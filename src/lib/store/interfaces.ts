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

export interface IStoreSourceFolderConfig {
    keys: string[]
    namespace: string
    type: string
    include_regexp: string
    exclude_regexp: string
    folder: {
        path: string
        interval: number
    }
}

export interface IStoreConfig {
    keys: string[]
    tmp: string
    sources: Array<IStoreSourceGitConfig|IStoreSourceFolderConfig>
}

export interface IStoreKeys {
    [key: string]: string
}

export interface IStore extends EventEmitter {
    run: () => void
    stop: () => void
    getFile: (file_path: string, namespace_name: string) => Promise<string>
    getList: (folder_path: string, namespace_name: string) => string[]
    isDirectory: (folder_path: string, namespace_name: string) => boolean
    getHash: (file_path: string, namespace_name: string) => string
    readonly keys: {
        [key: string]: string
    }
    readonly namespaces: string[]
}

export interface IStoreSource extends EventEmitter {
    run: () => void
    stop: () => void
    readonly namespace: string
    readonly keys: {
        [key: string]: string
    }
}