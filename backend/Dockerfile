# 1. Usamos una imagen oficial de PHP
FROM php:8.2-fpm

# 2. Instalamos dependencias del sistema y herramientas necesarias
# Añadimos 'gnupg' aquí para no tener que hacer otro apt-get update luego
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    gnupg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. Instalamos las extensiones de PHP para Laravel
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# 4. Instalamos Node.js y NPM
# CORRECCIÓN AQUÍ: Usamos la versión 20 (LTS - más estable) y arreglamos el salto de línea con "\"
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 5. Instalamos Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. Carpeta de trabajo
WORKDIR /var/www/html

# Exponer puerto
EXPOSE 8000

# Comando de arranque
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]