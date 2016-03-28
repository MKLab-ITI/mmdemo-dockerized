FROM java:8
MAINTAINER Manos Schinas manosetro@iti.gr

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y git maven

RUN git clone https://github.com/MKLab-ITI/mklab-stream-manager.git && \
    cd mklab-stream-manager	&& \
	  mvn clean package && \
    cd /

ADD ./stream_manager /stream_manager

RUN cp mklab-stream-manager/target/mklab-stream-manager-0.3-SNAPSHOT-with-dependencies.jar /stream_manager/mklab-stream-manager.jar

RUN cp -r mklab-stream-manager/src/main/resources/profiles.sm /stream_manager && \
    cp mklab-stream-manager/english.all.3class.distsim.crf.ser.gz /stream_manager

WORKDIR /stream_manager

ENTRYPOINT ["java", "-jar", "mklab-stream-manager.jar"]
CMD ["streams.conf.xml"]
