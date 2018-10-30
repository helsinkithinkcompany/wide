import json
import blessed
import argparse

t = blessed.Terminal()

color_on = True
colors= [t.cyan, t.green, t.yellow, t.blue, t.magenta, t.red, t.white]

def print_children(children, level=1, count_limit=0):
    prefix = '\t' * level
    out_level = level + 1
    for child in children['children']:
        if child['count'] >= count_limit:
            child_str = prefix + '{} [{}]'.format(child['prefLabel'], child['count'])

            if color_on and level - 1 < len(colors):
                child_str = colors[level - 1](child_str)

            print(child_str)
            print_children(child, level=out_level, count_limit=count_limit)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('-c', '--count-limit', type=int, default=100)
    parser.add_argument('-f', '--filename', type=str, default='1940_1000items.json')

    args = parser.parse_args()

    with open(args.filename, 'r') as f:
        tree = json.load(f)

    current_level = 0
    max_depth = 3

    for child in tree['children']:
        print(t.bold_underline('{} [{}]'.format(child['prefLabel'],  child['count'])))
        print_children(child, count_limit=args.count_limit)
