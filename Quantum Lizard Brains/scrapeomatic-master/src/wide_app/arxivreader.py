"""

Documentation at 
http://export.arxiv.org/api_help/docs/user-manual.html
for more information, or email the arXiv api 
mailing list at arxiv-api@googlegroups.com.

urllib is included in the standard python library.
feedparser can be downloaded from http://feedparser.org/ .

This is free software.  Feel free to do what you want
with it, but please play nice with the arXiv API!

Original script by Julius B. Lucks
<python_arXiv_parsing_example.py>

Modified
by Mikael Mieskolainen, 2018

"""

import urllib
import feedparser


# Input:  list of query_words (+ search parameters)
# Output: list of dictionaries, each list element one paper
#
def search(query_words, start=0, max_results=50, sortBy='relevance', sortOrder='ascending'):

    # Base api query url
    base_url = 'http://export.arxiv.org/api/query?';

    # ************** arXiv Search parameters *****************
    # start = 0
    # max_results = 3
    # sortBy = 'relevance'    # relevance, lastUpdatedDate, submittedDate
    # sortOrder = 'ascending' # ascending, descending
    # ********************************************************

    # Construct query string
    #search_query = 'all:"' # Start with category all
    search_query = 'all:' # Start with category all
    for entry in query_words:
        search_query = search_query + '+' + entry
    #search_query = search_query + '"' # FOR EXCLUSIVE SEARCH USE " blaa this and that "

    query = 'search_query=%s&start=%i&max_results=%i&sortBy=%s&sortOrder=%s' % (search_query,
                                                         start,
                                                         max_results, sortBy, sortOrder)

    # Opensearch metadata such as totalResults, startIndex, 
    # and itemsPerPage live in the opensearch namespase.
    # Some entry metadata lives in the arXiv namespace.
    # This is a hack to expose both of these namespaces in
    # feedparser v4.1
    feedparser._FeedParserMixin.namespaces['http://a9.com/-/spec/opensearch/1.1/'] = 'opensearch'
    feedparser._FeedParserMixin.namespaces['http://arxiv.org/schemas/atom'] = 'arxiv'

    # perform a GET request using the base_url and query
    response = urllib.request.urlopen(base_url+query).read()

    # parse the response using feedparser
    feed = feedparser.parse(response)

    # DEBUG, print out feed information
    print('Feed title: %s' % feed.feed.title)
    print('Feed last updated: %s' % feed.feed.updated)

    # DEBUG, print opensearch metadata
    print('totalResults for this query: %s' % feed.feed.opensearch_totalresults)
    print('itemsPerPage for this query: %s' % feed.feed.opensearch_itemsperpage)
    print('startIndex for this query: %s'   % feed.feed.opensearch_startindex)
    print('')

    # Push into this list the articles
    articles = []

    # Run through each entry, and print out information
    for entry in feed.entries:

        # feedparser v5.0.1 correctly handles multiple authors
        authors = []
        try:
            for author in entry.authors:
                authors.append(author.name)
        except AttributeError:
            pass

        # get the links to the abs page and pdf for this e-print
        abslink = ''
        pdflink = ''
        for link in entry.links:
            if link.rel == 'alternate':
                abslink = link.href
            elif link.title == 'pdf':
                pdflink = link.href
        
        # The journal reference, comments and primary_category sections
        # live under the arxiv namespace
        try:
            journal_ref = entry.arxiv_journal_ref
        except AttributeError:
            journal_ref = 'No journal ref found'
        
        try:
            comment = entry.arxiv_comment
        except AttributeError:
            comment = 'No comment found'
        
        # Since the <arxiv:primary_category> element has no data, only
        # attributes, feedparser does not store anything inside
        # entry.arxiv_primary_category
        # This is a dirty hack to get the primary_category, just take the
        # first element in entry.tags.
        category = entry.tags[0]['term']
        
        # Lets get all the categories
        all_categories = [t['term'] for t in entry.tags]

        element = {
            'published' : entry.published,
            'authors' : authors,
            'title': entry.title,
            'category' : entry.tags[0]['term'],
            'all_categories' : all_categories,
            'id' : entry.id.split('/abs/')[-1],
            'abstract': entry.summary,
            'journal' : journal_ref,
            'pdf' : pdflink,
            'links': [
                abslink
            ],
            'comments' : comment,
            'source': 'arxiv'
        }
        articles.append(element)

        # DEBUG
        # print(element)
        # print('---------------------------------------------------------')

    return articles

if __name__ == "__main__":

    # Test search
    search(query_words = ['QCD','diffraction','observables'])

