#!/usr/bin/env bash

SCRIPT_DIR=`dirname $0`
SOURCE_DB="IS_STOR_TEST"

mongoexport -d "$SOURCE_DB" -c txs-domain | jq -c 'del(._id)' >  "$SCRIPT_DIR"/txs-test/domain.json
mongoexport -d "$SOURCE_DB" -c txs-pool | jq -c 'del(._id)' >  "$SCRIPT_DIR"/txs-test/pool.json
mongoexport -d "$SOURCE_DB" -c txs-config | jq -c 'del(._id)' >  "$SCRIPT_DIR"/txs-test/config.json
