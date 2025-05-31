# 部署指南 / Deployment Guide

本文档介绍如何将Canvas Fighting Game Enhanced Edition部署到各种平台。

## 🚀 快速部署 / Quick Deployment

### 1. GitHub Pages 部署

#### 步骤 1: 构建项目
```bash
npm run build
```

#### 步骤 2: 创建GitHub仓库
1. 在GitHub上创建新仓库
2. 将代码推送到仓库

```bash
git init
git add .
git commit -m "Initial commit: Canvas Fighting Game Enhanced Edition"
git branch -M main
git remote add origin https://github.com/yourusername/canvas-fighting-game-enhanced.git
git push -u origin main
```

#### 步骤 3: 启用GitHub Pages
1. 进入仓库设置 (Settings)
2. 找到 "Pages" 选项
3. 选择 "Deploy from a branch"
4. 选择 "main" 分支和 "/dist" 文件夹
5. 点击 "Save"

### 2. Netlify 部署

#### 方法 1: 拖拽部署
1. 运行 `npm run build`
2. 将 `dist` 文件夹拖拽到 [Netlify Drop](https://app.netlify.com/drop)

#### 方法 2: Git 集成
1. 连接GitHub仓库到Netlify
2. 设置构建命令: `npm run build`
3. 设置发布目录: `dist`
4. 点击 "Deploy site"

### 3. Vercel 部署

#### 使用Vercel CLI
```bash
npm i -g vercel
vercel
```

#### 或通过GitHub集成
1. 访问 [Vercel](https://vercel.com)
2. 导入GitHub仓库
3. Vercel会自动检测Vite项目并配置

## 🔧 构建配置 / Build Configuration

### Vite 配置优化

创建或修改 `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // 用于相对路径部署
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境不生成sourcemap
    minify: 'terser', // 使用terser压缩
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['typescript']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
```

### 环境变量配置

创建 `.env.production`:
```
VITE_APP_TITLE=Canvas Fighting Game Enhanced
VITE_APP_VERSION=1.0.0
```

## 📦 Docker 部署

### Dockerfile

```dockerfile
# 构建阶段
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 构建和运行Docker

```bash
# 构建镜像
docker build -t canvas-fighting-game .

# 运行容器
docker run -p 8080:80 canvas-fighting-game
```

## 🌐 CDN 优化

### 使用CDN加速资源

在 `index.html` 中添加:

```html
<!-- 预连接到CDN -->
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
```

### 资源压缩

确保所有图片和音频文件都经过压缩:

```bash
# 安装图片压缩工具
npm install -g imagemin-cli

# 压缩图片
imagemin assets/**/*.{jpg,png} --out-dir=assets/compressed
```

## 📊 性能监控

### 添加Google Analytics (可选)

在 `index.html` 中添加:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔒 安全配置

### 添加安全头

在服务器配置中添加:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 🚨 故障排除

### 常见问题

1. **资源加载失败**
   - 检查 `base` 配置是否正确
   - 确保所有资源路径使用相对路径

2. **字体加载问题**
   - 确保字体文件包含在构建输出中
   - 检查CORS设置

3. **音频播放问题**
   - 现代浏览器需要用户交互才能播放音频
   - 确保音频文件格式兼容

### 调试命令

```bash
# 本地预览构建结果
npm run preview

# 分析构建包大小
npm install -g webpack-bundle-analyzer
npx vite-bundle-analyzer
```

## 📝 部署检查清单

- [ ] 运行 `npm run build` 成功
- [ ] 测试构建后的应用功能正常
- [ ] 检查所有资源文件都包含在dist目录中
- [ ] 验证语言切换功能正常工作
- [ ] 测试在不同浏览器中的兼容性
- [ ] 检查控制台没有错误信息
- [ ] 验证移动端响应式设计
- [ ] 测试音频和图片加载

---

**提示**: 部署前建议先在本地运行 `npm run preview` 测试构建后的应用。