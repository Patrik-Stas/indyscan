#!/bin/bash

MAJOR=`cat version.json | jq '.major'`
MINOR=`cat version.json | jq '.minor'`
PATCH=`cat version.json | jq '.patch'`
echo "$MAJOR.$MINOR.$PATCH"
