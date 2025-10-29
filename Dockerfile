# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY bot.js ./

# Set environment to production
ENV NODE_ENV=production

# Run the bot
CMD ["node", "bot.js"]
