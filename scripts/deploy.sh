#!/bin/bash -ex
env=$1
server=''
servicename='picsio'
tag=''
ref='master' # we can deploy specific brahch or tag `deploy.sh stage feat/my-newest-feature`.
if [ ! -z "$2" ]; then
	ref=$2
fi

if [ ! -z "$3" ]; then
	tag=$3
fi

dir="/home/ubuntu/projects/$servicename"
color="#2ab27b" # color for Slack messages

if [[ "production" = $env ]]; then
	server="pics.io"
	color="#2ab27b"
elif [[ "stage" = $env ]]; then
	server="stage.pics.io"
	color="#dd0000"
else
	echo "ERROR: Environment is not specified. Should be 'stage' or 'production'."
	echo "Usage: deploy.sh [production|stage] [branch|tag]"
	echo "Example 1: deploy.sh production"
	echo "Example 2: deploy.sh production mybranch"
	echo "Example 3: deploy.sh production v2.0.0"
	exit
fi

ssh ubuntu@$server << EOF
	# `set -e` will exit immediately on command fail
	# https://ss64.com/bash/set.html
	set -e; 

	cd $dir;

	echo 'Updating sources'
	if [[ $ref =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
		git fetch --tags origin
		git checkout --force tags/$ref
	else
		git fetch origin $ref
		git checkout --force origin/$ref
	fi
	git status

	echo 'Updating dependencies'
	npm i

	echo 'Building bundles'
	if [[ "$tag" != '' ]]; then 
		BUNDLE_NAME="$tag" npm run build:$env
		BUNDLE_NAME="$tag" npm run build:proofing:$env
		BUNDLE_NAME="$tag" npm run build:single:$env
	else 
		npm run build:$env
		npm run build:proofing:$env
		npm run build:single:$env
	fi

	echo 'Notifiying to Slack about release'
	curl -X POST --data-urlencode 'payload={"channel": "#releases", "username": "Pics.io browser app deployed to ['$env']", "attachments":[{"mrkdwn_in": ["text"], "text": ":tada: Pics.io browser app deployed to *'$env'*. https://'$server'", "color":"'$color'","unfurl_links":false}]}' https://hooks.slack.com/services/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

	# server caches index.html, so we should restart it
	pm2 restart server
	echo 'Restarting nginx'
	sudo service nginx restart

	echo 'Deployed'
EOF
