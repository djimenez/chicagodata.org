<?php

require_once('../proxy.php');

$date_start = date('Y-m-d\TH:i:s.000', strtotime('midnight first day of 121 months ago'));
$date_end = date('Y-m-d\TH:i:s.999', strtotime('midnight first day of now -1 second'));

// resource specific defaults
$params = array(
	'$where' => "license_start_date between '{$date_start}' and '{$date_end}'",
	'$order' => 'license_start_date DESC'
);

// if a ward is set, validate and add it to the params
if (isset($_GET['ward'])) {
	$ward = intval($_GET['ward']);

	// validate the ward
	if ($ward < 1 || $ward > 100) {
		http_response_code(400);
		echo "ward is not valid\n";
		return;
	}	

	$params['ward'] = $ward;
}

$url = build_resource_url('xqx5-8hwx.json', $params);
proxy_resource($url);