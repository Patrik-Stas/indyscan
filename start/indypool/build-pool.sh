#!/usr/bin/env bash

REPO_OWNER="hyperledger"
INDY_VERSION="v1.14.1"
TMP_INDYSDK=$(dirname "$0")/tmp-indysdk


if [ ! -d "$TMP_INDYSDK" ]; then
    git clone "https://github.com/${REPO_OWNER}/indy-sdk.git" "$TMP_INDYSDK"
fi;

(cd "$TMP_INDYSDK" && git checkout -- . && git fetch && git checkout "$INDY_VERSION")
if [ $? -ne 0 ]; then
    echo "Could not checkout indy-sdk at revision $INDY_VERSION";
    exit 1;
fi;

if [ -z "$POOL_ADDRESS" ]; then
  POOL_ADDRESS="indypool.indyscan"
  echo "Using default POOL_VERSION=${POOL_ADDRESS}"
fi

if [ -z "$POOL_VERSION" ]; then
  POOL_VERSION="v1.14.1"
  echo "Using default POOL_VERSION=${POOL_VERSION}"
fi

IMAGE_TAG="indyscanpool:$POOL_ADDRESS-$POOL_VERSION"
echo "This will build ${IMAGE_TAG}"
echo "Do you want to continue? (y/n)"
read yesno
if [ $yesno != "y" ]; then
  exit 0
fi

cd "$TMP_INDYSDK" || exit 1
docker build --build-arg pool_ip="$POOL_ADDRESS" -f "ci/indy-pool.dockerfile" -t "$IMAGE_TAG" .

echo "Image built"
docker image ls "$IMAGE_TAG"

echo "Indy Network genesis for this image:"
docker run "$IMAGE_TAG" cat /var/lib/indy/sandbox/pool_transactions_genesis

docker exec "indypool" cat /var/lib/indy/sandbox/pool_transactions_genesis
