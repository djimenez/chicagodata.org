<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Business Licenses per Month</title>
    <link rel="icon" href="../css/icons/favicon.ico" />
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php include '../php/chart-links.php'; ?>
	<style type="text/css">
        #dc-license-chart {
            width: 100%;
            height: 100%;    
        }
        #dc-type-pie {
            width: 100%;
            height: 100%;  
        }
        #dc-license-chart .axis line {
            fill: none;
            stroke: lightgray;
            shape-rendering: crispEdges;
        }
        #dc-license-chart .axis path {
            fill: none; 
            stroke: gray;
        }
     </style>
</head>
<body>
<?php include '../php/header.php'; ?> 
<div class="container-fluid">
	  <div class="container-fluid form-top dash-responsive">
	    <form class="form-inline form-responsive">  
	      <div class="input-group dropdown">
	        <span class="input-group-addon">Ward</span>
	        <select id="area_select" class="form-control" data-live-search="true" title="Select a Ward">	
                <option id="area1"  value="1-1st Ward">1st Ward </option>
                <option id="area2"  value="2-2nd Ward">2nd Ward </option>
                <option id="area3"  value="3-3rd Ward">3rd Ward </option>
                <option id="area4"  value="4-4th Ward">4th Ward </option>
                <option id="area5"  value="5-5th Ward">5th Ward </option>
                <option id="area6"  value="6-6th Ward">6th Ward </option>
                <option id="area7"  value="7-7th Ward">7th Ward </option>
                <option id="area8"  value="8-8th Ward">8th Ward </option>
                <option id="area9"  value="9-9th Ward">9th Ward </option>
                <option id="area10"  value="10-10th Ward">10th Ward </option>
                <option id="area11"  value="11-11th Ward">11th Ward </option>
                <option id="area12"  value="12-12th Ward">12th Ward </option>
                <option id="area13"  value="13-13th Ward">13th Ward </option>
                <option id="area14"  value="14-14th Ward">14th Ward </option>
                <option id="area15"  value="15-15th Ward">15th Ward </option>
                <option id="area16"  value="16-16th Ward">16th Ward </option>
                <option id="area17"  value="17-17th Ward">17th Ward </option>
                <option id="area18"  value="18-18th Ward">18th Ward </option>
                <option id="area19"  value="19-19th Ward">19th Ward </option>
                <option id="area20"  value="20-20th Ward">20th Ward </option>
                <option id="area21"  value="21-21st Ward">21st Ward </option>
                <option id="area22"  value="22-22nd Ward">22nd Ward </option>
                <option id="area23"  value="23-23rd Ward">23rd Ward </option>
                <option id="area24"  value="24-24th Ward">24th Ward </option>
                <option id="area25"  value="25-25th Ward">25th Ward </option>
                <option id="area26"  value="26-26th Ward">26th Ward </option>
                <option id="area27"  value="27-27th Ward">27th Ward </option>
                <option id="area28"  value="28-28th Ward">28th Ward </option>
                <option id="area29"  value="29-29th Ward">29th Ward </option>
                <option id="area30"  value="30-30th Ward">30th Ward </option>
                <option id="area31"  value="31-31st Ward">31st Ward </option>
                <option id="area32"  value="32-32nd Ward">32nd Ward </option>
                <option id="area33"  value="33-33rd Ward">33rd Ward </option>
                <option id="area34"  value="34-34th Ward">34th Ward </option>
                <option id="area35"  value="35-35th Ward">35th Ward </option>
                <option id="area36"  value="36-36th Ward">36th Ward </option>
                <option id="area37"  value="37-37th Ward">37th Ward </option>
                <option id="area38"  value="38-38th Ward">38th Ward </option>
                <option id="area39"  value="39-39th Ward">39th Ward </option>
                <option id="area40"  value="40-40th Ward">40th Ward </option>
                <option id="area41"  value="41-41st Ward">41st Ward </option>
                <option id="area42"  value="42-42nd Ward">42nd Ward </option>
                <option id="area43"  value="43-43rd Ward">43rd Ward </option>
                <option id="area44"  value="44-44th Ward">44th Ward </option>
                <option id="area45"  value="45-45th Ward">45th Ward </option>
                <option id="area46"  value="46-46th Ward">46th Ward </option>
                <option id="area47"  value="47-47th Ward">47th Ward </option>
                <option id="area48"  value="48-48th Ward" selected>48th Ward </option>
                <option id="area49"  value="49-49th Ward">49th Ward </option>
                <option id="area50"  value="50-50th Ward">50th Ward </option>
			</select>
	      </div>
            <a href="../business/map.php" class="btn btn-warning">
		      Business Maps
            </a>
		</form>  
	  </div>
	  
	 <div class="container-fluid">
	    <div class="row dash-responsive">

	      <div class="col-sm-12">

	        <div class="row">
	          <div class="col-md-8 col-sm-12 col-xs-12 line-chart nopadding">
	            <div class="chart-wrapper">
	              <div class="chart-title-dash">
	                Business Licenses per Month (by License Start Date)  <span class="chart-title"></span> 
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
					<a href="https://data.cityofchicago.org/Community-Economic-Development/Business-Licenses/r5kz-chrr">Data Source</a> |	<a href="http://communitydataproject.org/issue">Report Issue</a>  
	              </div> 
	            </div>
	          </div>
            <div class="col-md-4 col-sm-4 col-xs-6 nopadding">
	            <div class="chart-wrapper">
	              <div class="chart-title-dash">
	                License Description Filter  <small><a id="license">Reset</a></small>
	              </div>
	              <div class="chart-stage">
					  <svg id="dc-license-chart" viewBox="0 0 350 300" 
					       preserveAspectRatio="xMidYMid meet">
					  </svg>
	              </div>
	              <div class="chart-notes">
	                Select license descriptions to filter
	              </div>
	            </div>
	       </div>    
	          <div class="col-md-4 col-sm-4 col-xs-6 nopadding">
	            <div class="chart-wrapper">
	              <div class="chart-title-dash">
	                Application Type  <small><a id="type">Reset</a></small>
	              </div>
	              <div class="chart-stage capitalize">
					  <svg id="dc-status-pie" viewBox="-100 0 400 200"
					       preserveAspectRatio="xMidYMid meet">
					  </svg>
	              </div>
	              <div class="chart-notes">
	                Select type to filter 
	              </div>
	            </div>
	          </div>
            </div>    
			<div class="col-md-4 col-sm-12 col-xs-12 spacer">	
		 	</div>	 
           </div>        
          </div>
       </div>
    </div>
    <?php include '../php/footer.php'; ?> 
    <?php include '../php/chart-scripts.php'; ?> 
    <script type="text/javascript" src="js/business.monthly.js"></script>

</body>
</html>
