# MagicNav Dockerfile
# 用于构建和运行 MagicNav 应用

# 使用 Node.js 20 Slim 镜像作为构建基础（基于 Debian，对 Prisma 引擎更兼容）
FROM node:20-slim AS builder

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖（基于 Debian，更适合 Prisma 引擎）
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 优化依赖安装：仅复制 package.json 和 package-lock.json 先安装依赖
COPY package*.json ./

# 安装依赖（使用 --ignore-scripts 跳过 postinstall 脚本）
RUN npm install --ignore-scripts

# 复制应用代码
COPY . .

# 为 Prisma generate 设置临时 DATABASE_URL（不需要实际连接）
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 使用 Node.js 20 Slim 镜像作为运行基础（基于 Debian，对 Prisma 引擎更兼容）
FROM node:20-slim AS runner

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖（基于 Debian，更适合 Prisma 引擎）
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/prisma ./prisma

# 环境变量说明：
# - 用户部署时需要根据实际情况替换这些值
# - 所有敏感信息都通过环境变量传入，不在代码中硬编码

# 暴露端口
EXPOSE 3000

# 启动应用
# 注意：环境变量应该在 docker-compose.yml 或运行容器时传入
CMD ["npm", "start"]