#!/bin/bash

set -exuo pipefail

export VERSION=$1

for dir in */; do
    pushd $dir
    docker-compose build
    docker-compose push
    popd
done
