# ============================================================
# CloudExecX — Worker Service Dockerfile
# ============================================================
# NOTE: The worker needs access to the Docker socket to spawn
# execution containers. Mount with:
#   -v /var/run/docker.sock:/var/run/docker.sock

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY ../shared ../shared
RUN npm run build

FROM node:20-alpine
# Install docker-cli so the worker can interact with Docker
RUN apk add --no-cache docker-cli
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

CMD ["node", "dist/index.js"]
