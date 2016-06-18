
	/* instantiate and configure map for use without mapbox */
	//var map = L.map('map');
	
	//L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		//center: [41.865, -87.6847],
		//maxZoom: 11,
		//zoom: 11,
		//}).addTo(map);
		
	/* configure map for mapbox */
	L.mapbox.accessToken = 'pk.eyJ1IjoicG1hcmNvIiwiYSI6ImNhMjY1NzhmMDIzYzRhZGRhODllYjY5YmU4Y2RlZTU4In0.O8pC3TcknGkQStzVx5AsJA';	
	/* instantiate and configure map */
	
	
	var map = L.mapbox.map('map', 'mapbox.streets')
	.setView([41.865, -87.6847], 10);
	
	//var featureLayer = L.mapbox.featureLayer()
	  //  .loadURL('data/calayer.geojson')
	    //.addTo(map);

	//var map = new L.Map("map", {center: [41.865, -87.6847], zoom: 11})
	//    .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));

	var markers = new L.FeatureGroup();

	//var svg = d3.select(map.getPanes().overlayPane).append("svg"),
	//    g = svg.append("g").attr("class", "leaflet-zoom-hide");	
	var json_url = "../data/crime/map.php";
	//$select=date, community_area, primary_type, latitude, longitude&	

	$("select#area_select").val("14-Albany Park");
	drawChart(json_url+"?community_area=14");
	
	$('#area_select').change(function(){
	    $('#typeDown').prop('selectedIndex',0);
	});
	
	$('#area_select').change(function(){
	    $('#locDown').prop('selectedIndex',0);
	});

	$('#area_select').on('change',function(e){
		var sVal = $('#area_select').val(),
			sValue = sVal.substr(0, sVal.indexOf("-")),
			sText = sVal.substr(sVal.indexOf("-")+1);
		if(sValue == 0){
			$("title").html("All Crimes per Day");
			$(".chart-title").html("All");
			drawChart(json_url);
		}
		else{
			$("title").html(sText + " Crime Map");
			$(".chart-title").html(sText);
			drawChart(json_url+"?community_area=" + sValue);
		}
	});

	$('.info-icon-open').on('click', function(){
		$('.info-content').show();
	});
	
	$('.info-icon-close').on('click', function(){
		$('.info-content').hide();
	});

	//drawChart(json_url+json_where);
	//drawChart("Data/chicago1.json");
	
	var formatDate = d3.time.format("%m/%d/%Y"); 
	var formatTime = d3.time.format("%H:%M");
    
    var parseTime = d3.time.format.utc("%H:%M").parse,
	midnight = parseTime("00:00");
		
	function drawChart(url){

		// load the SODA data using d3.json
		d3.json(url, function(error, data){ 
			var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%L"); 
			var numberFormat = d3.format(",f");	
		
			//gets today and up to 140 days ago
			var startDate = d3.time.day.offset(new Date(), -90);
			var endDate = d3.time.day(new Date());
		
			//var startDate = d3.time.day.offset(new Date("2012/01/2"), -250);
			//var endDate = d3.time.day(new Date("2012/07/01"));
	
			// normalize/parse data so dc can correctly sort & bin them
			// I like to think of each "d" as a column in a spreadsheet
			data.forEach(function(d) {		
				d.date = parseDate.parse(d.date);	
				//d.dd = parseDate.parse(d.date);
				//d.date = d.date;
				d.year = +d.year;
				d.location_description = d.location_description;
				d.community_area = +d.community_area; 
				d.primary_type = d.primary_type;
				d.latitude = d.latitude;
				d.longitude = d.longitude;
				d.arrest = d.arrest; 
				d.domestic = d.domestic; 
				d.block;
			});
		
			//console.log(data);
			/* data is now pre-filtered
			var filterData = data.filter(function(d) { 
				if(d.date < endDate && d.date > startDate || d.date == endDate || d.date == startDate)
					return d;
			});
			*/
			var filterData = data;
		
			// Use the crossfilter force.
		    var cf = crossfilter(filterData);
	
			var all = cf.groupAll();		
			
		    var yearValue = cf.dimension(function (d) {
		        return d3.time.year(d.date).getFullYear();
		    });
			var yearValueGroup = yearValue.group();
			
			var minDate = yearValue.bottom(1)[0].year;
			var maxDate = parseInt(yearValue.top(1)[0].year) + 3; 

			// for dropdown 
		    var startValue = cf.dimension(function (d) {
				return d.primary_type;
		    });
		    var startValueGroup = startValue.group();	
			
			// for dropdown 
		    var locationValue = cf.dimension(function (d) {
				return d.location_description;
		    });
		    var locationValueGroup = locationValue.group();	
		
		    var dateDimension = cf.dimension(function (d) {
			        return d3.time.day(d.date);
			    });	
			
		    var dayOfWeek = cf.dimension(function (d) {
		        var day = d.date.getDay();
		        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		        return day + '.' + name[day];
		    });
			
		    var dayOfWeekGroup = dayOfWeek.group();
            
            var hourLine = [];
		      for(var i=0; i<24; i++) {
			     hourLine[i] =  parseTime(i+":00");
		      }
		
		    var timeOfDay = cf.dimension(function (d) {
			var hour = d.date.getHours();
			//return hour;
			return hourLine[hour];
		      });
			
			var timeOfDayGroup = timeOfDay.group(); 
			
			var arrestValue = cf.dimension(function (d) {
				return d.arrest; 
			});
			
			var arrestValueGroup = arrestValue.group(); 
			
			var domesticValue = cf.dimension(function (d) {
				return d.domestic; 
			});
			
			var domesticValueGroup = domesticValue.group();
				
			// define all of the charts and graphs for the dashboard
			var rowChart = dc.rowChart("#dc-row-chart"),
				timeOfDayChart = dc.barChart("#dc-time-of-day-chart"),
				arrestPie = dc.pieChart("#dc-arrest-pie"),
				domesticPie = dc.pieChart("#dc-domestic-pie"),
				dataCount = dc.dataCount('#data-count'),
				datatable = dc.dataTable("#dc-table-graph");
		
			rowChart
				.width(350)
				.height(200)
				.dimension(dayOfWeek)
				.group(dayOfWeekGroup)
				.margins({top: 10, right: 10, bottom: 20, left: 10})
				.renderLabel(true)
				.elasticX(true)
				//.x(d3.scale.log().clamp(true).domain([1, 1000]))
				//.xAxis().ticks(10, ",.0f").tickSize(5, 0)
				//.colors("#9BF07D")
				//.xAxis().ticks(0);
				
			dataCount
				.dimension(cf)
				.group(all);	
				
			rowChart.label(function (d) {
            	return d.key.split('.')[1];
        	});		
			
            timeOfDayChart
                .width(350)
                .height(200)
                .margins({top: 20, right: 30, bottom: 20, left: 50})
                .dimension(timeOfDay)
                .group(timeOfDayGroup)
                .transitionDuration(500)
                .centerBar(false)
                .brushOn(true)
                .elasticY(true)
                .gap(1)
                //.colors("#7DD4F0")
                //.x(d3.scale.linear().domain([0, 24]).rangeRound([0, 240]))
                .yAxis().ticks(10, "0,000").tickSize(5, 0);
                //.xUnits(d3.time.minutes, 60); // Need empty val to offset first value	

            timeOfDayChart
                .x(d3.time.scale.utc().domain([midnight, d3.time.day.utc.offset(midnight, 1)]).rangeRound([0, 24]))
                .xUnits(d3.time.hours, 1)
                .xAxis().tickFormat(d3.time.format.utc("%-I%p"));
			
			arrestPie
				.width(150)
				.height(150)
				.dimension(arrestValue)
				.group(arrestValueGroup)
				.innerRadius(20);
		
			
			domesticPie
				.width(150)
				.height(150)
				.dimension(domesticValue)
				.group(domesticValueGroup)
				.innerRadius(20);
		 
			datatable
			    .dimension(yearValue)
			    .group(function(d) {return d.year;})
				.size(20)
			    // dynamic columns creation using an array of closures
			    .columns([
			        function(d) { return formatDate(d.date);},
					function(d) { return formatTime(d.date);},
			        function(d) {return d.community_area;},  
					function(d) { return '<a href=\"http://maps.google.com/maps?z=15&t=m&q=loc:' + d.latitude + '+' + d.longitude +"\" target=\"_blank\">Map</a>"}     
			    ])
			   .order(d3.descending)
			        .sortBy(function (d) {
			              return d.date;
	          
			   })
			   .on('renderlet', function (table) {
					// each time table is rendered remove nasty extra row dc.js insists on adding
					table.select('tr.dc-table-group').remove();

					// update map with breweries to match filtered data
					markers.clearLayers();
					_.each(dateDimension.top(Infinity), function (d) {						
						var Lat = parseFloat(d.latitude);
						var Lng = parseFloat(d.longitude);
					
						if(Lat && Lng){
							if(d.primary_type == "HOMICIDE"){
								var marker = L.circleMarker([d.latitude, d.longitude], {
									color: "#ffffff",
									weight: 1,
									fillColor: '#3182bd',
									fillOpacity: 1,
									radius: 5
								});

							} else {
								var marker = L.circleMarker([d.latitude, d.longitude], {
									color: "#ffffff",
									weight: 1,
									fillColor: '#3182bd',
									fillOpacity: 1,
									radius: 5
								});
							}					
							marker.bindPopup("<p>" + "Type: " + d.primary_type + "</br>" + "Location: " + d.location_description + "</br>" + "Date: " + formatDate(d.date) + "</br>" + "Block: " + d.block + "</p>");
							markers.addLayer(marker);
						}
					
					});
					map.addLayer(markers);
					map.fitBounds(markers.getBounds());
				});

		
			dataCount
				.dimension(cf)
				.group(all);			
	 
	
			d3.selectAll('a#day').on('click', function () {
				rowChart.filterAll();
				dc.redrawAll();
			});
	
			d3.selectAll('a#time').on('click', function () {
				timeOfDayChart.filterAll();
				dc.redrawAll();
			});			
	
			d3.selectAll('#typeDown') .on('change', function() { 
				startValue.filter(this.value);
				if (this.value == "All") {
					startValue.filterAll();
				}
				dc.redrawAll(); 
			});
	
			d3.selectAll('#locDown') .on('change', function() { 
				locationValue.filter(this.value);
				if (this.value == "All") {
					locationValue.filterAll();
				}
				dc.redrawAll(); 
			});
	
			dc.renderAll();
			
	});		
	
}	