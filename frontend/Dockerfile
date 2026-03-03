# Base image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
# Setup build arg for API URL to be injected at build time if needed, 
# though usually env vars at runtime are better for Next.js 13+ public vars if configured correctly.
# For now, we rely on runtime ENV.
RUN npm run build

# Expose port (Next.js default)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
