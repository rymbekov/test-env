#!/bin/bash -e

TOKEN=$JIRA_API_TOKEN
USER=$JIRA_USER
APP_NAME=$1

run() {
    parseJiraKey
    if [[ -n "${ISSUE_KEYS}" ]]; then
        postCommit
    else
        echo "No Jira issue keys found in branch name, skipping."
        exit 0
    fi
}

parseJiraKey() {
    if [ -z "$ISSUE_KEYS" ]; then
        RELEASE_NAME=$(curl -H "Authorization: token $GITHUB_AUTH_TOKEN" \
                "https://api.github.com/repos/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/releases/tags/$CIRCLE_TAG" | jq .name)

        ISSUE_BODY=$(jq --null-input --arg name "$RELEASE_NAME" '{ name: $name }')
        ISSUE_KEYS=$(echo $ISSUE_BODY | jq -r '.name | scan("([A-Z]{2,30}-[0-9]+)") | .[]')
    fi
    if [ -z "$ISSUE_KEYS" ]; then
        echo "No issue keys found. This build does not contain a match for a Jira Issue. Please add your issue ID to the branch name."
        exit 0
    fi
}

postCommit() {
    for key in ${ISSUE_KEYS}
    do
        # echo $key
        sendCommitBy $key
    done
}

sendCommitBy() {
    key=$1
    echo "JIRA issue key is: $key"
    url="https://toptechphoto.atlassian.net/rest/api/3/issue/${key}/comment"
    echo $url

    requestBody="$(echo {} | jq \
        --arg project "${CIRCLE_PROJECT_REPONAME}" \
        --arg tag "${CIRCLE_TAG} - ${APP_NAME}" \
        '{
            "body":  {
                "version": 1,
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "type": "text",
                                "text": "Releases: ",
                                "marks": [
                                    {
                                        "type": "em"
                                    },
                                    {
                                        "type": "strong"
                                    }
                                ]
                            },
                            {
                                "type": "hardBreak"
                            },
                            {
                                "type": "text",
                                "text": "App: ",
                                "marks": [
                                    {
                                        "type": "strong"
                                    }
                                ]
                            },
                            {
                                "type": "text",
                                "text": $project,
                                "marks": [
                                    {
                                        "type": "code"
                                    }
                                ]
                            },
                            {
                                "type": "text",
                                "text": " - "
                            },
                            {
                                "type": "text",
                                "text": "Version: ",
                                "marks": [
                                    {
                                    "type": "strong"
                                    }
                                ]
                            },
                            {
                                "type": "text",
                                "text": $tag,
                                "marks": [
                                    {
                                    "type": "code"
                                    }
                                ]
                            },
                            {
                                "type": "hardBreak"
                            }
                        ]
                    }
                ]
            }
        }')"

 curl --request POST \
  --url  "${url}" \
  -u "${USER}:${TOKEN}" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "${requestBody}"
}

run
