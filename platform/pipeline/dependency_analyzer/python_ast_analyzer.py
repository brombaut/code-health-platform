import argparse
import ast
import os
import json

DEPENDENCIES_KEY = "$dependencies"
CHILDREN_KEY = "children"
NAME_NO_EXT_KEY = "name_no_extension"
NAME_KEY = "name"

DEPENDENCY_STRUCTURE_FILE = f"{os.path.dirname(os.path.abspath(__file__))}/../generated_files/dependency_structure.json"


class PythonAstAnalyzer:
    def __init__(self, directory):
        self.dir_to_analyze = directory

    def run(self):
        imports_dict = self.make_imports_dict()
        dependency_data_structure = DependencyDataStructure(imports_dict).make()
        write_json_file(dependency_data_structure, DEPENDENCY_STRUCTURE_FILE)
        return DEPENDENCY_STRUCTURE_FILE

    def make_imports_dict(self):
        py_files = self.get_project_python_files(self.dir_to_analyze)
        repo_dir = os.path.abspath(self.dir_to_analyze)
        imports_dict = dict()
        for file in py_files:
            file_path_in_repo = file[len(repo_dir) + 1:]
            source = self.read_py_file_source(file)
            try:
                imports = ImportsParser(source).parse()
                imports_dict[file_path_in_repo] = imports
            except Exception as e:
                print(f"Error Parsing Imports {file_path_in_repo}")
        return imports_dict

    @staticmethod
    def get_project_python_files(directory):
        directory = os.path.abspath(directory)
        list_of_files = list()
        for (dirpath, dirnames, filenames) in os.walk(directory):
            py_files = list()
            for file in filenames:
                if file.endswith('.py'):
                    py_files.append(os.path.join(dirpath, file))
            list_of_files.extend(py_files)
        return list_of_files

    @staticmethod
    def read_py_file_source(file):
        try:
            source = open(file, "r")
            return source.read()
        except Exception:
            raise SystemExit("The file doesn't exist or it isn't a Python script ...")


class ImportsParser:
    def __init__(self, source):
        self.source = source

    def parse(self):
        tree = ast.parse(self.source)
        tree_body = tree.body
        result = list()
        for item in tree_body:
            if isinstance(item, ast.Import):
                for i in item.names:
                    new_import = dict()
                    new_import['name'] = i.name
                    new_import['asname'] = i.asname
                    new_import['module'] = None
                    new_import['level'] = None
                    result.append(new_import)
            """
            Examples
            from data_transform_scripts.library_imports_finder import LibraryImportsFinder
            -> {
                "level": 0,
                "module": "data_transform_scripts.library_imports_finder",
                "asname": None,
                "name": LibraryImportsFinder
            }

            from .data_transform_scripts.library_imports_finder import LibraryImportsFinder
            -> {
                "level": 1,
                ...
            }

            from ..data_transform_scripts.
            library_imports_finder import LibraryImportsFinder
            -> {
                "level": 2,
                ...
            }
            """
            if isinstance(item, ast.ImportFrom):
                for i in item.names:
                    new_from_import = dict()
                    new_from_import['level'] = item.level
                    new_from_import['module'] = item.module
                    new_from_import['asname'] = i.asname
                    new_from_import['name'] = i.name
                    result.append(new_from_import)
        return result


class DependencyDataStructure:
    def __init__(self, imports_dict):
        self.imports_dict = imports_dict

    def make(self):
        root = {
            NAME_KEY: "root",
            NAME_NO_EXT_KEY: "root",
            CHILDREN_KEY: []
        }
        for file, imports in self.imports_dict.items():
            for import_obj in imports:
                from_path = path_components(file)
                if import_obj['level'] is not None:
                    if import_obj['module'] is None:
                        continue
                    else:
                        to_path_raw = import_obj['module'].replace(".", "/")
                        to_path = path_components(to_path_raw)
                    if import_obj['level'] == 0:
                        # absolute import
                        path_to_prepend = from_path[:-1]
                    else:
                        # relative import
                        path_to_prepend = from_path[:(import_obj['level'] * -1)]
                    full_to_path = path_to_prepend + to_path
                    self.add_component_then_dependencies(root, from_path, full_to_path)
                else:
                    path_to_prepend = from_path[:-1]
                    to_path = path_to_prepend + [import_obj['name']]
                    self.add_component_then_dependencies(root, from_path, to_path)
        return root

    def add_component_then_dependencies(self, root, from_path, dependency_path):
        # Check if root already has children key for curr_from_component
        # If not, add it to children,
        # Select the child node as root, recursively call with rest_from_path
        curr_from_component = from_path[0]
        curr_from_component_no_ext = no_extension(curr_from_component)
        matched_child = next(
            (item for item in root[CHILDREN_KEY] if item[NAME_NO_EXT_KEY] == curr_from_component_no_ext), None)
        if not matched_child:
            matched_child = {
                NAME_KEY: curr_from_component,
                NAME_NO_EXT_KEY: curr_from_component_no_ext,
                CHILDREN_KEY: [],
            }
            root[CHILDREN_KEY].append(matched_child)
        rest_from_path = from_path[1:]
        if len(rest_from_path) > 0:
            self.add_component_then_dependencies(matched_child, rest_from_path, dependency_path)
        else:
            # Base case - reached leaf node so add dependencies
            if DEPENDENCIES_KEY not in matched_child:
                matched_child[DEPENDENCIES_KEY] = []
            self.add_dependencies(matched_child[DEPENDENCIES_KEY], dependency_path)

    def add_dependencies(self, children, to_path):
        curr_to_component = to_path[0]
        curr_to_component_no_ext = no_extension(curr_to_component)
        matched_child = next((item for item in children if item[NAME_NO_EXT_KEY] == curr_to_component_no_ext), None)
        if not matched_child:
            matched_child = {
                NAME_NO_EXT_KEY: curr_to_component_no_ext,
                CHILDREN_KEY: [],
            }
            children.append(matched_child)
        rest_to_path = to_path[1:]
        if len(rest_to_path) > 0:
            self.add_dependencies(matched_child[CHILDREN_KEY], rest_to_path)


def path_components(path):
    path = os.path.normpath(path)
    return path.split(os.sep)


def no_extension(path):
    return os.path.splitext(path)[0]


def write_json_file(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--dir', help="search directory")
    p_args = parser.parse_args()
    PythonAstAnalyzer(p_args.dir)
