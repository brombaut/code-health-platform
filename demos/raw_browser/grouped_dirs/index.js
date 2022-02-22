let root;
let svg, node, label;
let view, focus;
let tooltipEl;


function removeFileExtention(fileName) {
    return fileName.split('.').slice(0, -1).join('.');
}

function getPathToD(d) {
    const result = [];
    let currNode = d;
    while (currNode.parent) {
        result.unshift(currNode.data.name);
        currNode = currNode.parent
    }
    return result;
}

function getDFromPath(nodes, path) {
    console.log(path);
    console.log(nodes);
}

function getDependenciesForNode(node, dependencies) {
    const pathToNode = getPathToD(node);
    let tempDeps = dependencies;
    const dependencyPathToD = [];
    // Walk down the dependency tree to the node
    for (let i=0; i < pathToNode.length; i++) {
        const pathItem = pathToNode[i];
        // We find the correct node in the dependency tree. Move into that node and continue
        if (tempDeps[pathItem]) {
            tempDeps = tempDeps[pathItem];
            dependencyPathToD.push(pathItem);
            continue;
        }
        // We didnt find a specific node in the tree - try to remove file extention
        // (The structure graph leaf nodes (files) have the file extention, but the 
        // dependency graph leaf nodes do not have the file extention)
        const pathItemRemoveExtention = removeFileExtention(pathItem);
        if (pathItemRemoveExtention && tempDeps[pathItemRemoveExtention]) {
            tempDeps = tempDeps[pathItemRemoveExtention];
            dependencyPathToD.push(pathItemRemoveExtention);
            continue;
        }
        // Dependencies not found - return null
        return null;
    }

    const createSubDependencies = (dependencyPathToD, tempDeps) => {
        const result = {...tempDeps}; // Copy 
        delete result['$dependencies'];
        // TODO
        return result;
    };
    const result = {
        pathToNode,
        dependencyPathToNode: dependencyPathToD,
        directDependencies: tempDeps['$dependencies'],
        subDependencies: null, // TODO
    }
    return result;
}


function dependencyTreeHasPath(dependencies, path) {
    // Base case - we c found every element in the path, which means the path has been found in 
    // the dependency tree - return true
    if (path.length === 0) {
        return true;
    }
    for(const [parent, child] of Object.entries(dependencies)) {
        if (parent === path[0] || parent === removeFileExtention(path[0])) {
            return dependencyTreeHasPath(child, [...path.slice(1)]);
        }
    }
    // We didn't find a matching path in the dependency tree - return false
    return false;
}

function findDependenciesWithPath(pathToCheck, pathSoFar, dependencies) {
    const result = [];
    for(const [parent, child] of Object.entries(dependencies)) {
        if (parent === "$dependencies") {
            // Base Case - Need to check if dependencies contains pathToCheck
            if (dependencyTreeHasPath(child, pathToCheck)) {
                // PathSoFar node depends on pathToCheck
                // console.log(pathToCheck)
                result.push(pathSoFar);
            }
            // console.log("FALSE");
        } else {
            // Recursively call getDependents
            result.push(...findDependenciesWithPath(pathToCheck, [...pathSoFar, parent], child));
        }
    }
    return result;
}

function getDependencyFromPath(path, dependencies) {
    const result = {};
    let tempResult = result;
    let tempDeps = dependencies;
    for(let i=0; i<path.length; i++) {
        if (!tempDeps[path[i]]) {
            return;
        }
        if (i === path.length-1) {
            tempResult[path[i]] = tempDeps[path[i]];
        } else {
            tempResult[path[i]] = {};
        }
        tempResult = tempResult[path[i]]
        tempDeps = tempDeps[path[i]];
    }
    return result;
}

function getDependentsForNode(node, dependencies, rootNode) {
    const pathToNode = getPathToD(node);
    const dependentNodeDependencyPaths = findDependenciesWithPath(pathToNode, [], dependencies)
    const dependentNodeDependencies = dependentNodeDependencyPaths.map((path) => getDependencyFromPath(path, dependencies));
    const addDepToFlattened = (dep, result) => {
        for (const [parent, children] of Object.entries(dep)) {
            if (!result[parent]) {
                result[parent] = children;
            } else {
                addDepToFlattened(children, result[parent]);
            }

        }
    }
    const dependentNodeDependenciesFlattened = {};
    dependentNodeDependencies.forEach((dep) => {
        addDepToFlattened(dep, dependentNodeDependenciesFlattened);
    });
    const result = getLeafNodesForDependencies(rootNode, dependentNodeDependenciesFlattened);
    return result;
}

