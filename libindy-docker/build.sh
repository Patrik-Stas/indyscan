#!/usr/bin/env bash

INDY_VERSION="v1.6.6"

FULL_TAG="pstas/libindy:$INDY_VERSION"

docker build --build-arg INDY_VERSION="$INDY_VERSION" -t "$FULL_TAG" .
