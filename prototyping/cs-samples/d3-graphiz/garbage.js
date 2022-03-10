import enc_diagram_json from './enclosure_diagram.json' assert { type: "json" };
// var enc_diagram_json = require('./enclosure_diagram.json'); //with path
console.log(enc_diagram_json);

var selected = null; // Start root as nothing (i.e., at the top of the project directory)
var structure = {
    name: "root",
    children: [
        {
            name: "A",
            children: [
                {
                    name: "AB",
                    children: [
                        {
                            name: "ABA",
                            children: []
                        }
                    ],
                },
                {
                    name: "AC",
                    children: [],
                },
            ]
        },
        {
            name: "B",
            children: [
                {
                    name: "BB",
                    children: [],
                },
                {
                    name: "BC",
                    children: [],
                    size: 1,
                },
            ]
        },
        {
            name: "X",
            children: [],
        },
    ]
};

// var dependencies = {
//     X: ["ABA"],
//     ABA: ["AC", "BC", "BB"],
// };

var dependencies = {
    "project.clj": ["README.md"]
};

function generatedDigraph(structure, dependencies, selected) {

    function addChild(child) {
        return child.children.length == 0 ? 
            generateNode(child) : 
            generateSubGraph(child);
    }

    function generateNode(leafNode) {
        console.log(leafNode.name);
        var nodeColor = selected == leafNode.name ? "yellow" : "lightgrey";
        // TODO: 
        var nodeWidth = false && leafNode.size ? leafNode.size : 0.5;
        // return `"${leafNode.name}"[style=filled,shape=circle,width=${nodeWidth},color=${nodeColor}];\n`;
        return `"${leafNode.name}"[style=filled,shape=circle,color=${nodeColor}];\n`;
    }

    function generateSubGraph(root) {
        var result = `
            subgraph cluster_${root.name} {
                style=rounded;
                label="${root.name}";
                ${root.children.map(addChild).join("")}
            };
        `;
        return result;
    }

    function generateDependencies(dependencies) {
        var result = '';
        for (var [key, value] of Object.entries(dependencies)) {
            for (var v of value) {
                // Show all of the selected nodes dependencies
                // and all of the dependents of the selected node
                if (selected == key || selected == v) {
                    result += `"${key}"->"${v}";`;
                } else {
                    result += `"${key}"->"${v}"[style=invis];`;
                }
            }
        }
        return result;
    }

    var result = `digraph G {
        ${generateSubGraph(structure)}
        ${generateDependencies(dependencies)}
    }`
    return result;
}

var graphEl = document.querySelector("#graph");
console.log(graphEl);
var graphviz = d3.select("#graph").graphviz()
graphviz.tweenPaths(false); // Disable these for performance reasons
graphviz.tweenShapes(false);
graphviz.width(graphEl.getBoundingClientRect().width)
    .height(graphEl.getBoundingClientRect().height)
    .fit(true)
    // .transition(function () {
    //     return d3.transition("main")
    //         .ease(d3.easeLinear)
    //         .delay(0)
    //         .duration(100);
    // })
    .logEvents(false)
    .on("initEnd", render)
    .on('end', setNodeClickListeners);

function render() {
    console.time("generatedDigraph");
    // var dot = generatedDigraph(structure, dependencies, selected);
    var dot = generatedDigraph(enc_diagram_json, dependencies, selected);
    console.timeEnd("generatedDigraph");
    console.time("renderDot");
    graphviz.renderDot(dot);
        // .on('end', setNodeClickListeners);
    console.timeEnd("renderDot");
}


function setNodeClickListeners() {
    var nodes = d3.selectAll(d3.select("#graph").node().querySelectorAll(".node"));
    nodes.on("click", function (d) {
        selected = d.key;
        console.log(d);
        render();
    });
}