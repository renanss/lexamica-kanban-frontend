# Development stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./

# Clean install without platform-specific binaries
RUN npm cache clean --force && \
    rm -rf node_modules && \
    rm -rf .next && \
    npm install

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_ENV=development

# Start development server
CMD ["npm", "run", "dev"] 