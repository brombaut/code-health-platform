DEPENDENCIES_KEY = "$dependencies"
CHILDREN_KEY = "children"
NAME_KEY = "name_no_extension"


class StructureDependencyMerger:
    def __init__(self, structure, dependency_structure):
        self.structure = structure
        self.dependency_structure = dependency_structure

    def merge(self):
        ir_structure = Structure(self.structure)
        ir_dependency_structure = Structure(self.dependency_structure)
        ir_structure.merge_in_dependency_data(ir_dependency_structure)
        return ir_structure.root


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

    def __rec_merge(self, matched_structure_node, matched_dependency_node):
        # If matched_dependency_node has the DEPENDENCIES_KEY, it is a leaf dependency node and copy the dependencies
        # to the matched structure node
        if DEPENDENCIES_KEY in matched_dependency_node:
            matched_structure_node[DEPENDENCIES_KEY] = matched_dependency_node[DEPENDENCIES_KEY]
        else:
            # Not a leaf node, so for each dependency child node, find that matched structure child node and rec
            for dependency_child in matched_dependency_node[CHILDREN_KEY]:
                matched_structure_child_node = next((item for item in matched_structure_node[CHILDREN_KEY] if item[NAME_KEY] == dependency_child[NAME_KEY]), None)
                if matched_structure_child_node:
                    self.__rec_merge(matched_structure_child_node, dependency_child)