function getLeafNodesForDependencies(rootNode, dependencies) {
    if (!rootNode.children) {
        // Base case - we have found a leaf node in the node tree that matches our walk
        // on the dependency tree, so return this root node.
        return [rootNode];
    }

    const result = []
    for (const [parent, children] of Object.entries(dependencies)) {
        const matchedChildNode = rootNode.children.find((d) => {
            return d.data.name === parent || removeFileExtention(d.data.name) === parent;
        });
        if (!matchedChildNode) {
            // We couldn't find a matching node in the structure tree for the node in the dependency tree - return null
            return []
        }
        // Recursively match 
        result.push(...getLeafNodesForDependencies(matchedChildNode, children));
    }
    return result;
}

function getLowestShownNodeOfDependencies(dependencies, shownNodeNames) {
    const shownNodeNamesNoFileExt = shownNodeNames.map(removeFileExtention).filter(s => s !== '');
    const result = []
    for (const [parent, children] of Object.entries(dependencies)) {
        // If parent is not shown, then return nothing
        if (!shownNodeNames.includes(parent) && !shownNodeNamesNoFileExt.includes(parent)) {
            return [];
        } else {
            // Parent node is shown. Check if any children are shown.
            const childrenShown = getLowestShownNodeOfDependencies(children, shownNodeNames);
            if (childrenShown.length == 0) {
                // None of the children are shown. This means the parent is the lowest shown node
                result.push(parent);
            } else {
                // Some of the children are shown, spread them out into the result.
                result.push(...childrenShown);
            }
        }
    }
    return result;
}

function findNodeByName(name, shownNodes) {
    const filtered = shownNodes.filter(d => {
        const dName = d.data.name
        return dName === name || removeFileExtention(dName) === name;
    }).data();
    if (filtered.length === 1) return filtered[0];
    return null
}

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
    const margin = 100;
    const max_dimension = 700;
    const outerW = containerRect.width - outerDiameterOffset;
    const innerW = Math.min(outerW - 2*margin, max_dimension);
    const outerH = containerRect.height - outerDiameterOffset;
    const innerH = Math.min(outerH - 2*margin, max_dimension);
    const result = {
        outerW,
        innerW: Math.min(innerW, innerH),
        outerH,
        innerH: Math.min(innerW, innerH)
    }
    return result;
}

function makeRoot(d3, data, containerEls) {
    const pack = (data) => d3.pack()
        .size([containerEls.diameters.innerW, containerEls.diameters.innerH])
        .padding(3)
        (d3.hierarchy(data)
            .sum(d => Number(d.size))
            .sort((a, b) => b.size - a.size))
    function addShownAttr(structure) {
        // Base case
        if (!structure) return;
        structure.show = false;
        for (const c of structure.children) {
            addShownAttr(c);
        }
        return;
    }
    addShownAttr(data.structure)
    const result = pack(data.structure);
    return result;
}

function makeSvg(d3, containerEls, color) {
    const minX = containerEls.diameters.outerW / 2;
    const minY = containerEls.diameters.outerH / 2;
    const width = containerEls.diameters.outerW;
    const height = containerEls.diameters.outerH;
    const result = d3.select(containerEls.container).append("svg")
        .attr("viewBox", `-${minX}, -${minY}, ${width}, ${height}`)
        .style("background", color(0))
        .style("cursor", "pointer");
    return result
}

function makeTooltip(d3, containerEls) {
    const result = d3.select(containerEls.container).append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0)
        .style("z-index", 100);
    return result;
}

