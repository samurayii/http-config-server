import { EventEmitter } from "events";

export interface IStoreSourceGitConfig {
    keys: string[]
    namespace: string
    type: string
    include_regexp: string
    exclude_regexp: string
    git: {
        interval: number
        commit_count: number
        repository: string
        branch: string
    }
}

export interface IStoreConfig {
    keys: string[]
    default_namespace: string
    tmp: string
    sources: Array<IStoreSourceGitConfig>
}

export interface IStoreKeys {
    [key: string]: string
}

export interface IStore extends EventEmitter {
    run: () => void
    stop: () => void
    readonly keys: {
        [key: string]: string
    }
}

export interface IStoreSource extends EventEmitter {
    run: () => void
    stop: () => void
    readonly namespace: string
    readonly keys: {
        [key: string]: string
    }
}