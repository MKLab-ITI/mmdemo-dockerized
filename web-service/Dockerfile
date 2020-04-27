FROM ubuntu:xenial

MAINTAINER Manos Schinas <manosetro@iti.gr>

RUN apt-get update
RUN apt-get -y upgrade

# Install apache, PHP, and supplimentary programs. curl and lynx-cur are for debugging the container.
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install apache2 php7.0-dev libapache2-mod-php7.0 php7.0-mcrypt php7.0-gd libxml2  \
php-pear php-apcu php7.0-curl curl lynx-cur memcached php-memcached libcurl4-openssl-dev pkg-config libssl-dev apt-utils python python-dev python-pip php-zip

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Enable apache mods.
RUN a2enmod php7.0
RUN a2enmod rewrite
RUN phpenmod mcrypt
RUN a2enmod headers

RUN pip install requests
RUN pecl install mongodb
RUN pip install redis==3.4.1
RUN pip install pymongo==3.5.1

# Update the PHP.ini file, enable <? ?> tags and quieten logging.
RUN sed -i "s/error_reporting = .*$/error_reporting = E_ERROR | E_WARNING | E_PARSE/" /etc/php/7.0/apache2/php.ini
RUN sed -i "s/variables_order.*/variables_order = \"EGPCS\"/g" /etc/php/7.0/apache2/php.ini
RUN echo "extension=mongodb.so" >> /etc/php/7.0/apache2/php.ini && echo "extension=mongodb.so" >> /etc/php/7.0/cli/php.ini

# Manually set up the apache environment variables
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid

# Copy site into place.
ADD site /var/www/site

# Update the default apache site with the config we created.
ADD apache-config.conf /etc/apache2/sites-enabled/000-default.conf

ADD auto_cache.py /
ADD collection_download_scheduler.py /
ADD run.sh /

EXPOSE 80

# By default, simply start apache.
CMD sh run.sh
