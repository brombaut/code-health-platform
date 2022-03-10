#!/bin/env python

#######################################################################
# This program generates a JSON document suitable for a D3.js
# enclosure diagram visualization.
# The input data is read from two CSV files:
# 1) The complete system structure, including size metrics.
# 2) A hotspot analysis result used to assign weights to the modules.
#######################################################################

import argparse
import csv
import json
import os
import sys


class MergeError(Exception):
    def __init__(self, message):
        Exception.__init__(self, message)


# class Merged(object):
#     def __init__(self):
#         self._all_modules_with_complexity = {}
#         self._merged = {}
#
#     def sorted_result(self):
#         # Sort on descending order:
#         ordered = sorted(self._merged.items(),
#                          key=lambda item: item[1][0], reverse=True)
#         return ordered
#
#     def extend_with(self, name, freqs):
#         if name in self._all_modules_with_complexity:
#             complexity = self._all_modules_with_complexity[name]
#             self._merged[name] = freqs, complexity
#
#     def record_detected(self, name, complexity):
#         # TODO: What is this?
#         self._all_modules_with_complexity[name] = complexity


# def write_csv(stats):
#     print('module,revisions,code')
#     for s in stats:
#         name, (f, c) = s
#         print(name + ',' + f + ',' + c)
# 
# 
# def parse_complexity(merged, row):
#     name = row[1][2:]
#     complexity = row[4]
#     merged.record_detected(name, complexity)
# 
# 
# def parse_freqs(merged, row):
#     name = row[0]
#     freqs = row[1]
#     merged.extend_with(name, freqs)
# 
# 
# def merge(revs_file, comp_file):
#     merged = Merged()
#     parse_csv(merged, comp_file, parse_complexity,
#               expected_format='language,filename,blank,comment,code')
#     parse_csv(merged, revs_file, parse_freqs, expected_format='entity,n-revs')
#     write_csv(merged.sorted_result())

######################################################################
# Parse input
######################################################################


def validate_content_by(heading, expected):
    if not expected:
        return  # no validation
    comparison = expected.split(',')
    stripped = heading[0:len(comparison)]  # allow extra fields
    if stripped != comparison:
        raise MergeError('Erroneous content. Expected = ' +
                         expected + ', got = ' + ','.join(heading))


def parse_csv(filename, parse_action, expected_format=None, remove_project_path=False, path_column=None):
    def read_heading_from(r):
        p = next(r)
        while not p:
            p = next(r)
        return p	
    rows = list()
    with open(filename, 'r') as csvfile:
        r = csv.reader(csvfile, delimiter=',')
        heading = read_heading_from(r)
        validate_content_by(heading, expected_format)
        for row in r:
            rows.append(row)
    project_path = extract_project_path(rows, path_column) if remove_project_path else None
    return [parse_action(row, project_path=project_path) for row in rows]


def extract_project_path(rows, path_column):
    paths = [row[path_column] for row in rows if row[path_column] != '']
    project_path = os.path.commonprefix(paths)
    return project_path


class StructuralElement(object):
    def __init__(self, name, file_language, code_lines, comment_lines, blank_lines):
        self.name = name
        self.file_language = file_language
        self.code_lines = code_lines
        self.comment_lines = comment_lines
        self.blank_lines = blank_lines

    def parts(self):
        return self.name.split('/')


def as_os_aware_path(name):
    return os.path.normpath(name)


def parse_structural_element(csv_row, project_path=None):
    name = as_os_aware_path(csv_row[1])
    if project_path is not None:
        name = name.removeprefix(project_path)
    # name = csv_row[1][2:]
    file_language = csv_row[0]
    blank_lines = csv_row[2]
    comment_lines = csv_row[3]
    code_lines = csv_row[4]
    return StructuralElement(name, file_language, code_lines, comment_lines, blank_lines)


def make_element_weight_parser(weight_column):
    """ Parameterize with the column - this allows us 
            to generate data from different analysis result types.
    """
    def parse_element_weight(csv_row, project_path=None):
        name = csv_row[0]
        weight = float(csv_row[weight_column])  # Assert not zero?
        return name, weight
    return parse_element_weight


