# 1. Usamos una imagen ligera de Node.js (Alpine Linux)
FROM node:22-alpine

# 2. Establecemos la carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos el package.json primero
# Esto es un truco de optimización: Docker solo reinstalará dependencias si cambia este archivo
COPY package*.json ./

# 4. Instalamos las dependencias de Node
RUN npm install

# 5. Copiamos el resto del código del frontend
COPY . .

# 6. Exponemos el puerto 5173 (el estándar de Vite) para que Windows lo vea
EXPOSE 5173

# 7. Comando por defecto al iniciar: Arrancar el servidor de desarrollo
# "--host" es vital para que se pueda acceder desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]