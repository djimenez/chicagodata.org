<?php

require_once('../proxy.php');

// include approximately 140 days of data (account for the week delay as well)
$start_date = date('Y-m-d\TH:i:s.000', strtotime('147 days ago midnight'));
$end_date = date('Y-m-d\TH:i:s.000', strtotime('7 days ago midnight'));

// resource specific defaults
$params = array(
	'$select' => 'date, community_area, primary_type, location_description, arrest, domestic',
	'$where' => "date between '{$start_date}' and '{$end_date}'",
	'$order' => 'date DESC'
);

// if a community area is set, valid and add it to the params
if (isset($_GET['community_area'])) {
	$community_area = intval($_GET['community_area']);

	// validate the community area
	if ($community_area < 1 || $community_area > 100) {
		http_response_code(400);
		echo "community_area is not valid\n";
		return;
	}	

	$params['community_area'] = $community_area;
}

$url = build_resource_url('6zsd-86xi.json', $params);
proxy_resource($url);