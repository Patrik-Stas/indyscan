#!/usr/bin/env bash

PROJECT_VERSION=`cat package.json | jq -r .version`
PROJECT_NAME=`cat package.json | jq -r .name`
IMAGE_TAG="$PROJECT_NAME:$PROJECT_VERSION"

echo "Going to build $IMAGE_TAG"
echo "Do you want to continue? (y/n)"
read yesno
if [ "$yesno" != "y" ]; then
  exit 0
fi


cd .. # we need to have api-clinet in docker build context
docker build -f "./$PROJECT_NAME/Dockerfile" -t "$IMAGE_TAG" .
