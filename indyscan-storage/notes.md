```
docker run --name elasticsearch -v "$HOME/esdata":/usr/share/elasticsearch/data -d -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.3.0
```

```
docker run -d --name kibana --link elasticsearch -p 5601:5601 docker.elastic.co/kibana/kibana:7.3.0
```

