var json_url = "https://data.cityofchicago.org/resource/";
var json_where = "$where=license_start_date>'2010-01-01T12:00:00'&$limit=500000&$$app_token=BWWPzJPWah0RdMqRqbWEw53eb"; 
//$where=position_title not like '%25ADVISOR%25'	//$where=date>'2015-08-01T12:00:00'
//$select=date, community_area, primary_type, latitude, longitude&	

var resource = "xqx5-8hwx.json?";

$("select#area_select").val("48-48th Ward");
drawChart(json_url+resource+json_where+"&ward='48'");

$('#area_select').change(function(){
    $('#typeDown').prop('selectedIndex',0);
});

$('#area_select').on('change',function(e){
    var sVal = $('#area_select').val(),
        sValue = sVal.substr(0, sVal.indexOf("-")),
        sText = sVal.substr(sVal.indexOf("-")+1);
    if(sValue == 0){
        $("title").html("All Business Licenses");
        $(".chart-title").html("All");
        drawChart(json_url+resource+json_where);
    }
    else{
        $("title").html(sText + " Business Licenses");
        $(".chart-title").html(sText);
        drawChart(json_url+resource+json_where+"&ward=" + sValue);
    }
});

//drawChart(json_url+json_where);
//drawChart("Data/chicago1.json");

var formatDate = d3.time.format("%m/%Y"); 
var formatTipNumber = d3.format("0,000");

//var svg = d3.select(map.getPanes().overlayPane).append("svg"),
//    g = svg.append("g").attr("class", "leaflet-zoom-hide");	

// tooltips for line chart
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {return "<span style='color: white'>" + formatDate(d.x) + "</span>: "  + formatTipNumber(d.y); });

