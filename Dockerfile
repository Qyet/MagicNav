FROM node:18-alpine

WORKDIR /app

# Set timezone
ENV TZ=Asia/Shanghai

# Install dependencies (copy package files first)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Copy prisma directory for prisma generate
COPY prisma/ ./prisma/

# Install dependencies (this will trigger postinstall script)
RUN \
  if [ -f package-lock.json ]; then npm ci --omit=dev; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile --prod; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile --production; \
  else npm install --omit=dev; \
  fi

# Generate Prisma Client
RUN npx prisma generate

# Copy remaining source files
COPY src/ ./src/
COPY public/ ./public/
COPY next.config.js ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./
COPY components.json ./

# Build application
ENV NODE_ENV=production
RUN npm run build

# Clean up development dependencies
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
