import random
from collections import namedtuple
import joblib
from finna_client import FinnaClient
from math import ceil

ImageRecord = namedtuple('ImageRecord', ['id', 'subject', 'url'])

memory = joblib.Memory('./cache', verbose=0)


@memory.cache(ignore=['client'])
def finna_search(year, client):
    search = lambda page, n: client.search('',
                                           fields=['id', 'subjects', 'images'],
                                           filters=['format:0/Image/',
                                                    'online_boolean:1',
                                                    'search_daterange_mv:"[{} TO {}]"'.format(year, year)],
                                           other={'search_daterange_mv_type':'within'},
                                           page=page,
                                           limit=n)
    n_images = search(1,0)['resultCount']

    res = []
    for i in range(ceil(n_images/100)):
        records = search(i+1, 100)['records']

        ids = [x['id'] for x in records]
        subjects = [x['subjects'][0][0] if len(x['subjects']) > 0 else [] for x in records]
        urls = [x['images'][0].replace('&index=0&size=large','') if len(x['images']) > 0 else [] for x in records]

        res += [ImageRecord(id_, subj, url) for id_, subj, url in zip(ids, subjects, urls)
                if subj != [] and url != []]

    return res
    

class FinnaImageFinder:
    def __init__(self):
        self.client = FinnaClient()        
    
    def __call__(self, year, n=50):
        res = finna_search(year, self.client)
        random.seed(42)
        return random.sample(res, k=n)


if __name__ == '__main__':
    finder = FinnaImageFinder()
    print(finder(1900))

    print(len(finna_search(1900, finder.client)))
