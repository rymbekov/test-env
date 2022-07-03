#!/bin/bash -ex
env=$1
server=''
servicename='inboxes'
stagename=''
slackservername=$1
serverurl='stage.pics.io'
dir=''
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
	server="146.148.53.130" # services.pics.io
	dir="/home/ubuntu/projects/$servicename"
elif [[ "stage" = $env ]]; then
	server="35.202.231.44" # services2.pics.io
	dir="/home/ubuntu/projects/$servicename"
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

	echo 'Restart service'
	docker restart $servicename
	
	# echo 'Reset app restart counter'
	# pm2 reset $servicename

	echo 'Done.'
EOF
