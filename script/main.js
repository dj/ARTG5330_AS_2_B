var margin = {t:50,r:50,b:50,l:50};
var width = $('.plot').width() - margin.r - margin.l,
    height = $('.plot').height() - margin.t - margin.b;

var canvas = d3.select('.plot')
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

/* SCALES */
var scaleX = d3.scale.log().range([0,width]),
    scaleY = d3.scale.log().range([height,0]),
    scaleR = d3.scale.sqrt().range([10, 50]);

/* AXES */
var axisX = d3.svg.axis()
    .orient('bottom')
    // .tickValues()
    .tickSize(-height,0)
    .scale(scaleX);
var axisY = d3.svg.axis()
    .orient('left')
    .tickSize(-width,0)
    .scale(scaleY);

/* Init */
d3.csv('data/world_bank_2010_gdp_co2.csv', parse, dataLoaded);

function parse(row) {
  // Return the columns we care about and coerce
  // some of them from strings to nums
  // If there is missing data, represented as '..',
  // the result is undefined
  var parsedRow = {
    gdpPerCap: +row['GDP per capita, PPP (constant 2011 international $)'],
    co2PerCap: +row['CO2 emissions (metric tons per capita)'],
    co2Total: +row['CO2 emissions (kt)'],
    country: row['Country Name'],
    id: row['Country Code']
  };

  if (parsedRow.gdpPerCap & parsedRow.co2PerCap & parsedRow.co2Total) {
    return parsedRow;
  } else {
    return;
  }
}

/* Mine the data for domain */
function dataLoaded(err,rows){
  scaleX.domain( d3.extent(rows, function(d) { return d.gdpPerCap }) );
  scaleY.domain( d3.extent(rows, function(d) { return d.co2PerCap }) );
  scaleR.domain( d3.extent(rows, function(d) { return d.co2Total }) );

  canvas.append('g')
    .attr('class','axis x')
    .attr('transform','translate(0,'+height+')')
    .call(axisX);
  canvas.append('g')
    .attr('class','axis y')
    .call(axisY);

  draw(rows);
}

function draw(rows) {
  var nodes = canvas.selectAll('.node')
    .data(rows)

  var nodesEnter = nodes.enter()
    .append('g')
    .attr('class','node')
    .attr('transform', function(d) {
      return 'translate('+scaleX(d.gdpPerCap)+','+scaleY(d.co2PerCap)+')';
    })

  nodesEnter
    .append('circle')
    .attr('r', function(d) { return scaleR(d.co2Total) })

  nodesEnter
    .append('text')
    .attr('transform', function(d) {
      return 'translate(0,' + scaleR(d.co2Total) + 10 + ')';
    })
    .text(function(d){
        return d.country;
    })
    .attr('text-anchor','middle')

  nodes.exit().remove()
}

