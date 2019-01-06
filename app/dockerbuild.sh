#!/bin/bash

TIME=`date -u +%Y%m%dT%H%M%SZ`
REPO="pstas/indyscan"
IMAGE_TAG="$REPO:latest"

echo "Building docker image '$IMAGE_TAG'"
docker build -t "$IMAGE_TAG" .
