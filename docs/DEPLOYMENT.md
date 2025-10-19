# 部署指南

## GitHub Actions 自动部署

### 1. 准备工作

#### 获取 Cloudflare 凭据
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 右侧边栏找到 **Account ID** 并复制
3. 点击右上角头像 → **My Profile** → **API Tokens**
4. 点击 **Create Token**，选择 **Custom token**
5. 配置权限：
   - **Permissions**: `Cloudflare Workers:Edit`
   - **Account resources**: `Include - All accounts`
   - **Zone resources**: `Include - All zones`
6. 点击 **Continue to summary** → **Create Token**
7. 复制生成的 API Token

#### 获取 Telegram 凭据
1. 与 [@BotFather](https://t.me/botfather) 对话
2. 发送 `/newbot` 创建新 Bot
3. 按提示设置 Bot 名称和用户名
4. 复制获得的 **Bot Token**
5. 创建频道或群组，将 Bot 添加为管理员
6. 获取频道/群组 ID：
   - 方法1: 使用 [@userinfobot](https://t.me/userinfobot)
   - 方法2: 发送消息到频道，然后访问 `https://api.telegram.org/bot<TOKEN>/getUpdates`

### 2. 配置 GitHub Secrets

在 GitHub 仓库页面：
1. 点击 **Settings** → **Secrets and variables** → **Actions**
2. 添加以下 **Repository secrets**：

| Secret 名称 | 值 | 说明 |
|-------------|----|----- |
| `CLOUDFLARE_API_TOKEN` | 你的 API Token | Cloudflare API 令牌 |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Account ID | Cloudflare 账户 ID |
| `TELEGRAM_BOT_TOKEN` | 你的 Bot Token | Telegram Bot 令牌 |
| `TELEGRAM_TARGET` | 频道/群组 ID | 文件存储位置 |
| `ACCESS_PASSWORD` | 自定义密码 | 可选，访问密码 |

3. 添加以下 **Repository variables**（可选）：

| Variable 名称 | 值 | 说明 |
|---------------|----|----- |
| `RUN_MODE` | `p` 或 `m` | p=页面模式，m=仅API模式 |
| `CUSTOM_DOMAIN` | `https://your-domain.com` | 自定义域名 |

### 3. 触发部署

推送代码到 `main` 或 `master` 分支，GitHub Actions 会自动：
1. 安装依赖
2. 创建配置文件
3. 部署到 Cloudflare Workers
4. 创建 KV 命名空间（如需要）

## 手动部署

### 1. 环境准备

```bash
# 克隆仓库
git clone <your-repo-url>
cd tgstate-cloudflare

# 安装依赖
npm install

# 登录 Cloudflare
npx wrangler login
```

### 2. 配置环境变量

编辑 `wrangler.toml` 文件，取消注释并填写相关变量：

```toml
[vars]
TOKEN = "your-telegram-bot-token"
TARGET = "your-telegram-target"
PASS = "your-access-password"
MODE = "p"
URL = "your-custom-domain"
```

### 3. 部署

```bash
# 开发环境测试
npm run dev

# 部署到生产环境
npm run deploy:prod
```

## 自定义域名配置

### 1. 在 Cloudflare 中添加域名

1. 登录 Cloudflare Dashboard
2. 点击 **Workers & Pages**
3. 选择你的 Worker
4. 点击 **Settings** → **Triggers**
5. 点击 **Add Custom Domain**
6. 输入域名并点击 **Add Custom Domain**

### 2. 更新配置

在 GitHub Variables 中设置 `CUSTOM_DOMAIN` 为你的域名，然后重新部署。

## 故障排除

### 部署失败

1. 检查所有 Secrets 是否正确配置
2. 确认 Cloudflare API Token 权限充足
3. 查看 GitHub Actions 日志获取详细错误信息

### 文件上传失败

1. 检查 Telegram Bot Token 是否有效
2. 确认 Bot 已添加到目标频道/群组
3. 验证频道/群组 ID 是否正确

### 访问被拒绝

1. 检查密码设置是否正确
2. 确认运行模式配置
3. 清除浏览器缓存和 Cookie