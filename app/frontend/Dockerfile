# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy remaining app files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the default port
EXPOSE 3000

# Start Next.js in production
CMD ["npm", "start"]
