# Multi-stage Dockerfile for Instagram MERN Application

# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy the entire project
COPY . .

# Navigate to frontend and install dependencies
WORKDIR /app/frontend

# Install frontend dependencies
RUN npm ci

# Build the frontend application
RUN npm run build

# Stage 2: Build the backend
FROM node:18-alpine AS backend-build

WORKDIR /app

# Copy the entire project
COPY . .

# Navigate to backend and install dependencies
WORKDIR /app/backend

# Install backend dependencies
RUN npm ci

# Stage 3: Production image
FROM node:18-alpine

WORKDIR /app

# Install serve to serve the frontend build
RUN npm install -g serve

# Copy backend files from build stage
COPY --from=backend-build /app/backend ./backend

# Copy frontend build from build stage
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Create a startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/backend && node server.js &' >> /app/start.sh && \
    echo 'cd /app/frontend/build && serve -s . -l 3000' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose ports (3000 for frontend, 8000 for backend)
EXPOSE 3000
EXPOSE 8000

# Set environment variables
ENV NODE_ENV=production

# Start both frontend and backend
CMD ["/app/start.sh"]