import requests

response = requests.get('https://doaj.org/api/v1/search/articles/bibjson.abstract:"mathematics"')
# response = requests.get('https://doaj.org/api/v1/search/articles/bibjson.abstract:"mathematics"%20AND%20bibjson.year="2016"')
# response = requests.get('https://doaj.org/api/v1/search/articles/bibjson.abstract:"mathematics" OR bibjson.year="1999"')
# response = requests.get('https://doaj.org/api/v1/search/articles/bibjson.abstract:"mathematics" AND bibjson.year="2014"')
from pprint import pprint
pprint(response.json())
