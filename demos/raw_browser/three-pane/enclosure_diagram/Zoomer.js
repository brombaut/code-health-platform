class Zoomer {
    constructor() {
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
}