#!/usr/bin/env bash

SCRIPT_DIR=$(dirname $0)

cd $SCRIPT_DIR/genesis

curl https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_builder_genesis -O
curl https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_live_genesis -O
curl https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_sandbox_genesis -O
curl https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_training_genesis -O