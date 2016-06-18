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
	var json_url = "../data/311/vacant-map.php";
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
	var formatTime = d3.time.format("%H:%M")
		
	function drawChart(url){

		// load the SODA data using d3.json
		d3.json(url, function(error, data){ 
			var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%L"); 
			var numberFormat = d3.format(",f");	
		
			//gets today and up to 90 days ago
			var startDate = d3.time.day.offset(new Date(), -90);
			var endDate = d3.time.day(new Date());
		
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
			/* data pre-filtered
			var filterData = data.filter(function(d) { 
				if(d.date_service_request_was_received < endDate && d.date_service_request_was_received > startDate || d.date_service_request_was_received == endDate || d.date_service_request_was_received == startDate)
					return d;
			});
			*/
			var filterData = data;
		
			// Use the crossfilter force.
		    var cf = crossfilter(filterData);
	
			var all = cf.groupAll();		
 
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
			var dataCount = dc.dataCount('#data-count'),
                firePie = dc.pieChart('#dc-fire-pie'),
                squatPie = dc.pieChart('#dc-squat-pie'),
				datatable = dc.dataTable("#dc-table-graph");
				
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
		 
			datatable
			    .dimension(fireValue)
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
							if(d.is_the_building_vacant_due_to_fire_ == "true"){
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
							marker.bindPopup("<p>" + "Request Type: " + d.service_request_type + "</br>" + "Date Created: " + formatDate(d.date_service_request_was_received) + "</br>" + "Vacant from Fire: " + d.is_the_building_vacant_due_to_fire_ + "</br>" + "Used by Homeless/Gangs/Children: " + d.any_people_using_property_homeless_childen_gangs_ + "</p>");
							markers.addLayer(marker);
						}
					
					});
					map.addLayer(markers);
					map.fitBounds(markers.getBounds());
				});

		
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
			
	});		
	
}