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
1. 创建 Telegram Bot：
   - 联系 [@BotFather](https://t.me/BotFather)
   - 发送 `/newbot` 创建机器人
   - 获取 Bot Token

2. 设置存储目标：
   - **频道**：创建频道，添加 Bot 为管理员
   - **群组**：创建群组，添加 Bot 到群组
   - **个人**：获取你的 Telegram ID

#### Cloudflare 配置
1. 获取 [Cloudflare API Token](https://dash.cloudflare.com/profile/api-tokens)
2. 获取 Account ID（在 Cloudflare Dashboard 右侧）

### 2. 部署方式

#### 方式一：GitHub Actions 自动部署（推荐）

1. **Fork 此仓库**

2. **设置 GitHub Secrets**：
   ```
   CLOUDFLARE_API_TOKEN=your-api-token
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   TELEGRAM_BOT_TOKEN=your-bot-token
   TELEGRAM_TARGET=@yourchannel
   ACCESS_PASSWORD=your-password (可选)
   ```

3. **设置 GitHub Variables**（可选）：
   ```
   RUN_MODE=p (p=网盘模式, m=私聊模式)
   CUSTOM_DOMAIN=https://files.example.com
   ```

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

## ⚙️ 配置选项

| 环境变量 | 必需 | 说明 | 示例 |
|---------|------|------|------|
| `TOKEN` | ✅ | Telegram Bot Token | `1234567890:ABC...` |
| `TARGET` | ✅ | 存储目标 | `@mychannel` |
| `PASS` | ❌ | 访问密码 | `mypassword` |
| `MODE` | ❌ | 运行模式 | `p` (默认) 或 `m` |
| `URL` | ❌ | 自定义域名 | `https://files.example.com` |

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

### 常见问题

1. **部署失败**
   - 检查 API Token 权限
   - 确认 Account ID 正确

2. **文件上传失败**
   - 检查 Bot Token
   - 确认 Bot 已添加到目标频道/群组

3. **403 错误**
   - 检查密码设置
   - 确认运行模式

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

---

⭐ 如果这个项目对你有帮助，请给个 Star！