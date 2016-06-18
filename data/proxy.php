<?php
/**
 * Proxy include script, used by other data scripts.
 */

define('BASE_URL', 'https://data.cityofchicago.org/resource/');
define('APP_TOKEN', 'BWWPzJPWah0RdMqRqbWEw53eb');
define('DEFAULT_LIMIT', 500000);

define('CACHE_DIR', sys_get_temp_dir()); // could also use __DIR__ or other if permissions are correct
define('CACHE_TTL', 3600);
define('CACHE_FALLBACK_TO_REDIRECT', true);

// this will do gzip / deflate content encoding for us - can alternatively be handled at the web server level
ini_set('zlib.output_compression', 'On');

/**
 * Serves the requested content from the cache if able, otherwise, fetches the
 * data and caches it first.
 *
 * NOTE: this assumes the cityofchicago SODA api and that we're always dealing
 * with JSON data - would need modification for other types and sources.
 *
 * @param $url string the location the data can be fetched from if not cached
 */
function proxy_resource($url) {
	// sanity check cache dir
	if (!is_writable(CACHE_DIR)) {
		error_log(__FUNCTION__ . ': the configured cache directory is not writeable - no caching taking place');

		// error is appropriate, but redirecting seems possibly nicer
		if (CACHE_FALLBACK_TO_REDIRECT) {
			header('Location: ' . $url);
		} else {
			http_response_code(500);
		}
		return;
	}

	// start the process of validating / filling the cache
	$cache_file = CACHE_DIR . '/' . md5($url) . '.json';
	$last_modified = @filemtime($cache_file);

	$lock_file = $cache_file . '.lock';
	$lock_fd = fopen($lock_file, 'c');

	if (!$lock_fd) {
		// we expected to be able to create files, without this file we can't continue
		if (CACHE_FALLBACK_TO_REDIRECT) {
			header('Location: ' . $url);
		} else {
			http_response_code(500);
		}
		return;
	}

	// check for cache existence and validity
	if ($last_modified === false || $last_modified + CACHE_TTL < time()) {
		// use a non-blocking exclusive acquisition to have only the first process do the fetch
		if (flock($lock_fd, LOCK_EX | LOCK_NB)) {
			// we  want to fetch into a tmp file, in case there are fetch errors
			$tmp_cache_file = $cache_file . '.tmp';
			$tmp_fd = fopen($tmp_cache_file, 'w');

			if ($tmp_fd) {
				error_log(__FUNCTION__ . ': fetching ' . $url);
				
				$curl_handle = curl_init($url);
				curl_setopt($curl_handle, CURLOPT_FILE, $tmp_fd);

				// tell curl to send all supported Accept-Encoding values (i.e. gzip)
				curl_setopt($curl_handle, CURLOPT_ENCODING, "");

				// make this a conditional GET if we can
				if ($last_modified) {
					curl_setopt($curl_handle, CURLOPT_TIMECONDITION, CURLOPT_TIMECOND_IFMODIFIED_SINCE);
					curl_setopt($curl_handle, CURLOPT_TIMEVALUE, $last_modified);
				}

				$curl_success = curl_exec($curl_handle);
				fclose($tmp_fd);

				if ($curl_success) {
					$curl_status = curl_getinfo($curl_handle, CURLINFO_HTTP_CODE);

					// NOTE: we're purposely leaving the tmp cache file there if the fetch or rename don't succeed
					if ($curl_status === 200) {
						// we fetched new content, move it into place all at once
						rename($tmp_cache_file, $cache_file);
					} elseif ($curl_status === 304) {
						// our conditional get was a success, continue using existing content
						touch($cache_file);
					} else {
						error_log(__FUNCTION__ . ': unexpected status code ' . $curl_status);

						// attempt to avoid many repeated failures during down times- if we have stale cache, just keep using it
						if ($last_modified) {
							touch($cache_file);
						}
					}
				} else {
					error_log(__FUNCTION__ . ': curl error: ' . curl_error($curl_handle));
				}

				curl_close($curl_handle);
			} else {
				error_log(__FUNCTION__ . ': could not create tmp cache file');
			}

			// release the lock
			flock($lock_fd, LOCK_UN);

			// hack: reset last modified so we refresh it below
			$last_modified = false;
		}

		if ($last_modified === false) {
			// if we don't have an existing stale cache, block for a shared lock
			flock($lock_fd, LOCK_SH);
			flock($lock_fd, LOCK_UN);

			// refresh our last modified, it has changed and we use in the response headers later
			clearstatcache($cache_file);
			$last_modified = @filemtime($cache_file);

			// if last modified is still false then we failed to fetch content, and we can't even serve a stale copy
			if ($last_modified === false) {
				if (CACHE_FALLBACK_TO_REDIRECT) {
					header('Location: ' . $url);
				} else {
					http_response_code(500);
				}
				return;
			}
		} // else: if we didn't fetch, and didn't need to wait, serve stale content
	}

	// if cache exists and valid, also support conditional GET
	if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
		$modified_time = filemtime($cache_file);
		$conditional_time = strtotime(DATE_RFC822, $_SERVER['HTTP_IF_MODIFIED_SINCE']);

		if ($condition_time < $last_modified) {
			http_response_code(304);
			return;
		}
	}	

	// write out the cache file. Because we create the cache file through a rename, we shouldn't have to worry about
	// creating a shared lock.
	header('Content-Type: application/json');
	header('Last-Modified: ' . date(DATE_RFC822, $last_modified));
	header('Expires: ' . date(DATE_RFC822, $last_modified + CACHE_TTL));

	readfile($cache_file);
}

/**
 * Given a resource name and parameters, constructs the full
 * cityofchicago SODA url.
 *
 * @param $resource string resource name, e.g. 6zsd-86xi.json
 * @param $params array associative array of key value pairs that represent the query
 * @return string the full URL
 */
function build_resource_url($resource, $params) {
	if (!isset($params['$$app_token'])) {
		$params['$$app_token'] = APP_TOKEN;
	}

	if (!isset($params['$limit'])) {
		$params['$limit'] = DEFAULT_LIMIT;
	}

	return BASE_URL . $resource . '?' . http_build_query($params);
}