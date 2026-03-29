# 1. Dependencies (build uniquement)
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 2. Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# 3. Runtime minimal
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# utilisateur non-root
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# ⚠️ uniquement ce qui est nécessaire
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]