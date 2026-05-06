# syntax=docker/dockerfile:1

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY nest-cli.json tsconfig*.json ./
COPY src ./src
RUN npm ci \
  && npm run build \
  && npm cache clean --force

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache curl \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001 -G nodejs

COPY package*.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/health || exit 1

CMD ["node", "dist/main.js"]
