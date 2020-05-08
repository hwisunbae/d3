const margin = {
  right: 20,
  left: 20,
  bottom :10,
  top :30
}

const width = 500 - margin.right - margin.left,
  height = 500 - margin.top - margin.bottom;

let svg = d3.select("#chart-area")
.append('svg')
  .attr('width', width + margin.right + margin.left)
  .attr('height', height + margin.top + margin.bottom);



d3.json('data/continents.json').then(data => {
  window.data = data;

  let circle = svg.selectAll('circle')
    .data(data)

  circle.enter()

}).catch(err => console.log(err))


