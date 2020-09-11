import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get, Post } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import { Store, IStore } from "../../lib/store";
import * as Ajv from "ajv";

const hashes_schema = {
    type: "array",
    items: {
        type: "string",
        minLength: 1,
        maxLength: 256,
        pattern: "^[^/]{1}"
    },
    minItems: 0
};

const ajv = new Ajv();
const validate = ajv.compile(hashes_schema);

@Controller("/v1/store", "api-server")
export class RouteStore {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _store: IStore = <IStore>Catalog(Store)
    )  {
        this._logger.info(`[${this._app_id}] Controller "${this._name}" assigned to application with prefix ${this._prefix}`, "dev");
    }

    @Get("/list/:namespace_name/(.*)", "api-server")
    async list (ctx: Context): Promise<void> {
        
        const namespace_name = ctx.params.namespace_name;
        const file_path = ctx.params[0];

        const result = this._store.getList(file_path, namespace_name);

        ctx.body = { 
            status: "success",
            data: result
        };
        
        ctx.status = 200;
    
    }

    @Get("/keys", "api-server")
    async keys (ctx: Context): Promise<void> {

        const result = this._store.keys;

        ctx.body = { 
            status: "success",
            data: result
        };
        
        ctx.status = 200;
    
    }

    @Get("/namespaces", "api-server")
    async namespaces (ctx: Context): Promise<void> {

        const result = this._store.namespaces;

        ctx.body = { 
            status: "success",
            data: result
        };
        
        ctx.status = 200;
    
    }

    @Get("/hash/:namespace_name/(.*)", "api-server")
    async hash (ctx: Context): Promise<void> {
        
        const namespace_name = ctx.params.namespace_name;
        const file_path = ctx.params[0];

        const result = this._store.getHash(file_path, namespace_name);

        if (result === undefined) {
            ctx.body = { 
                status: "fail",
                message: `Hash for file "${file_path}" name "${namespace_name}" not file`
            };
        } else {
            ctx.body = { 
                status: "success",
                data: result
            };
        }

        ctx.status = 200;
    
    }

    @Post("/hashes", "api-server")
    async hashes (ctx: Context): Promise<void> {
        
        if (ctx.request.body === undefined) {
            throw new Error("Request body empty");
        }

        const valid = validate(ctx.request.body);

        if (!valid) {
            throw new Error(`Schema errors:\n${JSON.stringify(validate.errors, null, 2)}`);
        }

        const result: unknown[] = [];

        for (const file_path of ctx.request.body) {

            const namespace_name = file_path.split("/")[0];
            const hash = this._store.getHash(file_path.replace(`${namespace_name}/`, ""), namespace_name);

            if (hash === undefined) {
                result.push({
                    exist: false,
                    file: file_path
                });
            } else {
                result.push({
                    exist: true,
                    file: file_path,
                    hash: hash
                });
            }

        }

        ctx.body = { 
            status: "success",
            data: result
        };

        ctx.status = 200;
    
    }

    @Get("/get/:namespace_name/(.*)", "api-server")
    async get (ctx: Context): Promise<void> {
        
        const namespace_name = ctx.params.namespace_name;
        const file_path = ctx.params[0];
        
        const result = await this._store.getFile(file_path, namespace_name);

        if (result === undefined) {
            ctx.body = { 
                status: "fail",
                message: `File "${file_path}" name "${namespace_name}" not file`
            };
        } else {
            ctx.body = { 
                status: "success",
                data: result
            };
        }
        
        ctx.status = 200;
    
    }

}