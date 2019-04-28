#!/usr/bin/env bash
# Run this:
# eval `./injectenv.sh`
echo "export INDY_NETWORKS_V2='[{\"id\":\"sovmain\",\"db\":\"SOVRIN_MAINNET\",\"display\":\"MAINNET\",\"aliases\":[\"SOVRIN_MAINNET\"]},{\"id\":\"sovstaging\",\"db\":\"SOVRIN_TESTNET\",\"display\":\"STAGINGNET\",\"aliases\":[\"SOVRIN_TESTNET\"]},{\"id\":\"sovbuilder\",\"db\":\"SOVRIN_BUILDERNET\",\"display\":\"BUILDERNET\"}]'"