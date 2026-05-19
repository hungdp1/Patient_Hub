# ---- Patient Hub backend ----
# Node + Express + Prisma + Socket.io, run via tsx (ESM-safe, no dist build)
FROM node:20-slim

# Prisma needs OpenSSL at runtime; ca-certificates for outbound HTTPS (Gemini)
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Generate the Prisma client (schema only needed for this step)
COPY prisma ./prisma
RUN npx prisma generate

# App source
COPY . .

# Entrypoint waits for the DB, syncs the schema, then starts the server
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
