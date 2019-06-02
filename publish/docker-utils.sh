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
  local DRY_RUN="$3"

  info "Going to tag '$IMAGE' as '$PUSH_AS'."
  if [ "$DRY_RUN" == '0' ]; then
    docker tag "$IMAGE" "$PUSH_AS" || exitWithErrMsg "Failed to tag image '$IMAGE' as '$PUSH_AS'."
  else
    warning "Dry run:\ndocker tag \"$IMAGE\" \"$PUSH_AS\"\n"
  fi

  info "Going to push image '$PUSH_AS'."
  if [ "$DRY_RUN" == '0' ]; then
     docker push "$PUSH_AS" || exitWithErrMsg "Failed to push image '$PUSH_AS'."
  else
    warning "Dry run:\ndocker push \"$PUSH_AS\"\n"
  fi
}