function makeNodes(d3, containerEls, graphEls, system_data, color) {
    const tooltipFunctions = {
        show: (event, d) => {
            graphEls.tooltipEl.transition()
                .duration(200)
                .style("opacity", .9);
                graphEls.tooltipEl.html(d.data.name);
            const targetCircleBoundingRect = event.target.getBoundingClientRect();
            const topOffset = targetCircleBoundingRect.top - containerEls.container.getBoundingClientRect().top - 20*1.2;
            
            let leftOffset = 0;
            leftOffset += targetCircleBoundingRect.left; // How far left the edge of the target circle is
            leftOffset += targetCircleBoundingRect.width/2;  // We want the tooltip in the center, so add half the width of the circle
            leftOffset -= containerEls.container.getBoundingClientRect().left; // Account for the container position
            leftOffset -= graphEls.tooltipEl.node().getBoundingClientRect().width/2  // Subtract half the width of the tooltip to make sure it appears centered
            graphEls.tooltipEl.style("left", (leftOffset) + "px");
            graphEls.tooltipEl.style("top", (topOffset) + "px");
        },
        hide: () => {
            graphEls.tooltipEl.transition()
                .duration(500)
                .style("opacity", 0);
        },
    }

    const shownNodesFunctions = {
        setSelected: (d3, event, d) => {
            d3.selectAll(".selected").nodes().map((el) => {
                el.classList.remove("selected");
            });
            event.target.classList.add("selected");
            graphEls.focus = d; // Set clicked node as selected
        },
        updateShownNodes: (graphEls, dependencies) => {
            // Initially only have root, immediate children of root, focused, and immediate children of focused showing
            graphEls.nodes.each((d) => {
                const isRoot = d === graphEls.root;
                const isImmediateChildOfRoot = d.parent === graphEls.root;
                const isFocused = d === graphEls.focus;
                const isChildOfFocused = d.parent === graphEls.focus;
                d.data.show = isRoot || isImmediateChildOfRoot || isFocused || isChildOfFocused;
            });

            // If focused node is a leaf node, show all leaf nodes that are direct dipendencies of the focused node
            if (!graphEls.focus.children) {
                const dependenciesForNode = getDependenciesForNode(graphEls.focus, dependencies);
                if (dependenciesForNode?.directDependencies) {
                    const leafNodesForDependencies = getLeafNodesForDependencies(graphEls.root, dependenciesForNode.directDependencies);
                    leafNodesForDependencies.forEach((d) => d.data.show = true);
                }

                // Need to show the dependents of the selected node
                const dependentsForNode = getDependentsForNode(graphEls.focus, dependencies, graphEls.root);
                dependentsForNode.forEach((d) => d.data.show = true);
            }

            // Any ancestor nodes of any shown node should be shown
            graphEls.nodes.filter((d) => d.data.show).each((d) => {
                let temp = d.parent;
                while(temp) {
                    temp.data.show = true;
                    temp = temp.parent;
                }
            });
            
            //Finally, actually show the nodes that should be shown
            graphEls.nodes.each((d, elIdx, els) => {
                if (d.data.show) {
                    els[elIdx].classList.remove("node--hide");
                    els[elIdx].classList.remove("node--dim");
                    els[elIdx].classList.add("node--show");
                } 
                // else if (d.parent === graphEls.focus.parent) {
                //     els[elIdx].classList.remove("node--show");
                //     els[elIdx].classList.remove("node--hide");
                //     els[elIdx].classList.add("node--dim");
                // } 
                else {
                    els[elIdx].classList.remove("node--show");
                    els[elIdx].classList.remove("node--dim");
                    els[elIdx].classList.add("node--hide");
                }
            });
        },
    };

    const result = graphEls.svg
        .append("g")
        .attr("class", "g-node")
        .selectAll("circle")
        .data(graphEls.root.descendants())
        .enter().append('circle')
        .attr("class", function (d) {
            const classList = ["node"];
            if (d == graphEls.root) classList.push("node--root", "selected");
            if (!d.children) classList.push("node--leaf");
            
            if (d == graphEls.root || d.parent == graphEls.root) {
                classList.push("node--show");
            } else {
                classList.push("node--hide");
            }
            return classList.join(" ");
        })
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        .style("fill", (d) => {
            if (d.data.weight > 0.0 ) return "darkred";
            else if (d.children) return color(d.depth);
            else return "WhiteSmoke";
        })
        .style("fill-opacity", (d) => d.data.weight)
        .on("mouseenter", (event, d) => {
            tooltipFunctions.show(event, d);
        })
        .on("mouseout", (event, d) => {
            tooltipFunctions.hide(event, d);
        })
        .on("click", (event, d) => {
            shownNodesFunctions.setSelected(d3, event, d);
            shownNodesFunctions.updateShownNodes(graphEls, system_data.dependencies);
            // zoom(event, d, graphEls, containerEls);
            makeLinks(d3, graphEls, containerEls, system_data)
        });
        
    return result;
}

