# Contributing to tgState Cloudflare Workers

感谢您对 tgState 项目的关注！我们欢迎各种形式的贡献。

## 🚀 快速开始

### 开发环境设置

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/tgState.git
   cd tgState
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入你的配置
   ```

4. **本地开发**
   ```bash
   npm run dev
   ```

## 📋 开发流程

### 代码规范

我们使用以下工具确保代码质量：

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查（可选）

运行代码检查：
```bash
npm run lint
npm run format
npm run type-check
```

### 测试

在提交代码前，请确保所有测试通过：

```bash
npm test
```

添加新功能时，请同时添加相应的测试用例。

### 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型包括：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat(api): add file size validation
fix(ui): resolve upload progress display issue
docs: update deployment instructions
```

## 🔧 项目结构

```
├── src/
│   ├── worker.js          # 主要的 Worker 代码
│   └── utils.js           # 工具函数和错误处理
├── test/
│   ├── worker.test.js     # Worker 测试
│   └── setup.js           # 测试环境设置
├── .github/
│   └── workflows/         # GitHub Actions 工作流
├── package.json           # 项目配置和依赖
├── wrangler.toml          # Cloudflare Workers 配置
├── tsconfig.json          # TypeScript 配置
├── jest.config.js         # Jest 测试配置
└── README.md              # 项目说明
```

## 🐛 报告问题

发现 bug 或有功能建议？请：

1. 检查 [Issues](https://github.com/your-username/tgState/issues) 是否已有相关问题
2. 如果没有，创建新的 Issue，包含：
   - 清晰的问题描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 环境信息（浏览器、Node.js 版本等）

## 📝 提交 Pull Request

1. **Fork 仓库**并创建功能分支：
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **开发和测试**：
   - 编写代码
   - 添加测试
   - 确保所有测试通过
   - 运行代码检查

3. **提交更改**：
   ```bash
   git commit -m "feat: add amazing feature"
   ```

4. **推送到分支**：
   ```bash
   git push origin feature/amazing-feature
   ```

5. **创建 Pull Request**：
   - 提供清晰的标题和描述
   - 关联相关的 Issues
   - 确保 CI 检查通过

## 🎯 贡献指南

### 优先级任务

- 🔒 安全性改进
- 🚀 性能优化
- 📱 移动端体验优化
- 🌐 国际化支持
- 📊 监控和分析功能

### 代码审查

所有 PR 都需要经过代码审查。审查关注：

- 功能正确性
- 代码质量和可读性
- 测试覆盖率
- 性能影响
- 安全性考虑

## 📄 许可证

通过贡献代码，您同意您的贡献将在 MIT 许可证下发布。

## 🤝 行为准则

我们致力于提供一个友好、安全和欢迎所有人的环境。请：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表现出同理心

## 📞 联系我们

有问题或需要帮助？

- 📧 Email: [your-email@example.com]
- 💬 Telegram: [@tgstate123](https://t.me/tgstate123)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/tgState/issues)

感谢您的贡献！🎉