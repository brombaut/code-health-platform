
class DependencyPane {
    constructor(d3, systemStructure) {
        this.d3R = d3
        this.systemStructure = systemStructure;
        this.callbacksMaker = new InfoNodeCallbacksMaker();

        const callbacks = {
            onClick: (event, d) => this.dependencyNodeClicked(d),
            onMouseEnter: (event, d) => this.onDependencyNodeHover(d, true),
            onMouseLeave: (event, d) => this.onDependencyNodeHover(d, false),
        }

        this.diagram = new TreeDiagram(this.d3R, callbacks)

        this.nodeClickedReceiver = new EventReceiver(
            EventTypes.ENC_NODE_SELECTED,
            ({ node }) => this.newNodeSelected(node)
        )
    }

    newNodeSelected(node) {
        const treeDiagramStructure = this.makeTreeDiagramStructure(node, this.systemStructure);
        this.diagram.makeNewDiagram(treeDiagramStructure);
    }

    makeTreeDiagramStructure(node, structureRoot) {
        const root = new DependencyTreeNode(node);
        if (node.data["$dependencies"]) {
            const nodeDependencies = [];
            node.data["$dependencies"].forEach((dependencyRoot) => {
                const dependencyName = dependencyRoot.name_no_extension;
                const structureName = structureRoot.data.name_no_extension;
                if (dependencyName === structureName) {
                    nodeDependencies.push(...this.getDependencyNode(structureRoot, dependencyRoot));
                }
            });
            root.setDependencies(nodeDependencies);
        }
        return root.treeDiagramFormat();
    }

    getDependencyNode(structureRoot, dependencyRoot) {
        // If structureRoot is a leaf node that matches the name of the dependencyRoot, return the structureNode
        if (!structureRoot.children) {
            return [structureRoot];
        }
        // Else, find children of structureRoot and dependencyRoot that match, and recursively follow that tree
        const result = [];
        for (const structureChild of structureRoot.children) {
            const theyMatch = (c) => c.name_no_extension === structureChild.data.name_no_extension;
            const matchedDependencyChild = dependencyRoot.children.find(theyMatch);
            if (matchedDependencyChild) {
                result.push(...this.getDependencyNode(structureChild, matchedDependencyChild));
            }
        }
        return result;
    }

    dependencyNodeClicked(dependencyNode) {
        this.onDependencyNodeHover(dependencyNode, false); // Force remove tooltip
        const encNode = dependencyNode.data.node;
        this.callbacksMaker.makeSelected(encNode)();
    }

    onDependencyNodeHover(dependencyNode, isEnter) {
        const encNode = dependencyNode.data.node;
        const eventToCall = isEnter ? this.callbacksMaker.makeMouseEnter(encNode) : this.callbacksMaker.makeMouseLeave(encNode);
        eventToCall();
    }
}