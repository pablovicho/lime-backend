FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install pnpm if not already installed
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN mkdir -p static/uploads
RUN pnpm run build
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
