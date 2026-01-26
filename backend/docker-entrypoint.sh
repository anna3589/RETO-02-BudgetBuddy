#!/bin/sh
# backend/docker-entrypoint.sh

# backend/docker-entrypoint.sh

# ... (al inicio)

echo "🔧 Ajustando permisos de carpetas críticas..."
# Damos permisos de escritura al grupo y usuario (777 es drástico pero seguro para entornos de desarrollo escolar)
chmod -R 777 storage bootstrap/cache

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

# Intentamos conectar hasta que responda. 
# Usamos un bucle infinito que se rompe cuando la conexión tiene éxito.
# 'db' es el nombre de tu servicio en docker-compose
# 'budgetbuddy' es el nombre de tu base de datos en el .env
until php -r "try { new PDO('mysql:host=db;dbname=budgetbuddy', 'root', 'root'); echo 'Conectado'; } catch (PDOException \$e) { exit(1); }" > /dev/null 2>&1; do
  echo "zzz... MySQL aún no está listo. Reintentando en 3 segundos..."
  sleep 3
done

# 5. Correr migraciones (Crea las tablas automáticamente)
echo "🚀 Ejecutando migraciones..."
php artisan migrate --force

# 6. Arrancar el servidor de Laravel
echo "🏁 Iniciando servidor..."
php artisan serve --host=0.0.0.0 --port=8000