function drawChart(url){

    // load the SODA data using d3.json
    d3.json(url, function(error, data){ 
        var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%L"); 
        var numberFormat = d3.format(",f");	

        //gets today and up to 120 months ago
        var startDate = d3.time.month.offset(new Date(), -121);
        var endDate = d3.time.month(new Date());

        //var startDate = d3.time.day.offset(new Date("2012/01/2"), -250);
        //var endDate = d3.time.day(new Date("2012/07/01"));

        // normalize/parse data so dc can correctly sort & bin them
        // I like to think of each "d" as a column in a spreadsheet
        data.forEach(function(d) {		
            d.license_start_date = parseDate.parse(d.license_start_date);	
            //d.dd = parseDate.parse(d.date);
            //d.date = d.date;
            d.ward = +d.ward;
            d.doing_business_as_name = d.doing_business_as_name;
            d.license_description = d.license_description;
            d.latitude = d.latitude;
            d.longitude = d.longitude;
            d.application_type = d.application_type; 

        });

        //console.log(data);
        var filterData = data.filter(function(d) { 
            if(d.license_start_date < endDate && d.license_start_date > startDate || d.license_start_date == endDate || d.license_start_date == startDate)
                return d;
        });

        // Use the crossfilter force.
        var cf = crossfilter(filterData);

        var all = cf.groupAll();

        // for date, per type of chart 
        var dateValue = cf.dimension(function (d) {
           return d3.time.month(d.license_start_date);
        });
        var dateValueGroup = dateValue.group();

        var dateDimension = cf.dimension(function (d) {
            return d3.time.day(d.license_start_date);
            });	

        var licenseValue = cf.dimension(function (d) {
            return d.license_description;
        });

        var licenseValueGroup = licenseValue.group();

        var typeValue = cf.dimension(function (d) {
            return d.application_type;
        });
        var typeValueGroup = typeValue.group();

        // define all of the charts and graphs for the dashboard
        var lineChart = dc.lineChart("#dc-line-chart"),
            dataCount = dc.dataCount('#data-count'),
            licenseChart = dc.rowChart('#dc-license-chart'),
            statusPie = dc.pieChart('#dc-status-pie');

        dataCount
            .dimension(cf)
            .group(all);		

        lineChart
            .width(816)
            .height(580)
            .margins({top: 20, right: 30, bottom: 50, left: 50})
            .dimension(dateValue)
            .group(dateValueGroup)
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
            .on('renderlet.c', function(chart) {
                chart.selectAll('rect').on("click", function(d) {
                    console.log("click!", d);
                });

                var xdata = [];
                var ydata = [];				

                // use real statistics here!
                for(var i=0; i<dateValueGroup.all().length; i++){			
                    ydata.push(dateValueGroup.all()[i].value);
                    xdata.push(dateValueGroup.all()[i].key);					
                }

                // get the x and y values for least squares				
                var xLabels = xdata;

                var xSeries = d3.range(1, xLabels.length + 1);
                var ySeries = ydata;

                var leastSquaresCoeff = leastSquares(xSeries, ySeries);

                var x1 = xLabels[0];
                var y1 = Math.abs(leastSquaresCoeff[0] + leastSquaresCoeff[1]);
                //var x2 = xLabels[xLabels.length - 1];
                var x2 = d3.time.day.offset(xLabels[xLabels.length - 1], 2);
                var y2 = Math.abs(leastSquaresCoeff[0] * (xSeries.length+2) + leastSquaresCoeff[1]);

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

                var ty1 = y1;		// StartDate
                    //ty2 = Math.abs(leastSquaresCoeff[0] * (xSeries.length) + leastSquaresCoeff[1]),		// EndDate
                var	ty2 = Math.abs(leastSquaresCoeff[0] * 6 + leastSquaresCoeff[1]);			// StartDate+7days
                var	ty = rateOfChange(ty1, ty2);

                $(".high").html(" " + formatTipNumber(highValue));
                $(".low").html(" " + formatTipNumber(lowValue));
                $(".celeration").html(" " + ty + " per 6 months");
            })
            .y(d3.scale.log().clamp(true).domain([.5, 1000000]))
            .x(d3.time.scale().domain([new Date (startDate), new Date (endDate)]))			
            .yAxis().ticks(10, ",.0f").tickSize(5, 0);	

        //TODO check for updates from brandongordon
        lineChart.xAxis().ticks(10).tickSize(7,0).tickFormat(d3.time.format("%m/%Y"));	
        lineChart.yAxisLabel('TOTAL PER MONTH');	
        lineChart.xAxisLabel('CALENDAR MONTHS');

		statusPie
			.width(200)
			.height(200)
			.dimension(typeValue)
			.group(typeValueGroup)
			.innerRadius(30)
            .colors(d3.scale.ordinal().range([ '#4B93C3', '#88BEDE', '#B1D4E7', '#DDE9F5']));

        licenseChart
            .width(350)
            .height(300)
            .dimension(licenseValue)
            .group(licenseValueGroup)
            .margins({top: 10, right: 20, bottom: 20, left: 10})
            .renderLabel(true)
            .elasticX(true)
            .xAxis().ticks(4, ",0f").tickSize(5, 0); 

        licenseChart.data(function (group) {
            return group.top(10);
        });
            //.x(d3.scale.log().clamp(true).domain([1, 1000]))
            //.xAxis().ticks(10, ",.0f").tickSize(5, 0)
            //.colors("#5591BA")
            //.xAxis().ticks(0);	

        dataCount
            .dimension(cf)
            .group(all);			

        d3.selectAll('a#type').on('click', function () {
            statusPie.filterAll();
            dc.redrawAll();
        });

        d3.selectAll('a#license').on('click', function () {
            licenseChart.filterAll();
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
        function rateOfChange(a, b) {
            var rate = "";
            if(a == 0) a = 0.5;
            if(b == 0) b = 0.5;
            if(a-b>0) {
                rate = "/" + Math.abs(Math.round(a*100/b)/100);
            }else if(a-b<0) {
                rate = "X" + Math.abs(Math.round(b*100/a)/100);
            }else{ rate = "X" + Math.abs(Math.round(b*100/a)/100); }

            return rate;
        }

        function rateOfChange1(a, b) {
        var rate = "";
        if(a-b>0) {
            rate = "/" + Math.abs(Math.round(a*100/b)/100);
        }else if(a-b<0) {
            rate = "X" + Math.abs(Math.round(b*100/a)/100);
        }else{ rate = "X" + Math.abs(Math.round(b*100/a)/100); }

        return rate;
    }	

});		

}