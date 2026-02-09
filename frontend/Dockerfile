# Use Node.js 20 LTS (Lightweight)
FROM node:20-slim

# Install git for some dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Argument for API URL during build (important for Next.js)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js application
RUN npm run build

# Expose the frontend port
EXPOSE 3001

# Start the application
CMD ["npx", "next", "start", "-p", "3001", "-H", "0.0.0.0"]
