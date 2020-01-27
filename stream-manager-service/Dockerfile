FROM mcr.microsoft.com/java/jdk:11u6-zulu-debian8
MAINTAINER Manos Schinas manosetro@iti.gr

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y git maven

RUN mkdir /stream_manager
RUN git clone --single-branch --branch no-deps-sm https://github.com/MKLab-ITI/mklab-stream-manager.git && \
    cd mklab-stream-manager	&& \
	  mvn clean package && \
    cd /

RUN cp mklab-stream-manager/target/mklab-stream-manager-0.3-lightweight-with-dependencies.jar /stream_manager/mklab-stream-manager.jar

RUN cp -r mklab-stream-manager/src/main/resources/profiles.sm /stream_manager && \
    cp mklab-stream-manager/english.all.3class.distsim.crf.ser.gz /stream_manager

ADD conf /stream_manager/conf
WORKDIR /stream_manager

ENTRYPOINT java -DMONGO_USER=$MONGO_USER -DMONGO_PASSWORD=$MONGO_PASSWORD -jar mklab-stream-manager.jar
CMD ["conf/streams.conf.xml"]
