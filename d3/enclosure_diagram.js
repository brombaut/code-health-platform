require.undef('enclosure_diagram_js');

require.config({paths: {d3: 'd3/d3_7.3.0/d3.min'}});

function makeColor(d3) {
    const result = d3.scaleLinear()
    .domain([-1, 5])
    .range(["hsl(185,60%,99%)", "hsl(187,40%,70%)"])
    .interpolate(d3.interpolateHcl);
    return (c) => result(c);
}

function makeDiameters(container) {
    const containerRect = container.getBoundingClientRect();
    const outerDiameterOffset = 10;
    const margin = 10;
    const outerW = containerRect.width - outerDiameterOffset;
    const innerW = outerW - 2*margin;
    const outerH = containerRect.width - outerDiameterOffset;
    const innerH = outerH - 2*margin;
    const result = {
        outerW,
        innerW,
        outerH,
        innerH
    }
    return result;
}

function makeRoot(d3, data, diameters) {
    const pack = (data) => d3.pack()
        .size([diameters.innerW, diameters.innerH])
        .padding(3)
        (d3.hierarchy(data)
            .sum(d => Number(d.size))
            .sort((a, b) => b.size - a.size))
    const result = pack(data);
    return result;
}

function makeSvg(d3, container, diameters, color) {
    const minX = diameters.outerW / 2;
    const minY = diameters.outerH / 2;
    const width = diameters.outerW;
    const height = diameters.outerH;
    const result = d3.select(container).append("svg")
        .attr("viewBox", `-${minX}, -${minY}, ${width}, ${height}`)
        .style("background", color(0))
        .style("cursor", "pointer");
    return result
}

function makeTooltip(d3, container) {
    const result = d3.select(container).append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0)
        .style("z-index", 100);
    return result;
}

function makeNode(d3, container, svg, root, tooltipEl, enc_type, zoom, color, focus) {
    const tooltipFunctions = {
        show: (event, d) => {
            tooltipEl.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipEl.html(d.data.name);
            const targetCircleBoundingRect = event.target.getBoundingClientRect();
            const topOffset = targetCircleBoundingRect.top - container.getBoundingClientRect().top - 20*1.2;
            
            let leftOffset = 0;
            leftOffset += targetCircleBoundingRect.left; // How far left the edge of the target circle is
            leftOffset += targetCircleBoundingRect.width/2;  // We want the tooltip in the center, so add half the width of the circle
            leftOffset -= container.getBoundingClientRect().left; // Account for the container position
            leftOffset -= tooltipEl.node().getBoundingClientRect().width/2  // Subtract half the width of the tooltip to make sure it appears centered
            tooltipEl.style("left", (leftOffset) + "px");
            tooltipEl.style("top", (topOffset) + "px");
        },
        hide: () => {
            tooltipEl.transition()
                .duration(500)
                .style("opacity", 0);
        },
    }

    const highlightFunctions = {
        highlightDependentsOf: (d, clickedEl) => {
            if (d.children) return; // Don't highlight when hovering on directory
            const dependentDs = d3.selectAll(".node--leaf").nodes().filter(() => Math.random() < 0.1);
            // console.log(dependentDs);
            dependentDs.map((d) => {
                d.classList.add("dependent");
            });
        },
        highlightSelected: (clickedEl) => {
            clickedEl.classList.add("selected");
        },
        removeHighlights: () => {
            d3.selectAll(".selected, .dependent").nodes().map((el) => {
                el.classList.remove("selected");
                el.classList.remove("dependent");
            });
        },
    }

    const result = svg.append("g")
        .selectAll("circle")
        .data(root.descendants())
        .enter().append('circle')
        .attr("class", function (d) {
            if (!d.parent) return "node node--root";
            if (d.children) return "node";
            return "node node--leaf"
        })
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
        .style("fill", (d) => {
            if (enc_type == "hotspot") {
                if (d.data.weight > 0.0 ) return "darkred";
                else if (d.children) return color(d.depth);
                else return "WhiteSmoke";
            } else if (enc_type == "main_dev") {
                if (d.data.weight > 0.0 ) return d.data.author_color;
                else if (d.children) return color(d.depth);
                else return "WhiteSmoke";
            } else {
                throw new Error("Unknown enclosure diagram type: " + enc_type)
            }
        })
        .style("fill-opacity", (d) => {
            if (enc_type == "hotspot") {
                return d.data.weight; 
            } else if (enc_type == "main_dev") {
                return d.data.effort;
            } else {
                throw new Error("Unknown enclosure diagram type: " + enc_type)
            }
        })
        .on("mouseenter", (event, d) => {
            tooltipFunctions.show(event, d);
        })
        .on("mouseout", (event, d) => {
            tooltipFunctions.hide(event, d);
        })
        .on('click', (event, d) => {
            const clickedEl = event.target;
            const clickedSelectedLeaf = clickedEl.classList.contains('selected');
            const clickedDirectory = !clickedEl.classList.contains('node--leaf')
            if (clickedSelectedLeaf || clickedDirectory) {
                // Click already selected node
                highlightFunctions.removeHighlights();
            } else {
                highlightFunctions.removeHighlights();
                highlightFunctions.highlightSelected(clickedEl);
                highlightFunctions.highlightDependentsOf(d, clickedEl);
            }
        })
        // .on("wheel", (event, d) => {
        //     const findNodeToZoomInTo = (focus, selectedChild) => {
        //         let result = selectedChild;
        //         while (result.parent && result.parent != focus) {
        //             result = result.parent;
        //         }
        //         return result;
        //     };
        //     const zoomIn = event.wheelDeltaY >= 0;
        //     const nodeToMoveTo = zoomIn ? findNodeToZoomInTo(focus, d) : focus.parent ? focus.parent : focus;
        //     zoom(null, nodeToMoveTo);
        // });
    return result;
}

define('enclosure_diagram_js', ['d3'], function (d3) {
    function draw(container, json_file, enc_type) {
        container.style.position = "relative";
        let view;
        const color = makeColor(d3);
        const diameters = makeDiameters(container);
        const root = makeRoot(d3, json_file, diameters);
        let focus = root;
        const svg = makeSvg(d3, container, diameters, color);
        const tooltipEl = makeTooltip(d3, container);
        const node = makeNode(d3, container, svg, root, tooltipEl, enc_type, zoom, color, focus);

        zoomTo({
            x: root.x,
            y: root.y,
            diameter: root.r * 2
        });

        function zoomTo(toZoomTo) {
            const k = diameters.innerW / toZoomTo.diameter;
            view = toZoomTo;
        
            const transformEl = (d) => {
                const translateX = (d.x - toZoomTo.x) * k;
                const translateY = (d.y - toZoomTo.y) * k;
                return `translate(${translateX},${translateY})`
            }
            node.attr("transform", transformEl);
            node.attr("r", d => d.r * k);
        }

        function zoom(event, d) {
            const focus0 = focus;
            focus = d;
            const transition = svg.transition()
                .duration(750)
                .tween("zoom", d => {
                    const translatedView = [
                        view.x,
                        view.y,
                        view.diameter,
                    ];
                    const i = d3.interpolateZoom(translatedView, [focus.x, focus.y, focus.r * 2]);
                    return (t) => {
                        const toZoomTo = {
                            x: i(t)[0],
                            y: i(t)[1],
                            diameter: i(t)[2],
                        }
                        // zoomTo(toZoomTo, node, label); // I don't know why node and label were passed here...?
                        zoomTo(toZoomTo);
                    };
                });
        }

    }
    return draw;
});