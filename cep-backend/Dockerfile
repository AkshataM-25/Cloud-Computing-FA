FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including dev) for building
COPY package*.json ./
RUN npm install

# Copy source and TypeScript config, then build to /app/dist
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM node:20-alpine

WORKDIR /app

# Install only production dependencies for a smaller runtime image
COPY package*.json ./
RUN npm install --only=production

# Copy compiled JavaScript from the builder stage
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8787

EXPOSE 8787

CMD ["node", "dist/index.js"]

