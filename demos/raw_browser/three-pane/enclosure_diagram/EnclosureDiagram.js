
class EnclosureDiagram {
    constructor(d3, data) {
        this.d3R = d3;
        this.elementProxy = new ElementProxy(d3)
        const builder = new EnclosureDiagramBuilder(d3, this.elementProxy);
        this.root = builder.makeRoot(data);
        this.svg = builder.makeSvg();
        const callbacks = {
            onClick: (event, d) => this.onNodeClick(d),
            onMouseEnter: (event, d) => this.onNodeHover(d, true),
            onMouseLeave: (event, d) => this.onNodeHover(d, false),
        }
        this.nodes = builder.makeNodes(this.svg, this.root, callbacks);
        this.labels = builder.makeLabels(this.svg, this.root);

        this.zoomer = new Zoomer()
        this.zoomer.zoomTo(this.zoomer.makeToZoomTo(this.root), this);

        // Initially set selected node to root
        this.setSelectedNode(this.root);

        this.nodeClickedReceiver = new EventReceiver(
            EventTypes.INFO_NODE_SELECTED,
            ({node}) => this.setSelectedNode(node)
        )

        this.nodeMouseEnterReceiver = new EventReceiver(
            EventTypes.INFO_NODE_MOUSE_ENTER,
            ({node}) => this.setHoveringNode(node)
        )

        this.nodeMouseLeaveReceiver = new EventReceiver(
            EventTypes.INFO_NODE_MOUSE_LEAVE,
            ({node}) => this.removeHoveringNode(node)
        )
    }

    onNodeClick(d) {
        this.setSelectedNode(d);
    }

    onNodeHover(d, enter) {
        if (enter) {
            new EncNodeMouseEnterEvent(d).dispatch();
        } else {
            new EncNodeMouseLeaveEvent(d).dispatch();
        }
    }

    setSelectedNode(node) {
        if (!node) {
            node = this.root;
        }
        // Remove selected
        this.d3R.selectAll(".selected").nodes().map((el) => {
            el.classList.remove("selected");
        });
        const elToSelect = this.findElFromNode(node);
        elToSelect?.classList.add("selected");
        const e = new EncNodeSelectedEvent(node);
        e.dispatch();
    }

    setHoveringNode(node) {
        // Remove selected
        this.d3R.selectAll(".hovering").nodes().map((el) => {
            el.classList.remove("hovering");
        });
        const elToSelect = this.findElFromNode(node);
        elToSelect?.classList.add("hovering");
    }

    removeHoveringNode(node) {
        const elToSelect = this.findElFromNode(node);
        elToSelect?.classList.remove("hovering");
    }

    findElFromNode(node) {
        // TODO: This could probably be done better
        const elsToSelect = this.nodes.filter((d) => d === node).nodes();
        if (elsToSelect.length > 0) {
            return elsToSelect[0];
        } else {
            return null;
        }
    }

}
