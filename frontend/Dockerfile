# Build aşaması
FROM node:18-alpine AS build
WORKDIR /app

# Build-time arg (docker-compose build --build-arg REACT_APP_API_URL=...)
ARG REACT_APP_API_URL
# Set env so npm build sees it
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Paket dosyalarını kopyala ve bağımlılıkları yükle
COPY package*.json ./
RUN npm install --silent

# Kaynak kodları kopyala
COPY . ./

# Production build
RUN npm run build

# Runtime aşaması - Nginx ile serve et
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Nginx yapılandırması (React Router için)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]