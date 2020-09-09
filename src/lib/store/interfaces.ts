import { EventEmitter } from "events";

export interface IStoreSourceGitConfig {
    keys: string[]
    namespace: string
    type: string
    include_regexp: string
    exclude_regexp: string
    git: {
        commit_count: number
        repository: string
        branch: string
    }
}

export interface IStoreConfig {
    keys: string[]
    default_namespace: string
    sources: Array<IStoreSourceGitConfig>
}

export interface IStore extends EventEmitter {
    run: () => void
    stop: () => void
}