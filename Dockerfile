FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  else npm install; \
  fi

# Copy all files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
