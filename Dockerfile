# Use Node.js 20 LTS (Lightweight)
FROM node:20-slim

# Install dependencies for Puppeteer, better-sqlite3 and other native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    git \
    wget \
    gnupg \
    ca-certificates \
    libnss3 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build if needed, then prune)
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Create required directories for persistence
RUN mkdir -p logs sessions media auth_info_baileys data src/config

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
