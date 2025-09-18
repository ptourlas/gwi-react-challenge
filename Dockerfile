# ---------- Build stage ----------
FROM node:lts-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

ARG VITE_API_KEY
ENV VITE_API_KEY=${VITE_API_KEY}

# Copy the env file so Vite can read it
COPY .env ./

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
