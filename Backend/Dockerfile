FROM php:8.2-cli

# Instalar dependências necessárias para o Laravel usar o banco de dados
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libsqlite3-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql pdo_sqlite zip

WORKDIR /app
