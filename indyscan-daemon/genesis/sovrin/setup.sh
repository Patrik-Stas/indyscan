#!/usr/bin/env bash
cd $(dirname "$0")

set -e

POOL_DIR="$HOME"/.indy_client/pool
mkdir -p "$POOL_DIR"/SOVRIN_MAINNET
mkdir -p "$POOL_DIR"/SOVRIN_STAGINGNET
mkdir -p "$POOL_DIR"/SOVRIN_BUILDERNET
mkdir -p "$POOL_DIR"/SOVRIN_TRAININGNET

echo "Downloading genesis files for public Sovrin ledgers."
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_live_genesis > "$POOL_DIR"/SOVRIN_MAINNET/SOVRIN_MAINNET.txn
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_sandbox_genesis > "$POOL_DIR"/SOVRIN_STAGINGNET/SOVRIN_STAGINGNET.txn
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_builder_genesis > "$POOL_DIR"/SOVRIN_BUILDERNET/SOVRIN_BUILDERNET.txn
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_training_genesis > "$POOL_DIR"/SOVRIN_TRAININGNET/SOVRIN_TRAININGNET.txn

echo "Main-net network genesis saved to: $POOL_DIR/SOVRIN_MAINNET/SOVRIN_MAINNET.txn"
echo "Staging-net network genesis saved to: $POOL_DIR/SOVRIN_STAGINGNET/SOVRIN_STAGINGNET.txn"
echo "Builder-net network genesis saved to: $POOL_DIR/SOVRIN_BUILDERNET/SOVRIN_BUILDERNET.txn"
echo "Training-net network genesis saved to: $POOL_DIR/SOVRIN_TRAININGNET/SOVRIN_TRAININGNET.txn"
