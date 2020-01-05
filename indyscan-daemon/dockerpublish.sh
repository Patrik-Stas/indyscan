#!/usr/bin/env bash

PROJECT_VERSION=`cat package.json | jq -r .version`
PROJECT_NAME=`cat package.json | jq -r .name`

set -e

LOCAL_SOURCE_TAG="$PROJECT_NAME:$PROJECT_VERSION"
REMOTE_TARGET_TAG_V="pstas/$PROJECT_NAME:$PROJECT_VERSION"
REMOTE_TARGET_TAG_LATEST="pstas/$PROJECT_NAME:latest"

echo -e "Will be pushing image $LOCAL_SOURCE_TAG:\n"
docker images "$LOCAL_SOURCE_TAG"
echo -e "\nas '$REMOTE_TARGET_TAG_V' and '$REMOTE_TARGET_TAG_LATEST' \n\nDo you want to continue? (y/n)"

read yesno

if [ $yesno == "y" ]; then
  echo "Tagging and pushing!"
else
  echo "Terminating."
  exit 0
fi

set -x

docker tag  "$LOCAL_SOURCE_TAG" "$REMOTE_TARGET_TAG_V"
docker tag  "$LOCAL_SOURCE_TAG" "$REMOTE_TARGET_TAG_LATEST"
docker push "$REMOTE_TARGET_TAG_V"
docker push "$REMOTE_TARGET_TAG_LATEST"
