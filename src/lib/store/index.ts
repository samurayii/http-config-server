import { 
    IStore, 
    IStoreConfig,
    IStoreSourceGitConfig,
    IStoreSource,
    IStoreKeys
} from "./interfaces";
import { EventEmitter } from "events";
import { StoreSourceGit } from "./lib/git-source";
import { ILogger } from "logger-flx";
import * as fs from "fs";
import * as path from "path";
import { sync as sync_del } from "rimraf";
import jtomler from "jtomler";
import * as crypto from "crypto";

export * from "./interfaces";

export class Store extends EventEmitter implements IStore {

    private readonly _sources_list: {
        [key: string]: IStoreSource
    }
    private readonly _keys: IStoreKeys
    private readonly _store_folder: string
    private _store_data: {
        [key: string]: {
            [key: string]: string
        }
    }

    constructor (
        private readonly _config: IStoreConfig,
        private readonly _logger: ILogger
    ) {

        super();

        this._sources_list = {};
        this._keys = {};
        this._store_data = {};
        
        const tmp_folder = path.resolve(process.cwd(), this._config.tmp);
        const tmp_sources_folder = path.resolve(process.cwd(), `${this._config.tmp}/sources`);

        this._store_folder = path.resolve(process.cwd(), `${this._config.tmp}/store`);

        if (fs.existsSync(tmp_folder)) {
            sync_del(tmp_folder);
        }

        fs.mkdirSync(tmp_folder);
        fs.mkdirSync(tmp_sources_folder);
        fs.mkdirSync(this._store_folder);

        this._loadKeys();

        for (const source of this._config.sources) {

            if (this._sources_list[source.namespace] !== undefined) {
                this._logger.error(`[Store] Source named "${source.namespace}" already exist`);
                process.exit(1);
            }

            switch(source.type) { 
                case "git": { 
                    this._sources_list[source.namespace] = new StoreSourceGit(<IStoreSourceGitConfig>source, tmp_sources_folder, this._logger);
                    break;
                }
                default: { 
                    this._logger.error(`[Store] Source type ${source.type} not support`);
                    process.exit(1);
                } 
            }

        }

        for (const source_name in this._sources_list) {

            const source = this._sources_list[source_name];
            const namespace_folder = path.resolve(this._store_folder, source.namespace);

            fs.mkdirSync(namespace_folder);

            this._store_data[source.namespace] = {};

            source.on("delete", (file_path) => {
                delete this._store_data[source.namespace][file_path];
            });

            source.on("add", (file_path, body) => {

                body = this._parseKeys(body);

                const hash = crypto.createHash("md5").update(body).digest("hex");
                const full_file_path = path.resolve(namespace_folder, file_path);
                const dirname = path.dirname(full_file_path);

                if (!fs.existsSync(dirname)) {
                    fs.mkdirSync(dirname, {
                        recursive: true
                    });
                }

                fs.writeFileSync(full_file_path, body);

                this._store_data[source.namespace][file_path] = hash;

            });

        }

    }

    private _parseKeys (body: string): string {

        for (const key_name in this._keys) {

            const key = this._keys[key_name];
            const reg = new RegExp(`<<${key_name}>>`, "gi");

            body = body.replace(reg, key);

        }

        return body;
    }

    private _loadKeysFile (key_path: string, prefix?: string): void {

        try {
        
            let keys_file_text = fs.readFileSync(key_path).toString();
    
            for (const env_name in process.env) {
    
                const env_arg = process.env[env_name];
                const reg = new RegExp("\\${"+env_name+"}", "gi");
    
                keys_file_text = keys_file_text.replace(reg, env_arg);
            }
            
            const keys_file_json = <IStoreKeys>jtomler(keys_file_text, false);
    
            for (const key_name in keys_file_json) {
    
                let value = keys_file_json[key_name];
    
                if (typeof value === "object") {
                    value = JSON.stringify(value);
                }

                if (typeof value === "boolean") {
                    if (value === true) {
                        value = "true";
                    } else {
                        value = "false";
                    }
                } else {
                    if (value === null) {
                        value = "null";
                    }
                    if (typeof value === "object") {
                        value = JSON.stringify(value);
                    }
                    if (typeof value !== "object") {
                        value = `${value}`;
                    }
                }

                if (prefix !== undefined) {
                    this._keys[`server/${prefix}/${key_name}`] = value;
                } else {
                    this._keys[`server/${key_name}`] = value;
                }

            }
    
        } catch (error) {
            this._logger.error(`[Store] Error parsing keys file ${key_path}. ${error.message}`);
            this._logger.log(error.stack);
            process.exit(1);
        }

    }

    private _loadKeysFolder (folder_path: string, prefix?: string): void {

        const files = fs.readdirSync(folder_path);

        for (const key_path of files) {

            const full_key_path = path.resolve(folder_path, key_path);
            const stat = fs.statSync(full_key_path);

            if (stat.isDirectory()) {
                this._loadKeysFolder(full_key_path, `${prefix}/${path.basename(full_key_path)}`);
            } else {
                this._loadKeysFile(full_key_path, prefix);
            }

        }

    }

    private _loadKeys (): void {

        for (const key_path of this._config.keys) {

            const full_key_path = path.resolve(process.cwd(), key_path);

            if (!fs.existsSync(full_key_path)) {
                this._logger.error(`[Store] Key file ${full_key_path} not found`);
                process.exit(1);
            }

            const stat = fs.statSync(full_key_path);

            if (stat.isDirectory()) {
                this._loadKeysFolder(full_key_path, path.basename(full_key_path));
            } else {
                this._loadKeysFile(full_key_path);
            }

        }

    }

    run (): void {
        for (const source_name in this._sources_list) {
            const source = this._sources_list[source_name];
            source.run();
        }
    }

    stop (): void {
        for (const source_name in this._sources_list) {
            const source = this._sources_list[source_name];
            source.stop();
        }
    }

    get keys (): IStoreKeys {

        let result = {
            ...this._keys
        };

        for (const source_name in this._sources_list) {
            const source = this._sources_list[source_name];
            result = {
                ...result,
                ...source.keys
            };
        }

        return result; 
    }

}