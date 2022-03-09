class TreeDiagram {
    constructor(d3, callbacks) {
        this.d3R = d3;
        this.elementProxy = new DepElementProxy();
        this.callbacks = callbacks;
    }

    makeNewDiagram(data) {
        console.log(data);
        this.elementProxy.reset();
        this.root = this.makeRoot(data);
        this.svg = this.makeSvg();
        this.links = this.makeLinks(this.svg, this.root);
        this.nodes = this.makeNodes(this.svg, this.root);
    }

    makeRoot(data) {
        const treemap = this.d3R
            .tree()
            .size([
                this.elementProxy.containerHeight() - this.elementProxy.margin(),
                this.elementProxy.containerWidth() - this.elementProxy.margin()
            ]);
        const nodes = this.d3R.hierarchy(data, d => d.children);
        const root = treemap(nodes);
        return root;
    }

    makeSvg() {
        // const minX = this.elementProxy.containerWidth() / 2;
        // const minY = this.elementProxy.containerHeight() / 2;
        const minX = this.elementProxy.margin();
        const minY = this.elementProxy.margin();
        const width = this.elementProxy.containerWidth() + this.elementProxy.margin();
        const height = this.elementProxy.containerHeight() + this.elementProxy.margin();
        const result = this.d3R.select(this.elementProxy.container())
            .append("svg")
            .attr("viewBox", `-${minX}, -${minY}, ${width}, ${height}`)
            .style("cursor", "pointer");
        return result;
    }

    makeNodes(svg, root) {
        const result = svg
            .append("g")
            .attr("class", "g-node")
            .selectAll("circle")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", d => "dep-node")
            .attr("transform", d => `translate(${d.y},${d.x})`);
        
        var rectHeight = 60, rectWidth = 120;
        // result.append('rect')
        //     .attr('class', 'dep-node')
        //     .attr("width", rectWidth)
        //     .attr("height", rectHeight)
        //     .attr("x", (rectWidth/2)*-1)
        //     .attr("y", (rectHeight/2)*-1)
        //     .attr("rx","5")
        //     .style("fill", "#5f9ea0");
        result.append("circle")
            .attr("r", d => 20)
            .style("stroke", d => d.data.type)
            .style("fill", "#5f9ea0")
            .on("click", this.callbacks.onClick)
            .on("mouseenter", this.callbacks.onMouseEnter)
            .on("mouseleave", this.callbacks.onMouseLeave);

        result.append("text")
            .text(d => d.data.name)
            .attr("dy", ".35em")
            .attr("x", (d, idx, lblEls) => {
                const lblElRect = lblEls[idx].getBoundingClientRect();
                let offset;
                if (d.children) {
                    offset = lblElRect.width/2 * -1;
                } else {
                    offset = lblElRect.width * -1;
                }
                return offset;
            })
            .attr("y", (d, idx, els) => {
                const nodeEls = result.nodes();
                const nodeElRect = nodeEls[idx].getBoundingClientRect();;
                const offset = nodeElRect.height * -1;
                return offset;
            })

    }

    makeLinks(svg, root) {

        svg.append("svg:defs").append("svg:marker") 
            .attr("id", "arrow")
            .attr("refX", 40)
            .attr("refY", 10)
            .attr("markerWidth", 100)
            .attr("markerHeight", 100)
            .attr("orient", "auto")
            .append("path")
            .attr("d", this.d3R.line()([[0, 0], [0, 20], [20, 10]]))
            .style("fill", "black");
        
        const result = svg.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter()
            .append("path")
            .attr("class", "link")
            .style("stroke", "black")
            .style("fill", "transparent")
            .attr("d", d => {
                // Draw from parent to child (i.e., left to right)
                const dAttr = `
                    M${d.parent.y},${d.parent.x}
                    C${(d.parent.y + d.y) / 2},${d.parent.x}
                    ${(d.parent.y + d.y) / 2},${d.x}
                    ${d.y},${d.x}
                `;
                return dAttr;

            })
            .attr("marker-end", "url(#arrow)");
        // return result;
    }
}