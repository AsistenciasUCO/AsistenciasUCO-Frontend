# ==========================================================
# Etapa 1: Construcción de la aplicación Angular (Build Stage)
# ==========================================================
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias limpias
RUN npm ci

# Copiar el código fuente completo del proyecto
COPY . .

# Compilar para producción (genera dist/gestio-asistencia-frontend/browser)
RUN npm run build -- --configuration=production

# ==========================================================
# Etapa 2: Servidor Nginx para producción (Production Stage)
# ==========================================================
FROM nginx:alpine AS production-stage

# Eliminar la configuración predeterminada de Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copiar la configuración personalizada para Single Page Application (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los artefactos compilados desde la etapa de build
COPY --from=build-stage /app/dist/gestio-asistencia-frontend/browser /usr/share/nginx/html

# Exponer el puerto HTTP estándar
EXPOSE 80

# Iniciar servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
