	var json_url = "../data/311/vacant-monthly.php";
//$where=position_title not like '%25ADVISOR%25'	//$where=date>'2015-08-01T12:00:00'
	//$select=date, community_area, primary_type, latitude, longitude&	
    
	$("select#area_select").val("14-Albany Park");
	drawChart(json_url+"?community_area=14");
	
	$('#area_select').change(function(){
	    $('#typeDown').prop('selectedIndex',0);
	});

	$('#area_select').on('change',function(e){
		var sVal = $('#area_select').val(),
			sValue = sVal.substr(0, sVal.indexOf("-")),
			sText = sVal.substr(sVal.indexOf("-")+1);
		if(sValue == 0){
			$("title").html("All Vacant/Abandoned Buildings");
			$(".chart-title").html("All");
			drawChart(json_url);
		}
		else{
			$("title").html(sText + " Vacant/Abandoned Building Map");
			$(".chart-title").html(sText);
			drawChart(json_url+"?community_area=" + sValue);
		}
	});

	//drawChart(json_url+json_where);
	//drawChart("Data/chicago1.json");
	
	var formatDate = d3.time.format("%m/%d/%Y"); 
	var formatTipNumber = d3.format("0,000");

    var svg = d3.select("#dc-line-chart").append("svg") 
        .attr("viewBox", "0 0 735 545")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g");

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
				d.date_service_request_was_received = parseDate.parse(d.date_service_request_was_received);	
				//d.dd = parseDate.parse(d.date);
				//d.date = d.date;
                d.is_the_building_vacant_due_to_fire_ = d.is_the_building_vacant_due_to_fire_;
                d.any_people_using_property_homeless_childen_gangs_ = d.any_people_using_property_homeless_childen_gangs_;
                d.service_request_type = d.service_request_type;
				d.community_area = +d.community_area; 
				d.latitude = d.latitude;
				d.longitude = d.longitude;
			});
		
			//console.log(data);
			/* data is pre-filtered
			var filterData = data.filter(function(d) { 
				if(d.date_service_request_was_received < endDate && d.date_service_request_was_received > startDate || d.date_service_request_was_received == endDate || d.date_service_request_was_received == startDate)
					return d;
			});
			*/
			var filterData = data;
		
			// Use the crossfilter force.
		    var cf = crossfilter(filterData);
	
			var all = cf.groupAll();	
            
            // for date, per type of chart 
	        var dateValue = cf.dimension(function (d) {
	           return d3.time.month(d.date_service_request_was_received);
	        });
		    var dateValueGroup = dateValue.group();
 
		    var squatValue = cf.dimension(function (d) {
				return d.any_people_using_property_homeless_childen_gangs_;
		    });
		    var squatValueGroup = squatValue.group();
            
            // for statusValue 
		    var fireValue = cf.dimension(function (d) {
				return d.is_the_building_vacant_due_to_fire_;
		    });
		    var fireValueGroup = fireValue.group();
            
            var dateDimension = cf.dimension(function (d) {
			        return d3.time.day(d.date_service_request_was_received);
			    });	
				
			// define all of the charts and graphs for the dashboard
			var lineChart = dc.lineChart("#dc-line-chart"),
                dataCount = dc.dataCount('#data-count'),
                firePie = dc.pieChart('#dc-fire-pie'),
                squatPie = dc.pieChart('#dc-squat-pie');
            
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

				    var	ty = rateOfChange(leastSquaresCoeff[0], leastSquaresCoeff[1], xSeries.length);	// Celeration

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
		
				
			dataCount
				.dimension(cf)
				.group(all);	
            
            squatPie
                .width(200)
                .height(200)
                .dimension(squatValue)
                .group(squatValueGroup)
                .innerRadius(30);
            
            firePie
                .width(200)
                .height(200)
                .dimension(fireValue)
                .group(fireValueGroup)
                .innerRadius(30);
				
			dataCount
				.dimension(cf)
				.group(all);	
		 

		
			dataCount
				.dimension(cf)
				.group(all);			
	 
            d3.selectAll('a#squat').on('click', function () {
				squatPie.filterAll();
				dc.redrawAll();
			});
            
			d3.selectAll('a#fire').on('click', function () {
				firePie.filterAll();
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
				celeration = "X" + roundCel((intercept+slope*(xLength/2))/(intercept+slope*(xLength/2-6)));				
			}else if(slope<0){
				celeration = "/" + roundCel((intercept+slope*(xLength/2-6))/(intercept+slope*(xLength/2)));
			}else{
				celeration = "X1";
			}

			return celeration;
		}

  });	

}