import rdflib, requests
from collections import defaultdict

PREFLABEL = rdflib.URIRef('http://www.w3.org/2004/02/skos/core#prefLabel')
BROADER = rdflib.URIRef('http://www.w3.org/2004/02/skos/core#broader')
NARROWER = rdflib.URIRef('http://www.w3.org/2004/02/skos/core#narrower')
CLOSEMATCH = rdflib.URIRef('http://www.w3.org/2004/02/skos/core#closeMatch')

FINLAND = 'http://www.yso.fi/onto/yso/p94426'
CANONICAL_HEIGHT = 3

class Places:    
    def __init__(self, filename):
        self.geocache = {}
        
        graph = rdflib.Graph()
        with open(filename, 'r') as f:
            graph.parse(data=f.read())

        # Parse YSO-places dataset    
        self.labels, self.reverse_labels = {}, {}
        self.up, self.down = defaultdict(list), defaultdict(list)
        self.to_paikkatiedot = {}
        for s, p, o in graph:
            u, v = str(s), str(o)
            if p == PREFLABEL:
                name, ident = str(o), str(s)
                self.labels[v] = u
                self.reverse_labels[u] = v
            elif p == BROADER:
                self.up[u].append(v)
                self.down[v].append(u)
            elif p == NARROWER:
                self.up[v].append(u)
                self.down[u].append(v)
            elif p == CLOSEMATCH and 'paikkatiedot' in v:
                self.to_paikkatiedot[u] = v + '.jsonld'
        
        # Finds all nodes reachable from Finland
        self.canonical = []
        stack = [[FINLAND]]
        while len(stack) != 0:
            path = stack.pop()
            n = path[-1]
            if len(path) == CANONICAL_HEIGHT:
                self.canonical.append(n)
                continue

            if not n in self.down:
                continue

            for d in self.down[n]:
                stack.append(path + [d])
    
    # Returns "canonized" location for YSO-places id
    def canonize(self, ident):
        stack = [[ident]]
        while len(stack) != 0:
            path = stack.pop()
            if len(path) > 10:
                continue

            n = path[-1]            
            if n in self.canonical:
                return n

            for u in self.up[n]:
                stack.append(path + [u])

        return None

    # Queries paikkatiedot.fi for lat-long of location
    def to_geo(self, ident):
        if not ident in self.to_paikkatiedot:
            return None

        if ident in self.geocache:
            return self.geocache[ident]

        url = self.to_paikkatiedot[ident]
        req = requests.get(url)
        req.raise_for_status()

        data = req.text

        x, y = 0, 0
        for line in data.split('\n'):
            if 'latitude' in line:
                y = float(line.split(':')[1][1:-2])
            elif 'longitude' in line:
                x = float(line.split(':')[1][1:-1])
        return x, y