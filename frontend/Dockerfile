# Stage 1: Build static assets
FROM node:20-slim AS builder

WORKDIR /app

# Copy lock files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy code and build production files
COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy built HTML/JS assets to default Nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy default nginx configuration to handle SPA routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
