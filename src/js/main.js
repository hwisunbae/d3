
let margin = {
  left:100,
  right:10,
  top:10,
  bottom:100
}
let width = 600 - margin.left - margin.right;
let height = 400 - margin.top - margin.bottom;


let svg = d3.select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

let g = svg.append("g")
  .attr("transform", "translate("+margin.left+ ", "
  +margin.top + ")");

//X Label
g.append('text')
  .attr('class', 'x axis-label')
  .attr('x', width/2)
  .attr('y', height + 100)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .text('the world\'s tallest buildings')

//Y Label
g.append('text')
  .attr('class', 'y axis-label')
  .attr('x', -(height/2))
  .attr('y', -60)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .attr('transform','rotate(-90)')
  .text('Height (m)')

d3.json("data/buildings.json").then(data => {
  // console.log(data)
  data.forEach(d => {
    d.height = +d.height;
  });
  let dataArr = [];

  data.forEach(d => dataArr.push(d.name));
  console.log(dataArr)
  let x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0,width])
    .paddingInner(0.3)
    .paddingOuter(0.3);


  let y = d3.scaleLinear()
    .domain([0,d3.max(data, d=> d.height)])
    .range([height, 0]);

  let xAxisCall= d3.axisBottom(x);
  g.append("g")
    .attr("class","x axis")
    .attr("transform", "translate(0,"+height+")")
    .call(xAxisCall)
    .selectAll("text")
    .attr("y", "10")
    .attr("x", '-5')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-40)')

  let yAxisCall = d3.axisLeft(y)
    .tickFormat(d => d+'m');

  g.append("g")
    .attr("class","y-axis")
    .call(yAxisCall)


  let rects = g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", d => y(d.height))
    .attr("x", (d) => x(d.name))
    .attr("width", x.bandwidth)
    .attr("height", d => height - y(d.height))
    .attr("fill", "grey")
})


