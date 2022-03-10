import argparse
import json
import logging
import os
from itertools import groupby

DEPENDENCIES_KEY = "$dependencies"
CHILDREN_KEY = "children"
NAME_KEY = "name_no_extension"


def read_json_file(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)


def write_json_file(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f)


def read_txt_file(file_path):
    with open(file_path, 'r') as f:
        return f.readlines()

class Structure:
    def __init__(self, structure):
        self.root = structure

    def structure_as_lines(self):
        lines = []
        self.__rec_transform_structure_to_lines(self.root, [], lines)
        return lines

    def __rec_transform_structure_to_lines(self, root, components_so_far, result):
        # Add root name to component_so_far
        components_so_far.append(root[NAME_KEY])
        if len(root['children']) == 0:
            # Base case - leaf node, so add the path here to the result
            result.append(components_so_far)
        else:
            # For every child, recursively call
            for c in root['children']:
                # Copy the list of components so far because
                self.__rec_transform_structure_to_lines(c, components_so_far.copy(), result)

    def merge_in_dependency_data(self, other):
        self.__rec_merge(self.root, other.root)

    def __rec_merge(self, node1, node2):
        for child2 in node2[CHILDREN_KEY]:
            if child2[NAME_KEY] == DEPENDENCIES_KEY:
                node1[DEPENDENCIES_KEY] = child2[CHILDREN_KEY]
            else:
                # Find matched child node in node1 children
                child1 = next((item for item in node1[CHILDREN_KEY] if item[NAME_KEY] == child2[NAME_KEY]), None)
                if child1:
                    self.__rec_merge(child1, child2)


class ParserBuilder:
    def __init__(self, callgraph_generator_type, callgraph_file, structure):
        self.callgraph_generator_type = callgraph_generator_type
        self.callgraph_file = callgraph_file
        self.structure = structure

    def parser(self):
        if self.callgraph_generator_type == "java-callgraph":
            return JavaCallgraphParser(self.callgraph_file, self.structure)
        else:
            raise Exception("Unknown callgraph generator")


