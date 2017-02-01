#!/bin/bash

# start the temporary container
docker run -d -p 27018:27017 -v /disk1_data/workspace/git/mmdemo-dockerized/mongo_data_dir:/data/db --name tmpMongoDB mongo:3.2.11

# do the user creation
docker run -it --link tmpMongoDB --rm mongo:3.2.11 sh -c \
    'mongo admin --host tmpMongoDB --eval "db.createUser({ user: \"admin\", pwd: \"place_your_password_here\", roles: [ { role: \"dbOwner\", db: \"Demo\" } ] });"'
    
# stop the server
docker stop tmpMongoDB

# clean up old container
docker rm tmpMongoDB
