import argparse
import json

import pydot


def main(args):
    graphs = pydot.graph_from_dot_file(args.dotfile)
    graph = graphs[0]
    edges = graph.obj_dict['edges']
    edges_tree = build_dict_of_edges(edges)
    with open("dependency_tree.json", "w") as f:
        json.dump(edges_tree, f)


def build_dict_of_edges(edges):
    result = dict()

    def add_edge_to_result(a, b, so_far):
        split_a = a.split("__")
        curr_node_a = so_far
        for node_a in split_a:
            if node_a not in curr_node_a:
                curr_node_a[node_a] = dict()
            curr_node_a = curr_node_a[node_a]
        if '$dependencies' not in curr_node_a:
            curr_node_a['$dependencies'] = dict()
        split_b = b.split("__")
        curr_node_b = curr_node_a['$dependencies']
        for node_b in split_b:
            if node_b not in curr_node_b:
                curr_node_b[node_b] = dict()
            curr_node_b = curr_node_b[node_b]
        pass
    for e in edges:
        add_edge_to_result(e[0], e[1], result)
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Generates a JSON document of dot graph edges.')
    parser.add_argument('--dotfile', required=True,
                        help='A DOT file to parse')
    args = parser.parse_args()
    main(args)
