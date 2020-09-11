#!/usr/bin/dumb-init /bin/bash

node /env.js

if [[ $CONFIG_SERVER_DOCKER_HEALTHCHECK_ENABLE == "true" ]]; then
    echo "docker healthcheck activated"
fi

if [[ $APP_RESTARTER ]]; then
    app-restarter -e "node app.js --config ./config.toml" -tmp /app_restarter_tmp -c /${APP_NAME}
else
    cd /${APP_NAME}
    node app.js --config ./config.toml
fi