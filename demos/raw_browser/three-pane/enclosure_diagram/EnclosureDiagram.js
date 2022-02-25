
class EnclosureDiagram {
    constructor(d3, data) {
        this.d3R = d3;
        this.elementProxy = new ElementProxy(this.d3R)
        this.tooltip = new ToolTip(this.d3R, this.elementProxy);
        const builder = new EnclosureDiagramBuilder(this.d3R, this.elementProxy);
        this.root = builder.makeRoot(data);
        this.svg = builder.makeSvg();
        const callbacks = {
            onClick: (event, d) => this.onNodeClick(d),
            onMouseEnter: (event, d) => {
                this.onNodeHover(d, true);
                this.tooltip.show(d, event.target);
            },
            onMouseLeave: (event, d) => {
                this.onNodeHover(d, false);
                this.tooltip.hide();
            },
        }
        this.nodes = builder.makeNodes(this.svg, this.root, callbacks);
        this.labels = builder.makeLabels(this.svg, this.root);

        this.focus = this.root;
        this.zoomer = new Zoomer(this.d3R)
        this.zoomer.zoomTo(this.zoomer.makeToZoomTo(this.focus), this);

        // Initially set selected node to root
        this.setSelectedNode(this.root);

        this.nodeClickedReceiver = new EventReceiver(
            EventTypes.INFO_NODE_SELECTED,
            ({node}) => this.onNodeClick(node)
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

    onNodeClick(node) {
        if (!node) {
            node = this.root;
        }
        this.setSelectedNode(node);
        // If not leaf node, zoom to node, else zoom to parent
        const nodeToZoomTo = node.children || !node.parent ? node : node.parent;
        this.zoomer.zoom(nodeToZoomTo, this);
    }

    onNodeHover(node, enter) {
        if (enter) {
            new EncNodeMouseEnterEvent(node).dispatch();
        } else {
            new EncNodeMouseLeaveEvent(node).dispatch();
        }
    }

    setSelectedNode(node) {
        this.focus = node;
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
        if (!node) {
            node = this.root;
        }
        const elToSelect = this.findElFromNode(node);
        if (elToSelect) {
            elToSelect.classList.add("hovering");
            this.tooltip.show(node, elToSelect);
        }
    }

    removeHoveringNode(node) {
        if (!node) {
            node = this.root;
        }
        const elToSelect = this.findElFromNode(node);
        if (elToSelect) {
            elToSelect.classList.remove("hovering");
            this.tooltip.hide();
        }
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
