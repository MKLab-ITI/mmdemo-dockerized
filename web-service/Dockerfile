FROM ubuntu:latest

MAINTAINER Manos Schinas <manosetro@iti.gr>

RUN apt-get update
RUN apt-get -y upgrade

# Install apache, PHP, and supplimentary programs. curl and lynx-cur are for debugging the container.
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install apache2 php5-dev libapache2-mod-php5 php5-mysql php5-mcrypt php5-gd php-pear php-apc php5-curl curl lynx-cur php-xml

# Enable apache mods.
RUN a2enmod php5
RUN a2enmod rewrite
RUN php5enmod mcrypt

RUN pecl install mongo

# Update the PHP.ini file, enable <? ?> tags and quieten logging.
RUN sed -i "s/short_open_tag = Off/short_open_tag = On/" /etc/php5/apache2/php.ini
RUN sed -i "s/error_reporting = .*$/error_reporting = E_ERROR | E_WARNING | E_PARSE/" /etc/php5/apache2/php.ini
RUN sed -i "s/variables_order.*/variables_order = \"EGPCS\"/g" /etc/php5/apache2/php.ini

RUN 	echo "extension=mongo.so" >> /etc/php5/apache2/php.ini
RUN 	echo "extension=dom.so" >> /etc/php5/apache2/php.ini

# Manually set up the apache environment variables
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid

# Copy site into place.
ADD api /var/www/site/api
ADD ui /var/www/site/ui

# Update the default apache site with the config we created.
ADD apache-config.conf /etc/apache2/sites-enabled/000-default.conf

EXPOSE 80

# By default, simply start apache.
CMD /usr/sbin/apache2ctl -D FOREGROUND
