import argparse
import json
import logging
import os
from itertools import groupby


def read_json_file(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)


def read_txt_file(file_path):
    with open(file_path, 'r') as f:
        return f.readlines()


def remove_file_extention(name):
    return os.path.splitext(name)[0]


class Structure:
    def __init__(self, structure):
        self.structure = structure

    def structure_as_lines(self):
        lines = []
        self.__rec_transform_structure_to_lines(self.structure, [], lines)
        return lines

    def __rec_transform_structure_to_lines(self, root, components_so_far, result):
        # Add root name to component_so_far
        components_so_far.append(remove_file_extention(root['name']))
        if len(root['children']) == 0:
            # Base case - leaf node, so add the path here to the result
            result.append(components_so_far)
        else:
            # For every child, recursively call
            for c in root['children']:
                # Copy the list of components so far because
                self.__rec_transform_structure_to_lines(c, components_so_far.copy(), result)

    def merge_with_structure(self, other):
        pass


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
    def __init__(self, file_path, structure):
        self.lines = read_txt_file(file_path)
        self.structure = structure
        self.path_prefix = self.__determine_path_prefix()
        self.dependency_structure = dict()

    def parse(self):
        self.__build_dependency_structure()

    def __determine_path_prefix(self):
        structure_lines = self.structure.structure_as_lines()
        matches = list()
        for dependency_line in self.lines:
            dependency_type, from_components, to_components = self.__line_components(dependency_line)
            # Only do this for the class relationships just to speed things up
            if dependency_type != "C":
                continue
            for structure_line in structure_lines:
                matched_path = self.__match_structure_path_to_dependency_path(structure_line, from_components)
                if matched_path:
                    matches.append(matched_path)

        def all_equal(iterable):
            g = groupby(iterable)
            return next(g, True) and not next(g, False)
        if all_equal(matches):
            return matches[0]
        raise Exception("Not able to extract path prefix")

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

    def __build_dependency_structure(self):
        for line in self.lines:
            self.__parse_line(line)

    def __line_components(self, line):
        def remove_anonymous_inner_class(s):
            return s.split("$")[0]
        dependency_type = line[0]
        rest_of_line = line[2:]
        rest_of_line = rest_of_line.rstrip("\n")
        from_str = rest_of_line.split(" ")[0]
        to_str = rest_of_line.split(" ")[1]
        from_components = [remove_anonymous_inner_class(s) for s in from_str.split(".")]
        if hasattr(self, "path_prefix"):
            from_components = self.path_prefix + from_components
        to_components = [remove_anonymous_inner_class(s) for s in to_str.split(".")]
        if hasattr(self, "path_prefix"):
            to_components = self.path_prefix + to_components
        return dependency_type, from_components, to_components

    def __parse_line(self, line):
        dependency_type, from_components, to_components = self.__line_components(line)
        if dependency_type == "C":
            self.__parse_class_dependency(from_components, to_components)
        elif dependency_type == "M":
            pass
        else:
            logging.error(f"Unknown dependency type: {dependency_type}")

    def __parse_class_dependency(self, from_components, to_components):
        self.__add_from_component_to_dependency_tree(self.dependency_structure, from_components, to_components)

    def __add_from_component_to_dependency_tree(self, dependencies_tree, from_components, to_components):
        if len(from_components) == 0:
            # Base case - add dependency to leaf node
            if "$dependencies" not in dependencies_tree:
                dependencies_tree["$dependencies"] = dict()
            self.__add_to_components_to_from(dependencies_tree["$dependencies"], to_components)
        else:
            curr_from_component = from_components[0]
            remaining_from_components = from_components[1:]
            if curr_from_component not in dependencies_tree:
                dependencies_tree[curr_from_component] = dict()
            self.__add_from_component_to_dependency_tree(
                dependencies_tree[curr_from_component],
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
            # Remove anything after '$' character - threading stuff
            if "$" in curr_to_component:
                curr_to_component = curr_to_component.split("$")[0]
            if curr_to_component not in dependencies_tree:
                dependencies_tree[curr_to_component] = dict()
            self.__add_to_components_to_from(dependencies_tree[curr_to_component], remaining_to_components)


def main(args):
    structure = Structure(read_json_file(args.structure_file))
    dependency_parser = ParserBuilder(args.callgraph_generator, args.callgraph_file, structure).parser()
    dependency_parser.parse()
    dependency_structure = Structure(dependency_parser.dependency_structure)
    merged = structure.merge_with_structure(dependency_structure)


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
