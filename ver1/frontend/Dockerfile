# ---- Patient Hub frontend ----
# Stage 1: build the Vite/React app
FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . .

# API + socket are same-origin in production; nginx reverse-proxies them.
# Override at build time with --build-arg if the backend lives elsewhere.
ARG VITE_API_BASE_URL=/api
ARG VITE_API_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: serve static files with nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