function makeLabels(graphEls) {
    const result = graphEls.svg.append("g")
        .selectAll("text")
        .data(graphEls.root.descendants())
        .enter().append('text')
        .attr("class", "label")
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        .style("fill-opacity", (d) => d.parent === graphEls.root ? 1 : 0)
        .style("display", (d) => {
            if (d == graphEls.root || d.parent == graphEls.root) {
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

function makeLinks(d3, graphEls, containerEls, systemData) {

    // function createEdgesBetweenDependentShownNodes(d, shownNodes, edges, focusedNode) {

    //     const nodeName = d.data.name;
    //     const dDeps = getDependenciesForNode(d, systemData.dependencies);
    //     const log = nodeName === "repo_analyzer.py";
    //     if (log) {
    //         console.log(nodeName);
    //         // console.log(pathToD);
    //         console.log(dDeps);
    //     }
        
    //     if (dDeps?.directDependencies) {
    //         for (const [parent, children] of Object.entries(dDeps.directDependencies)) {
    //             if (parent === nodeName) continue; // Don't draw edge to between the same node
    //             function getShownParentOrChildren(parent, children, shownNodeNames, shownNodeNamesNoFileExt) {
    //                 const result = [];
    //                 // loop over children
    //                 for (const [lParent, lChildren] of Object.entries(children)) {
    //                     // recursively call
    //                     result.push(...getShownParentOrChildren(lParent, lChildren, shownNodeNames, shownNodeNamesNoFileExt))
    //                 }
    //                 if (result.length == 0 && (shownNodeNames.includes(parent) || shownNodeNamesNoFileExt.includes(parent))) {
    //                     // base case - there are no children or no children are shown, and the p
    //                     result.push(parent);
    //                 }
    //                 return result;
    //             }

    //             const shownNodeNames = shownNodes.data().map((d) => d.data.name);
    //             const shownNodeNamesNoFileExt = shownNodeNames.map(removeFileExtention).filter(s => s !== '');
    //             const shownDependencies = getShownParentOrChildren(parent, children, shownNodeNames, shownNodeNamesNoFileExt);
    //             function findNodeByName(name) {
    //                 const filtered = shownNodes.filter(d => {
    //                     const dName = d.data.name
    //                     return dName === name || removeFileExtention(dName) === name;
    //                 }).data();
    //                 if (filtered.length === 1) return filtered[0];
    //                 return null
    //             }
    //             for (sw of shownDependencies) {
    //                 edges.add([d, findNodeByName(sw)]);
    //             }
    //         }
    //     }
    // };

    function translateEdgesToLinks(edges, containerEls) {
        const result = [];
        const offsetX = containerEls.diameters.innerW / 2;
        const offsetY = containerEls.diameters.innerH / 2;
        edges.forEach((edge) => {
            from = edge[0];
            to = edge[1];
            if (!from || !to) return;
            result.push({
                source: [from.x - offsetX, from.y - offsetY],
                target: [to.x - offsetX, to.y - offsetY],
            });
        });
        return result;
    };

    graphEls.svg.selectAll("path").remove()

    function extractEdgesToDraw(nodes) {

        function createEdgesBetweenNodeAndDependenciesClosestShownNodes(node, shownNodes, dependencies, edges) {
            const shownNodeNames = shownNodes.data().map((d) => d.data.name);
            const dependenciesForNode = getDependenciesForNode(node, dependencies);
            if (dependenciesForNode?.directDependencies) {
                const shownNodeDependencies = getLowestShownNodeOfDependencies(dependenciesForNode.directDependencies, shownNodeNames)
                    .filter((name) => name !== node.data.name && name !== removeFileExtention(node.data.name));  // Dont draw edge to itself
                for (const sw of shownNodeDependencies) {
                    edges.add([node, findNodeByName(sw, shownNodes)]);
                }
            }

            // TODO: Handle sub dependencies

        }

        function createEdgesForDependentsOfNode(node, root, dependencies, edges) {
            const dependentsForNode = getDependentsForNode(node, dependencies, root);
            for (const sw of dependentsForNode) {
                edges.add([node, sw]);
            }
        }
        const shownNodes = nodes.filter((d) => d.data.show);
        const result = new Set();
        if (graphEls.focus.children) {
            // If focused on directory draw dependencies from all children of focused nodes to all shown nodes
            const childrenOfFocusedNode = nodes.filter((d) => d.parent === graphEls.focus);
            // console.log(childrenOfFocusedNode);
            childrenOfFocusedNode.each((d) => createEdgesBetweenNodeAndDependenciesClosestShownNodes(d, shownNodes, systemData.dependencies, result))
        } else {
            // If focused on file...
            // ...draw all dependencies from file
            createEdgesBetweenNodeAndDependenciesClosestShownNodes(graphEls.focus, shownNodes, systemData.dependencies, result);
            // ...draw all dependencies from other files to the selected file
            createEdgesForDependentsOfNode(graphEls.focus, graphEls.root, systemData.dependencies, result);
        }

        return result
    }
    const edgesToDraw = extractEdgesToDraw(graphEls.nodes);
    const links = translateEdgesToLinks(edgesToDraw, containerEls);

    graphEls.svg
        .selectAll("path")
        .data(links)
        .enter().append("svg:path")
        .attr("d", d3.linkHorizontal())
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("marker-end", "url(#end)");
}

function zoomTo(toZoomTo, graphEls, containerEls) {
    const k = containerEls.diameters.innerW / toZoomTo.diameter;
    containerEls.view = toZoomTo;

    const transformEl = (d) => {
        const translateX = (d.x - toZoomTo.x) * k;
        const translateY = (d.y - toZoomTo.y) * k;
        return `translate(${translateX},${translateY})`
    }
    graphEls.nodes.attr("transform", transformEl);
    graphEls.nodes.attr("r", d => d.r * k);
    graphEls.labels.attr("transform", transformEl);
}

function zoom(event, d, graphEls, containerEls) {
    const focus0 = graphEls.focus;
    graphEls.focus = d;
    function zoomTween(d) {
        const startingView = [
            containerEls.view.x,
            containerEls.view.y,
            containerEls.view.diameter,
        ];
        const endingView = [
            graphEls.focus.x,
            graphEls.focus.y,
            graphEls.focus.r * 2
        ]
        // TODO: Need to bring in d3 here
        const i = d3.interpolateZoom(startingView, endingView);
        return (t) => {
            const toZoomTo = {
                x: i(t)[0],
                y: i(t)[1],
                diameter: i(t)[2],
            }
            zoomTo(toZoomTo, graphEls, containerEls);
        };
    }

    const transition = graphEls.svg.transition()
        .duration(750)
        .tween("zoom", zoomTween);
}


async function draw() {
    const structure = await fetch("enclosure_diagram.json").then(res => res.json());
    const dependencies = await fetch("dependency_tree.json").then(res => res.json());
    const data = {
        structure,
        dependencies
    }
    console.log(data);

    const container = document.querySelector("#graph");

    container.style.position = "relative";

    const containerEls = {
        container,
        view: null,
        diameters: makeDiameters(container)
    }
    
    const color = makeColor(d3);
    
    const graphEls = {
        root: makeRoot(d3, data, containerEls),
        svg: makeSvg(d3, containerEls, color),
        tooltipEl: makeTooltip(d3, containerEls),
        nodes: null,
        labels: null,
        focus: null
    };
    graphEls.focus = graphEls.root;
    graphEls.nodes = makeNodes(d3, containerEls, graphEls, data, color);
    graphEls.labels  = makeLabels(graphEls);
    // makeLinks(d3, graphEls, containerEls, data);

    const toZoomTo = {
        x: graphEls.root.x,
        y: graphEls.root.y,
        diameter: graphEls.root.r * 2
    };

    zoomTo(toZoomTo, graphEls, containerEls);
}


draw();