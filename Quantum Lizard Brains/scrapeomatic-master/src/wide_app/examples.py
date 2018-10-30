
from finna_client import FinnaClient
finna = FinnaClient()
results = finna.search("bicycle", limit=5)
for rec in results['records']: print(rec['title'])

from annif_client import AnnifClient
annif = AnnifClient()
results = annif.analyze(project_id='yso-en', text="The quick brown fox", limit=5)
for result in results: print(result)
