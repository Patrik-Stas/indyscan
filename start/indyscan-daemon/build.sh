#!/usr/bin/env bash
SCRIPT_DIR_PATH=$(dirname "$0")

"$SCRIPT_DIR_PATH"/../../ubuntu-libindy/build.sh

"$SCRIPT_DIR_PATH"/../tools/build-docker.sh \
                    --name "indyscan-daemon" \
                    --tag "latest" \
                    --dockerfile "$SCRIPT_DIR_PATH/../../indyscan-daemon/Dockerfile" \
                    --context "$SCRIPT_DIR_PATH/../.."
