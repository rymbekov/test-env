#!/bin/bash -ex
env=$1
server=''
servicename='picsio'
stagename=''
slackservername=$1
serverurl='stage.pics.io'
dir="/home/ubuntu/projects/$servicename"
color="#2ab27b" # color for Slack messages

if [ ! -z "$2" ]; then
	stagename="server-$2"
	serverurl="$2.stage.pics.io"
	slackservername="server-$2"
	echo "serverurl: " $serverurl
	echo "stagename: " $stagename
	echo "slackservername: " $slackservername
fi

if [[ "production" = $env ]]; then
	server="pics.io"
	serverurl="pics.io"
	color="#2ab27b"
elif [[ "stage" = $env ]]; then
	server="stage.pics.io"
	color="#dd0000"
else
	echo "ERROR: Environment is not specified. Should be 'stage' or 'production'."
	echo "Usage: restart.sh [production|stage]"
	echo "Example 1: restart.sh stage"
	exit
fi

ssh ubuntu@$server <<EOF
	# `set -e` will exit immediately on command fail
	# https://ss64.com/bash/set.html
	set -e; 
	cd $dir;
	echo 'Notifiying to Slack about release'
	curl -X POST --data-urlencode 'payload={"channel": "#releases", "username": "Pics.io browser app deployed to ['$slackservername']", "attachments":[{"mrkdwn_in": ["text"], "text": ":tada: Pics.io browser app deployed to *'$slackservername'*. https://'$serverurl'", "color":"'$color'","unfurl_links":false}]}' https://hooks.slack.com/services/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
	# server caches index.html, so we should restart it
	if [[ "$stagename" != '' ]]; then 
		echo 'restarting personal stage: $stagename'
		pm2 restart '$stagename' && pm2 restart websites
	elif [[ "stage" == "$env" ]]; then 
		pm2 restart server && pm2 restart websites && pm2 restart server-yetithefoot
	else 
		pm2 restart server && pm2 restart websites
	fi
	echo 'Restarting nginx'
	sudo service nginx restart
	echo 'Deployed'
EOF
