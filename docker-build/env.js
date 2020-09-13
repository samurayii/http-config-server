/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const os = require("os");

if (process.argv[2] === undefined || process.argv[2] === "") {
    console.error("[env.js] error, not set path to keys file");
    process.exit(1);
}

const full_file_path = path.resolve(process.cwd(), process.argv[2].trim());
const json_data = {
    hostname: os.hostname()
};

for (let env_key in process.env) {
    if ((/KEY_CONFIG_SERVER_.*/).test(env_key)) {
        const key = env_key.replace("KEY_CONFIG_SERVER_", "").toLocaleLowerCase();
        json_data[`${key}`] = process.env[env_key].trim();
        console.log(`Variable ${env_key}->${key} initialized`);
    }
}

if (fs.existsSync("/sys/fs/cgroup/memory/memory.limit_in_bytes")) {
    const memory = parseInt(fs.readFileSync("/sys/fs/cgroup/memory/memory.limit_in_bytes").toString());
    json_data["memory"] = memory;
    json_data["memory_kb"] = parseInt(memory/1024);
    json_data["memory_mb"] = parseInt(memory/1024/1024);
}

fs.writeFileSync(full_file_path, JSON.stringify(json_data, null, 4));
console.log(`[env.js] keys write to file ${full_file_path}`);