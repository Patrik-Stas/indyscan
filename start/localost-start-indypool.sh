#!/usr/bin/env bash
SCRIPT_DIR_PATH=$(dirname "$0")

NETWORK_NAME="indypool-by-indyscan-x"

"$SCRIPT_DIR_PATH"/indypool/start.sh --address "127.0.0.1" --version "v1.8.3" --name "$NETWORK_NAME"
"$SCRIPT_DIR_PATH"/indyscan/start.sh --mode 'build' --indy-networks "$NETWORK_NAME"


