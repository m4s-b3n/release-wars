# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built application from builder stage
COPY --from=builder /app /app

# Install production dependencies only
RUN npm ci --only=production

# Expose application port
EXPOSE 3000

# Add a health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"]