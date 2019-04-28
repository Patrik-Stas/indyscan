#!/usr/bin/env bash
# Run this:
# eval `./injectenv.sh`
echo "export INDY_NETWORKS_V2='[{\"id\":\"sovmain\",\"db\":\"SOVRIN_MAINNET\",\"display\":\"MAIN-NET\"},{\"id\":\"sovstaging\",\"db\":\"SOVRIN_TESTNET\",\"display\":\"STAGING-NET\",\"aliases\":[\"SOVRIN_TESTNET\"]},{\"id\":\"sovbuilder\",\"db\":\"SOVRIN_BUILDERNET\",\"display\":\"BUILDER-NET\"}]'"