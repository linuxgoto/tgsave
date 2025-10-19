# 🚀 部署指南

本文档详细介绍如何使用 GitHub Actions 自动部署 tgState 到 Cloudflare Workers。

## 📋 目录

- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [GitHub Secrets 配置](#github-secrets-配置)
- [工作流说明](#工作流说明)
- [部署环境](#部署环境)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 🚀 快速开始

### 1. Fork 仓库

1. 访问 [tgState 仓库](https://github.com/csznet/tgState)
2. 点击右上角的 "Fork" 按钮
3. 选择你的 GitHub 账户

### 2. 获取 Cloudflare 凭据

#### 2.1 获取 API Token
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 "Create Token"
3. 使用 "Edit Cloudflare Workers" 模板，或自定义权限：
   - **Account**: `Cloudflare Workers:Edit`
   - **Zone**: `Zone Settings:Read, Zone:Read` (如果使用自定义域名)
4. 复制生成的 API Token

#### 2.2 获取 Account ID
1. 在 Cloudflare Dashboard 右侧边栏找到 Account ID
2. 复制 Account ID

### 3. 获取 Telegram 配置

#### 3.1 创建 Telegram Bot
1. 联系 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 创建新机器人
3. 按提示设置机器人名称和用户名
4. 获取 Bot Token

#### 3.2 设置存储目标
选择以下方式之一：

**选项 A: 使用频道**
1. 创建 Telegram 频道
2. 将 Bot 添加为管理员
3. 获取频道用户名（如 `@mychannel`）

**选项 B: 使用群组**
1. 创建 Telegram 群组
2. 将 Bot 添加到群组
3. 获取群组用户名（如 `@mygroup`）

**选项 C: 使用个人账户**
1. 联系 [@getmyid_bot](https://t.me/getmyid_bot)
2. 获取你的 Telegram ID（数字）

## ⚙️ 环境配置

### GitHub Secrets 配置

在你的 GitHub 仓库中设置以下 Secrets：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下 Secrets：

#### 必需的 Secrets

| Secret 名称 | 描述 | 示例 |
|------------|------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | `abc123...` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | `def456...` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token | `1234567890:ABC...` |
| `TELEGRAM_TARGET` | 存储目标 | `@mychannel` 或 `123456789` |

#### 可选的 Secrets

| Secret 名称 | 描述 | 默认值 |
|------------|------|--------|
| `ACCESS_PASSWORD` | 访问密码 | 无密码 |
| `KV_NAMESPACE_ID` | KV 存储命名空间 ID | 自动创建 |
| `KV_NAMESPACE_PREVIEW_ID` | KV 预览命名空间 ID | 自动创建 |
| `SLACK_WEBHOOK_URL` | Slack 通知 Webhook | 无通知 |
| `CODECOV_TOKEN` | Codecov 代码覆盖率 | 无上传 |

### GitHub Variables 配置

在 Variables 选项卡中设置：

| Variable 名称 | 描述 | 默认值 |
|--------------|------|--------|
| `RUN_MODE` | 运行模式 (`p`=网盘模式, `m`=私聊模式) | `p` |
| `CUSTOM_DOMAIN` | 自定义域名 | Workers 默认域名 |

## 🔄 工作流说明

### 1. 主部署工作流 (deploy-cloudflare.yml)

**触发条件:**
- 推送到 `main` 或 `master` 分支
- Pull Request 到主分支
- 手动触发

**工作流程:**
1. **代码质量检查** - ESLint, Prettier, 测试
2. **安全检查** - npm audit, CodeQL 分析
3. **开发环境部署** - PR 时部署到开发环境
4. **生产环境部署** - 主分支推送时部署到生产环境
5. **健康检查** - 验证部署是否成功
6. **通知** - 发送部署结果通知

### 2. 持续集成工作流 (ci.yml)

**触发条件:**
- 推送到任何分支
- Pull Request
- 定时任务（每日）

**检查项目:**
- 代码格式和质量
- 单元测试和覆盖率
- 安全漏洞扫描
- 依赖检查
- 构建验证

### 3. 发布工作流 (release.yml)

**触发条件:**
- 推送标签 (v*)
- 手动触发

**功能:**
- 自动创建 GitHub Release
- 生成变更日志
- 部署到生产环境
- 健康检查和通知

### 4. 清理维护工作流 (cleanup.yml)

**触发条件:**
- 定时任务（每周）
- 手动触发

**维护任务:**
- 清理旧的开发环境部署
- 删除过期的 Release
- 清理缓存
- 健康监控
- 依赖更新检查

## 🌍 部署环境

### 开发环境 (Development)
- **URL**: `https://tgstate-dev.{account-id}.workers.dev`
- **触发**: Pull Request
- **用途**: 功能测试和预览

### 生产环境 (Production)
- **URL**: 自定义域名或 `https://tgstate-prod.{account-id}.workers.dev`
- **触发**: 推送到主分支或发布标签
- **用途**: 正式服务

## 📊 监控和维护

### 健康检查端点

部署完成后，可以通过以下端点监控服务状态：

- **健康检查**: `GET /health`
- **版本信息**: `GET /version`
- **Ping 测试**: `GET /ping`

### 日志查看

1. **GitHub Actions 日志**:
   - 仓库 → Actions → 选择工作流运行

2. **Cloudflare Workers 日志**:
   - Cloudflare Dashboard → Workers & Pages → 你的 Worker → Logs

### 自动化维护

系统会自动执行以下维护任务：

- 每日代码质量检查
- 每周清理旧部署和缓存
- 依赖更新检查
- 安全漏洞扫描

## 🔧 自定义配置

### 自定义域名

1. **在 Cloudflare 中配置**:
   - Workers & Pages → 你的 Worker → Settings → Triggers
   - 添加自定义域名

2. **更新 GitHub Variables**:
   - 设置 `CUSTOM_DOMAIN` 为你的域名

### KV 存储配置

如果需要缓存功能：

1. **创建 KV 命名空间**:
   ```bash
   npx wrangler kv:namespace create "CACHE"
   npx wrangler kv:namespace create "CACHE" --preview
   ```

2. **更新 GitHub Secrets**:
   - 设置 `KV_NAMESPACE_ID` 和 `KV_NAMESPACE_PREVIEW_ID`

### 通知配置

#### Slack 通知

1. 创建 Slack Webhook URL
2. 设置 `SLACK_WEBHOOK_URL` Secret
3. 系统会自动发送部署通知

## 🐛 故障排除

### 常见问题

#### 1. 部署失败

**检查项目:**
- ✅ Cloudflare API Token 权限是否正确
- ✅ Account ID 是否正确
- ✅ Telegram Bot Token 是否有效
- ✅ Bot 是否已添加到目标频道/群组

**解决方法:**
```bash
# 验证 wrangler 配置
npx wrangler whoami

# 测试部署
npx wrangler deploy --dry-run
```

#### 2. 健康检查失败

**可能原因:**
- 环境变量配置错误
- Telegram API 连接问题
- Worker 启动时间过长

**解决方法:**
1. 检查 Worker 日志
2. 验证环境变量
3. 手动访问健康检查端点

#### 3. 权限错误

**错误信息**: `Authentication error`

**解决方法:**
1. 重新生成 Cloudflare API Token
2. 确认 Token 权限包含 Workers 编辑权限
3. 检查 Account ID 是否正确

### 调试技巧

#### 1. 本地测试

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint
```

#### 2. 查看部署日志

```bash
# 查看 Worker 日志
npx wrangler tail

# 查看部署状态
npx wrangler list
```

#### 3. 手动部署

```bash
# 手动部署到开发环境
npx wrangler deploy

# 手动部署到生产环境
npx wrangler deploy --env production
```

## 📚 相关文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## 🆘 获取帮助

如果遇到问题，可以：

1. 查看 [GitHub Issues](https://github.com/csznet/tgState/issues)
2. 创建新的 Issue 并提供详细信息
3. 联系 Telegram [@tgstate123](https://t.me/tgstate123)

---

🎉 现在你已经完成了 tgState 的自动化部署配置！推送代码到主分支即可触发自动部署。