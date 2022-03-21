import type NodeView from "./NodeView";

export default class Zoomer {
    d3R: any;
    view: any;
    constructor(d3: any) {
        this.d3R = d3;
        this.view = null;
    }

    makeToZoomTo(node: { x: number; y: number; r: number; }): NodeView {
        return {
            x: node.x,
            y: node.y,
            diameter: node.r * 2
        };
    }

    zoomTo(toZoomTo: NodeView, encDiagram: any) {
        const k = encDiagram.size / toZoomTo.diameter;
        this.view = toZoomTo;
    
        const transformEl = (d: { x: number; y: number; }) => {
            const translateX = (d.x - toZoomTo.x) * k;
            const translateY = (d.y - toZoomTo.y) * k;
            return `translate(${translateX},${translateY})`
        }
        encDiagram.nodes.attr("transform", transformEl);
        encDiagram.nodes.attr("r", (d: { r: number; }) => d.r * k);
        encDiagram.labels.attr("transform", transformEl);
    }

    zoom(node: { x: number; y: number; r: number; }, encDiagram: any) {
        const zoomTween = (d: any) => {
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
            return (t: any) => {
                const toZoomTo = {
                    x: i(t)[0],
                    y: i(t)[1],
                    diameter: i(t)[2],
                }
                this.zoomTo(toZoomTo, encDiagram);
            };
        }
        const transition = encDiagram.svg.transition()
            .duration(750)
            .tween("zoom", zoomTween);
        
        encDiagram.labels
            .style("fill-opacity", (d: { parent: any; }) => d.parent == node ? 1 : 0)
            .style("display", (d: { parent: any; }) => d.parent == node ? "inline" : "none");

    }
}