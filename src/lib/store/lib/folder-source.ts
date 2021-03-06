import { IStoreSource, IStoreKeys, IStoreSourceFolderConfig } from "../interfaces";
import { ILogger } from "logger-flx";
import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";
import jtomler from "jtomler";

export class StoreSourceFolder extends EventEmitter implements IStoreSource {

    private readonly _store_full_path: string
    private _keys: IStoreKeys
    private _id_interval: ReturnType<typeof setTimeout>
    private _running_flag: boolean
    private readonly _include_regexp: RegExp
    private readonly _exclude_regexp: RegExp
    private _info_files_list: {
        [key: string]: string
    }

    constructor (
        private readonly _config: IStoreSourceFolderConfig,
        private readonly _logger: ILogger
    ) {

        super();

        this._info_files_list = {};

        this._store_full_path = path.resolve(process.cwd(), this._config.folder.path);

        if (!fs.existsSync(this._store_full_path)) {
            this._logger.error(`[Store:${this._config.namespace}] Store folder ${this._store_full_path} not found`);
            process.exit(1);
        }

        this._keys = {};
        this._running_flag = false;
        this._include_regexp = new RegExp(`${this._config.include_regexp}`, "i");
        this._exclude_regexp = new RegExp(`${this._config.exclude_regexp}`, "i");

        this._logger.log(`[Store:${this._config.namespace}] Created`, "dev");
        
    }

    get keys (): IStoreKeys {
        return this._keys; 
    }

    get namespace (): string {
        return this._config.namespace;
    }

    run (): void {
        this._running_flag = true;
        this._sync();
    }

    stop (): void {
        this._running_flag = false;
        clearTimeout(this._id_interval);
    }

    private _sync (): void {

        if (this._running_flag === false) {
            return;
        }

        this._logger.log(`[Store:${this._config.namespace}] Sync running...`, "dev");

        if (!fs.existsSync(this._store_full_path)) {
            this._logger.error(`[Store:${this._config.namespace}] Synchronization Error. Store folder ${this._store_full_path} not found`);
            process.exit(1);
        }

        const checkUpdateFolder = (folder: string, change_flag: boolean = false): boolean => {

            const files = fs.readdirSync(folder);
        
            files.forEach( (file_path) => {
        
                const full_file_path = path.resolve(folder, file_path);
                const stat = fs.statSync(full_file_path);
        
                if (stat.isFile()) {

                    const info = JSON.stringify(stat);

                    if (this._info_files_list[full_file_path] === undefined) {
                        this._info_files_list[full_file_path] = info;
                        change_flag = true;
                    } else {
                        if (this._info_files_list[full_file_path] !== info) {
                            change_flag = true;
                        }
                    }
    
                } else {
                    change_flag = checkUpdateFolder(full_file_path, change_flag);
                }
        
            });

            return change_flag;
    
        };

        const store_change_flag = checkUpdateFolder(this._store_full_path);

        if (store_change_flag === true) {

            this._logger.log(`[Store:${this._config.namespace}] Scanning...`, "dev");

            this.emit("change", this._config.namespace);

            this._loadKeys();

            const files = fs.readdirSync(this._store_full_path);

            for (const file_path of files) {

                const full_file_path = path.resolve(this._store_full_path, file_path);
                const stat = fs.statSync(full_file_path);

                if (stat.isDirectory()) {
                    this._syncDirectory(full_file_path);
                } else {
                    this._syncFile(full_file_path);
                }

            }

            this._logger.log(`[Store:${this._config.namespace}] Scanning completed`, "dev");
        }

        this._logger.log(`[Store:${this._config.namespace}] Sync completed`, "dev");

        if (this._running_flag === true) {
            this._id_interval = setTimeout( () => {
                this._sync();
            }, this._config.folder.interval * 1000);
        }

    }

    private _parseKeys (body: string): string {

        for (const key_name in this._keys) {

            const key = this._keys[key_name];
            const reg_namespace = new RegExp(`<<${key_name}>>`, "gi");
            const reg_default = new RegExp(`<<${key_name.replace(`${this._config.namespace}.`, "")}>>`, "gi");

            body = body.replace(reg_namespace, key);
            body = body.replace(reg_default, key);

        }

        return body;
    }

