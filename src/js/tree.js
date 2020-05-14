
let svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

let fader = function(color) { return d3.interpolateRgb(color, "#fff")(0); },
  color = d3.scaleOrdinal(d3.schemeSet3.map(fader)),
  format = d3.format(",d");

let treemap = d3.treemap()
  .tile(d3.treemapSquarify)
  .size([width, height]) // 960 570
  .round(true)
  .paddingInner(1);

d3.json('data/tree.json').then(data => {

  let root = d3.hierarchy(data)
    .eachBefore((d) => { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
    .sum(sumBySize)
    .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

  window.data = data;
  window.root = root;

  treemap(root);

  let cell = svg.selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

  cell.append("rect")
    .attr("id", function(d) { return d.data.id; })
    .attr("width", function(d) { window.d = d; return d.x1 - d.x0; })
    .attr("height", function(d) { return d.y1 - d.y0; })
    .attr("fill", function(d) { return color(d.parent.data.id); });

  // cell.append("clipPath")
  //   .attr("id", function(d) { return "clip-" + d.data.id; })
  //   .append("use")
  //   .attr("xlink:href", function(d) { return "#" + d.data.id; });

  cell.append("text")
    // .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
    .selectAll("tspan")
    .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(d.data.value))})
    .enter().append("tspan")
    .style("font", "10px sans-serif")
    .attr("x", 4)
    .attr("y", function(d, i) { return 13 + i * 10; })
    .text(d => d);

  cell.append("title")
    .text(function(d) { return d.data.id + "\n" + format(d.value); });

  d3.selectAll("input")
    .data([sumBySize, sumByCount], function(d) { return d ? d.name : this.value;
    })
    .on("change", changed);

  let timeout = d3.timeout(function() {
    d3.select("input[value=\"sumByCount\"]")
      .property("checked", true)
      .dispatch("change");
  }, 2000);

  function changed(sum) {
    timeout.stop();

    treemap(root.sum(sum));

    cell.transition()
      .duration(750)
      .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
      .select("rect")
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; });
  }
}).catch(err => {
  console.log(err)
})

function sumByCount(d) {
  return d.children ? 0 : 1;
}

function sumBySize(d) {
  return d.value;
}
