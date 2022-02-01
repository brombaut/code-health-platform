require.undef('enclosure_diagram_js');

define('enclosure_diagram_js', ['d3'], function (d3) {

    function draw(container, json_file) {
        console.log(container.getBoundingClientRect());
        var margin = 20,
            outerDiameter = container.getBoundingClientRect().width - 200,
            innerDiameter = outerDiameter - margin - margin;
        
        var x = d3.scale.linear().range([0, innerDiameter]);

        var y = d3.scale.linear().range([0, innerDiameter]);

        var color = d3.scale.linear()
            .domain([-1, 5])
            .range(["hsl(185,60%,99%)", "hsl(187,40%,70%)"])
            .interpolate(d3.interpolateHcl);

        var pack = d3.layout.pack()
            .padding(2)
            .size([innerDiameter, innerDiameter])
            .value(function (d) { return d.size; })

        var svg = d3.select(container).append("svg")
            .attr("width", outerDiameter)
            .attr("height", outerDiameter)
            .append("g")
            .attr("transform", "translate(" + margin + "," + margin + ")");

        // Define the div for the tooltip
        var div = d3.select(container).append("div")	
            .attr("class", "tooltip")				
            .style("opacity", 0);
        
        var root = json_file;
        var focus = root,
            nodes = pack.nodes(root);

        svg.append("g").selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function (d) {
                if (!d.parent) return "node node--root";
                if (d.children) return "node";
                return "node node--leaf"
            })
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
            .attr("r", function (d) { return d.r; })
            .style("fill", function (d) {
                return d.weight > 0.0 ? "darkred" :
                    d.children ? color(d.depth) : "WhiteSmoke";
            })
            .style("fill-opacity", function (d) { return d.weight; })
            .on("click", function (d) { return zoom(focus == d ? root : d); })
            .on("mouseenter", (d) => {
                // console.log(d.value / d.parent.value);
                const rect = d3.event.target.getBoundingClientRect();
                // console.log(rect.y);
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div.html(d.name)	
                    .style("left", (rect.x) + "px")		
                    .style("top", (rect.y) + "px");	
            })
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });

        svg.append("g").selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
            .style("fill-opacity", function (d) { return d.parent === root ? 1 : 0; })
            .style("display", function (d) {
                if (d.parent === root) return null;
                return "none";
            })
            .text(function (d) { return d.name; });

        d3.select(window)
            .on("click", function () { zoom(root); });

        function zoom(d, i) {
            var focus0 = focus;
            focus = d;

            var k = innerDiameter / d.r / 2;
            x.domain([d.x - d.r, d.x + d.r]);
            y.domain([d.y - d.r, d.y + d.r]);
            d3.event.stopPropagation();

            var transition = d3.selectAll("text,circle").transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function (d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

            transition.filter("circle")
                .attr("r", function (d) { return k * d.r; });

            transition.filter("text")
                .filter(function (d) { return d.parent === focus || d.parent === focus0; })
                .style("fill-opacity", function (d) { return d.parent === focus ? 1 : 0; })
                .each("start", function (d) {
                    if (d.parent === focus) {
                        // Only show text label if parent is focused and d is not a leaf node
                        if (d.children || d.value / d.parent.value >= 0.02) {   
                            this.style.display = "inline";
                        }
                    }
                    
                })
                .each("end", function (d) {
                    if (d.parent !== focus) this.style.display = "none";
                });
        }

        // d3.select(self.frameElement).style("height", outerDiameter + "px");
    }
    return draw;
});

// element.append('<small>&#x25C9; &#x25CB; &#x25EF; Loaded enclosure_diagram.js &#x25CC; &#x25CE; &#x25CF;</small>');


// // First undefine 'circles' so we can easily reload this file.
// require.undef('circles');

// define('circles', ['d3'], function (d3) {

//     function draw(container, data, width, height) {
//         width = width || 600;
//         height = height || 200;
//         var svg = d3.select(container).append("svg")
//             .attr('width', width)
//             .attr('height', height)
//             .append("g");

//         var x = d3.scaleLinear()
//             .domain([0, data.length - 1])
//             .range([50, width - 50]);

//         var circles = svg.selectAll('circle').data(data);

//         circles.enter()
//             .append('circle')
//             .attr("cx", function (d, i) {return x(i);})
//             .attr("cy", height / 2)
//             .attr("r", 20)
//             .style("fill", "#1f77b4")
//             .style("opacity", 0.7)
//             .on('mouseover', function() {
//                 d3.select(this)
//                   .interrupt('fade')
//                   .style('fill', '#ff850e')
//                   .style("opacity", 1)
//                   .attr("r", function (d) {return 1.1 * d + 10;});
//             })
//             .on('mouseout', function() {
//                 d3.select(this)
//                     .transition('fade').duration(500)
//                     .style("fill", "#1f77b4")
//                     .style("opacity", 0.7)
//                     .attr("r", function (d) {return d;});
//             })
//             .transition().duration(2000)
//             .attr("r", function (d) {return d;});
//     }

//     return draw;
// });

// element.append('<small>&#x25C9; &#x25CB; &#x25EF; Loaded circles.js &#x25CC; &#x25CE; &#x25CF;</small>');