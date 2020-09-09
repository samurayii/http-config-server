import { program } from "commander";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as finder from "find-package-json";
import * as Ajv from "ajv";
import jtomler from "jtomler";
import json_from_schema from "json-from-default-schema";
import * as auth_user_schema from "./schemes/auth_user.json";
import * as git_store_source_schema from "./schemes/git_store_source.json";
import * as config_schema from "./schemes/config.json";
import { IAppConfig } from "./config.interface";
import { IStoreSourceGitConfig } from "./store";
 
const pkg = finder(__dirname).next().value;

program.version(`version: ${pkg.version}`, "-v, --version", "output the current version.");
program.name(pkg.name);
program.option("-c, --config <type>", "Path to config file.");

program.parse(process.argv);

if (process.env["TEMPLATE_CONFIG_PATH"] === undefined) {
	if (program.config === undefined) {
		console.error(chalk.red("[ERROR] Not set --config key"));
		process.exit(1);
	}
} else {
	program.config = process.env["TEMPLATE_CONFIG_PATH"];
}

const full_config_path = path.resolve(process.cwd(), program.config);

if (!fs.existsSync(full_config_path)) {
    console.error(chalk.red(`[ERROR] Config file ${full_config_path} not found`));
    process.exit(1);
}

const config: IAppConfig = <IAppConfig>json_from_schema(jtomler(full_config_path), config_schema);

for (const item of config.authorization.users) {

    const ajv_user_item = new Ajv();
    const validate_user_item = ajv_user_item.compile(auth_user_schema);

    if (!validate_user_item(item)) {
        console.error(chalk.red(`[ERROR] Config authorization.users parsing error. Schema errors:\n${JSON.stringify(validate_user_item.errors, null, 2)}`));
        process.exit(1);
    }

}

let index = 0;

for (const item of config.store.sources) {

    if (typeof item.type !== "string") {
        throw new Error("Config parsing error. Store \"source.type\" type must be string");
    }

    const ajv_item = new Ajv();

    let validate_item;

    if (item.type === "git") {
        config.store.sources[index] = <IStoreSourceGitConfig>json_from_schema(item, git_store_source_schema);
        validate_item = ajv_item.compile(git_store_source_schema);
    }

    const valid = validate_item(item);

    if (!valid) {
        console.error(chalk.red(`[ERROR] Config store.source parsing error. Schema errors:\n${JSON.stringify(validate_item.errors, null, 2)}`));
        process.exit(1);
    }

    index++;

}

const ajv = new Ajv();
const validate = ajv.compile(config_schema);

if (!validate(config)) {
    console.error(chalk.red(`[ERROR] Schema errors:\n${JSON.stringify(validate.errors, null, 2)}`));
    process.exit(1);
}

export default config;
