# 1. Imagen base
FROM php:8.2-fpm

# 2. Dependencias del sistema (Perfecto)
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

# 3. Extensiones PHP (Perfecto)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# 4. Node.js (Bien configurado)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 5. Composer (Perfecto)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. --- AQUÍ ESTABA EL FALLO ---
# Primero definimos la carpeta de trabajo
WORKDIR /var/www/html

# AHORA copiamos los archivos de tu PC a la imagen
# Sin esto, el siguiente paso fallaría porque no encontraría el archivo
COPY . .

# AHORA que el archivo ya existe dentro, lo arreglamos
# Arreglo de permisos y saltos de línea (CRLF -> LF)
RUN chmod +x docker-entrypoint.sh
RUN sed -i 's/\r$//' docker-entrypoint.sh

# 7. Exponer puerto
EXPOSE 8000

# 8. --- CAMBIO IMPORTANTE ---
# En lugar de CMD, usamos ENTRYPOINT para que SIEMPRE ejecute tu script
# Esto asegura que se instalen las dependencias y corran las migraciones
ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]