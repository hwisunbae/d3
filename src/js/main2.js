
let margin = {
  left:80,
  right:10,
  top:10,
  bottom:100
}
let width = 1300 - margin.left - margin.right;
let height = 400 - margin.top - margin.bottom;

let flag = true;
let t = d3.transition().duration(3000)

let svg = d3.select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .call(zoom)

let g = svg.append("g")
  .attr("transform", "translate("+margin.left+ ", "
  +margin.top + ")")
  .attr('class', 'bars')

//X Label
let xLabel = g.append('text')
  .attr('class', 'x axis-label')
  .attr('x', width/2)
  .attr('y', height + 100)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .text('Month')

let xAxisGroup = g.append("g")
  .attr("class","x-axis")
  .attr("transform", "translate(0,"+height+")")

let yAxisGroup = g.append("g")
  .attr("class","y-axis")

let yLabel = g.append('text')
  .attr('class', 'y axis-label')
  .attr('x', -(height/2))
  .attr('y', -60)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .attr('transform','rotate(-90)')
  .text('Revenue')

let x = d3.scaleBand()
  .range([0,width])
  .paddingInner(0.3)
  .paddingOuter(0.3);


let y = d3.scaleLinear()
  .range([height, 0]);

d3.json("data/profits.json").then(data => {
  window.data =data;
  data.forEach(d => {
    d.revenue = +d.revenue;
    d.profit = +d.profit;
  });

  update(data);
})



function update(data) {

  let value = flag ? "revenue" : "profit";
  let label = flag? "Revenue" : "Profit";
  yLabel.text(label)

  x  .domain(data.map(d => d.month))
  y  .domain([0,d3.max(data, d=> d[value])])

  let xAxisCall= d3.axisBottom(x);

  xAxisGroup
    .transition(t)
    .call(xAxisCall)
    .selectAll("text")
    .attr("y", "10")
    .attr("x", '-5')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-40)')

  let yAxisCall = d3.axisLeft(y)
    .tickFormat(d => d+'m');

  yAxisGroup
    .transition(t)
    .call(yAxisCall)

  let rects = g.selectAll("rect")
    .data(data, d => d.month)


  let bar = rects
    .enter()
    .append("rect")
    .attr("y", y(0))
    .attr("x", (d) => x(d.month) + x.bandwidth() /2)
    .attr('revenue-value', d => d.revenue)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", "lightblue")

  bar
    .transition().duration(1000)
    .attr('y', d => y(d[value]))
    .attr('height',  d => height - y(d[value]))

}

function zoom(svg) {
  const extent = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

  svg.call(d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent(extent)
    .extent(extent)
    .on("zoom", zoomed));

  function zoomed() {
    x.range([0, width - margin.right].map(d => d3.event.transform.applyX(d)));
    svg.selectAll(".bars rect").attr("x", d => x(d.month)).attr("width", x.bandwidth());
    svg.selectAll(".x-axis").call(d3.axisBottom(x));
  }
}

