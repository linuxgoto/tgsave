# 📁 tgState Cloudflare Workers

> 基于 Telegram 的文件外链系统 - Cloudflare Workers 版本

[![Deploy to Cloudflare Workers](https://github.com/csznet/tgState/actions/workflows/deploy-cloudflare.yml/badge.svg)](https://github.com/csznet/tgState/actions/workflows/deploy-cloudflare.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

一个部署在 Cloudflare Workers 上的文件外链系统，使用 Telegram 作为存储后端，提供快速、可靠的文件分享服务。

## ✨ 特性

- 🚀 **无服务器架构** - 基于 Cloudflare Workers，全球加速
- 📁 **文件上传** - 支持拖拽上传、点击上传
- 🔗 **直链访问** - 生成永久直链，支持外链引用
- 🔐 **密码保护** - 可选的访问密码保护
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🌐 **自定义域名** - 支持绑定自定义域名
- 📊 **API 接口** - RESTful API，支持程序化调用
- 🔍 **健康监控** - 内置健康检查和版本信息端点
- 🛡️ **安全可靠** - 完善的错误处理和日志记录

## 🚀 快速开始

### 1. 准备工作

#### Telegram 配置

##### 🤖 创建 Telegram Bot
1. 在 Telegram 中搜索并联系 [@BotFather](https://t.me/BotFather)
2. 发送 `/start` 命令开始
3. 发送 `/newbot` 创建新的机器人
4. 按提示输入机器人名称（显示名称）
   ```
   例如: tgState File Bot
   ```
5. 输入机器人用户名（必须以 bot 结尾）
   ```
   例如: tgstate_files_bot
   ```
6. 创建成功后，BotFather 会返回 Bot Token
   ```
   示例格式: 1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
   ```
7. **重要**: 保存好这个 Token，不要泄露给他人

##### 📂 设置存储目标

选择以下方式之一作为文件存储位置：

**选项 A: 使用频道（推荐）**
1. 创建一个新的 Telegram 频道
2. 将频道设为私有或公开
3. 将你的 Bot 添加为频道管理员：
   - 频道设置 → 管理员 → 添加管理员
   - 搜索你的 Bot 用户名并添加
   - 给予 "发送消息" 权限
4. 获取频道用户名或 ID：
   - **公开频道**: 使用 `@channelname` 格式
   - **私有频道**: 使用频道 ID（负数，如 `-1001234567890`）

**选项 B: 使用群组**
1. 创建一个新的 Telegram 群组
2. 将你的 Bot 添加到群组
3. 将 Bot 设为群组管理员（可选，但推荐）
4. 获取群组用户名或 ID：
   - **公开群组**: 使用 `@groupname` 格式
   - **私有群组**: 使用群组 ID（负数）

**选项 C: 使用个人聊天**
1. 与你的 Bot 开始私聊
2. 发送 `/start` 命令
3. 获取你的 Telegram 用户 ID：
   - 联系 [@getmyid_bot](https://t.me/getmyid_bot)
   - 或联系 [@userinfobot](https://t.me/userinfobot)
   - 使用返回的数字 ID（正数，如 `123456789`）

##### 🔍 获取频道/群组 ID 的方法

如果你需要获取私有频道或群组的 ID：

**方法 1: 使用 Bot API**
```bash
# 将 Bot 添加到频道/群组后，发送一条消息，然后访问：
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates

# 在返回的 JSON 中找到 "chat" -> "id" 字段
```

**方法 2: 使用第三方 Bot**
1. 将 [@getidsbot](https://t.me/getidsbot) 添加到频道/群组
2. 发送任意消息
3. Bot 会回复频道/群组的 ID

**方法 3: 转发消息法**
1. 从目标频道/群组转发一条消息给 [@getmyid_bot](https://t.me/getmyid_bot)
2. Bot 会返回频道/群组的详细信息

#### Cloudflare 配置

##### 📋 获取 Cloudflare API Token
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击右上角头像 → **"My Profile"**
3. 选择 **"API Tokens"** 选项卡
4. 点击 **"Create Token"** 按钮
5. 选择 **"Edit Cloudflare Workers"** 模板
   - 或者点击 **"Get started"** 使用预设模板
6. 配置权限（如果使用自定义模板）：
   - **Permissions**:
     - `Account` - `Cloudflare Workers:Edit`
     - `Zone` - `Zone Settings:Read, Zone:Read` (仅在使用自定义域名时需要)
   - **Account Resources**:
     - `Include` - `All accounts` 或选择特定账户
   - **Zone Resources** (可选):
     - `Include` - `All zones` 或选择特定域名
7. 点击 **"Continue to summary"**
8. 检查权限摘要，点击 **"Create Token"**
9. **重要**: 复制生成的 Token（只显示一次）
   ```
   示例格式: abc123def456ghi789...
   ```

##### 🆔 获取 Cloudflare Account ID
1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) 主页
2. 在右侧边栏找到 **"Account ID"**
3. 点击 **"Click to copy"** 复制 Account ID
   ```
   示例格式: 1a2b3c4d5e6f7g8h9i0j
   ```

##### 🔍 验证配置
```bash
# 验证 API Token 是否有效
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type:application/json"

# 或使用 wrangler CLI
npx wrangler whoami
```

### 2. 部署方式

#### 方式一：GitHub Actions 自动部署（推荐）

1. **Fork 此仓库**

2. **设置 GitHub Secrets**：

   **📍 设置路径**: 你的仓库 → Settings → Secrets and variables → Actions

   **🔐 添加以下 Secrets**:
   
   | Secret 名称 | 值 | 说明 |
   |------------|----|----|
   | `CLOUDFLARE_API_TOKEN` | `abc123def456...` | [获取方法](#-获取-cloudflare-api-token) |
   | `CLOUDFLARE_ACCOUNT_ID` | `1a2b3c4d5e6f...` | [获取方法](#-获取-cloudflare-account-id) |
   | `TELEGRAM_BOT_TOKEN` | `1234567890:ABC...` | [获取方法](#-创建-telegram-bot) |
   | `TELEGRAM_TARGET` | `@mychannel` 或 `123456789` | [设置方法](#-设置存储目标) |
   | `ACCESS_PASSWORD` | `your-password` | 可选，网站访问密码 |

   **📝 详细设置步骤**:
   1. 进入你的 GitHub 仓库页面
   2. 点击 **Settings** 选项卡
   3. 在左侧菜单中选择 **Secrets and variables** → **Actions**
   4. 点击 **New repository secret** 按钮
   5. 输入 Secret 名称和对应的值
   6. 点击 **Add secret** 保存
   7. 重复步骤 4-6，添加所有必需的 Secrets

   **⚠️ 注意事项**:
   - Secrets 一旦保存就无法查看，只能更新
   - 确保 Token 和 ID 没有多余的空格
   - TELEGRAM_TARGET 格式要正确（@username 或纯数字 ID）

3. **设置 GitHub Variables**（可选）：

   **📍 设置路径**: 你的仓库 → Settings → Secrets and variables → Actions → Variables

   **🔧 添加以下 Variables**:
   
   | Variable 名称 | 值 | 说明 |
   |--------------|----|----|
   | `RUN_MODE` | `p` 或 `m` | `p`=网盘模式（默认），`m`=私聊模式 |
   | `CUSTOM_DOMAIN` | `https://files.example.com` | 自定义域名（可选） |

   **📝 详细设置步骤**:
   1. 在 Secrets and variables → Actions 页面
   2. 点击 **Variables** 选项卡
   3. 点击 **New repository variable** 按钮
   4. 输入 Variable 名称和对应的值
   5. 点击 **Add variable** 保存

   **💡 运行模式说明**:
   - `p` (网盘模式): 允许通过网页界面上传文件
   - `m` (私聊模式): 关闭网页上传，仅支持 API 和 Telegram 私聊上传

4. **推送代码触发部署**：
   ```bash
   git push origin main
   ```

#### 方式二：本地部署

1. **克隆仓库**：
   ```bash
   git clone https://github.com/csznet/tgState.git
   cd tgState
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **配置环境变量**：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件
   ```

4. **部署**：
   ```bash
   npm run deploy:prod
   ```

### 3. 验证部署

访问以下端点验证部署：
- `https://your-worker.workers.dev/health` - 健康检查
- `https://your-worker.workers.dev/version` - 版本信息
- `https://your-worker.workers.dev/` - 主页

## 📖 使用说明

### Web 界面

1. 访问部署的 URL
2. 如果设置了密码，输入密码登录
3. 拖拽文件到上传区域或点击选择文件
4. 获得永久直链

### API 调用

#### 上传文件
```bash
curl -X POST https://your-worker.workers.dev/api \\
  -F "image=@/path/to/file.jpg"
```

#### 带密码上传
```bash
curl -X POST "https://your-worker.workers.dev/api?pass=yourpassword" \\
  -F "image=@/path/to/file.jpg"
```

#### 响应格式
```json
{
  "success": true,
  "timestamp": "2024-10-19T12:00:00.000Z",
  "code": 1,
  "message": "/d/BAADBAADrwADBREAAYag2HL...",
  "url": "https://your-worker.workers.dev/d/BAADBAADrwADBREAAYag2HL..."
}
```

## ⚙️ 配置选项详解

### 🔧 环境变量说明

| 环境变量 | 必需 | 说明 | 示例值 | 获取方法 |
|---------|------|------|--------|----------|
| `TOKEN` | ✅ | Telegram Bot Token | `1234567890:ABC...` | [创建 Bot](#-创建-telegram-bot) |
| `TARGET` | ✅ | 存储目标 | `@mychannel` 或 `123456789` | [设置存储目标](#-设置存储目标) |
| `PASS` | ❌ | 访问密码 | `mypassword` | 自定义设置 |
| `MODE` | ❌ | 运行模式 | `p` (默认) 或 `m` | 根据需求选择 |
| `URL` | ❌ | 自定义域名 | `https://files.example.com` | Cloudflare 域名设置 |

### 📋 配置项详细说明

#### TOKEN (Telegram Bot Token)
- **格式**: `数字:字母数字组合`
- **示例**: `1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ`
- **获取**: 通过 [@BotFather](https://t.me/BotFather) 创建 Bot 时获得
- **注意**: 请妥善保管，不要泄露

#### TARGET (存储目标)
- **频道格式**: `@channelname` (公开) 或 `-1001234567890` (私有)
- **群组格式**: `@groupname` (公开) 或 `-1001234567890` (私有)  
- **个人格式**: `123456789` (正数用户 ID)
- **要求**: Bot 必须有发送消息的权限

#### PASS (访问密码)
- **用途**: 网站访问密码保护
- **格式**: 任意字符串
- **留空**: 表示无密码保护
- **特殊值**: `none` 也表示无密码

#### MODE (运行模式)
- **`p` (网盘模式)**:
  - ✅ 允许网页上传文件
  - ✅ 支持 API 上传
  - ✅ 支持 Telegram 私聊上传
  - 🎯 适合公共文件分享服务

- **`m` (私聊模式)**:
  - ❌ 禁用网页上传
  - ✅ 支持 API 上传
  - ✅ 支持 Telegram 私聊上传
  - 🎯 适合私人文件存储

#### URL (自定义域名)
- **格式**: `https://your-domain.com`
- **用途**: 替换默认的 Workers 域名
- **设置**: 需要在 Cloudflare 中绑定域名
- **留空**: 使用默认 `*.workers.dev` 域名

### 运行模式说明
- `p` (网盘模式): 允许通过网页上传文件
- `m` (私聊模式): 关闭网页上传，仅支持 API 调用

## 🛠️ 开发

### 本地开发
```bash
npm run dev
```

### 代码检查
```bash
npm run lint
npm run format
npm run type-check
```

### 运行测试
```bash
npm test
```

## 📊 监控端点

- `GET /health` - 健康检查
- `GET /ping` - 简单 ping 检查
- `GET /version` - 版本信息

## 🔧 高级配置

### 自定义域名
1. 在 Cloudflare Dashboard 添加自定义域名
2. 更新环境变量 `URL`

### KV 存储（可选）
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

### D1 数据库（可选）
```toml
[[d1_databases]]
binding = "DB"
database_name = "tgstate-db"
database_id = "your-database-id"
```

## 📝 注意事项

- **文件大小限制**: Cloudflare Workers 限制 100MB
- **并发限制**: 免费版有并发请求限制
- **存储**: 文件存储在 Telegram，Workers 仅作代理
- **缓存**: 建议配置 Cloudflare 缓存规则

## 🔍 故障排除

### 常见问题解决

#### 1. 🚨 部署相关问题

**问题**: `Authentication error` 或 `Invalid API token`
- **原因**: Cloudflare API Token 无效或权限不足
- **解决方案**:
  ```bash
  # 验证 API Token
  curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
       -H "Authorization: Bearer YOUR_API_TOKEN"
  
  # 或使用 wrangler
  npx wrangler whoami
  ```
- **检查项**:
  - ✅ API Token 是否正确复制（无多余空格）
  - ✅ Token 权限是否包含 `Cloudflare Workers:Edit`
  - ✅ Account ID 是否正确

**问题**: `Account ID not found`
- **原因**: Account ID 错误或格式不正确
- **解决方案**: 重新从 Cloudflare Dashboard 复制 Account ID
- **验证方法**:
  ```bash
  # Account ID 应该是 32 位的十六进制字符串
  # 格式: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
  ```

#### 2. 📱 Telegram 相关问题

**问题**: `Bot token invalid` 或 `Unauthorized`
- **原因**: Bot Token 错误或 Bot 被删除
- **解决方案**:
  ```bash
  # 验证 Bot Token
  curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
  ```
- **检查项**:
  - ✅ Bot Token 格式正确（数字:字母）
  - ✅ Bot 未被 BotFather 删除
  - ✅ Token 完整复制（包含冒号）

**问题**: `Chat not found` 或无法发送消息
- **原因**: Bot 未添加到目标频道/群组，或权限不足
- **解决方案**:
  1. 确认 Bot 已添加到目标位置
  2. 给予 Bot 发送消息权限
  3. 验证 TARGET 格式：
     - 频道: `@channelname` 或 `-1001234567890`
     - 群组: `@groupname` 或 `-1001234567890`  
     - 个人: `123456789`

**问题**: 获取不到频道/群组 ID
- **解决方案**:
  ```bash
  # 方法1: 添加 Bot 后发送消息，然后访问
  https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
  
  # 方法2: 使用 @getidsbot
  # 将此 Bot 添加到频道/群组，发送消息获取 ID
  ```

#### 3. 🌐 访问相关问题

**问题**: 403 Forbidden 错误
- **原因**: 密码设置或运行模式限制
- **解决方案**:
  - 检查 `ACCESS_PASSWORD` 设置
  - 确认 `RUN_MODE` 配置
  - 验证访问 URL 是否正确

**问题**: 健康检查失败
- **原因**: Worker 启动失败或环境变量配置错误
- **解决方案**:
  ```bash
  # 检查 Worker 状态
  npx wrangler list
  
  # 查看实时日志
  npx wrangler tail
  
  # 手动健康检查
  curl https://your-domain.com/health
  ```

#### 4. 🔧 配置验证工具

**一键检查脚本**:
```bash
# 使用项目提供的检查脚本
./scripts/check-deployment-status.sh

# 检查特定环境
./scripts/check-deployment-status.sh production
```

**手动验证命令**:
```bash
# 验证 Cloudflare 配置
npx wrangler whoami
npx wrangler list

# 验证 Telegram 配置  
curl "https://api.telegram.org/bot$TOKEN/getMe"
curl "https://api.telegram.org/bot$TOKEN/getChat?chat_id=$TARGET"

# 验证部署状态
curl "https://your-domain.com/health"
curl "https://your-domain.com/version"
```

### 查看日志
在 Cloudflare Dashboard > Workers & Pages > 你的Worker > Logs

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🔗 相关链接

- [原项目 (Go 版本)](https://github.com/csznet/tgState)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## 📞 支持

- 📧 Issues: [GitHub Issues](https://github.com/csznet/tgState/issues)
- 💬 Telegram: [@tgstate123](https://t.me/tgstate123)

## ✅ 配置检查清单

在部署前，请确认以下配置已正确设置：

### 🔐 Cloudflare 配置
- [ ] 已获取 Cloudflare API Token
- [ ] API Token 权限包含 `Cloudflare Workers:Edit`
- [ ] 已获取正确的 Account ID (32位十六进制)
- [ ] 可以通过 `npx wrangler whoami` 验证身份

### 📱 Telegram 配置  
- [ ] 已通过 BotFather 创建 Bot
- [ ] 已获取 Bot Token (格式: `数字:字母`)
- [ ] Bot 已添加到目标频道/群组/个人聊天
- [ ] Bot 具有发送消息权限
- [ ] TARGET 格式正确 (`@username` 或数字ID)

### 🔧 GitHub 配置
- [ ] 已 Fork 仓库到个人账户
- [ ] 已设置所有必需的 GitHub Secrets
- [ ] 已设置 GitHub Variables (可选)
- [ ] 仓库 Actions 权限已启用

### 🚀 部署验证
- [ ] 推送代码后 GitHub Actions 成功运行
- [ ] 可以访问 `/health` 端点
- [ ] 可以访问 `/version` 端点  
- [ ] 文件上传功能正常工作

### 🛠️ 可选配置
- [ ] 自定义域名已绑定 (如需要)
- [ ] 访问密码已设置 (如需要)
- [ ] Slack 通知已配置 (如需要)
- [ ] KV 存储已配置 (如需要缓存)

**💡 提示**: 使用 `./scripts/setup-github-actions.sh` 脚本可以自动完成大部分配置！

---

⭐ 如果这个项目对你有帮助，请给个 Star！