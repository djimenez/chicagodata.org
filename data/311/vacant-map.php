<?php

require_once('../proxy.php');

$date_start = date('Y-m-d\TH:i:s.000', strtotime('90 days ago midnight'));

// resource specific defaults
$params = array(
	'$where' => "date_service_request_was_received > '{$date_start}'",
	'$order' => 'date_service_request_was_received DESC'
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

$url = build_resource_url('yama-9had.json', $params);
proxy_resource($url);