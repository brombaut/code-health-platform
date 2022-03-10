require.undef('graphiz_dependency');
// const d3 = require("./d3_3.4.6/d3.min.js");

require.config({
    paths: {
        d3: 'd3/d3_3.4.6/d3.min',
        d3_graphiz: 'd3/d3_graphiz_3.0.5/d3_graphiz.min',
        wasm: 'd3/wasm_0.3.11/wasm.min'
    }
});

define('graphiz_dependency', ['d3', 'd3_graphiz', 'wasm'], function (d3, d3_graphiz, wasm) {
    function draw(container) {
        console.log(d3);
        console.log(d3_graphiz);
        console.log(wasm);
        var svg = d3.select(container)
            .graphviz()
            .renderDot("digraph{a->b}");
    };

    return draw;
});