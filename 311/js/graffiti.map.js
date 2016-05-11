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
	var json_url = "https://data.cityofchicago.org/resource/";
	var json_where = "$where=status not like '%25Dup%25'&$limit=500000&$$app_token=BWWPzJPWah0RdMqRqbWEw53eb"; 
//$where=position_title not like '%25ADVISOR%25'	//$where=date>'2015-08-01T12:00:00'
	//$select=date, community_area, primary_type, latitude, longitude&	
    
    var resource = "cdmx-wzbz.json?";

	$("select#area_select").val("14-Albany Park");
	drawChart(json_url+resource+json_where+"&community_area='14'");
	
	$('#area_select').change(function(){
	    $('#typeDown').prop('selectedIndex',0);
	});

	$('#area_select').on('change',function(e){
		var sVal = $('#area_select').val(),
			sValue = sVal.substr(0, sVal.indexOf("-")),
			sText = sVal.substr(sVal.indexOf("-")+1);
		if(sValue == 0){
			$("title").html("All Graffiti");
			$(".chart-title").html("All");
			drawChart(json_url+resource+json_where);
		}
		else{
			$("title").html(sText + " Graffiti Map");
			$(".chart-title").html(sText);
			drawChart(json_url+resource+json_where+"&community_area=" + sValue);
		}
	});

	//drawChart(json_url+json_where);
	//drawChart("Data/chicago1.json");
	
	var formatDate = d3.time.format("%m/%d/%Y"); 
	var formatTime = d3.time.format("%H:%M")
		
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
				d.creation_date = parseDate.parse(d.creation_date);	
				//d.dd = parseDate.parse(d.date);
				//d.date = d.date;
                d.what_type_of_surface_is_the_graffiti_on_ = d.what_type_of_surface_is_the_graffiti_on_;
                d.type_of_service_request = d.type_of_service_request;
				d.community_area = +d.community_area; 
				d.latitude = d.latitude;
				d.longitude = d.longitude;
                d.status = d.status; 
				
			});
		
			//console.log(data);
			var filterData = data.filter(function(d) { 
				if(d.creation_date < endDate && d.creation_date > startDate || d.creation_date == endDate || d.creation_date == startDate)
					return d;
			});
		
			// Use the crossfilter force.
		    var cf = crossfilter(filterData);
	
			var all = cf.groupAll();		

			// for surfaceValue 
		    var surfaceValue = cf.dimension(function (d) {
				return d.what_type_of_surface_is_the_graffiti_on_;
		    });
		    var surfaceValueGroup = surfaceValue.group();
            
            // for statusValue 
		    var statusValue = cf.dimension(function (d) {
				return d.status;
		    });
		    var statusValueGroup = statusValue.group();
            
            var dateDimension = cf.dimension(function (d) {
			        return d3.time.day(d.creation_date);
			    });	
		
		    var dayOfWeek = cf.dimension(function (d) {
		        var day = d.creation_date.getDay();
		        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		        return day + '.' + name[day];
		    });
			
		    var dayOfWeekGroup = dayOfWeek.group();
				
			// define all of the charts and graphs for the dashboard
			var rowChart = dc.rowChart("#dc-row-chart"),
				dataCount = dc.dataCount('#data-count'),
                surfaceChart = dc.rowChart('#dc-surface-chart'),
                statusPie = dc.pieChart('#dc-status-pie'),
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
            
            statusPie
                .width(200)
                .height(200)
                .dimension(statusValue)
                .group(statusValueGroup)
                .innerRadius(30);
            
            surfaceChart
				.width(350)
				.height(300)
				.dimension(surfaceValue)
				.group(surfaceValueGroup)
				.margins({top: 10, right: 10, bottom: 20, left: 10})
				.renderLabel(true)
				.elasticX(true); 
            
            surfaceChart.data(function (group) {
				return group.top(10);
			});
				//.x(d3.scale.log().clamp(true).domain([1, 1000]))
				//.xAxis().ticks(10, ",.0f").tickSize(5, 0)
				//.colors("#9BF07D")
				//.xAxis().ticks(0);
				
			dataCount
				.dimension(cf)
				.group(all);	
		 
			datatable
			    .dimension(surfaceValue)
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
							if(d.status == "Open"){
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
							marker.bindPopup("<p>" + "Request Type: " + d.type_of_service_request + "</br>" + "Surface Type: " + d.what_type_of_surface_is_the_graffiti_on_ + "</br>" + "Date Created: " + formatDate(d.creation_date) + "</br>" + "Status: " + d.status + "</p>");
							markers.addLayer(marker);
						}
					
					});
					map.addLayer(markers);
					map.fitBounds(markers.getBounds());
				});

		
			dataCount
				.dimension(cf)
				.group(all);			
	 
            d3.selectAll('a#status').on('click', function () {
				statusPie.filterAll();
				dc.redrawAll();
			});
            
			d3.selectAll('a#surface').on('click', function () {
				rowChart.filterAll();
				dc.redrawAll();
			});		
	
			dc.renderAll();
			
	});		
	
}	