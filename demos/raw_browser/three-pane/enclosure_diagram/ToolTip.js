class ToolTip {
    constructor(d3, elementProxy) {
        this.d3R = d3;
        this.elementProxy = elementProxy;
        this.d3El = this.d3R.select(this.elementProxy.container())
            .append("div")	
            .attr("id", "tooltip")				
            .style("opacity", 0)
            .style("z-index", 100);
    }

    show(node, nodeEl) {
        this.d3El.transition()
            .duration(200)
            .style("opacity", .9);
        this.d3El.html(node.data.name);
        const targetCircleBoundingRect = nodeEl.getBoundingClientRect();
        const topOffset = targetCircleBoundingRect.top - this.elementProxy.container().getBoundingClientRect().top - 20*1.4;
        
        let leftOffset = 0;
        leftOffset += targetCircleBoundingRect.left; // How far left the edge of the target circle is
        leftOffset += targetCircleBoundingRect.width/2;  // We want the tooltip in the center, so add half the width of the circle
        leftOffset -= this.elementProxy.container().getBoundingClientRect().left; // Account for the container position
        leftOffset -= this.d3El.node().getBoundingClientRect().width/2  // Subtract half the width of the tooltip to make sure it appears centered
        this.d3El.style("left", (leftOffset) + "px");
        this.d3El.style("top", (topOffset) + "px");
    }

    hide() {
        this.d3El.transition()
            .duration(500)
            .style("opacity", 0);
    }
}