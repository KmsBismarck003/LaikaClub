# Dockerfile para MATIS SolidJS Dashboard
FROM node:20-alpine

# Evitar que npm muestre demasiados logs
ENV NPM_CONFIG_LOGLEVEL=warn

WORKDIR /app

# Instalar dependencias primero para aprovechar el caché de Docker
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del código del dashboard
COPY . .

EXPOSE 3015

# Ejecutar el servidor de desarrollo de Vite en el puerto 3015
CMD ["npm", "run", "dev"]