class JavaCallgraphParser:

    class LineComponent:
        def __init__(self, dependency_line, structure_lines):
            self.dependency_line = dependency_line
            self.structure_lines = structure_lines
            self.dependency_type, self.from_components, self.to_components = self.__line_components()

        def __line_components(self):
            dependency_type = self.dependency_line[0]
            rest_of_line = self.dependency_line[2:]
            rest_of_line = rest_of_line.rstrip("\n")
            from_str = rest_of_line.split(" ")[0]
            to_str = rest_of_line.split(" ")[1]
            from_components_dependency = [self.remove_anonymous_inner_class(s) for s in from_str.split(".")]
            from_components_structure = self.__add_prefix_path_match_from_strucutre(from_components_dependency)
            to_components_dependency = [self.remove_anonymous_inner_class(s) for s in to_str.split(".")]
            to_components_structure = self.__add_prefix_path_match_from_strucutre(to_components_dependency)
            return dependency_type, from_components_structure, to_components_structure

        def __add_prefix_path_match_from_strucutre(self, dependency_component):
            result = dependency_component
            for structure_line in self.structure_lines:
                matched_path = self.__match_structure_path_to_dependency_path(structure_line, result)
                if matched_path:
                    result = matched_path + result
            return result

        @staticmethod
        def remove_anonymous_inner_class(s):
            return s.split("$")[0]

        @staticmethod
        def __match_structure_path_to_dependency_path(structure_path, dependency_path):
            s_idx = len(structure_path) - 1
            d_idx = len(dependency_path) - 1
            # Walk the whole dependency structure path in reverse
            while d_idx >= 0:
                # If the dependency path doesn't match the structure path, then they don't match, so return nothing
                if dependency_path[d_idx] != structure_path[s_idx]:
                    return None
                # Current dependency path component and current structure path component match.
                # Move onto the next one
                s_idx -= 1
                d_idx -= 1
            # We have matched to whole dependency path to the structure path.
            # So the remaining structure path is the prefix, which we return
            return structure_path[:s_idx + 1]

    def __init__(self, file_path, structure):
        lines = read_txt_file(file_path)
        structure_lines = structure.structure_as_lines()
        self.line_components = [self.LineComponent(line, structure_lines) for line in lines]
        self.dependency_structure = {
            NAME_KEY: "root",
            CHILDREN_KEY: []
        }

    def parse(self):
        self.__build_dependency_structure()

    def __build_dependency_structure(self):
        for line_component in self.line_components:
            self.__parse_line(line_component)

    def __parse_line(self, line_component):
        if line_component.dependency_type == "C":
            self.__parse_class_dependency(line_component.from_components, line_component.to_components)
        elif line_component.dependency_type == "M":
            pass
        else:
            logging.error(f"Unknown dependency type: {line_component.dependency_type}")

    def __parse_class_dependency(self, from_components, to_components):
        # Ignore first element of from_component , which is root
        self.__add_from_component_to_dependency_tree(self.dependency_structure, from_components[1:], to_components)

    def __add_from_component_to_dependency_tree(self, dependencies_tree, from_components, to_components):
        if len(from_components) == 0:
            # Base case - add dependency to leaf node
            dependencies_child = next((item for item in dependencies_tree[CHILDREN_KEY] if item[NAME_KEY] == DEPENDENCIES_KEY), None)
            if not dependencies_child:
                dependencies_child = {
                    NAME_KEY: DEPENDENCIES_KEY,
                    CHILDREN_KEY: []
                }
                dependencies_tree[CHILDREN_KEY].append(dependencies_child)
            self.__add_to_components_to_from(dependencies_child, to_components)
        else:
            curr_from_component = from_components[0]
            remaining_from_components = from_components[1:]
            next_component_node = next((item for item in dependencies_tree[CHILDREN_KEY] if item[NAME_KEY] == curr_from_component), None)
            if not next_component_node:
                next_component_node = {
                    NAME_KEY: curr_from_component,
                    CHILDREN_KEY: [],
                }
                dependencies_tree[CHILDREN_KEY].append(next_component_node)
            self.__add_from_component_to_dependency_tree(
                next_component_node,
                remaining_from_components,
                to_components
            )

    def __add_to_components_to_from(self, dependencies_tree, to_components):
        if len(to_components) == 0:
            # Base case - return
            return
        else:
            curr_to_component = to_components[0]
            remaining_to_components = to_components[1:]
            next_component_node = next((item for item in dependencies_tree[CHILDREN_KEY] if item[NAME_KEY] == curr_to_component), None)
            if not next_component_node:
                next_component_node = {
                    NAME_KEY: curr_to_component,
                    CHILDREN_KEY: [],
                }
                dependencies_tree[CHILDREN_KEY].append(next_component_node)
            self.__add_to_components_to_from(next_component_node, remaining_to_components)


def main(args):
    structure = Structure(read_json_file(args.structure_file))
    dependency_parser = ParserBuilder(args.callgraph_generator, args.callgraph_file, structure).parser()
    dependency_parser.parse()
    dependency_structure = Structure(dependency_parser.dependency_structure)
    # write_json_file(dependency_parser.dependency_structure, "./dependency_data.json")
    structure.merge_in_dependency_data(dependency_structure)
    write_json_file(structure.root, "./aug_structure_data.json")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='')
    parser.add_argument(
        '--structure-file',
        required=True,
        help='A json file generated from csv_as_enclosure_json.py (i.e., merging Hotspot data [CodeMaat] and system '
             'structure data [cloc])'
    )
    parser.add_argument(
        '--callgraph-file',
        required=True,
        help='A json file generated from csv_as_enclosure_json.py (i.e., merging Hotspot data [CodeMaat] and system '
             'structure data [cloc])'
    )
    parser.add_argument(
        '--callgraph-generator',
        required=True,
        help='The tool used to generated the call graph'
    )
    m_args = parser.parse_args()
    main(m_args)
