FROM php:7.2-apache


RUN apt-get update && apt-get install -y \
  build-essential \
  zip \
  unzip \
  zlib1g-dev \
  libpng-dev \
  npm

RUN docker-php-ext-install pdo_mysql mbstring zip


RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin/ --filename=composer

ENV APP_HOME /var/www/html
RUN usermod -u 1000 www-data && groupmod -g 1000 www-data

RUN sed -i -e "s/html/html\/public/g" /etc/apache2/sites-enabled/000-default.conf

RUN a2enmod rewrite

COPY . $APP_HOME

RUN composer install --no-interaction

RUN chown -R www-data:www-data $APP_HOME

# RUN php artisan preset react
RUN php artisan key:generate
RUN npm install
RUN npm update react-konva
RUN npm update konva 
RUN npm install react-konva@16.8.7-0
RUN npm run dev
