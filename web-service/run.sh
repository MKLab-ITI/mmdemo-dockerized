#!/bin/bash

#install php dependencies
cd /var/www/site/api
composer install
cd /

service memcached start

/usr/sbin/apache2ctl -D FOREGROUND
