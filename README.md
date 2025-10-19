# tgState - Cloudflare Workers 版本

基于 Telegram 的文件外链系统，部署在 Cloudflare Workers 上。

## 功能特性

- 📁 支持所有文件格式上传
- 🔗 生成永久外链
- 🔐 可选密码保护
- 🚀 基于 Cloudflare Workers，全球 CDN 加速
- 💰 免费额度充足，成本极低

## 部署方式

### 1. GitHub Actions 自动部署（推荐）

1. Fork 本仓库
2. 在 GitHub 仓库设置中配置以下 Secrets：

#### 必需的 Secrets：
- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID
- `TELEGRAM_BOT_TOKEN`: Telegram Bot Token
- `TELEGRAM_TARGET`: Telegram 频道/群组 ID

#### 可选的 Secrets：
- `ACCESS_PASSWORD`: 访问密码（不设置则无密码保护）

#### 可选的 Variables：
- `RUN_MODE`: 运行模式（`p` = 页面模式，`m` = 仅API模式）
- `CUSTOM_DOMAIN`: 自定义域名（如：`https://your-domain.com`）

3. 推送代码到 `main` 或 `master` 分支，GitHub Actions 会自动部署

### 2. 手动部署

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 部署到生产环境
npm run deploy:prod
```

## 配置说明

### Telegram Bot 设置

1. 与 [@BotFather](https://t.me/botfather) 对话创建 Bot
2. 获取 Bot Token
3. 创建频道或群组，将 Bot 添加为管理员
4. 获取频道/群组 ID（可以通过 [@userinfobot](https://t.me/userinfobot) 获取）

### Cloudflare 设置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 获取 Account ID（右侧边栏）
3. 创建 API Token：
   - 模板选择 "Custom token"
   - 权限：`Cloudflare Workers:Edit`
   - 账户资源：`Include - All accounts`
   - 区域资源：`Include - All zones`

## 环境变量说明

| 变量名 | 说明 | 必需 | 默认值 |
|--------|------|------|--------|
| `TOKEN` | Telegram Bot Token | ✅ | - |
| `TARGET` | Telegram 频道/群组 ID | ✅ | - |
| `PASS` | 访问密码 | ❌ | 无密码保护 |
| `MODE` | 运行模式（p/m） | ❌ | p |
| `URL` | 自定义域名 | ❌ | Workers 域名 |

## API 使用

### 上传文件

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api \
  -F "image=@/path/to/file" \
  -F "pass=your-password"  # 如果设置了密码
```

### 访问文件

```
https://your-worker.your-subdomain.workers.dev/d/{file_id}
```

## 自定义域名

1. 在 Cloudflare Dashboard 中添加自定义域名
2. 在 GitHub Variables 中设置 `CUSTOM_DOMAIN`
3. 重新部署即可

## 许可证

MIT License