# Источники данных

## Информация

Источники данных для сервера конфигурации указываются в секции `store.sources`.

## Типы источников

- [Git](#git)
- [Folder](#folder)

### <a name="git"></a> Пример конфигурации источника типа `git`

```toml
[[store.sources]]                           # массив источников данных
    keys = ["keys.json"]                    # пути к файлам/папкам ключей простанства имён, файлы могут быть json или toml
    namespace = "configs"                   # имя пространства имён (должно быть уникально)
    type = "git"                            # тип источника данных
    include_regexp = "\\.(json|yml|toml)$"           # regexp для файлов вхождения
    exclude_regexp = "(.*\\/\\.git.*|.*\\\\.git.*)"  # regexp для файлов исключения
    [store.sources.git]                                                     # настройка git репозитория
        interval = 20                                                       # интервал опроса в секундах
        commit_count = 10                                                   # максимальное количество коммитов
        repository = "https://user:password@server:3000/repository.git"     # репозиторий
        branch = "master"                                                   # ветка
```

### <a name="folder"></a> Пример конфигурации источника типа `folder`

```toml
[[store.sources]]                           # массив источников данных
    keys = ["keys.json"]                    # пути к файлам/папкам ключей простанства имён, файлы могут быть json или toml
    namespace = "configs"                   # имя пространства имён (должно быть уникально)
    type = "folder"                         # тип источника данных
    include_regexp = "\\.(json|yml|toml)$"  # regexp для файлов вхождения
    exclude_regexp = "(^\\.$|^\\.\\.$)"     # regexp для файлов исключения
    [store.sources.folder]                  # настройка работы с папкой
        path = "folder_store"           # путь до папки с файлами конфигурации
        interval = 60                   # интервал провеки обновлений в секундах
```
