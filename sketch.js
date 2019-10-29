var width = window.innerWidth;

var height = window.innerHeight;

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)

var g = svg.append("g")
    .attr("class", "compChart")
    .attr("transform", "translate(" + 0 + "," + 0 + ")");

var dataTot = [];
var counter = 0;


var colorScale = d3.scaleSequential(d3.interpolateViridis);


d3.tsv("data/data.tsv", function (error, data) {
    data.forEach(function (d) {
        dataTot.push(d)
        counter++;
        if (counter === data.length) {
            updateLoop();
        }
    })
});

const minYEAR = 1995;

//number of rating categories
var amplitude;



//initialize the parameters of the lines
const leftMargin = 100
const topMargin = height / 2;
var lineLength;

function updateLoop(){


    let unique = [...new Set(dataTot.map(d => d.LOCATION))];

    var min = d3.min(dataTot, function (d) { return parseFloat(d.Value) });
    var max = d3.max(dataTot, function (d) { return parseFloat(d.Value) });

    amplitude = 1.1 * Math.max(d3.min(dataTot, function (d) { return parseFloat(d.Value) }), d3.max(dataTot, function (d) { return parseFloat(d.Value) }))
  
    colorScale.domain([-amplitude,amplitude])
    lineLength = (width - leftMargin) / (d3.max(dataTot, function (d) { return parseFloat(d.TIME) }) - minYEAR)
    

    addLegend();

    unique.forEach(function(k){
        update(dataTot.filter(function (d) { return d.LOCATION == k && d.TIME>minYEAR;  }), k)
    })
}

function update(data,CountryCode){


    //----------------------------//
    //--ENTER THE PATHs AS LINES--//
    //----------------------------// 
    let chartLine =  svg.append("g")
        .attr("class", "compChart")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .selectAll(CountryCode)
        .data(data)

    let newLine = chartLine
        .enter()
        .append("line")
        .style("stroke-width", 2)
        .style("stroke-linejoin", "round")
        .style("stroke-linecap", "round")

    const getCoords = () => {
        var classCOU = "." + CountryCode
        var lastLine = d3.selectAll(classCOU).filter((d, i, list) => i === list.length - 1)

        const x = parseFloat(lastLine.attr("x2"))
        const y = parseFloat(lastLine.attr("y2"))

        return {
            "x": x,
            "y": y
        }
    }

    //----------//
    //--UPDATE--//
    //----------//
   
    let angle, endCoordX, endCoordY = 0
    let coords = { "x": leftMargin, "y": topMargin }

    //loop through the lines and create their geometry  
    newLine.each(function (d, i) {
        //calculate the angle position
        if(d.Value>=0)
            angle = -((Math.PI / 2 / amplitude) *  d.Value);

        if (d.Value < 0)
            angle = -((Math.PI / 2 / amplitude)* (d.Value));

        //calculate the end coordinates of the line
        endCoordX = lineLength * Math.cos(angle) + coords["x"]
        endCoordY = lineLength * Math.sin(angle) + coords["y"]
        //draw the line (highlight first 10 ratings)
        d3.select(this)
            .attr("class",  ()=>CountryCode)
            .style("stroke", () => colorScale(d.Value))
            .style("stroke-width", "1")
            .style("opacity", "0.7")
            .attr('x1', coords["x"])
            .attr('y1', coords["y"])
            .attr('x2', endCoordX)
            .attr('y2', endCoordY)
            .on("mousemove", function () {

                var value = Math.round(d.Value,1) + " %" 
                //Change titles
                d3.select("#chart-tooltip .tooltip-title").html(CountryCode)
                d3.select("#chart-tooltip .tooltip-explanation").html(d.TIME)
                d3.select("#chart-tooltip .tooltip-value").html(value)


                //Place & show the tooltip
                d3.select("#chart-tooltip")
                    .style("top", (event.screenY - 30 + "px"))
                    .style("left", (event.screenX + 30 + "px"))
                    .style("opacity", 1)

                 var highlightCOU = "." + CountryCode
                d3.selectAll(highlightCOU).style("stroke-width", "4")

            })
            .on("mouseout", function () {
                d3.select("#chart-tooltip")
                    .style("opacity", 0)


                var highlightCOU = "." + CountryCode
                d3.selectAll(highlightCOU).style("stroke-width", "1")
            })


        //update initial coordinates for next line
        coords = getCoords()
    })
}
function addLegend(){

    //add start year
    g.append('text')
        .attr("x", 40)
        .attr("y", height/2)
        .style("font-size", "21px")
        .style("fill", "#333")
        .style("font-weight", 800)
        .style("font-family", "Arial")
        .text(minYEAR)

    //add legend


g.append('text')
    .attr("x", 20)
    .attr("y", 30)
    .style("font-size", "15px")
    .style("fill", "#333")
    .style("font-weight", 800)
    .style("font-family", "Arial")
    .text("Key")

    const rootCoord = { "x": 80, "y": 1.5 * lineLength }

var base = Math.trunc(-amplitude/1.1)

var gap = Math.trunc(2 * Math.trunc(amplitude)/8);
console.log(gap)

for (var j = 0; j < 8; j++) {

    var i= base+gap*j;
    console.log(i)
    Math.round(amplitude)
    
    //calculate the angle position
    if (i >= 0)
        angle = -((Math.PI / 2 / amplitude) * i);

    if (i < 0)
        angle = -((Math.PI / 2 / amplitude) * i);


    let xCoord = lineLength * Math.cos(angle) + rootCoord["x"]
    let yCoord = lineLength * Math.sin(angle) + rootCoord["y"]

    g.append("line")
        .style("stroke", colorScale(i))
        .style("stroke-width", 1.2)
        .attr('x1', rootCoord["x"])
        .attr('y1', rootCoord["y"])
        .attr('x2', xCoord)
        .attr('y2', yCoord)

    g.append('text')
        .attr("x", xCoord - 5)
        .attr("y", yCoord + 5)
        .style("font-size", "15px")
        .style("fill", "#444")
        .style("font-weight", 800)
        .style("stroke", "#fff")
        .style("stroke-width", 0.5)
        .style("font-family", "Arial")
        .text(i)
}
}
/** 
svg
    .attr("width", g.node().getBBox().width + leftMargin)
    .attr("height", g.node().getBBox().height + topMargin)*/