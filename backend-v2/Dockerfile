# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies needed for build
RUN apk add --no-cache libc6-compat openssl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Generate Prisma Client and build the TypeScript project

# Copy the rest of the application source code
COPY . .

# Generate Prisma Client and build the TypeScript project
RUN npx prisma generate
RUN npm run build

# ---

# Stage 2: Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Install production dependencies
RUN apk add --no-cache openssl

ENV NODE_ENV production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application, node_modules, and prisma schema from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Create and set permissions for logs and uploads directories
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Set ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

EXPOSE 3002

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command with Prisma migration
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]