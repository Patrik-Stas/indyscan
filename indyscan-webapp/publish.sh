#!/usr/bin/env bash

VERSION=`cat package.json | jq -r '.version'`

set -e

LOCAL_SOURCE_TAG="indyscan-webapp:latest"
REMOTE_TARGET_TAG_V="pstas/indyscan-webapp:$VERSION"
REMOTE_TARGET_TAG_LATEST="pstas/indyscan-webapp:latest"

echo -e "Will be pushing image:\n"
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
