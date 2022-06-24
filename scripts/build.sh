#!/bin/bash -ex

# For test, should be in CircleCI env settings
PICSIO_DOCKER_REGISTRY=772554042062.dkr.ecr.us-east-1.amazonaws.com

if [ ! -n "$1" ]; then
	echo "ERROR: appname not specified. Usage: build.sh myapp 1.2.3"
	exit 1;
fi
appname="$1"

if [ ! -n "$2" ]; then
	echo "ERROR: tag is not specified. Usage: build.sh myapp 1.2.3"
	exit 1;
fi
tag="$2"

if [ ! -n "$3" ]; then
	shouldPush=false
else
	shouldPush=$3
fi

# echo 'Change version in package.json'
# npm version --commit-hooks=false --git-tag-version=false $tag

echo 'Building docker container'
# Login to docker registry
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $PICSIO_DOCKER_REGISTRY
DOCKER_BUILDKIT=1 docker build -t picsio/$appname:$tag .
# --secret id=npm,src=$HOME/.npmrc  
docker tag picsio/$appname:$tag $PICSIO_DOCKER_REGISTRY/picsio/$appname:$tag
echo 'Build completed'

if [ "$shouldPush" = true ]; then
	echo 'Pushing container'
	docker push $PICSIO_DOCKER_REGISTRY/picsio/$appname:$tag
fi

