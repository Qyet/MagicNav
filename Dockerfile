# 生产环境 Dockerfile

# 第一阶段：构建阶段（使用稳定的 Node.js 版本）
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache \
    libc6-compat \
    build-base \
    openssl-dev \
    git \
    && rm -rf /var/cache/apk/*

# 复制依赖文件
COPY package*.json ./

# 安装依赖（使用 npm ci 确保依赖一致性）
RUN npm ci --ignore-scripts

# 复制应用代码
COPY . .

# 为 Prisma 生成客户端设置临时环境变量
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 第二阶段：运行阶段（最小化镜像）
FROM node:20-alpine AS runner

# 设置工作目录
WORKDIR /app

# 设置 Node.js 环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 安装运行时依赖
RUN apk add --no-cache \
    libc6-compat \
    wget \
    && rm -rf /var/cache/apk/*

# 复制构建产物
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma/

# 暴露端口
EXPOSE 3000

# 创建生产环境启动脚本
RUN echo '#!/bin/sh
set -e

# 检查 DATABASE_URL 是否配置
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

# 执行数据库迁移（生产环境使用 migrate deploy）
echo "Running database migrations..."
./node_modules/.bin/prisma migrate deploy

# 启动应用
echo "Starting application..."
node server.js' > /app/start.sh && chmod +x /app/start.sh

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# 使用启动脚本执行迁移并启动应用
CMD ["/app/start.sh"]