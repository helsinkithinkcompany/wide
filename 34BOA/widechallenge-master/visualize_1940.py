import json
import argparse
from branch_mapper import prune_tree
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

colors = sns.color_palette('gist_stern', 30)
# colors = sns.color_palette('coolwarm', 30)

def draw_child(children, ax, level_x, level_y, range_y):

    bbox = {'facecolor': 'w', 'pad': 0, 'ec': 'w'}
    for idx, child in enumerate(children['children']):
        color_idx = int(level_x)
        if color_idx > 29:
            color_idx = 29
        color_ = colors[int(color_idx)]
        new_range = range_y / len(children['children'])
        y = level_y + idx * (range_y / len(children['children']))
        y = y * 1.15 + np.random.randn() * 1.7
        x = level_x + 1
        x = x * 1.15 + np.random.randn() * 1.5

        # ax.plot([level_x, x], [level_y, y], 'k-', linewidth=1 + 1.5 * np.log(child['count']))
        # ax.plot([level_x, x], [level_y, y], 'k-', linewidth=1)
        # ax.plot([level_x, x], [level_y, y], 'k-', linewidth=1 + .2 * np.log(child['count']), alpha=.5)
        # ax.plot(x, y, 'k.')
        # ax.text(x, y, child['prefLabel'], bbox=bbox, fontsize=2 * np.log(child['count']), rotation=idx * (360/len(children['children'])))

        text_alpha = np.log(child['count']) / 6.5 + np.random.randn() * .11
        if text_alpha > 1:
            text_alpha = 1
        elif text_alpha < .35:
            text_alpha = .35

        fontsize=7 + 2.5 * np.log(child['count'])
        if fontsize < 6:
            fontsize = 6

        ax.plot([level_x, x], [level_y, y], 'k-', linewidth=1 + .2 * np.log(child['count']), alpha=text_alpha * .4, color=color_)
        text_str = child['prefLabel'].replace(' ', '\n')
        ax.text(x, y, text_str, fontsize=fontsize, rotation=-1 * (idx + 1) * 10, alpha=text_alpha, ha='center', color=color_)
        draw_child(child, ax, x, y, new_range)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('-c', '--min-count', type=int, default=80)
    parser.add_argument('-f', '--filename', type=str, default='1940_1000items.json')
    args = parser.parse_args()

    with open(args.filename, 'r') as f:
        tree = json.load(f)

    tree2 = prune_tree(tree, 50)

    f, ax = plt.subplots(1)
    for idx, child in enumerate(tree['children']):

        x = 0
        y = idx * (1 / len(tree['children']))
        # ax.plot(x, y, 'kx')
        # ax.text(x, y, child['prefLabel'])
        ax.text(x, y, child['prefLabel'].replace(' ', '\n'), fontsize=5 + 2 * np.log(child['count']), rotation=-1 * (idx + 1) * 10)
        draw_child(child, ax, x, y, (1 / len(tree['children'])))
    ax.text(.3, .3, '1940', transform=ax.transAxes, fontsize=140, fontweight='bold', alpha=.30, ha='center', va='center', rotation=-45)

    # ax.set_xlim(-1, 4)
    # ax.set_ylim(-.5, 1.5)
    ax.set_axis_off()
    plt.show()
