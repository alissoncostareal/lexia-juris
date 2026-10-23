FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl ca-certificates

COPY package*.json ./
RUN npm install --omit=dev

COPY src/ ./src/
RUN mkdir -p /app/data /app/leis /app/public

ENV PORT=3460
ENV NODE_ENV=production
ENV OLLAMA_BASE_URL=http://ollama:11434
ENV OLLAMA_MODEL=qwen2.5:7b

EXPOSE 3460

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:3460/api/status || exit 1

CMD ["node", "src/server.mjs"]
