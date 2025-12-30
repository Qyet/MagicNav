FROM node:18-alpine

WORKDIR /app

# Set timezone
ENV TZ=Asia/Shanghai

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --omit=dev; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile --prod; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile --production; \
  else npm install --omit=dev; \
  fi

# Copy source files
COPY . .

# Generate Prisma Client (safe in build time)
RUN npx prisma generate

# Build application
ENV NODE_ENV=production
RUN npm run build

# Clean up development dependencies
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
