FROM ubuntu:18.04

#ENV APP_RESTARTER "true"
ENV APP_RESTARTER_VERSION 0.0.7
ENV APP_NAME "http-config-server"

RUN apt-get update && \
    apt-get install -y curl bash git && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash && \
    apt-get install -y nodejs && \
    node -v && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*  && \
    rm -f /var/cache/apt/archives/*.deb  && \
    rm -f var/cache/apt/archives/partial/*.deb  && \
    rm -f /var/cache/apt/*.bin

RUN npm install app-restarter@${APP_RESTARTER_VERSION} -g && \
    app-restarter -v

RUN curl -Lo /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 && \
    chmod 755 /usr/local/bin/dumb-init

COPY start.sh /start
COPY healthcheck.sh /healthcheck

RUN chmod +x /start && \
    chmod +x /healthcheck

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["/bin/bash", "/start"]

COPY app /${APP_NAME}
COPY env.js /env.js
COPY keys.json /keys.json
COPY config.toml /${APP_NAME}/config.toml


RUN cd /${APP_NAME} && \
    npm install --only=production && \
    node app.js -v && \
    node docker-healthcheck.js -v

HEALTHCHECK --interval=10s --timeout=10s --start-period=5s --retries=3 CMD [ "bash", "/healthcheck" ]