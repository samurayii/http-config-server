import { expect } from "chai";
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
                tmp: "tests/unit/store_tmp",
                sources: []
            };

            new Store(config, logger);
        });

        it("create (with keys)", function() {

            const config: IStoreConfig = {
                keys: ["tests/unit/store_key.json", "tests/unit/store_key"],
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
                done();
            }, 3000);
            
        });

        it("method (with keys, git-source)", function(done) {

            this.timeout(20000);
            this.slow(30000);

            const config: IStoreConfig = {
                keys: ["tests/unit/store_key.json", "tests/unit/store_key"],
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

            setTimeout( async () => {
                
                store.stop();

                const file_list = store.getList("app1/config.json", "git1");
                const file_hash = store.getHash("app1/config.json", "git1");

                expect(file_list).to.deep.equal(["git1/app1/config.json"]);
                expect(file_hash).to.be.an("string");

                const file_body = await store.getFile("app1/config.json", "git1");

                expect(file_body).to.be.an("string");

                done();

            }, 3000);
            
        });

    });

});