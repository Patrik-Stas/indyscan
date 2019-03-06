#!/bin/bash
INDY_VERSION="v1.7.0"
DOCKER_BUILD_ARGS="INDY_VERSION=$INDY_VERSION"
docker build --build-arg "$DOCKER_BUILD_ARGS" -t "ubuntu-libindy:$INDY_VERSION" -f "./ubuntu-libindy/Dockerfile" .

