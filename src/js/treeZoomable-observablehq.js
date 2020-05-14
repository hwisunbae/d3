const margin = {
    left: 30,
    right: 30,
    top: 40,
    bottom: 0
  }, width = 960 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

let svg = d3.select('#chart-area')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .style("font", "10px sans-serif");

let g = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
  // .call(render, treemap(data))

let fader = function(color) { return d3.interpolateRgb(color, "#fff")(0); },
  color = d3.scaleOrdinal(d3.schemeSet3.map(fader)),
  format = d3.format(",d");

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([0, height]);


function render(group, root) {
  const node = group
    .selectAll("g")
    .data(root.children.concat(root))
    .join("g");

  node.filter(d => d === root ? d.parent: d.children)
    .attr('cursor', 'pointer')
    .on('click', d => d === root ? zoomout(root) : zoomin(d))

  node.append('title')
    .text(d => `${name(d)} \n${format(d.value)}`)

  node.append("rect")
    .attr("fill", d => d === root ? "#fff" : d.children ? "#ccc" : "#ddd")
    .attr("stroke", "#fff");

  node.append("text")
    .attr("font-weight", d => d === root ? "bold" : null)
    .selectAll("tspan")
    .data(d => (d === root ? name(d) : d.data.name).split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
    .join("tspan")
    .attr("x", 3)
    .attr("y", function(d, i) { return 13 + i * 10; })
    .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
    .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
    .text(d => d);

  group.call(position, root);
}

function position(group, root) {
  group.selectAll("g")
    .attr("transform", d => d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`)
    .select("rect")
    .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
    .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
}

// When zooming in, draw the new nodes on top, and fade them in.
function zoomin(d) {
    const group0 = g.attr("pointer-events", "none");
    const group1 = g = svg.append("g").call(render, d);

    x.domain([d.x0, d.x1]);
    y.domain([d.y0, d.y1]);

    g.transition()
        .duration(1000)
        .call(t => group0.transition(t).remove()
          .call(position, d.parent))
        .call(t => group1.transition(t)
          .attrTween("opacity", () => d3.interpolate(0, 1))
          .call(position, d));
}

// When zooming out, draw the old nodes on top, and fade them out.
function zoomout(d) {
//     const group0 = group.attr("pointer-events", "none");
//     const group1 = group = svg.insert("g", "*").call(render, d.parent);

//     x.domain([d.parent.x0, d.parent.x1]);
//     y.domain([d.parent.y0, d.parent.y1]);

//     svg.transition()
//         .duration(750)
//         .call(t => group0.transition(t).remove()
//           .attrTween("opacity", () => d3.interpolate(1, 0))
//           .call(position, d))
//         .call(t => group1.transition(t)
//           .call(position, d.parent));
}

d3.json('data/tree.json').then(data => {

  let treemap = data => d3.treemap()
    .tile(d3.treemapSquarify)
    (d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value))

  let group = g.append("g")
    .call(render, treemap(data));
}).catch(err => {
  alert(err)
})

function name(d) {
  return d.ancestors().reverse().map(d => d.data.name).join('/')
}
