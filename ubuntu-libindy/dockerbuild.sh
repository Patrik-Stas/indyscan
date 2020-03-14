#!/bin/bash
SCRIPT_DIR_PATH=$(dirname "$0")

DOCKER_BUILD_PARAMS=$1

INDYSDK_REPO_OWNER="hyperledger"
INDYSDK_REVISION="v1.14.2"
NAME=""

DOCKER_TAG="indyscan-indysdk:$INDYSDK_REVISION"

if [[ "$NAME" ]]; then
  DOCKER_TAG="$DOCKER_TAG-$NAME"
fi;

INDYSDK_REPO="https://github.com/${INDYSDK_REPO_OWNER}/indy-sdk"

echo "Going to build $DOCKER_TAG from revision $INDYSDK_REVISION at repo: $INDYSDK_REPO"
echo "Do you want to continue? (y/n)"
read yesno
if [ "$yesno" != "y" ]; then
  exit 0
fi
echo "Building image!"

docker build "$DOCKER_BUILD_PARAMS" \
             --build-arg "INDYSDK_REPO=$INDYSDK_REPO" \
             --build-arg "INDYSDK_REVISION=$INDYSDK_REVISION" \
             -t "$DOCKER_TAG" \
             -f "$SCRIPT_DIR_PATH/Dockerfile" \
             .

echo "Images built"
