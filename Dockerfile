# MagicNav Dockerfile
# 用于构建和运行 MagicNav 应用

# 使用 Node.js 20 Alpine 镜像作为构建基础（更现代的版本）
FROM node:20-alpine AS builder

# 设置时区
ENV TZ=Asia/Shanghai

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache \
    git \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# 优化 npm 配置
RUN npm config set registry https://registry.npmmirror.com/ \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-mintimeout 10000 \
    && npm config set fetch-retrymaxwait 60000

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 清理 node_modules 和 package-lock.json（如果存在）
RUN rm -rf node_modules package-lock.json || true

# 安装依赖（增加 --legacy-peer-deps 选项以避免 peer dependency 冲突）
RUN npm install --legacy-peer-deps

# 复制应用代码
COPY . .

# 构建应用
RUN npm run build

# 使用更小的 Node.js 20 Alpine 镜像作为运行基础
FROM node:20-alpine AS runner

# 设置时区
ENV TZ=Asia/Shanghai

# 设置工作目录
WORKDIR /app

# 安装必要的运行时依赖
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# 复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# 环境变量说明：
# - 用户部署时需要根据实际情况替换这些值
# - 所有敏感信息都通过环境变量传入，不在代码中硬编码

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:3000 || exit 1

# 启动应用
# 注意：环境变量应该在 docker-compose.yml 或运行容器时传入
CMD ["npm", "start"]