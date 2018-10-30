from skosmos_client import SkosmosClient
from rdflib.namespace import SKOS
import joblib
from finna_client import FinnaClient
from finna_image_finder import finna_search
from requests import HTTPError


memory = joblib.Memory('./cache', verbose=0)


@memory.cache(ignore=['sk'])
def get_branch_route(keyword, sk):

    results = sk.search(keyword, vocabs='yso')
    print('--- keyword: {} ---'.format(keyword))

    if results:
        result = results[0]
        uri = result['uri']
    else:
        print('No hits for <<{}>>'.format(keyword))
        return []

    br_list = []

    try:
        while True:
            concept = sk.get_concept('yso', uri)
            br_list.append(concept.label())
            next_label = concept.broader()[0]['prefLabel']
            uri = concept.broader()[0]['uri']

    except IndexError:
        pass

    return br_list


@memory.cache(ignore=['sk'])
def get_node_parents(node, sk):
    concept = sk.get_concept('yso', node['uri'])
    parent_node = concept.broader()

    if parent_node == []:
        return [node]

    return get_node_parents(parent_node[0], sk) + [node]


def get_keyword_chain(keyword, sk):
    results = sk.search(keyword + '*', vocabs='yso')

    if results:
        node = results[0]
        node = {'uri': node['uri'], 'prefLabel': node['prefLabel'], }

        try:
            chain = get_node_parents(node, sk)
        except HTTPError as e:
            return None

        return chain

    else:
        return None


def create_tree(chain):
    tree = {'prefLabel': 'root', 'count': 1, 'children': []}
    root = tree
    for node in chain:
        n = node.copy()
        n['count'] = 1
        n['children'] = []
        root['children'] += [n]
        root = n
    return tree


def join_tree(tree_a, tree_b):
    tree = tree_a.copy()
    if tree['prefLabel'] == tree_b['prefLabel']:
        tree['count'] += tree_b['count']

        for c in tree_b['children']:
            try:
                ind = [x['prefLabel'] == c['prefLabel'] for x in tree['children']].index(True)
                tree['children'][ind] = join_tree(tree['children'][ind], c)
            except ValueError as e:
                tree['children'].append(c)

    return tree


def join_trees(trees):
    tree = trees[0].copy()
    for t in trees[1:]:
        tree = join_tree(tree, t)
    return tree


def prune_tree(tree, min_count):
    root = tree.copy()
    if root['count'] < min_count:
        return None
    new_children = []
    for child in root['children']:
        new_child = prune_tree(child, min_count)
        if new_child is None:
            continue
        new_children.append(new_child)
    root['children'] = new_children
    return root

def prune_tree_to_level(tree, max_level, level):
    root = tree.copy()
    if level < max_level:
        new_children = []
        for child in root['children']:
            new_child = prune_tree_to_level(child, max_level, level+1)
            new_children.append(new_child)
    if level == max_level:
        new_children = []
    root['children'] = new_children
    return root


@memory.cache
def get_tree(year):
    finna = FinnaClient()
    sk = SkosmosClient()
    records = finna_search(year, finna)
    chains = [get_keyword_chain(x.subject, sk) for x in records]
    chains = [x for x in chains if x is not None]
    trees = [create_tree(x) for x in chains]
    return join_trees(trees)


if __name__ == '__main__':

    sk = SkosmosClient()

    # keywords = ['rakkaus', 'makkara', 'kosmonautti', 'hevonen', 'rauta', 'taivas', 'helvetti']
    # keywords = ['love', 'sausage', 'cosmonaut', 'horse', 'iron', 'heaven', 'hell']
    keywords = ['häst', 'teknik', 'porträtt']

    for keyword in keywords:
        br = get_keyword_chain(keyword, sk)

        for item in br:
            print('{}\n⬇️'.format(item))

    tree = create_tree(get_keyword_chain('hatut', sk))
    print(tree)