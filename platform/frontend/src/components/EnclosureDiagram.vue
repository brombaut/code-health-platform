<template>
  <div id="enclosure-diagram">

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as d3 from "d3";  // TODO: Maybe dont import this whole thing
import Zoomer from "./Zoomer";

export default defineComponent({
    name: "EnclosureDiagram",
    props: {
        treeData: {
            type: Object as () => SystemStructureNode,
            required: true,
        },
        eventCallbacks: {
            type: Object,
            required: true,
        },
    },
    data() {
        const setColor = () => {
            const result = d3.scaleLinear()
                .domain([-1, 5])
                .range(["hsl(185,60%,99%)", "hsl(187,40%,70%)"])
                .interpolate(d3.interpolateHcl);
            return (c: any) => result(c);
        };

        const zoomer = new Zoomer(d3)

        return {
            lColor: setColor(),
            margin: 200,
            root: null,
            svg: null,
            nodes: null,
            labels: null,
            focus: null,
            zoomer,
        };
    },
    mounted() {
        this.init();
    },
    computed: {
        container() {
            return this.$el;
        },
        containerWidth() {
            return this.container.getBoundingClientRect().width;
        },
        containerHeight() {
            return this.container.getBoundingClientRect().height;
        },
        size() {
            const rawWidth = this.containerWidth - this.margin;
            const rawHeight = this.containerHeight - this.margin;
            return rawWidth < rawHeight ? rawWidth : rawHeight;
        },
    },
    methods: {
        init() {
            this.root = this.makeRoot(this.treeData);
            this.svg = this.makeSvg();
            this.nodes = this.makeNodes(this.svg, this.root, this.eventCallbacks);
            this.labels = this.makeLabels(this.svg, this.root);
            this.focus = this.root;
            this.zoomer.zoomTo(this.zoomer.makeToZoomTo(this.focus), this);
        },
        color(c: any) {
            return this.lColor(c);
        },
        makeRoot(data) {
            const pack = (data) => d3.pack()
                .size([this.size, this.size])
                .padding(3)
                (d3.hierarchy(data)
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
        },
        makeSvg() {
            const minX = this.containerWidth / 2;
            const minY = this.containerHeight / 2;
            const width = this.containerWidth;
            const height = this.containerHeight;
            const result = d3.select(this.container)
                .append("svg")
                .attr("viewBox", `-${minX}, -${minY}, ${width}, ${height}`)
                // .style("background", this.elementProxy.color(0))
                .style("cursor", "pointer");
            console.log(this.container);
            return result;
        },
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
                    else if (d.children) return this.color(d.depth);
                    else return "WhiteSmoke";
                })
                .style("fill-opacity", (d) => d.data.normalized_weight)
                .on("click", this.eventCallbacks.onClick)
                .on("mouseenter", this.eventCallbacks.onMouseEnter)
                .on("mouseleave", this.eventCallbacks.onMouseLeave);
                
            return result;
        },
        makeLabels(svg, root) {
            const result = svg
                .append("g")
                .selectAll("text")
                .data(root.descendants())
                .enter().append('text')
                .attr("class", "label")
                .attr("transform", (d) => `translate(${d.x},${d.y})`)
                .style("fill", (d) => {
                    return d.data.normalized_weight >= 0.5 ? "white" : "#3A445A";
                })
                .style("fill-opacity", (d) => d.parent === root ? 1 : 0)
                .style("display", (d) => d.parent == root ? "inline" : "none")
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
});
</script>

<style lang="scss">
#enclosure-diagram {
    flex: 1;

    .node {
        &:hover,
        &.hovering {
            stroke: var(--hover-color);;
            stroke-width: 1.5px;
        }

        &.selected {
            stroke: var(--selected-color);;
            stroke-width: 1.5px;
        }
    }

    .node--leaf {
        fill: white;
        stroke: #777;
        stroke-width: 0.5px;
    }

    .label {
        text-anchor: middle;
        font-size: 12px;
        /* fill: white; */
        /* fill: #3A445A; */
        /* text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff, 0 -1px 0 #fff; */
        pointer-events: none;
    }
}

</style>