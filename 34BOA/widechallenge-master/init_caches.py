from branch_mapper import get_tree

if __name__ == '__main__':
    for year in range(1800, 2019):
        get_tree(year)
        print(year, 'DONE')