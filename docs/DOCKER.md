# Docker

## Информация

Doсker образ доступен по имени **samuray/http-config-server**. В контейнере по умолчанию доступны переменные сервера **memory**, **memory_kb**, **memory_mb** и **container** которые могут быть использованы при формировании полученных файлов. Переменные сервера можно задать из переменой OC которая имеет префикс **KEY_CONFIG_SERVER_**, например значение переменной **KEY_CONFIG_SERVER_KEY1** будет занесено в переменную сервера под именем **key1**.

пример запуска: `docker run -d --name http-config-server --hostname http-config-server -v /keys:/keys -e CONFIG_SERVER_STORE_SOURCES=[{\"keys\":[\"/keys\"],\"namespace\":\"git\",\"type\":\"git\",\"git\":{\"repository\":\"https://user:password@github.com/repo.git\"}}] -p 3001:3001 samuray/http-config-server:latest`