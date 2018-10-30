from rdflib import Graph, RDF, URIRef, Literal
import csv
import json, re
from unidecode import unidecode

g = Graph().parse('yso-skos.ttl', format='turtle')

with open('data.csv', newline='', encoding='utf-8') as f:
    reader = csv.reader(f)
    i = 0
    fennica_grouped = {}
    fennica_all = {}
    fennica_group_labels = []
    for row in reader:
        i += 1
        pub_uri = row[1]
        year = row[2]
        match = re.search('\d+', year)
        if match is None:
            continue # no year found, skip
        year = match.group(0)
        year = int(year[0:4])
        if len(str(year)) < 4 or year < 1300:
            continue # filter
        yso_uris = row[3]
        for uri in yso_uris.split(', '):
            group_labels = []
            for s,p,o in g.triples((None, URIRef('http://www.w3.org/2004/02/skos/core#member'), URIRef(uri))):
                if (URIRef(s), RDF.type ,URIRef('http://purl.org/iso25964/skos-thes#ThesaurusArray')) in g:
                    continue
                pref = g.preferredLabel(URIRef(s), 'en')
                if len(pref) > 0:
                    group_label = unidecode(pref[0][1]).replace('.', '')
                    group_labels.append(group_label)
                    if (group_label not in fennica_group_labels):
                        fennica_group_labels.append(group_label)
            for group in group_labels:
                if group not in fennica_grouped:
                    fennica_grouped[group] = {}
                pref = g.preferredLabel(URIRef(uri), 'en')
                if len(pref) > 0:
                    pref_str = unidecode(g.preferredLabel(URIRef(uri), 'en')[0][1]).replace('.', '').replace('C#', 'C Sharp').replace('/', '')
                    if len(pref_str) == 0:
                        continue
                    ## add to grouped data
                    if year not in fennica_grouped[group]:
                        fennica_grouped[group][year] = {}
                    yearData = fennica_grouped[group][year]
                    labelAmount = yearData[pref_str] + 1 if pref_str in yearData else 1
                    yearData[pref_str] = labelAmount
                    fennica_grouped[group][year] = yearData
                    ## add to all data
                    if year not in fennica_all:
                        fennica_all[year] = {}
                    labelAmount = fennica_all[year][pref_str] + 1 if pref_str in fennica_all[year] else 1
                    fennica_all[year][pref_str] = labelAmount
        if i % 25000 == 0: # printing some primitive progress updates
            print(i)

combined = {"fennica-grouped": fennica_grouped, "fennica-all": fennica_all, "fennica-group-labels": fennica_group_labels}

with open('fennica-grouped.json', 'w') as outfile:
    json.dump(fennica_grouped, outfile)
    outfile.close()

with open('fennica-all.json', 'w') as outfile:
    json.dump(fennica_all, outfile)
    outfile.close()

with open('fennica-group-labels.json', 'w') as outfile:
    json.dump(fennica_group_labels, outfile)
    outfile.close()