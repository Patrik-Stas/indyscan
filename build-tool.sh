#!/bin/bash

APP_NAME="$1"
DOCKERFILE="$2"
REPO_OWNER="$3"

TIME=`date -u +%Y%m%dT%H%M%SZ`
if [ -z "$REPO_OWNER" ]; then
    REPO="$APP_NAME";
else
    REPO="$REPO_OWNER/$APP_NAME"
fi;

TAG1="$REPO:latest-local"
TAG2="$REPO:$TIME"

echo -e "Will build app: $APP_NAME from Dockerfile $DOCKERFILE as:\n$TAG1\n$TAG2\n"
if [ ! -z "$REPO_OWNER" ]; then
    echo "These images will be pushed to docker repository $REPO_OWNER"
fi;

sleep 8

docker build -t "$TAG1" -f "$DOCKERFILE" .
docker tag "$TAG1" "$TAG2"

if [ ! -z "$REPO_OWNER" ]; then
    docker push "$TAG1"
    docker push "$TAG2"
fi
