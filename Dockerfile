# Stage 1: Build
FROM node:24-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for TypeScript)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:24-slim AS production

# Set working directory
WORKDIR /app

# Set node env to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (ignoring scripts like Husky's prepare)
RUN npm ci --omit=dev --ignore-scripts

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Use the built-in non-root 'node' user for security
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
