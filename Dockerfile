# Multi-stage build for the bloomberg_free custom Node server (see server.js).
# This app is not serverless-deployable (background alert loop + SSE need a
# persistent process, and /data must be a writable, persistent filesystem) —
# run it as a long-lived container instead.

# ---- dependencies (full, needed for `next build`) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- production-only dependencies (for the final runtime image) ----
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/store ./store
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./package.json

# /data holds the CSV backend (accounts, holdings, wishlists, alerts) —
# mount a volume here so it survives container restarts/rebuilds.
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data
VOLUME /app/data

USER appuser
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
