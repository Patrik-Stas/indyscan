#!/usr/bin/env bash

SCRIPT_DIR_PATH=$(dirname "$0")

(cd "$SCRIPT_DIR_PATH"/indyscan-webapp && docker-compose down)
(cd "$SCRIPT_DIR_PATH"/indyscan-daemon && docker-compose down)

