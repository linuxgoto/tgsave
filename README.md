(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/README-Cloudflare.md b/README-Cloudflare.md
--- a/README-Cloudflare.md
+++ b/README-Cloudflare.md
@@ -0,0 +1,196 @@
+# tgState Cloudflare Workers 部署指南
+
+这是 tgState 项目的 Cloudflare Workers 版本，支持通过 GitHub Actions 自动部署。
+
+## 🚀 快速开始
+
+### 1. 准备工作
+
+#### 1.1 Cloudflare 账户设置
+1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
+2. 获取 **Account ID**：在右侧边栏可以找到
+3. 创建 **API Token**：
+   - 进入 "My Profile" > "API Tokens"
+   - 点击 "Create Token"
+   - 使用 "Edit Cloudflare Workers" 模板
+   - 或者自定义权限：
+     - Account: `Cloudflare Workers:Edit`
+     - Zone: `Zone Settings:Read, Zone:Read` (如果使用自定义域名)
+
+#### 1.2 Telegram 设置
+1. 创建 Telegram Bot：
+   - 联系 [@BotFather](https://t.me/BotFather)
+   - 发送 `/newbot` 创建新机器人
+   - 获取 Bot Token
+2. 设置存储目标：
+   - **频道**：创建频道，将 Bot 添加为管理员，获取频道用户名（如 @mychannel）
+   - **群组**：创建群组，将 Bot 添加到群组，获取群组用户名（如 @mygroup）
+   - **个人**：获取你的 Telegram ID（可通过 [@getmyid_bot](https://t.me/getmyid_bot) 获取）
+
+### 2. GitHub 仓库配置
+
+#### 2.1 Fork 或 Clone 仓库
+```bash
+git clone https://github.com/csznet/tgState.git
+cd tgState
+```
+
+#### 2.2 设置 GitHub Secrets
+在 GitHub 仓库设置中添加以下 Secrets：
+
+**必需的 Secrets：**
+- `CLOUDFLARE_API_TOKEN`：你的 Cloudflare API Token
+- `CLOUDFLARE_ACCOUNT_ID`：你的 Cloudflare Account ID
+- `TELEGRAM_BOT_TOKEN`：你的 Telegram Bot Token
+- `TELEGRAM_TARGET`：存储目标（频道用户名、群组用户名或个人ID）
+
+**可选的 Secrets：**
+- `ACCESS_PASSWORD`：访问密码（留空或设为 "none" 表示无密码）
+
+#### 2.3 设置 GitHub Variables（可选）
+在 GitHub 仓库设置中添加以下 Variables：
+
+- `RUN_MODE`：运行模式
+  - `p`：网盘模式（默认），允许网页上传
+  - `m`：私聊模式，关闭网页上传，只能通过 Telegram 私聊上传
+- `CUSTOM_DOMAIN`：自定义域名（如 `https://files.example.com`）
+
+### 3. 部署
+
+#### 3.1 自动部署
+推送代码到 `main` 或 `master` 分支即可触发自动部署：
+
+```bash
+git add .
+git commit -m "Deploy tgState to Cloudflare Workers"
+git push origin main
+```
+
+#### 3.2 手动部署
+也可以在 GitHub Actions 页面手动触发部署。
+
+### 4. 配置自定义域名（可选）
+
+1. 在 Cloudflare Dashboard 中进入 "Workers & Pages"
+2. 选择你的 Worker (`tgstate-prod`)
+3. 进入 "Settings" > "Triggers"
+4. 添加自定义域名
+5. 更新 GitHub Variables 中的 `CUSTOM_DOMAIN`
+
+### 5. 高级配置
+
+#### 5.1 KV 存储（可选）
+如果需要缓存功能，可以启用 KV 存储：
+
+1. 取消注释 `wrangler.toml` 中的 KV 配置
+2. 在 Cloudflare Dashboard 中创建 KV namespace
+3. 更新配置文件中的 namespace ID
+
+#### 5.2 环境变量管理
+环境变量可以在以下位置管理：
+- **GitHub Secrets/Variables**：用于 CI/CD 部署
+- **Cloudflare Dashboard**：Workers & Pages > 你的Worker > Settings > Environment variables
+
+## 📋 环境变量说明
+
+| 变量名 | 必需 | 说明 | 示例 |
+|--------|------|------|------|
+| `TOKEN` | ✅ | Telegram Bot Token | `1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ` |
+| `TARGET` | ✅ | 存储目标 | `@mychannel` 或 `123456789` |
+| `PASS` | ❌ | 访问密码 | `mypassword` 或 `none` |
+| `MODE` | ❌ | 运行模式 | `p`（默认）或 `m` |
+| `URL` | ❌ | 自定义域名 | `https://files.example.com` |
+
+## 🔧 功能特性
+
+- ✅ 文件上传（拖拽上传、点击上传）
+- ✅ 文件下载（通过链接直接访问）
+- ✅ 密码保护
+- ✅ API 接口
+- ✅ 响应式 Web 界面
+- ✅ 全球 CDN 加速
+- ✅ 自动扩缩容
+- ✅ 无服务器架构
+
+## 📡 API 使用
+
+### 上传文件
+```bash
+curl -X POST https://your-worker.your-subdomain.workers.dev/api \
+  -F "image=@/path/to/file.jpg"
+```
+
+### 带密码上传
+```bash
+curl -X POST "https://your-worker.your-subdomain.workers.dev/api?pass=yourpassword" \
+  -F "image=@/path/to/file.jpg"
+```
+
+### 响应格式
+```json
+{
+  "code": 1,
+  "message": "/d/BAADBAADrwADBREAAYag2HL...",
+  "url": "https://your-worker.your-subdomain.workers.dev/d/BAADBAADrwADBREAAYag2HL..."
+}
+```
+
+## 🛠️ 本地开发
+
+```bash
+# 安装依赖
+npm install
+
+# 本地开发
+npm run dev
+
+# 部署到开发环境
+npm run deploy
+
+# 部署到生产环境
+npm run deploy:prod
+```
+
+## 📝 注意事项
+
+1. **文件大小限制**：Cloudflare Workers 请求体限制为 100MB
+2. **并发限制**：免费版有并发请求限制
+3. **存储**：文件实际存储在 Telegram，Workers 只是代理
+4. **缓存**：建议配置 Cloudflare 缓存规则优化性能
+
+## 🔍 故障排除
+
+### 常见问题
+
+1. **部署失败**
+   - 检查 API Token 权限
+   - 确认 Account ID 正确
+   - 查看 GitHub Actions 日志
+
+2. **文件上传失败**
+   - 检查 Bot Token 是否正确
+   - 确认 Bot 已添加到目标频道/群组
+   - 检查目标 ID 格式
+
+3. **访问 403 错误**
+   - 检查密码设置
+   - 确认运行模式配置
+
+### 日志查看
+在 Cloudflare Dashboard 中可以查看 Worker 的实时日志：
+Workers & Pages > 你的Worker > Logs
+
+## 📄 许可证
+
+本项目遵循原项目的开源许可证。
+
+## 🤝 贡献
+
+欢迎提交 Issue 和 Pull Request！
+
+## 📞 支持
+
+如有问题，可以：
+1. 查看 [原项目文档](https://github.com/csznet/tgState)
+2. 提交 GitHub Issue
+3. 联系 Telegram [@tgstate123](https://t.me/tgstate123)
EOF
)
