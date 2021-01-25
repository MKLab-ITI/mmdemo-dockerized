#!/bin/bash

#install php dependencies
cd /var/www/site/api
composer update
composer install
cd /

#start memcached
echo "start memcached service"
service memcached start

#start auto-caching
echo "start auto caching python script"
python auto_cache.py localhost &

#start Apache
echo "start apache webserver"
/usr/sbin/apache2ctl -D FOREGROUND
