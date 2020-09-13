# Источники данных

## Информация

Источники данных для сервера конфигурации указываются в секции `store.sources`.

## Типы источников

- [Git](#git)

### <a name="git"></a> Пример конфигурации источника типа `git`

```toml
[[store.sources]]                           # массив источников данных
    keys = ["keys.json"]                    # пути к файлам ключей простанства имён
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