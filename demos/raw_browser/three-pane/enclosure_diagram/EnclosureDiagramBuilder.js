class EnclosureDiagramBuilder {
    constructor(d3, elementProxy) {
        this.d3R = d3;
        this.elementProxy = elementProxy;
    }

    makeRoot(data) {
        const pack = (data) => d3.pack()
            .size([this.elementProxy.size(), this.elementProxy.size()])
            .padding(3)
            (this.d3R.hierarchy(data)
                .sum(d => Number(d.code_lines))
                .sort((a, b) => b.code_lines - a.code_lines))
        function addShownAttr(s) {
            if (!s) return;
            s.show = false;
            for (const c of s.children) addShownAttr(c);
        }
        addShownAttr(data);
        const result = pack(data);
        return result;
    }

    makeSvg() {
        const minX = this.elementProxy.containerWidth() / 2;
        const minY = this.elementProxy.containerHeight() / 2;
        const width = this.elementProxy.containerWidth();
        const height = this.elementProxy.containerHeight();
        const result = this.d3R.select(this.elementProxy.container()).append("svg")
            .attr("viewBox", `-${minX}, -${minY}, ${width}, ${height}`)
            // .style("background", this.elementProxy.color(0))
            .style("cursor", "pointer");
        return result;
    }

    makeNodes(svg, root, callbacks) {
        const result = svg
            .append("g")
            .attr("class", "g-node")
            .selectAll("circle")
            .data(root.descendants())
            .enter().append('circle')
            .attr("class", (d) => {
                const classList = ["node"];
                if (d == root) classList.push("node--root", "selected");
                if (!d.children) classList.push("node--leaf");
                return classList.join(" ");
            })
            .attr("transform", (d) => `translate(${d.x},${d.y})`)
            .style("fill", (d) => {
                if (d.data.normalized_weight > 0.0 ) return "darkred";
                else if (d.children) return this.elementProxy.color(d.depth);
                else return "WhiteSmoke";
            })
            .style("fill-opacity", (d) => d.data.normalized_weight)
            .on("click", callbacks.onClick)
            .on("mouseenter", callbacks.onMouseEnter)
            .on("mouseleave", callbacks.onMouseLeave);
            
        return result;
    }

    makeLabels(svg, root) {
        const result = svg
            .append("g")
            .selectAll("text")
            .data(root.descendants())
            .enter().append('text')
            .attr("class", "label")
            .attr("transform", (d) => `translate(${d.x},${d.y})`)
            .style("fill-opacity", (d) => d.parent === root ? 1 : 0)
            .style("display", (d) => {
                if (d == root || d.parent == root) {
                    return null; // If a node is a child of the currently focused node, display it
                }
                return "none";
            })
            .text((d) => {
                let result = d.data.name;
                if (d.children?.length > 0) {
                    result += "/";
                }
                return result;
            });
        return result;
    }



}