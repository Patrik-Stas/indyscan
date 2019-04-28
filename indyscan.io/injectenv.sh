#!/usr/bin/env bash
# Run this:
# eval `./injectenv.sh`
RELATIVE_CONFIG_PATH="$(dirname "$0")/webapp-config.json"
CONFIG_WITH_NEWLINES=`cat $RELATIVE_CONFIG_PATH`
CONFIG_NO_NEWLINES=`echo $CONFIG_WITH_NEWLINES`
echo "export INDY_NETWORKS_V2='$CONFIG_NO_NEWLINES'"