//import { expect } from "chai";
import { Store, IStoreConfig } from "../../src/lib/store" ;
import { Logger } from "logger-flx";

describe("Store", function () {

    const logger = new Logger({
        mode: "debug",
        enable: true,
        type: true,
        timestamp: "time"
    });
    
    describe("Store", function() {
        
        it("create (empty)", function() {

            const config: IStoreConfig = {
                keys: [],
                default_namespace: "configs",
                tmp: "tests/unit/store_tmp",
                sources: []
            };

            new Store(config, logger);
        });

        it("create (with keys)", function() {

            const config: IStoreConfig = {
                keys: ["tests/unit/store_key.json", "tests/unit/store_key"],
                default_namespace: "configs",
                tmp: "tests/unit/store_tmp",
                sources: []
            };

            const store = new Store(config, logger);

            store.run();
            store.stop();
        });

        it("create (with keys, git-source)", function(done) {

            this.timeout(20000);
            this.slow(30000);

            const config: IStoreConfig = {
                keys: ["tests/unit/store_key.json", "tests/unit/store_key"],
                default_namespace: "git1",
                tmp: "tests/unit/store_tmp",
                sources: [
                    {
                        keys: [],
                        namespace: "git1",
                        type: "git",
                        include_regexp: "\\.(json|yml|toml)$",
                        exclude_regexp: "(.*\\/\\.git.*|.*\\\.git.*)",
                        git: {
                            interval: 10,
                            commit_count: 10,
                            repository: `https://samurayii:${process.env["GIT_SECRET"]}@github.com/samurayii/test-config-server.git`,
                            branch: "master"
                        }
                    }
                ]
            };

            const store = new Store(config, logger);

            store.run();

            setTimeout( () => {
                store.stop();
                done();
            }, 3000);
            
        });

        it("create (with keys, git-source with keys)", function(done) {

            this.timeout(20000);
            this.slow(30000);

            const config: IStoreConfig = {
                keys: ["tests/unit/store_key.json", "tests/unit/store_key"],
                default_namespace: "git1",
                tmp: "tests/unit/store_tmp",
                sources: [
                    {
                        keys: ["key.json", "keys"],
                        namespace: "git1",
                        type: "git",
                        include_regexp: "\\.(json|yml|toml)$",
                        exclude_regexp: "(.*\\/\\.git.*|.*\\\.git.*)",
                        git: {
                            interval: 10,
                            commit_count: 10,
                            repository: `https://samurayii:${process.env["GIT_SECRET"]}@github.com/samurayii/test-config-server.git`,
                            branch: "master"
                        }
                    }
                ]
            };

            const store = new Store(config, logger);

            store.run();

            setTimeout( () => {
                store.stop();
                console.log(store.keys);
                done();
            }, 3000);
            
        });

/*
        it("create (with keys, 2 git-source)", function(done) {

            this.timeout(20000);
            this.slow(30000);

            const config: IStoreConfig = {
                keys: ["tests/unit/store_key.json", "tests/unit/store_key"],
                default_namespace: "git1",
                tmp: "tests/unit/store_tmp",
                sources: [
                    {
                        keys: [],
                        namespace: "git1",
                        type: "git",
                        include_regexp: "\\.(json|yml|toml)",
                        exclude_regexp: "\\.git",
                        git: {
                            interval: 10,
                            commit_count: 10,
                            repository: `https://samurayii:${process.env["GIT_SECRET"]}@github.com/samurayii/test-config-server.git`,
                            branch: "master"
                        }
                    },
                    {
                        keys: [],
                        namespace: "git2",
                        type: "git",
                        include_regexp: "\\.(json|yml|toml)",
                        exclude_regexp: "\\.git",
                        git: {
                            interval: 10,
                            commit_count: 10,
                            repository: `https://samurayii:${process.env["GIT_SECRET"]}@github.com/samurayii/test-config-server.git`,
                            branch: "master"
                        }
                    }
                ]
            };

            const store = new Store(config, logger);

            store.run();

            setTimeout( () => {
                store.stop();
                done();
            }, 3000);
            
        });


        it("methods", function() {

            this.slow(10000);

            const config = {
                type: "file",
                folder: full_folder_namespace
            };
            const store = new Store(config, logger);
            const id = "tests/namespace";
            const file_name = "testsnamespace.json";

            expect("file").to.equal(store.type);

            const namespace = store.getNamespace(id);

            expect(namespace.id).to.equal(id);

            namespace.put("key1", "key1-val");
            namespace.put("key2", { message: "hello" });
            namespace.put("key3", ["hello"]);
            namespace.put("key4", 123);
            namespace.put("key5", true);

            expect(namespace.exist("no-key")).to.equal(false);
            expect(namespace.exist("key1")).to.equal(true);

            expect(namespace.get("no-key")).to.equal(undefined);
            expect(namespace.get("key1")).to.equal("key1-val");
            expect(namespace.get("key4")).to.equal(123);
            expect(namespace.get("key5")).to.equal(true);

            expect(namespace.get("key2")).to.deep.include({ message: "hello" });
            expect(namespace.get("key3")).to.be.an("array");

            const full_file_path = resolve(full_folder_namespace, file_name);

            if (!fs.existsSync(full_file_path)) {
                throw new Error(`File ${full_file_path} not exist`);
            }

            const body = JSON.parse(fs.readFileSync(full_file_path).toString());

            expect(body).to.deep.include({
                id: id,
                data: {
                    key1: "key1-val",
                    key2: {
                        message: "hello"
                    },
                    key3: ["hello"],
                    key4: 123,
                    key5: true
                }
            });

            const store2 = new Store(config, logger);
            const namespace2 = store2.getNamespace(id);

            expect(namespace2.id).to.equal(id);

            expect(namespace2.get("no-key")).to.equal(undefined);
            expect(namespace2.get("key1")).to.equal("key1-val");
            expect(namespace2.get("key4")).to.equal(123);
            expect(namespace2.get("key5")).to.equal(true);

            expect(namespace2.get("key2")).to.deep.include({ message: "hello" });
            expect(namespace2.get("key3")).to.be.an("array");

            namespace2.delete("key1");

            expect(namespace2.get("key1")).to.equal(undefined);

        });
*/
    });

});