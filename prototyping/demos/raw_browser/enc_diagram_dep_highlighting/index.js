let root;
let svg, node, label;
let view, focus;
let tooltipEl;


ENC_TYPE = "hotspot";

async function main() {
    const data = await fetchJson();
    root = makeRoot(data);
    focus = root;
    svg = makeSvg(root);
    tooltipEl = d3.select(container()).append("div")	
            .attr("class", "tooltip")				
            .style("opacity", 0);
    node = makeNode(root);
    // label = makeLabel(root);

    zoomTo({
        x: root.x,
        y: root.y,
        diameter: root.r * 2
    });
    return svg.node();
}

const diameters = (() => {
    const outerDiameterOffset = 0;
    const margin = 100;
    const outerDiameterW = container().getBoundingClientRect().width - outerDiameterOffset;
    const innerDiameterW = outerDiameterW - margin - margin;
    const outerDiameterH = container().getBoundingClientRect().height - outerDiameterOffset;
    const innerDiameterH = outerDiameterH - margin - margin;
    return () => {
        const result = {
            outerDiameterW,
            innerDiameterW,
            outerDiameterH,
            innerDiameterH
        }
        return result;
    };
})();

function outerWidth() { return diameters().outerDiameterW }
function outerHeight() { return diameters().outerDiameterH }
function innerWidth() { return diameters().innerDiameterW }
function innerHeight() { return diameters().innerDiameterH }


const color = (() =>  {
    const result = d3.scaleLinear()
        .domain([-1, 5])
        .range(["hsl(185,60%,99%)", "hsl(187,40%,70%)"])
        .interpolate(d3.interpolateHcl);
    return (c) => result(c);
})();

function makeRoot(data) {
    pack = data => d3.pack()
        .size([innerWidth(), innerHeight()])
        .padding(3)
        (d3.hierarchy(data)
            .sum(d => Number(d.size))
            .sort((a, b) => b.size - a.size))
    result = pack(data);
    return result;
}

function makeSvg() {
    const result = d3.select(container()).append("svg")
        .attr("viewBox", `-${outerWidth() / 2} -${outerHeight() / 2} ${outerWidth()} ${outerHeight()}`)
        .style("background", color(0))
        .style("cursor", "pointer");
    return result
}

function makeNode() {
    const tooltipFunctions = {
        show: (event, d) => {
            tooltipEl.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipEl.html(d.data.name);
            const circleBoundingRect = event.target.getBoundingClientRect();
            const topOffset = circleBoundingRect.top - container().getBoundingClientRect().top - 20*1.2;
            const leftOffset = circleBoundingRect.left - 
                container().getBoundingClientRect().left + 
                (circleBoundingRect.width/2) - 
                (tooltipEl.node().getBoundingClientRect().width/2);
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
            dependentDs = d3.selectAll(".node--leaf").nodes().filter(() => Math.random() < 0.1);
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
            if (ENC_TYPE == "hotspot") {
                if (d.data.weight > 0.0 ) return "darkred";
                else if (d.children) return color(d.depth);
                else return "WhiteSmoke";
            } else if (ENC_TYPE == "main_dev") {
                if (d.data.weight > 0.0 ) return d.data.author_color;
                else if (d.children) return color(d.depth);
                else return "WhiteSmoke";
            } else {
                throw new Error("Unknown enclosure diagram type: " + ENC_TYPE)
            }
        })
        .style("fill-opacity", (d) => {
            if (ENC_TYPE == "hotspot") {
                return d.data.weight; 
            } else if (ENC_TYPE == "main_dev") {
                return d.data.effort;
            } else {
                throw new Error("Unknown enclosure diagram type: " + ENC_TYPE)
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
        .on("wheel", (event, d) => {
            const findNodeToZoomInTo = (focus, selectedChild) => {
                let result = selectedChild;
                while (result.parent && result.parent != focus) {
                    result = result.parent;
                }
                return result;
            };
            const zoomIn = event.wheelDeltaY >= 0;
            const nodeToMoveTo = zoomIn ? findNodeToZoomInTo(focus, d) : focus.parent ? focus.parent : focus;
            zoom(null, nodeToMoveTo);
        });
    return result;
}

// function makeLabel() {
//     const result = svg.append("g")
//         .style("font", "10px sans-serif")
//         .attr("pointer-events", "none")
//         .attr("text-anchor", "middle")
//         .selectAll("text")
//         .data(root.descendants())
//         .join("text")
//         .style("fill-opacity", d => d.parent === root ? 1 : 0)
//         .style("display", d => d.parent === root ? "inline" : "none")
//         .text(d => d.data.name);
//     return result;
// }

function zoomTo(toZoomTo) {
    const k = innerWidth() / toZoomTo.diameter;
    view = toZoomTo;

    const transformEl = (d) => {
        const translateX = (d.x - toZoomTo.x) * k;
        const translateY = (d.y - toZoomTo.y) * k;
        return `translate(${translateX},${translateY})`
    }
    // label.attr("transform", transformEl);
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
                toZoomTo = {
                    x: i(t)[0],
                    y: i(t)[1],
                    diameter: i(t)[2],
                }
                zoomTo(toZoomTo, node, label);
            };
        });

    // label
    //     .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
    //     .transition(transition)
    //     .style("fill-opacity", d => d.parent === focus ? 1 : 0)
    //     .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
    //     .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}

async function fetchJson() {
    const response = await fetch("enclosure_diagram.json");
    return await response.json()
}

function container() {
    return document.querySelector("#graph");
}

main();