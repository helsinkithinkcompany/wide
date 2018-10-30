from finna_client import FinnaClient

from finna_client import FinnaClient, FinnaSearchType, FinnaSortMethod
import urllib
from PIL import Image

import requests
from io import BytesIO
import os

LIMIT = 100
SUBJECT = 'soutuveneet'
row_path = 'data/rowboats'

os.mkdirs(row_paths)
os.mkdirs('checkpoints')

finna = FinnaClient()
result = finna.search(SUBJECT, search_type=FinnaSearchType.Subject,
                    limit=0, filters=['format:0/Image/', 'online_boolean:1'])

pages = result['resultCount'] // LIMIT

urls = []
for page in range(pages):
    result = finna.search(SUBJECT, search_type=FinnaSearchType.Subject,
        filters=['format:0/Image/', 'online_boolean:1'],
        fields=['images'],
        sort=FinnaSortMethod.main_date_str_asc,
        limit=LIMIT,
        page=page)


    for rec in result['records']:
        urls.append('https://api.finna.fi' + rec['images'][0])
        


#for i in range(len(urls)):
#    path = row_path + '/' + str(i) + '.jpg'
#    with open(path, 'wb') as f:
#        f.write(urllib.request.urlopen(urls[i]).read())
        
for i in range(len(urls)):
    path = row_path + '/' + str(i) + '.jpg'
    size = (224,224)
    response = requests.get(urls[i])
    im = Image.open(BytesIO(response.content))
    im.thumbnail(size, Image.ANTIALIAS)
    im.save(path)
    
