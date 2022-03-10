class DependencyTree {
    constructor(dependencyTreeNodes) {
        this.dependencyTreeNodes = dependencyTreeNodes;
    }

    dependencyNode(node) {
        const matchedDependencyTreeNode = this.findDependencyTreeNodeFrom(node, this.dependencyTreeNodes)
        return matchedDependencyTreeNode;
    }

    findDependencyTreeNodeFrom(nodeToFind, nodeList) {
        for (const dependencyTreeNode of nodeList) {
            if (dependencyTreeNode.node === nodeToFind) {
                return dependencyTreeNode;
            }
            const subSearchResult = this.findDependencyTreeNodeFrom(nodeToFind, dependencyTreeNode.children || [])
            if (subSearchResult) {
                return subSearchResult;
            }
        }
        return null;
    }

    getPathToNode(node) {
        const result = [];
        let currNode = node;
        while (currNode.parent) {
            result.unshift(currNode.data.name);
            currNode = currNode.parent
        }
        return result;
    }
}