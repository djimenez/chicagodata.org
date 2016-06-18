<?php

require_once('../proxy.php');

$date_start = date('Y-m-d\TH:i:s.000', strtotime('midnight first day of 121 months ago'));
$date_end = date('Y-m-d\TH:i:s.999', strtotime('midnight first day of now -1 second'));

// resource specific defaults
$params = array(
	'$select' => 'date, community_area, primary_type, location_description, arrest, domestic',
	'$where' => "date between '{$date_start}' and '{$date_end}'",
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