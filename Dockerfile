# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy only necessary files for building the application
COPY package.json package-lock.json ./
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Set working directory
WORKDIR /app

# Copy only the built application and runtime dependencies
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Expose application port
EXPOSE 3000

# Add a health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["node", "dist/index.js"]