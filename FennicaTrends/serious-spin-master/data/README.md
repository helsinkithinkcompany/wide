# Get data

## Get data from Fennica

1. Download `fennica.hdt` and `fennica.hdt.index` from http://data.nationallibrary.fi/download/

2. Move hdt-datas to some folder f.ex. Documents/Fennica/

3. Get latest hdt-java from https://github.com/rdfhdt/hdt-java/releases

4. Extract hdt-java to same folder with hdt-datas

5. Install hdt-java with instructions found from readme

6. Go to hdt-fuseki folder and install that too with readme instructions

7. Go back to folder with hdt-datas and start fuseki with command `hdt-java-2.0/hdt-fuseki/bin/hdtEndpoint.sh --hdt fennica.hdt /dataset`

8. Get data as CSV with command:
``` 
curl http://localhost:3030/dataset/sparql -X POST --data 'query=PREFIX+skos%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0APREFIX+schema%3A+%3Chttp%3A%2F%2Fschema.org%2F%3E%0APREFIX+rdf%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0ASELECT+DISTINCT+%3Fname+%3Finst+%3Fyear+(GROUP_CONCAT(DISTINCT+%3Fconc%3B+separator%3D%22%2C+%22)+AS+%3Fyso)+WHERE+%7B%0A++%3Fwork+schema%3Aname+%3Fname+.%0A++%3Fwork+schema%3AworkExample+%3Finst+.%0A++%3Finst+schema%3AdatePublished+%3Fyear+.%0A++%3Fwork+schema%3Aabout+%3Fconc+.%0A++%23SERVICE+%3Chttp%3A%2F%2Fapi.dev.finto.fi%2Fsparql%3E+%7B%0A++%23++%3Fconc+skos%3AprefLabel+%3Flabel+.%0A++%23++FILTER(lang(%3Flabel)+%3D+'en')%0A++%23%7D%0A++FILTER(STRSTARTS(STR(%3Fconc)%2C+%22http%3A%2F%2Fwww.yso.fi%2Fonto%2Fyso%2F%22))%0A%7D+GROUP+BY+%3Fname+%3Finst+%3Fyso+%3Fyear&output=csv' > data.csv
```
Here's also the same query as pretty SPARQL:
```
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?name ?inst ?year (GROUP_CONCAT(DISTINCT ?conc; separator=", ") AS ?yso) WHERE {
 ?work schema:name ?name .
 ?work schema:workExample ?inst .
 ?inst schema:datePublished ?year .
 ?work schema:about ?conc .
 FILTER(STRSTARTS(STR(?conc), "http://www.yso.fi/onto/yso/"))
} GROUP BY ?name ?inst ?yso ?year
```

9. Get yso turtle data from http://finto.fi/yso/fi/ (bottom of the page)

10. Format data with two scripts found under data/python-directory:
`format-fennica.py` and `countRelativeWeights.py`
These scripts will take some time. Relax and take some refreshing drinks while waiting.
Scripts will create four datasets in json format:
    * `fennica-grouped.json` 
    * `fennica-all.json` 
    * `fennica-group-labels.json` 
    * `fennica-graph.json`
 
11. Import resulted json to Firebase Real-time Database with command line tool. See instructions here https://github.com/FirebaseExtended/firebase-import "Install" and "Obtaining Service account file" and generate a key.

    Then import all datasets to Firebase, run python script `importDataToFirebase.py` (this might take a while)
    * Run with these params to import everything (OVERWRITES ALL DATA!):   
      `python3 importDataToFirebase.py <YOUR-APP-NAME> <your-path-to-service-account.json>`  
    * OR import just one file by adding third arg (OVERWRITES SELECTED DATA):  
      `python3 importDataToFirebase.py <YOUR-APP-NAME> <your-path-to-service-account.json> fennica-group-labels` 
    