######################################################################
# Calculating weights from the given CSV analysis file
######################################################################
def module_weight_calculator_from(analysis_results):
    max_raw_weight = max(analysis_results, key=lambda e: e[1])
    max_value = max_raw_weight[1]
    normalized_weights = dict([
        (name, {"normalized_weight": (1.0 / max_value) * n, "raw_weight": n}) for name, n in analysis_results
    ])

    def normalized_weight_for(module_name):
        if module_name in normalized_weights:
            return normalized_weights[module_name]
        return {"normalized_weight": 0.0, "raw_weight": 0.0}
    return normalized_weight_for


######################################################################
# Building the structure of the system
######################################################################
def _matching_part_in(hierarchy, part):
    return next((x for x in hierarchy if x['name'] == part), None)


def _remove_file_extention(name):
    return os.path.splitext(name)[0]


def _ensure_branch_exists(hierarchy, branch):
    existing = _matching_part_in(hierarchy, branch)
    if not existing:
        new_branch = {
            'name': branch,
            "name_no_extension": _remove_file_extention(branch),
            'children': []
        }
        hierarchy.append(new_branch)
        existing = new_branch
    return existing


def _add_leaf(hierarchy, module, weight_calculator, name):
    module_weights = weight_calculator(module.name)
    new_leaf = {
        'name': name,
        "name_no_extension": _remove_file_extention(name),
        'children': [],
        'file_language': module.file_language,
        'code_lines': module.code_lines,
        'comment_lines': module.comment_lines,
        'blank_lines': module.blank_lines,
        'normalized_weight': module_weights["normalized_weight"],
        'raw_weight': module_weights["raw_weight"]
    }
    hierarchy.append(new_leaf)
    return hierarchy


def _insert_parts_into(hierarchy, module, weight_calculator, parts):
    """ Recursively traverse the hierarchy and insert the individual parts 
            of the module, one by one.
            The parts specify branches. If any branch is missing, it's
            created during the traversal. 
            The final part specifies a module name (sans its path, of course).
            This is where we add size and weight to the leaf.
    """
    if len(parts) == 1:
        return _add_leaf(hierarchy, module, weight_calculator, name=parts[0])
    next_branch = parts[0]
    existing_branch = _ensure_branch_exists(hierarchy, next_branch)
    return _insert_parts_into(existing_branch['children'],
                              module,
                              weight_calculator,
                              parts=parts[1:])


def generate_structure_from(modules, weight_calculator):
    hierarchy = []
    for module in modules:
        parts = module.parts()
        _insert_parts_into(hierarchy, module, weight_calculator, parts)

    structure = {
        'name': 'root',
        'name_no_extension': 'root',
        'children': hierarchy
    }
    return structure


######################################################################
# Output
######################################################################
def write_json(result):
    # print(json.dumps(result, indent=2))
    print(json.dumps(result))


######################################################################
# Main
######################################################################
def run(args):
    raw_weights = parse_csv(
        args.weights,
        parse_action=make_element_weight_parser(args.weightcolumn)
    )
    weight_calculator = module_weight_calculator_from(raw_weights)

    structure_input = parse_csv(
        args.structure,
        expected_format='language,filename,blank,comment,code',
        parse_action=parse_structural_element,
        remove_project_path=True,
        path_column=1
    )
    weighted_system_structure = generate_structure_from(
        structure_input, weight_calculator)
    weighted_system_structure["children"] = [c for c in weighted_system_structure["children"] if c["name"] != "."]
    write_json(weighted_system_structure)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Generates a JSON document suitable for enclosure diagrams.')
    parser.add_argument('--structure', required=True, help='A CSV file generated by cloc')
    parser.add_argument('--weights', required=True, help='A CSV file with hotspot results from Code Maat')
    parser.add_argument('--weightcolumn', type=int, default=1, help="The index specifying the column to use in the weight table")

    args = parser.parse_args()
    run(args)
