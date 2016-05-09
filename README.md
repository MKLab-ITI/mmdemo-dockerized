mmdemo-dockerized
===========================

This project dockerizes the multimedia demo that can be used for the collection of social media items from multiple sources.
You can find a running demo in this [link](http://step-mklab.iti.gr).
It uses Docker Compose to buddle all the services into the same YAML file and make easy the deployment of the application. 

The services that multimedia demo is built upon are

* [graylog](https://www.graylog.org/) - An Open Source Log Aggregator and Management server. 
* [redis](http://redis.io/) - Redis is an open source, in-memory data structure store, used as database, cache and message broker. Used primarily as a publish/subscribe service between different components of the demo. 
* [mongodb](https://www.mongodb.com/) - MongoDB is an open-source, document database. Used to store items collected from social media platforms.  
* [solr](http://lucene.apache.org/solr/) - Solr is the popular, blazing-fast, open source enterprise search platform built on Apache Lucene. Is used primarily for the indexing of the colleted social media items.   
* [web](https://github.com/MKLab-ITI/mmdemo-dockerized/tree/master/web-service) - This service consists of two parts: 1) A REST API used to provide access to the colleced social media items and to expose several statistics related to them, and 2) the web interface of this [link](http://step-mklab.iti.gr) demo.     
* [streammanager](https://github.com/MKLab-ITI/mklab-stream-manager) - Stream Manager monitors a set of seven social streams : Twitter, Facebook, Instagram, Google+, Flickr and Youtube to collect content relevant to a set of keywords, a user or a location, using the corresponding APIs that are provides from each service.

To start the services:
```sh
$ cd mmdemo-dockerized
$ docker-compose up
```
This will create or download images and pull in the necessary dependencies. Once done, it runs the Docker and map the ports to whatever is specified in the [docker-compose.yml](https://github.com/MKLab-ITI/mmdemo-dockerized/blob/master/docker-compose.yml) file. 

By default, the Docker will expose the following ports:
* **redis** -> *6379*
* **solr** -> *8983* 
* **mongodb** -> *27017*
* **web** -> *80* (as apache web server is used internally)
* **graylog** -> *9000*, *12201*, *12201/udp*

Note that if these ports are already in use, e.g. if the machine that runs docker has a running instance of mongodb,
then the corespondong service will fail to start. If necessary to change this, edit the docker-compose.yml. For example, in order to change the exposed port of redis from **6379** to **6380**, edit the following section in docker-compose.yml:
```sh
  redis:
    image: redis
    ports:
      - "6380:6379"
```

Verify the deployment by typing 

```sh
$ docker ps
```
