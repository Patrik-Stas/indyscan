#!/bin/bash

APP_NAME="$1"
DOCKERFILE="$2"

TIME=`date -u +%Y%m%dT%H%M%SZ`
REPO="pstas/$APP_NAME"
TAG1="$REPO:latest"
TAG2="$REPO:$TIME"

docker build -t "$TAG1" -f "$DOCKERFILE" .
docker tag "$TAG1" "$TAG2"
docker push "$TAG1"
docker push "$TAG2"