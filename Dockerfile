# Dockerfile for AdonisJS Application

# Stage 1: Build the application
FROM node:20-alpine AS build

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy application files
COPY . .

# Build the application
RUN node ace build --production

# Stage 2: Production image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

# Create app directory
WORKDIR /app

# Copy built files from the build stage
COPY --from=build /app/build .
COPY package*.json ./

# Install production dependencies
RUN npm ci --production

# Expose the application port
EXPOSE 3333

# Start the application
CMD ["node", "bin/server.js"]
