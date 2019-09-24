#!/bin/bash
SCRIPT_DIR_PATH=$(dirname "$0")

INDY_VERSION="v1.10.0"
DOCKER_BUILD_ARGS="INDY_VERSION=$INDY_VERSION"
docker build --build-arg "$DOCKER_BUILD_ARGS" -t "ubuntu-libindy:$INDY_VERSION" -f "$SCRIPT_DIR_PATH/Dockerfile" .

