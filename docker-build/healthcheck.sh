#!/bin/bash

if [[ $CASH_ONLINE_DOCKER_HEALTHCHECK_ENABLE == "true" ]]; then
    echo "start docker healthcheck"
    cd /${APP_NAME}
    node docker-healthcheck.js --config ./config.toml
fi
