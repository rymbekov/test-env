#!/bin/bash -e

run () {
  verify_api_key
  parse_jira_key_array
    # If you have either an issue key or a service ID
  if [[ -n "${ISSUE_KEYS}" ]]; then
    check_workflow_status
    generate_json_payload_build
    post_to_jira
  else
      # If no service is or issue key is found.
    echo "No Jira issue keys found in commit subjects or branch name, skipping."
    exit 0
  fi
}

verify_api_key () {
  URL="https://circleci.com/api/v2/me?circle-token=${JIRA_TOKEN}"
  fetch $URL /tmp/me.json
  jq -e '.login' /tmp/me.json
}

parse_jira_key_array () {
  if [ -z "$ISSUE_KEYS" ]; then
    fetch https://circleci.com/api/v1.1/project/github/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/${CIRCLE_BUILD_NUM} /tmp/job_info_temp.json
    if [ $CIRCLE_TAG ]; then
      echo "This pipeline was triggered by a git tag"
      TAG_BODY=$(curl -H "Authorization: token $GITHUB_AUTH_TOKEN" \
      "https://api.github.com/repos/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/releases/tags/$CIRCLE_TAG" | jq .name)
      
      cat /tmp/job_info_temp.json | jq -r --arg TAG_BODY "$TAG_BODY" '.all_commit_details[0] += {"branch":"", "subject":$TAG_BODY, "body":""}' > /tmp/job_info.json
    else
      mv /tmp/job_info_temp.json /tmp/job_info.json
    fi
    
    ISSUE_KEYS=$(cat /tmp/job_info.json | jq '[.all_commit_details[].subject | scan("([A-Z]{2,30}-[0-9]+)")   | .[] ] + [.all_commit_details[].branch | scan("([A-Z]{2,30}-[0-9]+)")   | .[] ] + [if .branch then .branch else "" end | scan("([A-Z]{2,30}-[0-9]+)")  | . [] ] + [if false then .all_commit_details[].body else "" end | scan("([A-Z]{2,30}-[0-9]+)")   | .[] ]')
  fi
  echo $ISSUE_KEYS
  if [ -z "$ISSUE_KEYS" ]; then
    echo "No issue keys found. This build does not contain a match for a Jira Issue. Please add your issue ID to the commit message or within the branch name."
    exit 0
  fi
}

fetch () {
  URL="$1"
  OFILE="$2"
  RESP=$(curl -w "%{http_code}" -s  --user "${JIRA_TOKEN}:"  \
  -o "${OFILE}" \
  "${URL}")

  if [[ "$RESP" != "20"* ]]; then
    echo "Curl failed with code ${RESP}. full response below."
    cat $OFILE
    exit 1
  fi
}

check_workflow_status () {
  URL="https://circleci.com/api/v2/workflow/${CIRCLE_WORKFLOW_ID}"
  fetch $URL /tmp/workflow.json
  export WORKFLOW_STATUS=$(jq -r '.status' /tmp/workflow.json)
  export CIRCLE_PIPELINE_NUMBER=$(jq -r '.pipeline_number' /tmp/workflow.json)
  echo "This job is passing, however another job in workflow is ${WORKFLOW_STATUS}"

  if [ "build" != "deployment" ]; then
      # deployments are special, cause they pass or fail alone.
      # but jobs are stuck togehter, and they must respect status of workflow
      if [[ "$WORKFLOW_STATUS" == "fail"* ]]; then
        export JIRA_BUILD_STATUS="failed"
      fi
  fi
}

generate_json_payload_build () {
  iso_time=$(date '+%Y-%m-%dT%T%z'| sed -e 's/\([0-9][0-9]\)$/:\1/g')
  echo {} | jq \
  --arg time_str "$(date +%s)" \
  --arg lastUpdated "${iso_time}" \
  --arg pipelineNumber "${CIRCLE_PIPELINE_NUMBER}" \
  --arg projectName "${CIRCLE_PROJECT_REPONAME} - ${CIRCLE_TAG}" \
  --arg state "${JIRA_BUILD_STATUS}" \
  --arg jobName "${CIRCLE_JOB}" \
  --arg buildNumber "${CIRCLE_BUILD_NUM}" \
  --arg url "${CIRCLE_BUILD_URL}" \
  --arg workflowUrl "https://circleci.com/workflow-run/${CIRCLE_WORKFLOW_ID}" \
  --arg commit "${CIRCLE_SHA1}" \
  --arg refUri "${CIRCLE_REPOSITORY_URL}/tree/${CIRCLE_BRANCH}" \
  --arg repositoryUri "${CIRCLE_REPOSITORY_URL}" \
  --arg branchName "${CIRCLE_BRANCH}" \
  --arg workflowId "${CIRCLE_WORKFLOW_ID}" \
  --arg repoName "${CIRCLE_PROJECT_REPONAME} - ${CIRCLE_TAG}" \
  --arg display "${CIRCLE_PROJECT_REPONAME} - ${CIRCLE_TAG}"  \
  --arg description "${CIRCLE_PROJECT_REPONAME} #${CIRCLE_BUILD_NUM} ${CIRCLE_JOB}" \
  --argjson issueKeys "${ISSUE_KEYS}" \
  '
  ($time_str | tonumber) as $time_num |
  {
    "builds": [
      {
        "schemaVersion": "1.0",
        "pipelineId": $projectName,
        "buildNumber": $pipelineNumber,
        "updateSequenceNumber": $time_str,
        "displayName": $display,
        "description": $description,
        "url": $workflowUrl,
        "state": $state,
        "lastUpdated": $lastUpdated,
        "issueKeys": $issueKeys
      }
    ]
  }
  ' > /tmp/jira-status.json
}

post_to_jira () {
  HTTP_STATUS=$(curl \
  -u "${JIRA_TOKEN}:" \
  -s -w "%{http_code}" -o /tmp/curl_response.txt \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -X POST "https://circleci.com/api/v1.1/project/github/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/jira/build" --data @/tmp/jira-status.json)

  echo "Results from Jira: "
  if [ "${HTTP_STATUS}" != "200" ];then
    echo "Error calling Jira, result: ${HTTP_STATUS}" >&2
    jq '.' /tmp/curl_response.txt
    exit 0
  fi

  if jq -e '.unknownIssueKeys[0]' /tmp/curl_response.txt > /dev/null; then
    echo "ERROR: unknown issue key"
    jq '.' /tmp/curl_response.txt
    exit 0
  fi

  # If reached this point, the deployment was a success.
  echo
  jq '.' /tmp/curl_response.txt
  echo
  echo
  echo "Success!"
}

# kick off
source ./circleci-orb-jira.status
run
rm -f ./circleci-orb-jira.status