# MagicNav Docker 部署教程

本教程将指导您使用 Docker Compose 部署 MagicNav 应用。

## 准备工作

1. **安装 Docker 和 Docker Compose**
   - 确保您的服务器已经安装了 Docker 20.10+ 和 Docker Compose 2.0+
   - 参考官方文档：[Docker 安装指南](https://docs.docker.com/get-docker/)

2. **克隆代码库**
   ```bash
   git clone https://github.com/Qyet/MagicNav.git
   cd MagicNav
   ```

3. **准备配置信息**
   - 域名或 IP 地址
   - 数据库连接信息（如果使用外部数据库）
   - 随机字符串（用于 NEXTAUTH_SECRET）

## 部署步骤

### 1. 配置环境变量

编辑 `docker-compose.yml` 文件，根据您的实际情况修改以下环境变量。**请严格遵守 YAML 语法规则**：

#### YAML 语法注意事项
1. **不要使用反引号**：YAML 只支持单引号 `'` 或双引号 `"`
2. **特殊字符必须用引号括起来**：包含 `&`, `$`, `#`, `?` 等特殊字符的值必须用引号括起来
3. **每行格式**：每行必须以 `-` 开头，后面跟着 `KEY=VALUE` 格式
4. **注释格式**：注释必须以 `#` 开头，且不能与环境变量在同一行
5. **缩进**：使用空格缩进，不要使用制表符

#### 必填环境变量
```yaml
# 应用服务环境变量
- NEXTAUTH_URL=https://your-domain.com  # 替换为您的域名或 IP 地址
- NEXTAUTH_SECRET=your_nextauth_secret_here  # 生成一个随机字符串，用于加密会话
- DATABASE_URL="postgresql://user:password@host:5432/database"  # 包含特殊字符的值必须用引号括起来

# 如果使用内置 PostgreSQL 数据库，还需要修改：
- POSTGRES_USER=your_db_user  # 数据库用户名
- POSTGRES_PASSWORD=your_db_password  # 数据库密码
- POSTGRES_DB=your_db_name  # 数据库名称
```

#### 可选环境变量
```yaml
- NEXT_PUBLIC_APP_URL=http://your-domain.com  # 您的应用公开 URL
- NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=  # Google Analytics ID（可选）
- NEXT_PUBLIC_CLARITY_ID=  # Microsoft Clarity ID（可选）
```

### 2. 构建和启动容器

```bash
# 在项目根目录执行以下命令
# 构建并后台运行容器
docker-compose up -d --build

# 查看容器状态
docker-compose ps

# 查看应用日志
docker-compose logs -f app
```

### 3. 初始化数据库

首次部署时，您需要初始化数据库：

1. 访问应用登录页面：`http://your-domain.com/login`
2. 使用您的凭证登录（如果还没有账号，需要先注册）
3. 在登录页面勾选 **Initialize Database** 选项
4. 点击 **Login** 按钮

### 4. 访问应用

- **应用前端**：`http://your-domain.com`
- **管理后台**：`http://your-domain.com/admin`

## 高级配置

### 使用外部数据库

如果您想使用外部数据库（如 Neon、Supabase、AWS RDS 等）：

1. 删除 `docker-compose.yml` 文件中的 `db` 服务配置
2. 修改 `DATABASE_URL` 环境变量，指向您的外部数据库：
   ```yaml
   - DATABASE_URL=postgresql://your_external_db_user:your_external_db_password@your_external_db_host:5432/your_external_db_name
   ```

### 配置 HTTPS

建议在生产环境中使用 HTTPS。您可以使用以下方法之一：

#### 方法 1：使用 Nginx 作为反向代理

1. 安装 Nginx
2. 创建 Nginx 配置文件：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl;
       server_name your-domain.com;

       ssl_certificate /path/to/your/cert.pem;
       ssl_certificate_key /path/to/your/key.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. 重启 Nginx

#### 方法 2：使用 Traefik 作为反向代理

参考 [Traefik 官方文档](https://doc.traefik.io/traefik/getting-started/quick-start/)

### 自定义端口

如果您想使用不同的端口，可以修改 `docker-compose.yml` 文件中的端口映射：

```yaml
ports:
  - "8080:3000"  # 将 8080 替换为您想要使用的端口
```

### 启用日志持久化

取消注释 `docker-compose.yml` 文件中的日志挂载配置：

```yaml
volumes:
  - ./logs:/app/logs
```

## 管理命令

### 停止和启动容器

```bash
# 停止容器
docker-compose down

# 启动容器
docker-compose up -d

# 重启容器
docker-compose restart
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动容器
docker-compose up -d --build
```

### 查看日志

```bash
# 查看应用日志
docker-compose logs -f app

# 查看数据库日志
docker-compose logs -f db

# 查看所有容器日志
docker-compose logs -f
```

### 进入容器

```bash
# 进入应用容器
docker-compose exec app sh

# 进入数据库容器
docker-compose exec db sh
```

## 数据库管理

### 备份数据库

```bash
# 如果使用内置 PostgreSQL 数据库
docker-compose exec db pg_dump -U your_db_user your_db_name > backup.sql

# 如果使用外部数据库，使用相应的备份命令
```

### 恢复数据库

```bash
# 如果使用内置 PostgreSQL 数据库
docker-compose exec -T db psql -U your_db_user your_db_name < backup.sql

# 如果使用外部数据库，使用相应的恢复命令
```

### 执行数据库迁移

```bash
# 进入应用容器
docker-compose exec app sh

# 执行 Prisma 迁移
npx prisma migrate dev
```

## 常见问题排查

### 1. 应用无法启动

- 检查容器状态：`docker-compose ps`
- 查看应用日志：`docker-compose logs app`
- 确保所有环境变量都已正确设置

### 2. 数据库连接失败

- 确保数据库服务正在运行
- 检查数据库连接 URL 是否正确
- 确保数据库用户名和密码正确
- 如果使用外部数据库，确保数据库允许远程连接

### 3. 登录失败

- 确保 `NEXTAUTH_URL` 环境变量正确
- 确保 `NEXTAUTH_SECRET` 环境变量已设置
- 检查数据库是否已初始化
- 查看应用日志，查找具体错误信息

### 4. 容器不断重启

- 查看应用日志：`docker-compose logs -f app`
- 检查是否有资源限制问题
- 确保所有必要的环境变量都已设置

## 安全最佳实践

1. **定期更新**：定期更新 Docker 镜像和应用代码
2. **使用强密码**：为数据库和管理员账号使用强密码
3. **限制网络访问**：使用防火墙限制容器的网络访问
4. **启用 HTTPS**：在生产环境中始终使用 HTTPS
5. **定期备份**：定期备份数据库和重要配置文件
6. **使用环境变量**：避免在代码中硬编码敏感信息
7. **限制容器权限**：不要以 root 用户运行容器
8. **监控日志**：定期检查应用和数据库日志

## 性能优化

1. **使用适当的资源限制**：在 `docker-compose.yml` 中为容器设置适当的 CPU 和内存限制
2. **启用缓存**：为应用配置适当的缓存策略
3. **优化数据库**：定期优化数据库查询和索引
4. **使用 CDN**：为静态资源配置 CDN

## 许可证

MIT