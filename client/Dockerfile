# Multi-stage build for production-optimized image

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (from client directory when build context is root)
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Build the application with environment variables
# Railway passes environment variables as build args via railway.json
ARG VITE_API_BASE_URL=https://calendar-book-production.up.railway.app/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source code (from client directory)
COPY client/ .

# Build TypeScript and Vite project
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy nginx configuration (from client directory)
COPY client/nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (Railway will dynamically map to $PORT)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
