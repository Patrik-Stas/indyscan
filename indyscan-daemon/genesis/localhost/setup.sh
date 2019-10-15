#!/usr/bin/env bash


POOL_DIR="$HOME"/.indy_client/pool
POOL_NAME="LOCALHOST_INDYSCAN"
GENESIS_DIR="$POOL_DIR/$POOL_NAME"
GENESIS_FILE="$GENESIS_DIR/$POOL_NAME.txn"
mkdir -p "$GENESIS_DIR" || exit
cp "$(dirname $0)/genesis.txn" "$GENESIS_FILE" || exit

cat $GENESIS_FILE || exit
echo -e "\nCreated genesis for local docker indypool at $GENESIS_FILE"
