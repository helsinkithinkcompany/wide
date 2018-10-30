from branch_mapper import get_tree, prune_tree_to_level
import networkx as nx


def tree_to_graph(tree, graph):
    parent_label = tree['prefLabel']
    if tree['children'] == []:
        graph.add_node(parent_label, count=tree['count'])
    else:
        graph.add_node(parent_label, count=0)
    for child in tree['children']:
        child_label = tree_to_graph(child, graph)
        graph.add_edge(parent_label, child_label)
    return parent_label


def mean(x):
    return sum(x)/len(x)


def get_graph_output(year, width, height):
    tree = get_tree(year)

    graph = nx.Graph()
    tree_to_graph(prune_tree_to_level(tree, 4, 1), graph)

    counts = nx.get_node_attributes(graph, 'count')
    paths = nx.shortest_path(graph, source='root')
    pos = nx.nx_agraph.graphviz_layout(graph, root='root', prog='neato')
    pos_x = [xy[0] for xy in pos.values()]
    pos_y = [xy[1] for xy in pos.values()]
    x_factor = (max(pos_x) - min(pos_x)) / (width*0.8)
    y_factor = (max(pos_y) - min(pos_y)) / (height*0.8)
    pos = {key: ((pos[0] - mean(pos_x)) / x_factor + width / 2, (pos[1] - mean(pos_y)) / y_factor + height / 2) for
           key, pos in pos.items()}

    pos_paths = {key: [pos[x] for x in path] for key, path in paths.items()}
    res = {}

    res['particles'] = [{'node': key, 'path': pos_paths[key], 'count': counts[key]} for key in counts.keys() if
                        counts[key] > 0]
    res['nodes'] = [{'label': key, 'position': value} for key,value in pos.items()]
    res['edges'] = [(pos[e[0]], pos[e[1]]) for e in graph.edges()]

    return res

if __name__ == '__main__':
    res = get_graph_output(1900, 1., 1.)
    for x in res['particles']:
        print(x,'\n')
    print('\n\n')
    for x in res['nodes']:
        print(x, '\n')