#!/bin/bash
set -e          # Fail on any error
set -o pipefail # Ensure piped commands propagate exit codes properly
set -u          # Treat unset variables as an error when substituting

project_id=mento-prod
function_name=handle-oncall-rotation
region=europe-west1

# Prints the log explorer URL for the Cloud Function and displays it in the terminal.
# Requires an environment arg (e.g., staging, production).
get_function_logs_url() {
	# Get time 1 day ago in UTC
	start_time=$(date -u -v-1d +"%Y-%m-%dT%H:%M:%S.000Z")

	# Get current time in UTC
	end_time=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

	logs_explorer_url=$(
		cat <<EOF | tr -d '\n' | sed 's/[[:space:]]//g'
https://console.cloud.google.com/logs/query;
query=%2528
	resource.type%20%3D%20%22cloud_function%22%0A
	resource.labels.function_name%20%3D%20%22${function_name}%22%0A
	resource.labels.region%20%3D%20%22${region}%22%2529%0A%20OR%20%0A%2528
	resource.type%20%3D%20%22cloud_run_revision%22%0A
	resource.labels.service_name%20%3D%20%22${function_name}%22%0A
	resource.labels.location%20%3D%20%22${region}%22%2529%0A%20
	severity%3E%3DDEFAULT;
storageScope=project;
summaryFields=labels%252FrateFeed,labels%252Fnetwork:false:32:beginning;
startTime=${start_time};
endTime=${end_time};
?project=${project_id}
EOF
	)

	printf '\n\033[1mLogs Explorer URL\033[0m - Your function logs in the GCP Logs Explorer, usually this is what you want.\n%s\n' "${logs_explorer_url}"

	function_logs_url="https://console.cloud.google.com/functions/details/${region}/${function_name}?project=${project_id}&tab=logs "
	printf '\n\033[1mCloud Function Logs\033[0m - A simplified logs view..\n%s\n' "${function_logs_url}"
}

get_function_logs_url "$@"
