# Multi-stage build for Express.js Backend with Prisma
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci
RUN npx prisma generate

# Build stage
FROM node:18-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Create uploads directory (optional, better to use S3)
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command with Prisma migration
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

