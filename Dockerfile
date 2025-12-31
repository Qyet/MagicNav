FROM node:18-bullseye

WORKDIR /app

# Set timezone
ENV TZ=Asia/Shanghai

# Set DATABASE_URL during build time for prisma generate and next build
ENV DATABASE_URL="postgresql://neondb_owner:npg_JZTe2Iv3YcCs@ep-lingering-grass-a1yx11c3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
ENV NEXTAUTH_SECRET="your-nexauth-secret-here"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV ADMIN_EMAIL="admin@example.com"
ENV ADMIN_PASSWORD="admin123"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"

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

# Build application with NODE_ENV=production
ENV NODE_ENV=production
RUN npm run build -- --no-lint

# Clean up development dependencies
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
