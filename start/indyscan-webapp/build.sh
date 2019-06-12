#!/usr/bin/env bash
SCRIPT_DIR_PATH=$(dirname "$0")

"$SCRIPT_DIR_PATH"/../tools/build-docker.sh \
                --name "indyscan-webapp" \
                --tag "latest" \
                --dockerfile "$SCRIPT_DIR_PATH/../../indyscan-webapp/Dockerfile" \
                --context "$SCRIPT_DIR_PATH/../.."