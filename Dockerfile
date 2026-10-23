# Stage 1: Compilação do Frontend React
FROM node:20-alpine AS build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Runtime do Servidor Node.js (Backend)
FROM node:20-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache curl ca-certificates

# Dependências do backend
COPY backend/package*.json ./
RUN npm install --omit=dev

# Código do backend e artefatos compilados do frontend
COPY backend/src/ ./src/
COPY public/ ./public/
COPY --from=build /app/public/ ./public/

# Diretório de persistência de dados e leis
RUN mkdir -p /app/data /app/leis

ENV PORT=3460
ENV NODE_ENV=production
ENV OLLAMA_BASE_URL=http://ollama:11434
ENV OLLAMA_MODEL=qwen2.5:7b

EXPOSE 3460

# Healthcheck sem localhost (usa loopback IPv4 direto)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:3460/api/status || exit 1

CMD ["node", "src/server.mjs"]
