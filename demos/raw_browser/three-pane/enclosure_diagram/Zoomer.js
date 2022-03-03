class Zoomer {
    constructor(d3) {
        this.d3R = d3;
        this.view = null;
    }

    makeToZoomTo(node) {
        return {
            x: node.x,
            y: node.y,
            diameter: node.r * 2
        };
    }

    zoomTo(toZoomTo, encDiagram) {
        const k = encDiagram.elementProxy.size() / toZoomTo.diameter;
        this.view = toZoomTo;
    
        const transformEl = (d) => {
            const translateX = (d.x - toZoomTo.x) * k;
            const translateY = (d.y - toZoomTo.y) * k;
            return `translate(${translateX},${translateY})`
        }
        encDiagram.nodes.attr("transform", transformEl);
        encDiagram.nodes.attr("r", d => d.r * k);
        encDiagram.labels.attr("transform", transformEl);
    }

    zoom(node, encDiagram) {
        const zoomTween = (d) => {
            const startingViewToZoomTo = this.view;
            const startingView = [
                startingViewToZoomTo.x,
                startingViewToZoomTo.y,
                startingViewToZoomTo.diameter
            ];
            const endingViewToZoomTo = this.makeToZoomTo(node);
            const endingView = [
                endingViewToZoomTo.x,
                endingViewToZoomTo.y,
                endingViewToZoomTo.diameter
            ];
            const i = this.d3R.interpolateZoom(startingView, endingView);
            return (t) => {
                const toZoomTo = {
                    x: i(t)[0],
                    y: i(t)[1],
                    diameter: i(t)[2],
                }
                this.zoomTo(toZoomTo, encDiagram);
            };
        }
        const transition = encDiagram.svg.transition()
            .duration(0)
            .tween("zoom", zoomTween);
        
        encDiagram.labels
            .style("fill-opacity", (d) => d.parent == node ? 1 : 0)
            .style("display", (d) => d.parent == node ? "inline" : "none");

    }
}