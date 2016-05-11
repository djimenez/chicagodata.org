<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Crimes Reported per Year</title>
    <link rel="icon" href="../css/icons/favicon.ico" />
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php include '../php/chart-links.php'; ?>
    <style type="text/css"> 
    #dc-row-chart {
        width: 100%;
        height: 100%;    
    }
    </style>
</head>
<body>
<?php include '../php/header.php'; ?> 
    <div id="load"></div>
<div class="container-fluid">
	  <div class="container-fluid form-top dash-responsive">
	    <form class="form-inline form-responsive">
  	      <div class="input-group dropdown">
  	        <span class="input-group-addon">Community Area</span>
  	        <select id="caDown" class="form-control" data-live-search="true" title="Select a Community">
  				<option value="All">All Chicago</option>
                <option value="14">Albany Park</option>
                <option value="57">Archer Heights</option>
                <option value="34">Armour Square</option>
                <option value="70">Ashburn</option>
                <option value="71">Auburn Gresham</option>
                <option value="25">Austin</option>
                <option value="45">Avalon Park</option>
                <option value="21">Avondale</option>
                <option value="19">Belmont Cragin</option>
                <option value="72">Beverly</option>
                <option value="60">Bridgeport</option>
                <option value="58">Brighton Park</option>
                <option value="47">Burnside</option>
                <option value="48">Calumet Heights</option>
                <option value="44">Chatham</option>
                <option value="66">Chicago Lawn</option>
                <option value="64">Clearing</option>
                <option value="35">Douglas</option>
                <option value="17">Dunning</option>
                <option value="27">East Garfield Park</option>
                <option value="52">East Side</option>
				<option value="77">Edgewater</option>
                <option value="9">Edison Park</option>
                <option value="68">Englewood</option>
                <option value="12">Forest Glen</option>
                <option value="37">Fuller Park</option>
                <option value="63">Gage Park</option>
                <option value="56">Garfield Ridge</option>
                <option value="38">Grand Boulevard</option>
                <option value="69">Greater Grand Crossing</option>
                <option value="55">Hegewisch</option>
                <option value="20">Hermosa</option>
                <option value="23">Humboldt Park</option>
                <option value="41">Hyde Park</option>
                <option value="16">Irving Park</option>
                <option value="11">Jefferson Park</option>
                <option value="39">Kenwood</option>
                <option value="6">Lake View</option>
                <option value="7">Lincoln Park</option>
                <option value="4">Lincoln Square</option>
                <option value="22">Logan Square</option>
                <option value="31">Lower West Side</option>
                <option value="59">McKinley Park</option>
                <option value="18">Montclare</option>
                <option value="75">Morgan Park</option>
                <option value="74">Mount Greenwood</option>
                <option value="8">Near North Side</option>
                <option value="33">Near South Side</option>
                <option value="28">Near West Side</option>
                <option value="61">New City</option>
                <option value="5">North Center</option>
                <option value="29">North Lawndale</option>
                <option value="13">North Park</option>
                <option value="10">Norwood Park</option>
                <option value="76">O'Hare</option>
                <option value="36">Oakland</option>
                <option value="15">Portage Park</option>
                <option value="50">Pullman</option>
                <option value="54">Riverdale</option>
                <option value="1">Rogers Park</option>
				<option value="49">Roseland</option>
                <option value="46">South Chicago</option>
                <option value="51">South Deering</option>
                <option value="30">South Lawndale</option>
                <option value="43">South Shore</option>
                <option value="32">The Loop</option>
                <option value="3">Uptown</option>
                <option value="73">Washington Heights</option>
                <option value="40">Washington Park</option>
                <option value="62">West Elsdon</option>
                <option value="67">West Englewood</option>
                <option value="26">West Garfield Park</option>
                <option value="65">West Lawn</option>
                <option value="53">West Pullman</option>
                <option value="2">West Ridge</option>
                <option value="24">West Town</option>
                <option value="42">Woodlawn</option>
  			</select>
  	      </div>
	      <div class="input-group dropdown">
	        <span class="input-group-addon">Primary Type</span>
	            <select id="typeDown" class="form-control" data-live-search="true" title="Select a Crime Type">
					<option value="All" selected="selected">All Types</option>	
					<option value="ARSON">Arson</option>
					<option value="ASSAULT">Assault</option>
					<option value="BATTERY">Battery</option>
                    <option value="BURGLARY">Burglary</option>
					<option value="CRIM SEXUAL ASSAULT">Criminal Sexual Assault</option>
					<option value="CRIMINAL DAMAGE">Criminal Damage</option>
					<option value="CRIMINAL TRESPASS">Criminal Tresspass</option>
					<option value="DECEPTIVE PRACTICE">Deceptive Practice</option>
					<option value="GAMBLING">Gambling</option>
					<option value="HOMICIDE">Homicide</option> 
					<option value="INTERFERENCE WITH PUBLIC OFFICER">Interference w/Public Officer</option>
					<option value="INTIMIDATION">Intimidation</option>
					<option value="KIDNAPPING">Kidnapping</option>
					<option value="LIQUOR LAW VIOLATION">Liquor Law Violation</option>
					<option value="MOTOR VEHICLE THEFT">Motor Vehicle Theft</option>
					<option value="NARCOTICS">Narcotics</option>
					<option value="OFFENSE INVOLVING CHILDREN">Offense Involving Children</option>
					<option value="OTHER OFFENSE">Other Offense</option>
					<option value="PROSTITUTION">Prostitution</option>
					<option value="PUBLIC PEACE VIOLATION">Public Peace Violation</option>
					<option value="ROBBERY">Robbery</option>
					<option value="SEX OFFENSE">Sex Offense</option>
					<option value="STALKING">Stalking</option>
					<option value="THEFT">Theft</option>
					<option value="WEAPONS VIOLATION">Weapons Violation</option>
			    </select>	
		  </div>
		</form>  
	  </div>
	 <div class="container-fluid">
	    <div class="row dash-responsive">
	      <div class="col-md-12 col-sm-12">
	        <div class="row">
	          <div class="col-md-8 col-sm-12 col-xs-12 line-chart nopadding">
	            <div class="chart-wrapper">
	              <div class="chart-title-dash">
	                Crimes Reported per Year
	              </div>
	              <div class="chart-stage">
					  <svg id="dc-line-chart" viewBox="0 0 816 580" 
					       preserveAspectRatio="xMidYMid meet">
					  </svg>
	              </div>
	              <div class="chart-notes">
		  			<div class="info-section">
						<div class="section-line"><b>HIGH:</b><li class="high"></li><b> | LOW:</b><li class="low   "></li><b> | CELERATION (RATE OF CHANGE):</b><li class="celeration"></li></div>
		  			</div>
					<a href="https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-present/ijzp-q8t2">Data Source</a>  |	<a href="http://communitydataproject.org/issue">Report Issue</a> 
	              </div>
	            </div>
	          </div>
	          <div class="col-md-4 col-sm-4 col-xs-6 nopadding">
	            <div class="chart-wrapper">
	              <div class="chart-title-dash">
	                Location Description Filter (Top 25)   <small><a id="location">Reset</a></small>
	              </div>
	              <div class="chart-stage dc-row-chart">
					  <svg id="dc-row-chart" viewBox="0 0 300 450" 
					       preserveAspectRatio="xMidYMid meet">
					  </svg>
	              </div>
	              <div class="chart-notes">
	                Select location descriptions to filter
	              </div>
	            </div>
	          </div>
            </div>    
			<div class="col-md-4 col-sm-12 col-xs-12 spacer">	
		           <div class="btn pull-left">
		               <a href="../crime/monthly.php" class="btn btn-primary">
		                   Monthly Charts
		               </a>
		               <a href="../crime/daily.php" class="btn btn-primary">
		                   Daily Charts
		               </a>
		               <a href="../crime/map.php" class="btn btn-warning">
		                   Maps
		               </a>
		           </div>
		 	</div>
            </div>
         </div>
    </div>
    </div>
    <?php include '../php/footer.php'; ?> 
    <?php include '../php/chart-scripts.php'; ?> 
    <script type="text/javascript" src="js/crime.yearly.js"></script>   
</body>  
</html>