    private _loadKeysFile (key_path: string, prefix?: string): void {

        this._logger.log(`[Store:${this._config.namespace}] Load keys file ${key_path}`, "dev");

        try {
        
            let keys_file_text = fs.readFileSync(key_path).toString();
    
            for (const env_name in process.env) {
    
                const env_arg = process.env[env_name];
                const reg = new RegExp("\\${"+env_name+"}", "gi");
    
                keys_file_text = keys_file_text.replace(reg, env_arg);
            }
            
            const keys_file_json = <IStoreKeys>jtomler(keys_file_text, false);
    
            for (const key_name in keys_file_json) {
                
                if (!/^[a-zA-Z]{1}[-a-zA-Z0-9_]{0,31}$/gi.test(key_name)) {
                    this._logger.warn(`[Store:${this._config.namespace}] Key ${key_name} not match regexp ^[a-zA-Z]{1}[-a-zA-Z0-9_]{0,31}$`);
                    continue;
                }
    
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

                const file_prefix = path.basename(key_path).replace(/(\.json|\.toml)$/ig, "");
                let full_key_name = "";

                if (prefix !== undefined) {
                    full_key_name = `${this._config.namespace}.${prefix}.${file_prefix}.${key_name}`;                   
                } else {
                    full_key_name = `${this._config.namespace}.${file_prefix}.${key_name}`;
                }

                this._keys[full_key_name] = value;

                this._logger.log(`[Store:${this._config.namespace}] Initialization variable "${full_key_name}"`);

            }
    
        } catch (error) {
            this._logger.error(`[Store:${this._config.namespace}] Error parsing keys file ${key_path}. ${error.message}`);
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
                this._loadKeysFolder(full_key_path, `${prefix}.${path.basename(full_key_path)}`);
            } else {
                this._loadKeysFile(full_key_path, prefix);
            }

        }

    }

    private _loadKeys (): void {

        for (const key_path of this._config.keys) {

            const full_key_path = path.resolve(this._store_full_path, key_path.replace(/(^\/|\/$)/,""));

            if (!fs.existsSync(full_key_path)) {
                this._logger.error(`[Store:${this._config.namespace}] Key file ${full_key_path} not found`);
                continue;
            }

            const stat = fs.statSync(full_key_path);

            if (stat.isDirectory()) {
                this._loadKeysFolder(full_key_path, path.basename(full_key_path));
            } else {
                this._loadKeysFile(full_key_path);
            }

        }

        this.emit("keys", this._keys, this._config.namespace);

    }

    private _syncFile (file_path: string): void {

        this._logger.log(`[Store:${this._config.namespace}] Scanning ${file_path} file`, "dev");

        if (!this._include_regexp.test(file_path)) {
            this._logger.log(`[Store:${this._config.namespace}] File ${file_path} not include to include_regexp. cancel scanning`, "dev");
            return;
        }

        if (this._exclude_regexp.test(file_path)) {
            this._logger.log(`[Store:${this._config.namespace}] File ${file_path} include to exclude_regexp. cancel scanning`, "dev");
            return;
        }

        let body_file_txt = fs.readFileSync(file_path).toString();

        body_file_txt = this._parseKeys(body_file_txt);

        this.emit("add", file_path.replace(`${this._store_full_path}`, "").replace(/(^\\|^\/)/, ""), body_file_txt, this._config.namespace);

    }

    private _syncDirectory (folder_path: string): void {

        this._logger.log(`[Store:${this._config.namespace}] Scanning ${folder_path} folder`, "dev");

        const files = fs.readdirSync(folder_path);

        for (const file_path of files) {

            const full_file_path = path.resolve(folder_path, file_path);
            const stat = fs.statSync(full_file_path);

            if (stat.isFile()) {
                this._syncFile(full_file_path);
            }

            if (stat.isDirectory()) {
                this._syncDirectory(full_file_path);
            }

        }

    }

}