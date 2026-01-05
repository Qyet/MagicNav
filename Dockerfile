# 使用Node.js 18作为基础镜像
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制所有源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口3000
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
