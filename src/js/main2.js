const margin = {
  right: 20,
  left: 50,
  bottom :40,
  top :30
}

const width = 500 - margin.right - margin.left,
  height = 500 - margin.top - margin.bottom;

let time = 0;

let svg = d3.select("#chart-area")
.append('svg')
  .attr('width', width + margin.right + margin.left)
  .attr('height', height + margin.top + margin.bottom);

let g = svg
  .append('g')
  .attr('transform', 'translate (' + margin.left + ', ' + margin.top + ')')

let continentColor = d3.scaleOrdinal(d3.schemePastel1)

// tooltip
let tip = d3.tip()
  .attr('class', 'd3-tip')
  .html(d => {
    let text = '<strong>Country: </strong> <span style="color:red">'+ d.country+'</span> <br>'
      text += '<strong>Continent: </strong> <span style="color:red;text-transform: capitalize">'+ d.continent+'</span> <br>'
      text += '<strong>Life Expectancy: </strong> <span style="color:red">'+ d3.format('.2f')(d.life_exp)+'</span> <br>'
      text += '<strong>GDP Per Capita: </strong> <span style="color:red">'+ d3.format('$,.0f')(d.income)+'</span> <br>'
      text += '<strong>Population: </strong> <span style="color:red">'+ d3.format(',.0f')(d.population)+'</span> <br>'
    return text
  })
g.call(tip)

// X and Y
let x = d3.scaleLog()
  .domain([142, 150000])
  .range([0, width])

let y = d3.scaleLinear()
  .domain([0,90])
  .range([height, 0]);

let area = d3.scaleLinear()
  .domain([2000, 1400000000])
  .range([25, 1500]);

let xAxisCall = d3.axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format("$"));
let xAxisGroup = g.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0,'+height +')');
xAxisGroup
  .call(xAxisCall)

let yAxisCall = d3.axisLeft(y)
  .tickFormat(d => +d)
let yAxisGroup = g.append('g')
  .attr('class', 'y axis')
yAxisGroup
  .call(yAxisCall)

let xLabel = g.append('text')
  .attr('class', 'x axis-label')
  .attr('x', width/2)
  .attr('y', height+40)
  .attr('text-anchor', 'middle')
  .text('GDP Per Capita ($)')

let yLabel = g.append('text')
  .attr('class', 'y axis-label')
  .attr('x', -height/2)
  .attr('y', -30)
  .attr('transform', 'rotate(-90)')
  .attr('text-anchor', 'middle')
  .text('Life Expectancy (Years)')

let timeGroup= g.append('text')
  .attr('x', width - margin.right)
  .attr('y', (height-margin.bottom))
  .attr('class', 'time')
  .attr('text-anchor', 'end')
  .attr('font-size', '40px')

let continents = ['europe', 'asia', 'americas', 'africa']
let legend = g.append('g')
  .attr('transform', 'translate(' + (width -10) + ', ' + (height -150) +')')

continents.forEach((continent, i) => {
  let legendRow = legend.append('g')
    .attr('transform', 'translate(0, '+ i *20 + ')')

  legendRow.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', continentColor(continent))

  legendRow.append('text')
    .attr('x', -10)
    .attr('y', 10)
    .attr('text-anchor', 'end')
    .style('text-transform', 'capitalize')
    .text(continent)
})

d3.json('data/continents.json').then(data => {

  //Clean Data
  const formattedData = data.map(datum => {
    return datum['countries'].filter(country => {
      return (country.income && country.life_exp)
    }).map(country => {
      country.income = +country.income;
      country.life_exp = +country.life_exp;
      return country;
    })
  })

  window.formattedData = formattedData;
  window.data = data;


  d3.interval(() => {
   time < 214 ? time++ : time;
   update(formattedData[time])

  }, 100)

  update(formattedData[0])

}).catch(err => console.log(err))

function update (data) {

  let t = d3.transition().duration(3000);

  let circle = g.selectAll('circle')
    .data(data, d => d.country)

  circle.exit()
    .remove()

  circle.enter()
    .append('circle')
    .attr('fill', d => continentColor(d.continent))
    .attr('continent', d => d.continent)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
      .merge(circle)
      .attr('cx', (d, i) => x(d.income))  // index no needed
      .attr('cy', (d, i) => y(d.life_exp))
      .attr('r', (d, i) => Math.sqrt(area(d.population)) )


  timeGroup.text(time + 1800)

  // let text = g.selectAll('text')
  //   .data(data, d => d[0])
  //   .text(d => d[])



}

