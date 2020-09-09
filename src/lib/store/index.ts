import { IStore, IStoreConfig } from "./interfaces";
import { EventEmitter } from "events";



export * from "./interfaces";

export class Store extends EventEmitter implements IStore {

    constructor (
        private readonly _config: IStoreConfig
    ) {

        super();

    }

    run (): void {
        console.log("run");
    }

    stop (): void {
        console.log("stop");
    }

}