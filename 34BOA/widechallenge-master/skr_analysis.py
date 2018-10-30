import os
from collections import namedtuple
from subprocess import call
import xmltodict
from annif_client import AnnifClient
import joblib
from tqdm import tqdm

if not os.path.exists('skr.xml'):
    print('Downloading SKR data')
    call("curl 'https://apurahat.skr.fi/myonnot/xml_apurahat?vuosi=2018&mkr=KR&ala=Tiede' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:62.0) Gecko/20100101 Firefox/62.0' -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed -H 'Referer: https://apurahat.skr.fi/myonnot' -H 'Connection: keep-alive' -o skr.xml", shell=True)

with open('./skr.xml', 'r') as fd:
    data = xmltodict.parse(fd.read())

Apuraha = namedtuple('Apuraha', ['saaja', 'otsikko', 'puhdas_otsikko', 'ala', 'rahasto', 'summa', 'annif'])

client = AnnifClient()

memory = joblib.Memory('./cache', verbose=0)

def clean_otsikko(otsikko):
    i = otsikko.find('käsittelevään')
    if i != -1:
        otsikko = otsikko[:i]
        
    i = otsikko.find('käsittelevän')
    if i != -1:
        otsikko = otsikko[:i]
        
    return otsikko.strip()

@memory.cache
def parse_skr(rec):
    otsikko = clean_otsikko(x['kuvaus'])
    annif_res = client.analyze(project_id='yso-fi', text=otsikko, limit=10)
    annif_res = [x for x in annif_res if x['score'] > 0.01]
    return Apuraha(saaja=x['aakkosnimi'], 
                   otsikko=x['kuvaus'],
                   puhdas_otsikko=otsikko,
                   ala=x['tieteenala'], 
                   rahasto=x['nimikkorahasto'], 
                   summa=x['summa'],
                   annif=annif_res)

recs = data['apurahat']['apuraha']
n = len(recs)
res = [None]*n
print('Parsing SKR data')
for i,x in enumerate(tqdm(recs)):
    res[i] = parse_skr(x)

for i in range(5):
    print(res[i].puhdas_otsikko, [x['label'] for x in res[i].annif])

from collections import Counter

c = Counter()
for r in res:
    c.update([x['label'] for x in r.annif])

print('Most common keywords')
print(c.most_common(20))

