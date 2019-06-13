#!/usr/bin/env bash
cd $(dirname "$0")

set -e

POOL_DIR="$HOME"/.indy_client/pool
mkdir -p "$POOL_DIR"/SOVRIN_MAIN_NET
mkdir -p "$POOL_DIR"/SOVRIN_STAGING_NET
mkdir -p "$POOL_DIR"/SOVRIN_BUILDER_NET
mkdir -p "$POOL_DIR"/SOVRIN_TRAINING_NET

echo "Downloading genesis files for public Sovrin ledgers."
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_live_genesis > "$POOL_DIR"/SOVRIN_MAIN_NET/SOVRIN_MAIN_NET.txn
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_sandbox_genesis > "$POOL_DIR"/SOVRIN_STAGING_NET/SOVRIN_STAGING_NET.txn
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_builder_genesis > "$POOL_DIR"/SOVRIN_BUILDER_NET/SOVRIN_BUILDER_NET.txn
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_training_genesis > "$POOL_DIR"/SOVRIN_TRAINING_NET/SOVRIN_TRAINING_NET.txn

echo "Main-net network genesis saved to: $POOL_DIR/SOVRIN_MAIN_NET/SOVRIN_MAIN_NET.txn"
echo "Staging-net network genesis saved to: $POOL_DIR/SOVRIN_STAGING_NET/SOVRIN_STAGING_NET.txn"
echo "Builder-net network genesis saved to: $POOL_DIR/SOVRIN_BUILDER_NET/SOVRIN_BUILDER_NET.txn"
echo "Training-net network genesis saved to: $POOL_DIR/SOVRIN_TRAINING_NET/SOVRIN_TRAINING_NET.txn"