class DependencyTreeParser {
    constructor(rawDependencyStructure, enclosure_diagram) {
        this.rawDependencyStructure = rawDependencyStructure;
        this.enclosureDiagram = enclosure_diagram;
        return this;
    }

    parse() {
        const dependencyTreeNodes = this.buildDependencyTreeNodes(this.enclosureDiagram.root);
        this.addDependencies(dependencyTreeNodes, this.rawDependencyStructure);
        return new DependencyTree(dependencyTreeNodes);
    }

    buildDependencyTreeNodes(node) {
        const result = [];
        for (const c of node.children) {
            const dependencyTreeNode = new DependencyTreeNode(c);
            if (c.children) {
                dependencyTreeNode.setChildren(this.buildDependencyTreeNodes(c));
            }
            result.push(dependencyTreeNode);
        }
        return result;
    }

    addDependencies(dependencyTreeNodes, depsTree) {
        for (const [parent, children] of Object.entries(depsTree)) {
            if (parent === "$dependencies") {
                // We have found that nodes dependencies, so return them
                return children;
            }
            const matchedNode = dependencyTreeNodes.find((treeNode) => treeNode.nameMatches(parent));
            if (matchedNode) {
                const nextdependencyTreeNodeList = matchedNode.children ? matchedNode.children : [];
                const result = this.addDependencies(nextdependencyTreeNodeList, children);
                if (result) {
                    // The result returned a hit for the $dependencies keyword in the children,
                    // which means the result now holds the dependencies for the current matched node
                    matchedNode.setDependencies(this.getLeafNodesForDependencies(this.enclosureDiagram.root, result));
                }
            }
        }

    }

    getLeafNodesForDependencies(rootNode, dependencies) {
        if (!rootNode.children) {
            // Base case - we have found a leaf node in the node tree that matches our walk
            // on the dependency tree, so return this root node.
            return [rootNode];
        }
    
        const result = []
        for (const [parent, children] of Object.entries(dependencies)) {
            const matchedChildNode = rootNode.children.find((d) => {
                return d.data.name === parent || this.removeFileExtention(d.data.name) === parent;
            });
            if (!matchedChildNode) {
                // We couldn't find a matching node in the structure tree for the node in the dependency tree - return null
                return []
            }
            // Recursively match 
            result.push(...this.getLeafNodesForDependencies(matchedChildNode, children));
        }
        return result;
    }

    removeFileExtention(fileName) {
        return fileName.split('.').slice(0, -1).join('.');
    }
}