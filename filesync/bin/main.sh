#!/bin/bash

[ ! -n "$SYNC_DIR" ] && echo "SYNC_DIR env var must be set" && exit 1
[ ! -n "$GS_URL" ] && echo "GS_URL env var must be set" && exit 1
[ ! -n "$INTERVAL" ] && echo "INTERVAL env var must be set" && exit 1

exec /usr/local/bin/gunicorn filesync.server:app -b 0.0.0.0:9898 --threads 8
