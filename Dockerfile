# 第一阶段：构建阶段
FROM node:20-alpine AS builder

# 安装必要的构建工具和OpenSSL
RUN apk add --no-cache libc6-compat openssl openssl-dev curl

WORKDIR /app

# 设置 npm 镜像（国内可选）
RUN npm config set registry https://registry.npmmirror.com

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制必要的配置文件
COPY prisma ./prisma/
COPY next.config.js ./

# 生成 Prisma Client
RUN npx prisma generate

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：运行阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 安装生产依赖和OpenSSL运行时库
COPY package*.json ./
RUN apk add --no-cache openssl && \
    npm ci --only=production --omit=dev --ignore-scripts && \
    rm -rf /app/node_modules/.cache && \
    rm -rf /tmp/*

# 复制Next.js standalone构建产物
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 复制Prisma相关文件
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 更改文件所有权
RUN chown -R nextjs:nodejs /app

USER nextjs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]