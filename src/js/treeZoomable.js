const margin = {
  left: 30,
  right: 0,
  top: 40,
  bottom: 0
}, width = 960 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

let svg = d3.select('#chart-area')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)

let g = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

let fader = function(color) { return d3.interpolateRgb(color, "#fff")(0); },
  color = d3.scaleOrdinal(d3.schemeSet3.map(fader)),
  format = d3.format(",d");

let treemap = d3.treemap() // treemap layout
  .tile(d3.treemapSquarify)


let x = d3.scaleLinear()
  .range([0, width])

let y = d3.scaleLinear()
  .range([0, height])

d3.json('data/tree.json').then(data => {

  // Node
  let root = d3.hierarchy(data)
    .eachBefore((d) => d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  root = treemap(root);
  // Node {data: {…}, height: 4, depth: 0, parent: null, children: Array(10), …}

  window.data = data;
  window.root = root;

  let group = g.append('g')
    .call(render, root)


  // d3.selectAll("input")
  //   .data([sumBySize, sumByCount], function(d) { return d ? d.name : this.value;
  //   })
  //   .on("change", changed);
  //
  // let timeout = d3.timeout(function() {
  //   d3.select("input[value=\"sumByCount\"]")
  //     .property("checked", true)
  //     .dispatch("change");
  // }, 2000);
  //
  //
  // function changed(sum) {
  //   timeout.stop();
  //
  //   treemap(root.sum(sum));
  //
  //   group.transition()
  //     .duration(750)
  //     .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
  //     .select("rect")
  //     .attr("width", function(d) { return d.x1 - d.x0; })
  //     .attr("height", function(d) { return d.y1 - d.y0; });
  // }
}).catch(err => {
  console.log(err)
})

function position (group, root) {
  group.selectAll('g')
    .attr("transform", d => d === root  ? `translate(0, -30)`: `translate(${x(d.x0)}, ${y(d.y0)})`)
    .select('rect')
    .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
    .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0))
}

function render (group, root) {
  let node = group
    .selectAll("g")
    .data(root.children.concat(root))
    // (221) [Node, Node, Node ...
    .join("g")

  node.filter(d => d === root ? d.parent: d.children)
    .attr('cursor', 'pointer')
    .on('click', d => d === root ? zoomout(root) : zoomin(d))

  node.append('title')
    .text(d => `${name(d)} \n${format(d.value)}`)

  node.append("rect")
    .attr("id", d => d.data.id)
    .attr("fill", d => d === root ? '#fff' : ( d.children ? '#ccc' : '#ddd'))
    .attr('stroke', '#fff')

  node.append("text")
    .selectAll("tspan")
    .data(d => (d === root ? name(d) : d.data.name).split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
    .enter().append("tspan")
    .style("font", "10px sans-serif")
    .attr("x", 4)
    .attr("y", function(d, i) { return 13 + i * 10; })
    .text(d => d);


  group.call(position, root)
}

function name(d) {
  return d.ancestors().reverse().map(d => d.data.name).join('/')
}

function zoomin(d) {
  // x.domain([root.parent.x0, d.parent.x1])
  // y.domain([root.parent.y0, root.parent.y1])

}
function zoomout(root) {

}

function sumByCount(d) {
  return d.children ? 0 : 1;
}

function sumBySize(d) {
  return d.value;
}
