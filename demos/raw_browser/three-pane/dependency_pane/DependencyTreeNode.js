class DependencyTreeNode {
    constructor(node) {
        this.node = node;
        this.name = this.node.data.name;
        this.children = null;
        this.dependencies = null;
    }

    setChildren(children) {
        this.children = children;
    }

    setDependencies(dependencies) {
        this.dependencies = dependencies;
    }

    nameMatches(tocheck) {
        return this.name === tocheck || this.removeFileExtention(this.name) === tocheck;
    }

    removeFileExtention(fileName) {
        return fileName.split('.').slice(0, -1).join('.');
    }

    treeDiagramFormat() {
        const result = {
            name: this.name,
            fullPath: this.fullPath(this.node),
            node: this.node,
        }
        if (this.dependencies) {
            result.children = this.dependencies
                .map((n) => this.formatDependenciesForTreeDiagramFormat(n))
                .filter((dep) => dep.node !== this.node);
        } else {
            result.children = [];
        }
        return result;
    }

    fullPath(node) {
        const result = [];
        let currNode = node;
        while (currNode.parent) {
            result.unshift(currNode.data.name);
            currNode = currNode.parent
        }
        return result;
    }

    formatDependenciesForTreeDiagramFormat(node) {
        const result = {
            name: node.data.name,
            fullPath: this.fullPath(node),
            node: node,
        };
        return result;
    }


}