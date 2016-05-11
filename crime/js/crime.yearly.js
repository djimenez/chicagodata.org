
//drawChart(json_url+json_where);
//drawChart("Data/chicago1.json");

var formatDate = d3.time.format("%m/%Y"); 
var formatTipNumber = d3.format("0,000");

//var svg = d3.select(map.getPanes().overlayPane).append("svg"),
//g = svg.append("g").attr("class", "leaflet-zoom-hide");	

// tooltips for line chart
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {return "<span style='color: white'>" + d.x + "</span>: "  + formatTipNumber(d.y); });



// load the data using d3.json 	
var data = d3.csv("../data/yearlycrime.csv", function(error, data){
    var parseDate = d3.time.format("%m/%d/%Y %X %p"); 
    var numberFormat = d3.format(",f");

    // I like to think of each "d" as a column in a spreadsheet
    data.forEach(function(d) {		
        d.date = parseDate.parse(d.date);	
        //d.dd = parseDate.parse(d.date);
        d.id = +d.id;
        d.year = d.year;
        d.primary_type = d.primary_type;
        d.location_description = d.location_description;
        d.community_area = d.community_area;
    });

// Use the crossfilter force.
var cf = crossfilter(data);
var all = cf.groupAll();
    
var yearValue = cf.dimension(function (d) {
    return d.year;
});
var yearValueGroup =      yearValue.group().reduceSum(function (d) {
    return d.id;
});

// get real dates for celeration    
var celValue = cf.dimension(function (d) {
    return d3.time.year(d.date).getFullYear();
});
var celValueGroup = celValue.group().reduceSum(function (d) {
    return d.id;
});    

// for community area
var caValue = cf.dimension(function (d) {
    return d.community_area;
});
var caValueGroup = caValue.group();    
    
// for primary crime type
var startValue = cf.dimension(function (d) {
    return d.primary_type;
});
var startValueGroup = startValue.group();

// for location description 
var locationValue = cf.dimension(function (d) {
   return d.location_description;
});

var locationValueGroup =  locationValue.group().reduceSum(function (d) {
    return d.id;
});   

// define all of the charts and graphs for the dashboard
var lineChart = dc.lineChart("#dc-line-chart"),
    rowChart = dc.rowChart("#dc-row-chart"),
    dataCount = dc.dataCount('#data-count');

lineChart
    .width(816)
    .height(580)
    .margins({top: 20, right: 35, bottom: 50, left: 50})
    .dimension(yearValue)
    .group(yearValueGroup)
    .brushOn(false)
    .renderLabel(true)
    .renderTitle(false)
    .transitionDuration(400)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .on('renderlet.a', function(chart){
        chart
            .selectAll("circle.dot")
            .call(tip)
            .attr("r", 2.2)	
            .style("fill-opacity", .8).on('mousemove', tip.show)
            .on('mouseout', tip.hide);
    })
    .on('renderlet', function(chart) {
        chart.selectAll('rect').on("click", function(d) {
            console.log("click!", d);
        });

        var xdata = [];
        var ydata = [];				

        // use real statistics here!
        for(var i=0; i<celValueGroup.all().length; i++){			
            ydata.push(celValueGroup.all()[i].value);
            xdata.push(celValueGroup.all()[i].key);					
        }

        // get the x and y values for least squares				
        var xLabels = xdata;

        var xSeries = d3.range(1, xLabels.length + 1);
        var ySeries = ydata;

        var leastSquaresCoeff = leastSquares(xSeries, ySeries);

        var x1 = xLabels[0];
        var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
        var x2 = xLabels [xLabels.length - 1] + 1;
        var y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1];

        var extra_data = [{x: chart.x()(x1), y: chart.y()(y1)}, {x: chart.x()(x2), y: chart.y()(y2)}];
        var line = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate('linear');			
        var path = chart.select('g.chart-body').selectAll('path.extra').data([extra_data]);
        path.enter().append('path').attr('class', 'extra').attr('stroke', '#31a354');
        path.attr('d', line);

        var highValue = d3.max(ydata, function(d) {return d;}),
            lowValue = d3.min(ydata, function(d) {return d;});

        var	ty = rateOfChange(leastSquaresCoeff[0], leastSquaresCoeff[1], xSeries.length);	// Celeration	
    
        $(".high").html(" " + formatTipNumber(highValue));
        $(".low").html(" " + formatTipNumber(lowValue));
        $(".celeration").html(" " + ty + " per 5 years");
    })

    .y(d3.scale.log().clamp(true).domain([.5, 1000000]))
    .x(d3.scale.linear().domain([2000, 2100]))			
    .yAxis().ticks(10, ",.0f").tickSize(5, 0);		

// TODO figure out chain length issues resulting in
// the rest of the chart labels and axis values here				
lineChart.xAxis().ticks(10).tickFormat(d3.format("d"));	
lineChart.yAxisLabel('TOTAL PER YEAR');	
lineChart.xAxisLabel('CALENDAR YEARS');	

rowChart
    .width(300)
    .height(450)
    .dimension(locationValue)
    .group(locationValueGroup)
    .margins({top: 10, right: 50, bottom: 20, left: 30})
    .renderLabel(true)
    .elasticX(true)
    .colors(d3.scale.category20c())
    .xAxis().ticks(3, ",0f").tickSize(5, 0);
    			
    rowChart.data(function (group) {
				return group.top(25);
			});
   
    //.xAxis().ticks(0);

dataCount
    .dimension(cf)
    .group(all);			


d3.selectAll('a#location').on('click', function () {
    rowChart.filterAll();
    dc.redrawAll();
});	

d3.selectAll('#caDown') .on('change', function() { 
    caValue.filter(this.value);
    if (this.value == "All") {
        caValue.filterAll();
    }
    dc.redrawAll(); 
});		

d3.selectAll('#typeDown') .on('change', function() { 
    startValue.filter(this.value);
    if (this.value == "All") {
        startValue.filterAll();
    }
    dc.redrawAll(); 
});



dc.renderAll();

// returns slope, intercept and r-square of the line
function leastSquares(xSeries, ySeries) {
    var reduceSumFunc = function(prev, cur) { return prev + cur; };

    var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
    var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

    var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
        .reduce(reduceSumFunc);

    var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
        .reduce(reduceSumFunc);

    var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
        .reduce(reduceSumFunc);

    var slope = ssXY / ssXX;
    var intercept = yBar - (xBar * slope);
    var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

    return [slope, intercept, rSquare];
}

    // calculate celeration from points along the least squares regression line
    function roundCel(num){ 
        var num_str = num.toString();
        var split_num = num_str.split('.');
        if(split_num[1]){
            var round_num = split_num[0] + '.' + split_num[1].substring(0, 2);
        }else{
            var round_num = split_num[0];
        }

        return round_num;
    }

    function rateOfChange(slope, intercept, xLength) { 
        var celeration = "";

        if(slope>0){
            celeration = "X" + roundCel((intercept+slope*(xLength/2))/(intercept+slope*(xLength/2-3.6)));				
        }else if(slope<0){
            celeration = "/" + roundCel((intercept+slope*(xLength/2-5))/(intercept+slope*(xLength/2)));
        }else{
            celeration = "X1";
        }

        return celeration;
    }
});		