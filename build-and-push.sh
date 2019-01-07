#!/bin/bash

APP_NAME="$1"

TIME=`date -u +%Y%m%dT%H%M%SZ`
REPO="pstas/indyscan"
TAG1="$REPO:latest"
TAG2="$REPO:$TIME"

docker build -t "$TAG1" -f app/Dockerfile .
docker tag "$TAG1" "$TAG2"

docker push "$TAG1"
docker push "$TAG2"