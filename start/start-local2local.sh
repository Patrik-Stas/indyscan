#!/usr/bin/env bash
set -e

SCRIPT_DIR_PATH=$(dirname "$0")

NETWORK_NAME="indypool-by-indyscan-x"

"$SCRIPT_DIR_PATH"/indypool/start.sh --address "127.0.0.1" --version "v1.8.3" --name "$NETWORK_NAME"
"$SCRIPT_DIR_PATH"/indyscan-daemon/start.sh --mode 'download' --url-mongo "mongodb://localhost:27999" --indy-networks "$NETWORK_NAME"
"$SCRIPT_DIR_PATH"/indyscan-webapp/start.sh --mode 'download' --url-mongo "mongodb://mongo.indynet:27017" --indy-networks "$NETWORK_NAME"



