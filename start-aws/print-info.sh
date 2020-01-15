#!/usr/bin/env bash

errcho(){ >&2 echo ">> ERROR: $@"; }
#
#function magentaEcho() {
#    local text="$1"
#    echo -en "\033[1;95m$text\033[0m"
#}
#
#function greenEcho() {
#    local text="$1"
#    echo -en "\033[1;32m$text\033[0m"
#}

function exitWithErrMsg() {
  errcho "$1"
  exit 1
}

GREEN="\033[1;32m"
MAGENTA="\033[1;95m"
RESET_COLOR="\033[0m"
POOL_NAME="$1"
INDYSCAN_ADDRESS="$2"


if [ -z "$POOL_NAME" ]; then
    exitWithErrMsg "Missing argument! POOL_NAME is missing"
fi

if [ -z "$INDYSCAN_ADDRESS" ]; then
    exitWithErrMsg "Missing argument! INDYSCAN_ADDRESS is missing"
fi

echo -en "Indy Pool was provisioned locally by name: $GREEN$POOL_NAME$RESET_COLOR\n"
echo -en "Use IndyScan to browse its transactions: $GREEN$INDYSCAN_ADDRESS$RESET_COLOR\n"
