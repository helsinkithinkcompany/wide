import sys, json
import plotly.offline as py

from places import Places
from search import paged_search, vectorized

if len(sys.argv) != 2:
    print('Usage: %s <subject>' % sys.argv[0])
    sys.exit(1)

SUBJECT = sys.argv[1]

places = Places('yso-paikat-skos.rdf')
results = paged_search(SUBJECT, places)
print(results)
vector = vectorized(results, places)
print(vector)

points = []
for point in vector:
    points.append(list(point))

basemap = []
with open('finland.geojson', 'r') as f:
    geojson = json.load(f)
    
    for feature in geojson['features']:
        if feature['geometry']['type'] == 'Polygon':
            basemap.extend(feature['geometry']['coordinates'][0])    
            basemap.append([None, None])

X, Y = zip(*basemap)
X2, Y2 = zip(*points)
data = [dict(type='scatter', x=X, y=Y, mode='lines', line=dict(width=0.5, color='blue')),
        dict(type='scatter', x=X2, y=Y2, mode='lines', line=dict(width=0.5, color='red'))]

axis_style = dict(showline=False, mirror=False, 
                showgrid=False, zeroline=False,
                ticks='', showticklabels=False)

layout = dict(title='',
            width=500, height=700, 
            autosize=False, xaxis=axis_style, yaxis=axis_style,
            hovermode='closest', geo = dict(
                projection = dict(type="orthographic")
            )
        )

py.plot(dict(data=data, layout=layout), filename=SUBJECT+'.html')