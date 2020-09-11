import { expect } from "chai";
import * as superagent from "superagent";

describe("Store", function () {

    it("list (file)", async () => {

        const response = await superagent.get("http://localhost:3001/api/v1/store/list/git1/app1/config.json");

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("object");
        expect(response.body.status).equal("success");
        expect(response.body.data).to.be.an("array");
        expect(response.body.data.length).equal(1);

    });

    it("list (list files)", async () => {

        const response = await superagent.get("http://localhost:3001/api/v1/store/list/git1/app2");

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("object");
        expect(response.body.status).equal("success");
        expect(response.body.data).to.be.an("array");
        expect(response.body.data.length).equal(2);

    });

    it("hash", async () => {

        const response = await superagent.get("http://localhost:3001/api/v1/store/hash/git1/app1/config.json");

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("object");
        expect(response.body.status).equal("success");
        expect(response.body.data).to.be.an("string");

    });

    it("get", async () => {

        const response = await superagent.get("http://localhost:3001/api/v1/store/get/git1/app1/config.json");

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("object");
        expect(response.body.status).equal("success");
        expect(response.body.data).to.be.an("string");

    });

    it("keys", async () => {

        const response = await superagent.get("http://localhost:3001/api/v1/store/keys");

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("object");
        expect(response.body.status).equal("success");
        expect(response.body.data).to.be.an("object");

    });

    it("namespaces", async () => {

        const response = await superagent.get("http://localhost:3001/api/v1/store/namespaces");

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("object");
        expect(response.body.status).equal("success");
        expect(response.body.data).to.be.an("array");

    });

    it("hashes", async () => {

        const response = await superagent.post("http://localhost:3001/api/v1/store/hashes").send([
            "git1/app1/config.json",
            "git1/app1/config.json"
        ]);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("object");
        expect(response.body.status).equal("success");
        expect(response.body.data).to.be.an("array");

    });

});