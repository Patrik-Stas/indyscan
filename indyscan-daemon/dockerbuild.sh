#!/usr/bin/env bash

DOCKER_BUILD_PARAMS=$1

PROJECT_VERSION=`cat package.json | jq -r .version`
PROJECT_NAME=`cat package.json | jq -r .name`
IMAGE_TAG="$PROJECT_NAME:$PROJECT_VERSION"
IMAGE_TAG_LATEST="$PROJECT_NAME:latest"

echo "Going to build $IMAGE_TAG and $IMAGE_TAG_LATEST"
echo "Do you want to continue? (y/n)"
read yesno
if [ "$yesno" != "y" ]; then
  exit 0
fi
echo "Building image!"

cd .. # we need to have full monorepo context loaded
docker build ${DOCKER_BUILD_PARAMS} -f "./$PROJECT_NAME/Dockerfile" -t "$IMAGE_TAG" .
docker tag "$IMAGE_TAG" "$IMAGE_TAG_LATEST"

echo "Images built"
