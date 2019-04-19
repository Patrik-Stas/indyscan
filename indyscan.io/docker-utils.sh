#!/usr/bin/env bash

function magentaEcho() {
    local text="$1"
    echo -en "\033[1;95m$text\033[0m"
}

function greenEcho() {
    local text="$1"
    echo -en "\033[1;32m$text\033[0m"
}

function exitWithErrMsg() {
  error "$1"
  exit 1
}

function validateImageExists() {
 local IMAGE="$1"
 local exists="yes"
 docker image inspect "$IMAGE"  > /dev/null 2>&1 || exitWithErrMsg "Image '$IMAGE' does not exists."
}

function pushImageAs() {
    local IMAGE="$1"
    local PUSH_AS="$2"
    info "Going to take image $IMAGE and push it as $PUSH_AS"
    docker tag "$IMAGE" "$PUSH_AS" || exitWithErrMsg "Failed to tag image '$IMAGE' as '$PUSH_AS'."
    info "Tagged"
    info "Going to push image $PUSH_AS"
    docker push "$PUSH_AS" || exitWithErrMsg "Failed to push image '$PUSH_AS'."
    info "Pushed"
}
