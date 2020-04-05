#!/usr/bin/env bash


LOCAL_SOURCE_TAG="indypool:indyscanpool-v1.15.0"
REMOTE_TARGET_TAG_V="pstas/$LOCAL_SOURCE_TAG"

echo -e "Will be pushing image $LOCAL_SOURCE_TAG:\n"
docker images "$LOCAL_SOURCE_TAG"
echo -e "\nas '$REMOTE_TARGET_TAG_V' Do you want to continue? (y/n)"

read yesno

if [ $yesno == "y" ]; then
  echo "Tagging and pushing!"
else
  echo "Terminating."
  exit 0
fi

set -x

docker tag  "$LOCAL_SOURCE_TAG" "$REMOTE_TARGET_TAG_V"
docker push "$REMOTE_TARGET_TAG_V"
