import config from "./lib/entry";
import { Logger } from "logger-flx";
import { Singleton } from "di-ts-decorators";
import { KoaD } from "koa-ts-decorators";
import { Authorization } from "./lib/authorization";
import { Store } from "./lib/store";

import "./http";

const logger = new Logger(config.logger);
const authorization = new Authorization(config.authorization);
const store = new Store(config.store, logger);

Singleton("config", config);
Singleton(Logger.name, logger);
Singleton(Store.name, store);

const api_server = new KoaD(config.api, "api-server");

const bootstrap = async () => {

    try {

        api_server.context.authorization = authorization;

        store.run();

        await api_server.listen( () => {
            logger.info(`[api-server] listening on network interface ${api_server.config.listening}${api_server.prefix}`);
        });

    } catch (error) {
        logger.error(error.message);
        logger.log(error.stack);
        process.exit(1);
    }

};

bootstrap();

process.on("SIGTERM", () => {
    logger.log("💀 Termination signal received 💀");
    process.exit();
});