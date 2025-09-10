# Multi-stage build for React frontend
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html
# Add runtime-configurable nginx template and entrypoint
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
RUN apk add --no-cache bash curl gettext
COPY <<'EOF' /docker-entrypoint.d/99-env-nginx.sh
#!/bin/sh
set -e
BACKEND_HOST="${BACKEND_HOST:-backend}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf
EOF
RUN chmod +x /docker-entrypoint.d/99-env-nginx.sh

# Copy custom nginx configuration
# Fallback default (will be overwritten by entrypoint script)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 