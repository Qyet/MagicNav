# 第一阶段：构建阶段
FROM node:20-alpine AS builder

# 安装必要的构建工具和OpenSSL
RUN apk add --no-cache libc6-compat openssl openssl-dev curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# 设置npm配置
RUN npm config set cache /tmp/npm-cache && \
    npm config set fund false

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖（只安装生产依赖用于构建）
RUN npm ci --only=production --omit=dev --ignore-scripts && \
    rm -rf /tmp/npm-cache && \
    rm -rf /tmp/*

# 复制必要的配置文件
COPY prisma ./prisma/
COPY next.config.js ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY components.json ./
COPY postcss.config.mjs ./

# 生成 Prisma Client
RUN npx prisma generate

# 复制源代码（只复制必要文件）
COPY src ./src
COPY public ./public

# 构建应用
RUN npm run build && \
    rm -rf /tmp/*

# 第二阶段：运行阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 安装生产依赖和OpenSSL运行时库
COPY package*.json ./
RUN apk add --no-cache openssl && \
    npm ci --only=production --omit=dev --ignore-scripts && \
    rm -rf /app/node_modules/.cache && \
    rm -rf /tmp/* && \
    rm -rf /var/cache/apk/*

# 复制Next.js standalone构建产物
COPY --from=builder /app/.next/standalone ./

# 复制静态资源和public目录
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 复制Prisma相关文件（包括migrations目录）
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    mkdir -p /app/.next/static /app/public /app/node_modules/.prisma /app/prisma && \
    chown -R nextjs:nodejs /app

USER nextjs

# 暴露端口
EXPOSE 3000

# 启动应用（先执行迁移，然后运行standalone服务器）
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]