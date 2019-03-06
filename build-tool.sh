#!/bin/bash

APP_NAME="$1"
DOCKERFILE="$2"

TIME=`date -u +%Y%m%dT%H%M%SZ`
REPO="$APP_NAME";
TAG1="$REPO:latest-local"
TAG2="$REPO:$TIME"
echo -e "Will build app: $APP_NAME from Dockerfile $DOCKERFILE as:\n$TAG1\n$TAG2\n"

sleep 8
docker build -t "$TAG1" -f "$DOCKERFILE" .
docker tag "$TAG1" "$TAG2"