const margin = {
  left: 40,
  right: 20,
  bottom :50,
  top: 40
}, height = 500 - margin.top - margin.bottom,
  width = 500 - margin.right - margin.left

let svg = d3.select('#chart-area')
  .append('svg')
  .attr('width', width + margin.right + margin.left)
  .attr('height', height + margin.top + margin.bottom)

let g = svg.append('g')
  .attr('transform', 'translate(' + margin.left +', ' +margin.top +')')

// Time parser for x-scale
let parseTime = d3.timeParse('%Y');
// tooltip
let bisectDate = d3.bisector((d) => d.year).left;

let x = d3.scaleTime()
  .range([0, width])

let y = d3.scaleLinear()
  .range([height, 0])

let xAxisCall = d3.axisBottom(x),
  yAxisCall = d3.axisLeft(y)
    .ticks(6)
    .tickFormat((d) => parseInt(d / 1000) +'k')

let xAxis = g.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate (0,' + height + ')')
let yAxis = g.append('g')
  .attr('class', 'y axis')

// yAxis label
let yLabel = g.append('text')
  .attr('transform', 'rotate (-90)')
  .attr('text-anchor', 'end')
  .attr('y', 10)
  .text('population')

// Line path generator
let line = d3.line()
  .x(d => x(d.year))
  .y(d => y(d.value))

d3.json('data/line.json').then(data => {

  window.data = data;
  data.forEach(d => {
    d.year = parseTime(d.year)
    d.value = +d.value
  })

  x.domain(d3.extent(data, d => d.year))
  y.domain([d3.min(data, d => { return d.value; }) / 1.005,
    d3.max(data, d => { return d.value; }) * 1.005])

  xAxis.call(xAxisCall)
  yAxis.call(yAxisCall)

  g.append('path')
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-with', '3px')
    .attr('d', line(data))

  /**
   * Tooltip code
   */

  let focus = g.append('g')
    .attr('class', 'focus')
    // .style('display', 'none')

  focus.append('line')
    .attr('class', 'x-hover-line hover-line')
    .attr('x1', 0)
    .attr('x2', width)

  focus.append('line')
    .attr('class', 'y-hover-line hover-line')
    .attr('y1', 0)
    .attr('y2', height)

  focus.append("circle")
    .attr("r", 7.5);

  focus.append("text")
    .attr("x", 15)
    .attr("dy", ".31em");

  svg.append('rect')
    .attr('transform', 'translate(' + margin.left +',' + margin.top + ')')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', () => {focus.style('display', null)})
    .on('mouseout', () => { focus.style('display', 'none')})
    .on('mousemove', mousemove)

  function mousemove() {
    let x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = x0 - d0.year > d1.year - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
    focus.select("text").text(d.value);
    focus.select(".x-hover-line").attr("y2", height - y(d.value));
    focus.select(".y-hover-line").attr("x2", -x(d.year));
  }



}).catch(err => {
  console.log(err)
})

