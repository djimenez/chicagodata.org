<!DOCTYPE html>
<html lang="en">
<head>
    <title>ChicagoData.org</title> 
    <link rel="icon" href="css/icons/favicon.ico" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php include 'php/home-links.php'; ?>
    <style type="text/css">
        
        h4 {
            text-align: center;
        }

        .thumbnail {
            padding: 0px;
            margin-top: 20px;
        }
        .home-row {
            background-color: #EEEEEE;
            width: 100%;
        }
        #banner {
		  background-image: url(css/images/dark_tint.png), url(css/images/skyline2.png);
		  background-position: center center;
		  background-size: cover;
          padding: 6em 0em 6em;
		  text-align: center;
	   }

		#banner :last-child {
			margin-bottom: 0;
		}

		#banner h2 {
			color: #ffffff;
			font-size: 4em; font-size: 6vw;
			line-height: 1em;
			margin: 0 0 0 0;
			padding: 0;
		}

        #banner h3 {
            color: #ffffff;
            font-size: 1.5em; font-size: 3vw;
            font-weight: 200;
		}
          
    </style>
</head>
<body>
    <?php include 'php/header.php'; ?>
	<div class="row">
		<div class="col-xs-12 col-sm-12 col-md-12">
			<section id="banner">
				<h2>ChicagoData.org</h2>
				<h3>Explore your community through data</h3>
			</section>
		</div>
	</div>       
<div class="container-fluid home-row">
	<div class="row">
		<div class="col-md-12">
			<div class="row">
				<div class="col-md-4 col-sm-4 col-xs-12">
					<div class="thumbnail">
                        <h4>
				           Crime Dashboards
				        </h4>
						<a href="crime/monthly.php"><img alt="Crime Reports" src="css/images/crime_db.png" style="padding-bottom:21px;"/></a> 
					</div>
				</div>
				<div class="col-md-4 col-sm-4 col-xs-12">
					<div class="thumbnail">
                        <h4>
				           311 Dashboards
				        </h4>
                        <a href="311/graffiti-monthly.php"><img alt="311 Reports" src="css/images/311_db.png" style="padding-bottom:8px;"/></a>
					</div>
				</div>
				<div class="col-md-4 col-sm-4 col-xs-12">
					<div class="thumbnail">
                        <h4>
				           Business Dashboards
				        </h4>
                        <a href="business/monthly.php"><img alt="Business Licenses" src="css/images/business_db.png" style="padding-bottom:19px;"/></a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div> 
    <?php include 'php/footer.php'; ?>    
    <!-- script type="text/javascript" src="js/d3.v3.min.js"></script -->
    <script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/bootstrap.min.js"></script>
</body>
</html>