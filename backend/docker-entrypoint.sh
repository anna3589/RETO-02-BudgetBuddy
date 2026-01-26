#!/bin/sh
# backend/docker-entrypoint.sh

# 1. Instalar dependencias si no existen
if [ ! -d "vendor" ]; then
    echo "📦 Instalando dependencias de Composer..."
    composer install --no-interaction --optimize-autoloader
fi

# 2. Copiar .env si no existe (Opcional, pero muy útil para desarrollo)
if [ ! -f ".env" ]; then
    echo "📄 Creando archivo .env desde ejemplo..."
    cp .env.example .env
fi

# 3. Generar la clave de aplicación si no está puesta
if ! grep -q "APP_KEY=base64" .env; then
    echo "🔑 Generando App Key..."
    php artisan key:generate
fi

# 4. Esperar a que la base de datos arranque (A veces el contenedor de DB tarda más)
echo "⏳ Esperando a la base de datos..."
# (Aquí podríamos poner un script de espera, pero por ahora confiaremos en depends_on)

# 5. Correr migraciones (Crea las tablas automáticamente)
echo "🚀 Ejecutando migraciones..."
php artisan migrate --force

# 6. Arrancar el servidor de Laravel
echo "🏁 Iniciando servidor..."
php artisan serve --host=0.0.0.0 --port=8000