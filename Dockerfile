FROM node:18-bullseye

WORKDIR /app

# Set timezone
ENV TZ=Asia/Shanghai

# Define build arguments for sensitive information
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG ADMIN_EMAIL
ARG ADMIN_PASSWORD
ARG NEXT_PUBLIC_APP_URL

# Set environment variables from build arguments
ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV ADMIN_EMAIL=${ADMIN_EMAIL}
ENV ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
# 禁用 Next.js 遥测
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files and prisma schema first
COPY package*.json ./
COPY prisma/ ./prisma/

# Install all dependencies (including dev) to run postinstall
RUN npm ci

# Generate Prisma Client (already done by postinstall, but ensure it's generated)
RUN npx prisma generate

# Remove dev dependencies after generation
RUN npm prune --production

# Copy source files
COPY src/ ./src/
COPY public/ ./public/
COPY next.config.js ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./
COPY components.json ./

# Build application with no static export
RUN npm run build -- --no-lint

# Clean up
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
