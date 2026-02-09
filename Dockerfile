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

# Copy package files for both backend and frontend
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies for both
RUN npm install --legacy-peer-deps
RUN cd frontend && npm install --legacy-peer-deps

# Copy application source
COPY . .

# Argument for Frontend Build (important for Next.js static export)
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the frontend
RUN cd frontend && npm run build

# Create required directories for persistence
RUN mkdir -p logs sessions media auth_info_baileys data src/config

# Expose the API port (which now also serves the UI)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
