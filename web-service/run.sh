#!/bin/bash

#install php dependencies
cd /var/www/site/api
composer install
cd /

#start memcached
service memcached start

#start auto-caching
python auto_cache.py localhost &

#start Apache
/usr/sbin/apache2ctl -D FOREGROUND
