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
INDYSCAN_ADDRESS_UI="$2"
INDYSCAN_ADDRESS_API="$3"


if [ -z "$POOL_NAME" ]; then
    exitWithErrMsg "Missing argument! POOL_NAME is missing"
fi

if [ -z "$INDYSCAN_ADDRESS_UI" ]; then
    exitWithErrMsg "Missing argument! INDYSCAN_ADDRESS_UI is missing"
fi

if [ -z "$INDYSCAN_ADDRESS_API" ]; then
    exitWithErrMsg "Missing argument! INDYSCAN_ADDRESS_API is missing"
fi

echo -en "Use IndyScan UI: $GREEN$INDYSCAN_ADDRESS_UI$RESET_COLOR\n"
echo -en "Use IndyScan API: $GREEN$INDYSCAN_ADDRESS_API$RESET_COLOR\n"
echo -en "Indy Pool was provisioned locally by name: $GREEN$POOL_NAME$RESET_COLOR\n"
echo -en "You can connect via IndyCLI:$GREEN pool connect $POOL_NAME$RESET_COLOR\n"
echo -en "To print the genesis file, run this:$GREEN cat ~/.indy_client/pool/$POOL_NAME/$POOL_NAME.txn $RESET_COLOR\n"
