# Stage 1: Build Angular application
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve application with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/gestio-asistencia-frontend/browser /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
