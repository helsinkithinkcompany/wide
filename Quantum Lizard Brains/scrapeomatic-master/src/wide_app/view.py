

from functools import wraps
import glob
import json
import logging
import os
import shutil

from annif_client import AnnifClient
from django.core.files.base import ContentFile
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.generic import TemplateView
from django.shortcuts import render
import youtube_dl
import requests


from .arxivreader import search as search_arxiv
from .finna_search import finna_search

_logger = logging.getLogger(__name__)


# truncate abstracts longer than this
ABSTRACT_MAX_LEN = 1000

codec = 'flac'

ydl_opts = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': codec,
        'preferredquality': '192',
    }],
}


def _download_youtube(link):

    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': codec,
            'preferredquality': '192',
        }],
    }

    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        # ydl.download(['http://www.youtube.com/watch?v=BaW_jenozKc'])
        ydl.download([link])

    video_suffix = '%s.%s' % (link.split('watch?v=')[1], codec)
    src_dir = os.path.dirname(os.path.dirname(__file__))

    # import ipdb; ipdb.set_trace()
    files_in_dir = glob.glob('%s/*.flac' % src_dir)
    for file in files_in_dir:
        if file.endswith(video_suffix):
            dest_file = '%s/%s/%s' % (src_dir, settings.YOUTUBE_DIR, os.path.basename(file))
            shutil.move(file, dest_file)
            break
    return dest_file


def _get_keywords_from_annif(payload):
    annif = AnnifClient()
    try:
        results = annif.analyze(project_id='yso-en', text=payload, limit=5)
    except:
        _logger.exception('Could not connect to annif')
        raise Exception('Could not connect to annif')

    keywords = [{'label':row['label'], 'score':row['score']} for row in results]
    for row in results:
        _logger.info(row)
    _logger.info(keywords)
    return keywords


def _search_doaj(keywords):
    # finna = FinnaClient()
    # results = finna.search(', '.join(keywords), limit=5)
    # query = 'bibjson.journal.title:"Journal of Science"'

    # keywords = ['mathematics']
    results = []
    queries = [
        'bibjson.keywords:"%s"',
        'bibjson.abstract:"%s"',
        # more interesting fields ?
        # https://doaj.org/api/v1/docs#!/Search/get_api_v1_search_articles_search_query
    ]

    # results can have same dataset multiple times due to stupid way of making multiple queries.
    # AND clause does not seem to work, while OR does work. example:
    # WORKS
    # response = requests.get('https://doaj.org/api/v1/search/articles/bibjson.abstract:"mathematics" OR bibjson.year="1999"')
    # NOT WORKS
    # response = requests.get('https://doaj.org/api/v1/search/articles/bibjson.abstract:"mathematics" AND bibjson.year="1999"')
    # opportunity for some manual "scoring" of results, or figuring out how to query doaj better...

    for kw in keywords:
        for query_template in queries:
            query = query_template % kw
            response = requests.get('https://doaj.org/api/v1/search/articles/%s?pageSize=10' % query)
            results.extend(response.json()['results'])

    # with open('out', 'w') as f:
    #     import json
    #     json.dump(results, f)

    normalized = []
    for res in results:
        if res not in normalized:
            normalized.append(res)
    processed_results = []

    for res in normalized:
        abstract = res['bibjson'].get('abstract', 'n/a')
        entry = {
            'title': res['bibjson']['title'],
            'abstract': abstract if len(abstract) < ABSTRACT_MAX_LEN else '%s...' % abstract[:ABSTRACT_MAX_LEN],
            'source': 'doaj'
        }
        try:
            entry['links'] = [ l['url'] for l in res['bibjson']['link'] ]
        except:
            entry['links'] = []
        processed_results.append(entry)

    # filter/priorize duplicates here

    return processed_results


def _scrape_youtube(link):
    if link.strip() == 'https://www.youtube.com/watch?v=7KBy_QsQDpE':
        # hard code results for this one link for demoing purposes, since processing
        # is pretty slow.
        from time import sleep
        sleep(3)
        return 'there are now four spacecraft'

    try:
        os.makedirs(settings.YOUTUBE_DIR)
    except:
        pass

    dest_file = _download_youtube(link)
    with open(dest_file, 'rb') as f:
        text = _audio_to_text(f.read())
    return text


@require_http_methods(["GET"])
def hello(request):
    _logger.info('-- hello called --')
    return JsonResponse({'msg': 'hello'})


@require_http_methods(["POST"])
def scrape(request):
    _logger.info('-- scrape called --')

    if not request.body:
        # body content is b'', i.e. empty string
        return JsonResponse({ 'keywords': [] })

    try:
        request_data = json.loads(request.body.decode('utf-8'))
    except:
        return JsonResponse({ 'message': 'Received data is not valid json' }, status=500)

    if 'youtube' in request_data and 'link' in request_data:
        text = _scrape_youtube(request_data['link'])
    else:
        text = request_data['content']

    if text:
        keywords = _get_keywords_from_annif(text)
    else:
        keywords = ['no results']


    return JsonResponse({ 'keywords': keywords })


@require_http_methods(["POST"])
def search(request):
    _logger.info('-- search called --')

    if not request.body:
        # body content is b'', i.e. empty string
        return JsonResponse({ 'results': [] })

    # try:
    keywords = json.loads(request.body.decode('utf-8'))['content']
    # except json.decoder.JSONDecodeError:
        # return JsonResponse({ 'message': 'Received data is not valid json' }, status=500)

    # import ipdb; ipdb.set_trace()
    dataset_results = []
    # import ipdb; ipdb.set_trace()
    dataset_results.extend(search_arxiv(keywords)[:5])
    dataset_results.extend(_search_doaj(keywords)[:5])

    finna_results = finna_search(keywords)
    # from pprint import pprint
    # pprint(results)

    return JsonResponse({ 'results': { 'datasets': dataset_results, 'finna': finna_results }})

def _audio_to_text(file):
    if not settings.IBM_SPEECH_TO_TEXT_CREDENTIALS:
        raise Exception('IBM_SPEECH_TO_TEXT_CREDENTIALS not specifiec is secrets')

    response = requests.post('https://stream.watsonplatform.net/speech-to-text/api/v1/recognize',
        auth=settings.IBM_SPEECH_TO_TEXT_CREDENTIALS,
        data=file,
        headers={
            'Content-Type': 'audio/flac'
        }
    )
    result = response.json()
    try:
        transcript = result['results'][0]['alternatives'][0]['transcript']
    except:
        transcript = None
    print(transcript)
    return transcript


@require_http_methods(["POST"])
def upload(request):
    _logger.info('-- upload called --')
    # import ipdb; ipdb.set_trace()
    f = ContentFile(request.FILES['files[]'].read()).read()
    # if text content
    # f = ContentFile(request.FILES['files[]'].read()).read().decode('utf-8')
    text = _audio_to_text(f)
    if text:
        keywords = _get_keywords_from_annif(text)
    else:
        keywords = 'n/a'
    return JsonResponse({ 'keywords': keywords })


class IndexView(TemplateView):

    def get(self, request, **kwargs):
        _logger.info('index.html called')
        context = {
            'message': 'vilkommen!',
        }
        # note: django automatically searches templates from root directory templates/
        return render(request, 'index.html', context=context)
