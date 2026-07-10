# Debian-based (not Alpine): schema.prisma targets debian-openssl-3.0.x, no linux-musl
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

FROM node:22-bookworm-slim

# openssl is required by the Prisma query engine on Debian slim images
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "index.js"]
