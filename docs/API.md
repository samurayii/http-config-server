# API

## Информация

Сервис предоставляет HTTP API для интеграции.

### Примеры применения

проверить доступность сервера: `curl -i http://localhost:3001/api/healthcheck` или `curl -i http://localhost:3001/api/`  
получить список идентификаторов наряд заказов: `http://localhost:3001/api/v1/nz/list`  
получить количество наряд заказов: `http://localhost:3001/api/v1/nz/count`  

### API информации сервиса

| URL | Метод | Код | Описание | Пример ответа/запроса |
| ----- | ----- | ----- | ----- | ----- |
| / | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck | GET | 200 | проверить здоровье сервиса | OK |
| v1/store/list/${namespace}/${path} | GET | 200 | получить список файлов по пути | [пример](#v1_store_list) |
| v1/store/hash/${namespace}/${path} | GET | 200 | получить хеш файла по пути | [пример](#v1_store_hash) |
| v1/store/get/${namespace}/${path} | GET | 200 | получить файл по пути | [пример](#v1_store_get) |
| v1/store/keys | GET | 200 | получить список переменых сервера | [пример](#v1_store_keys) |
| v1/store/namespaces | GET | 200 | получить список пространств имён | [пример](#v1_store_namespaces) |
| v1/store/hashes | POST | 200 | получить список хешей для списка файлов | [пример](#v1_store_hashes) |

## Примеры ответов/запросов

### Базовый ответ провала

Этот ответ возвращается при отказе выполнения запроса. Пример:

```js
{
    "status": "fail",
    "message": "Причина отказа"
}
```

### Базовый ответ ошибки.

Этот ответ возвращается при ошибке на сервере. Пример:

```js
{
    "status": "error",
    "message": "Причина ошибки"
}
```

### <a name="v1_store_list"></a> Получить список файлов по пути: v1/store/list/${namespace}/${path}

**Тело ответа**
```js
{
    "status": "success",
    "data": [
        "asd/asda/asdad1.json",
        "asd/asda/asdad2.json",
    ]
}
```

### <a name="v1_store_hash"></a> Получить хеш файла по пути: v1/store/hash/${namespace}/${path}

**Тело ответа**
```js
{
    "status": "success",
    "data": "asdadasdadsadsad"
}
```

### <a name="v1_store_get"></a> Получить файл по пути: v1/store/get/${namespace}/${path}

**Тело ответа**
```js
{
    "status": "success",
    "data": "тело документа"
}
```

### <a name="v1_store_keys"></a> Получить список переменых сервера: v1/store/keys
**Тело ответа**
```js
{
    "status": "success",
    "data": {
        "key1": "key1-val",
        "key2": "key2-val"
    }
}
```

### <a name="v1_store_namespaces"></a> получить список пространств имён: v1/store/namespaces
**Тело ответа**
```js
{
    "status": "success",
    "data": [
        "namespace1",
        "namespace2"
    ]
}
```

### <a name="v1_store_hashes"></a> Загрузить информацию о наряд заказах: v1/store/hashes
**Тело запроса**
```js
[
    "git1/app1/config.json",
    "git1/app1/config.json"
]
```

**Тело ответа**
```js
{
    "status": "success",
    "data": [
        {
            "exist": true,
            "file": "git1/app1/config.json",
            "hash": "f5ece0438de049ff6898c69c0a9d68e8"
        },
        {
            "exist": false,
            "file": "git1/app1/config.json"
        }
    ]
}
```