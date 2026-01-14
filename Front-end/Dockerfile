# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Run stage (Nginx) ----
FROM nginx:alpine
# Remplace la conf par défaut si tu veux du SPA routing (voir nginx.conf plus bas)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie le build Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
