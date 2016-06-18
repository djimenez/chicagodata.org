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
	var json_url = "../data/business/map.php";
//$where=position_title not like '%25ADVISOR%25'	//$where=date>'2015-08-01T12:00:00'
	//$select=date, community_area, primary_type, latitude, longitude&	
    
	$("select#area_select").val("48-48th Ward");
	drawChart(json_url+"?ward=48");
	
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
			drawChart(json_url);
		}
		else{
			$("title").html(sText + " Business Licenses");
			$(".chart-title").html(sText);
			drawChart(json_url+"?ward=" + sValue);
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
			/* data is pre-filtered
			var filterData = data.filter(function(d) { 
				if(d.license_start_date < endDate && d.license_start_date > startDate || d.license_start_date == endDate || d.license_start_date == startDate)
					return d;
			});
			*/
			var filterData = data
		
			// Use the crossfilter force.
		    var cf = crossfilter(filterData);
	
			var all = cf.groupAll();	
            
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
			var dataCount = dc.dataCount('#data-count'),
                licenseChart = dc.rowChart('#dc-license-chart'),
                typePie = dc.pieChart('#dc-type-pie'),
				datatable = dc.dataTable("#dc-table-graph");
				
			dataCount
				.dimension(cf)
				.group(all);		
            
            
            typePie
                .width(200)
                .height(200)
                .dimension(typeValue)
                .group(typeValueGroup)
                .innerRadius(30);
            
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
				//.colors("#9BF07D")
				//.xAxis().ticks(0);
				
			dataCount
				.dimension(cf)
				.group(all);	
		 
			datatable
			    .dimension(licenseValue)
			    .group(function(d) {return d.year;})
				.size(20)
			    // dynamic columns creation using an array of closures
			    .columns([
			        function(d) { return formatDate(d.license_start_date);},
					function(d) { return formatTime(d.license_start_date);},
			        function(d) {return d.ward;},  
					function(d) { return '<a href=\"http://maps.google.com/maps?z=15&t=m&q=loc:' + d.latitude + '+' + d.longitude +"\" target=\"_blank\">Map</a>"}     
			    ])
			   .order(d3.descending)
			        .sortBy(function (d) {
			              return d.license_start_date;
	          
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
							if(d.application_type == "ISSUE"){
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
							marker.bindPopup("<p>" + "Name: " + d.doing_business_as_name + "</br>" + "Description: " + d.license_description + "</br>" + "Start Date: " + formatDate(d.license_start_date) + "</br>" + "Type: " + d.application_type + "</p>");
							markers.addLayer(marker);
						}
					
					});
					map.addLayer(markers);
					map.fitBounds(markers.getBounds());
				});

		
			dataCount
				.dimension(cf)
				.group(all);			
	 
            d3.selectAll('a#license').on('click', function () {
				licenseChart.filterAll();
				dc.redrawAll();
			});
            
			d3.selectAll('a#type').on('click', function () {
				typePie.filterAll();
				dc.redrawAll();
			});		
	
			dc.renderAll();
			
	});		
	
}