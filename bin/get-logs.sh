#!/bin/bash
set -e          # Fail on any error
set -o pipefail # Ensure piped commands propagate exit codes properly
set -u          # Treat unset variables as an error when substituting

project_id=mento-prod
function_name=handle-oncall-rotation
region=europe-west1

# Fetches the latest logs for the Cloud Function and displays them in the terminal.
get_function_logs() {
	echo "Fetching logs for function ${function_name} in region ${region}..."
	printf "\n"

	# Fetch raw logs
	raw_logs=$(gcloud functions logs read "${function_name}" \
		--region "${region}" \
		--project "${project_id}" \
		--format json \
		--limit 50 \
		--sort-by TIME_UTC)

	# Format logs
	echo "${raw_logs}" | jq -r '.[] | if .level == null then
  "[INFO] \u001b[33m\(.time_utc)\u001b[0m: \(.log)"
elif .level == "E" then
  "\u001b[31m[ERROR]\u001b[0m \u001b[31m\(.time_utc)\u001b[0m: \u001b[31m\(.log)\u001b[0m"
elif .level == "D" then
  "[DEBUG] \u001b[33m\(.time_utc)\u001b[0m: \(.log)"
else
  "[\(.level)] \u001b[33m\(.time_utc)\u001b[0m: \(.log)"
end'
}

get_function_logs "$@"

./bin/get-logs-url.sh