
class DependencyPane {
    constructor(d3, dependencyTree) {
        this.tree = dependencyTree;
        this.diagram = new TreeDiagram(d3)

        this.nodeClickedReceiver = new EventReceiver(
            EventTypes.ENC_NODE_SELECTED,
            ({node}) => this.newNodeSelected(node)
        )
    }

    newNodeSelected(node) {
        const dependencyNode = this.tree.dependencyNode(node);
        console.log(dependencyNode.treeDiagramFormat());
        this.diagram.makeNewDiagram(dependencyNode.treeDiagramFormat());
    }
}