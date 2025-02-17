# Development stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./

# Clean install dependencies
RUN npm cache clean --force && \
    npm install

# Copy the rest of the code
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"] 