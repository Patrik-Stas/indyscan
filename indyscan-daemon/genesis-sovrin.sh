#!/usr/bin/env bash
cd $(dirname "$0")

set -e

POOL_DIR="./app-config/genesis"

echo "Downloading genesis files for public Sovrin ledgers."
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_live_genesis > "$POOL_DIR"/SOVRIN_MAINNET.txn
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_sandbox_genesis > "$POOL_DIR"/SOVRIN_TESTNET.txn
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_builder_genesis > "$POOL_DIR"/SOVRIN_BUILDERNET.txn
curl -s https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_training_genesis > "$POOL_DIR"/SOVRIN_TRAININGNET.txn

echo "Main-net network genesis saved to: $POOL_DIR/SOVRIN_MAINNET/SOVRIN_MAINNET.txn"
echo "Test-net network genesis saved to: $POOL_DIR/SOVRIN_TESTNET/SOVRIN_TESTNET.txn"
echo "Builder-net network genesis saved to: $POOL_DIR/SOVRIN_BUILDERNET/SOVRIN_BUILDERNET.txn"
echo "Training-net network genesis saved to: $POOL_DIR/SOVRIN_TRAININGNET/SOVRIN_TRAININGNET.txn"
