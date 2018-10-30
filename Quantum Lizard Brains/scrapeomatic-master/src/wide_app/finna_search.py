

from finna_client import FinnaClient


def finna_search(searchwords, filters = [], limit = 10):
    res = []
    resultcount = 0
    finna = FinnaClient()
    for word in searchwords:
        result = finna.search(word,
                              #search_type=FinnaSearchType.Author,
                              fields=['title','nonPresenterAuthors','id','formats','subjects','year','languages','primaryAuthors'],
                              filters=filters, 
                              #sort=FinnaSortMethod.main_date_str_desc,
                              limit=limit)
        res.extend(result["records"])
        resultcount += result['resultCount']
    
    results = []
    for item in res:
        if item not in results:
            item['url'] = "https://www.finna.fi/Record/"+item['id']
            if 'formats' in item and len(item['formats']):
                item['formats'] = item['formats'][0]
            else:
                item['formats'] = {'translated': ''}
            results.append(item)
    # from pprint import pprint
    # pprint(results[0])
    # {'formats': [{'translated': 'Kirja', 'value': '0/Book/'},
    #              {'translated': 'Kirja', 'value': '1/Book/Book/'}],
    #  'id': 'alli.313062',
    #  'languages': ['eng'],
    #  'nonPresenterAuthors': [{'name': 'Koolhaas, Rem'}],
    #  'primaryAuthors': [],
    #  'subjects': [],
    #  'title': 'Content',
    #  'url': 'https://www.finna.fi/Record/alli.313062',
    #  'year': '2004'}

    return results
