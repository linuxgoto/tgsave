#!/bin/bash

# tgState GitHub Actions 自动部署设置脚本
# 使用方法: ./scripts/setup-github-actions.sh

set -e

echo "🚀 tgState GitHub Actions 自动部署设置"
echo "========================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必需的工具
check_requirements() {
    echo -e "${BLUE}📋 检查必需工具...${NC}"
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git 未安装${NC}"
        exit 1
    fi
    
    if ! command -v gh &> /dev/null; then
        echo -e "${YELLOW}⚠️  GitHub CLI 未安装，将跳过自动设置 Secrets${NC}"
        echo -e "${YELLOW}   请手动在 GitHub 仓库中设置 Secrets${NC}"
        GH_AVAILABLE=false
    else
        GH_AVAILABLE=true
    fi
    
    echo -e "${GREEN}✅ 工具检查完成${NC}"
}

# 收集配置信息
collect_config() {
    echo -e "\n${BLUE}📝 收集配置信息...${NC}"
    
    # Cloudflare 配置
    echo -e "\n${YELLOW}🔧 Cloudflare 配置${NC}"
    read -p "请输入 Cloudflare API Token: " CLOUDFLARE_API_TOKEN
    read -p "请输入 Cloudflare Account ID: " CLOUDFLARE_ACCOUNT_ID
    
    # Telegram 配置
    echo -e "\n${YELLOW}📱 Telegram 配置${NC}"
    read -p "请输入 Telegram Bot Token: " TELEGRAM_BOT_TOKEN
    read -p "请输入 Telegram Target (频道/群组/用户ID): " TELEGRAM_TARGET
    
    # 可选配置
    echo -e "\n${YELLOW}🔒 可选配置${NC}"
    read -p "请输入访问密码 (可选，直接回车跳过): " ACCESS_PASSWORD
    read -p "请输入自定义域名 (可选，直接回车跳过): " CUSTOM_DOMAIN
    read -p "请输入运行模式 (p=网盘模式, m=私聊模式, 默认p): " RUN_MODE
    RUN_MODE=${RUN_MODE:-p}
    
    # 通知配置
    echo -e "\n${YELLOW}📢 通知配置${NC}"
    read -p "请输入 Slack Webhook URL (可选，直接回车跳过): " SLACK_WEBHOOK_URL
}

# 验证配置
validate_config() {
    echo -e "\n${BLUE}✅ 验证配置...${NC}"
    
    if [[ -z "$CLOUDFLARE_API_TOKEN" ]]; then
        echo -e "${RED}❌ Cloudflare API Token 不能为空${NC}"
        exit 1
    fi
    
    if [[ -z "$CLOUDFLARE_ACCOUNT_ID" ]]; then
        echo -e "${RED}❌ Cloudflare Account ID 不能为空${NC}"
        exit 1
    fi
    
    if [[ -z "$TELEGRAM_BOT_TOKEN" ]]; then
        echo -e "${RED}❌ Telegram Bot Token 不能为空${NC}"
        exit 1
    fi
    
    if [[ -z "$TELEGRAM_TARGET" ]]; then
        echo -e "${RED}❌ Telegram Target 不能为空${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 配置验证通过${NC}"
}

# 设置 GitHub Secrets
setup_github_secrets() {
    if [[ "$GH_AVAILABLE" == "true" ]]; then
        echo -e "\n${BLUE}🔐 设置 GitHub Secrets...${NC}"
        
        # 检查是否已登录 GitHub CLI
        if ! gh auth status &> /dev/null; then
            echo -e "${YELLOW}⚠️  请先登录 GitHub CLI: gh auth login${NC}"
            return 1
        fi
        
        # 设置必需的 Secrets
        echo "设置 CLOUDFLARE_API_TOKEN..."
        echo "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN
        
        echo "设置 CLOUDFLARE_ACCOUNT_ID..."
        echo "$CLOUDFLARE_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID
        
        echo "设置 TELEGRAM_BOT_TOKEN..."
        echo "$TELEGRAM_BOT_TOKEN" | gh secret set TELEGRAM_BOT_TOKEN
        
        echo "设置 TELEGRAM_TARGET..."
        echo "$TELEGRAM_TARGET" | gh secret set TELEGRAM_TARGET
        
        # 设置可选的 Secrets
        if [[ -n "$ACCESS_PASSWORD" ]]; then
            echo "设置 ACCESS_PASSWORD..."
            echo "$ACCESS_PASSWORD" | gh secret set ACCESS_PASSWORD
        fi
        
        if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
            echo "设置 SLACK_WEBHOOK_URL..."
            echo "$SLACK_WEBHOOK_URL" | gh secret set SLACK_WEBHOOK_URL
        fi
        
        # 设置 Variables
        if [[ -n "$CUSTOM_DOMAIN" ]]; then
            echo "设置 CUSTOM_DOMAIN..."
            gh variable set CUSTOM_DOMAIN --body "$CUSTOM_DOMAIN"
        fi
        
        echo "设置 RUN_MODE..."
        gh variable set RUN_MODE --body "$RUN_MODE"
        
        echo -e "${GREEN}✅ GitHub Secrets 设置完成${NC}"
    else
        echo -e "\n${YELLOW}📋 请手动设置以下 GitHub Secrets:${NC}"
        echo "========================================"
        echo "必需的 Secrets:"
        echo "- CLOUDFLARE_API_TOKEN: $CLOUDFLARE_API_TOKEN"
        echo "- CLOUDFLARE_ACCOUNT_ID: $CLOUDFLARE_ACCOUNT_ID"
        echo "- TELEGRAM_BOT_TOKEN: $TELEGRAM_BOT_TOKEN"
        echo "- TELEGRAM_TARGET: $TELEGRAM_TARGET"
        
        if [[ -n "$ACCESS_PASSWORD" ]]; then
            echo "- ACCESS_PASSWORD: $ACCESS_PASSWORD"
        fi
        
        if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
            echo "- SLACK_WEBHOOK_URL: $SLACK_WEBHOOK_URL"
        fi
        
        echo ""
        echo "Variables:"
        echo "- RUN_MODE: $RUN_MODE"
        
        if [[ -n "$CUSTOM_DOMAIN" ]]; then
            echo "- CUSTOM_DOMAIN: $CUSTOM_DOMAIN"
        fi
        
        echo ""
        echo "设置路径: 仓库 → Settings → Secrets and variables → Actions"
    fi
}

# 创建环境文件
create_env_file() {
    echo -e "\n${BLUE}📄 创建本地环境文件...${NC}"
    
    cat > .env.local << EOF
# tgState 本地开发环境配置
# 此文件不会被提交到 Git

# Cloudflare 配置
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID

# Telegram 配置
TOKEN=$TELEGRAM_BOT_TOKEN
TARGET=$TELEGRAM_TARGET

# 可选配置
PASS=${ACCESS_PASSWORD:-}
MODE=${RUN_MODE:-p}
URL=${CUSTOM_DOMAIN:-}

# 开发配置
NODE_ENV=development
EOF

    echo -e "${GREEN}✅ 已创建 .env.local 文件${NC}"
    echo -e "${YELLOW}⚠️  请不要将 .env.local 文件提交到 Git${NC}"
}

# 验证 GitHub Actions 工作流
validate_workflows() {
    echo -e "\n${BLUE}🔍 验证 GitHub Actions 工作流...${NC}"
    
    WORKFLOW_FILES=(
        ".github/workflows/deploy-cloudflare.yml"
        ".github/workflows/ci.yml"
        ".github/workflows/release.yml"
        ".github/workflows/cleanup.yml"
    )
    
    for file in "${WORKFLOW_FILES[@]}"; do
        if [[ -f "$file" ]]; then
            echo -e "${GREEN}✅ $file${NC}"
        else
            echo -e "${RED}❌ $file 不存在${NC}"
        fi
    done
}

# 测试部署配置
test_deployment() {
    echo -e "\n${BLUE}🧪 测试部署配置...${NC}"
    
    if command -v npx &> /dev/null; then
        echo "验证 wrangler 配置..."
        
        # 创建临时 wrangler.toml 用于测试
        cat > wrangler.toml.test << EOF
name = "tgstate-test"
main = "src/worker.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
TOKEN = "$TELEGRAM_BOT_TOKEN"
TARGET = "$TELEGRAM_TARGET"
PASS = "${ACCESS_PASSWORD:-}"
MODE = "${RUN_MODE:-p}"
URL = "${CUSTOM_DOMAIN:-}"
EOF
        
        if npx wrangler validate wrangler.toml.test; then
            echo -e "${GREEN}✅ Wrangler 配置验证通过${NC}"
        else
            echo -e "${YELLOW}⚠️  Wrangler 配置验证失败，请检查配置${NC}"
        fi
        
        rm -f wrangler.toml.test
    else
        echo -e "${YELLOW}⚠️  未安装 Node.js/npm，跳过 wrangler 验证${NC}"
    fi
}

# 显示下一步操作
show_next_steps() {
    echo -e "\n${GREEN}🎉 设置完成！${NC}"
    echo "========================================"
    echo -e "${BLUE}📋 下一步操作:${NC}"
    echo ""
    echo "1. 提交并推送代码到 GitHub:"
    echo "   git add ."
    echo "   git commit -m \"feat: setup GitHub Actions auto deployment\""
    echo "   git push origin main"
    echo ""
    echo "2. 查看 GitHub Actions 运行状态:"
    echo "   访问: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
    echo ""
    echo "3. 部署完成后访问应用:"
    if [[ -n "$CUSTOM_DOMAIN" ]]; then
        echo "   生产环境: $CUSTOM_DOMAIN"
        echo "   健康检查: $CUSTOM_DOMAIN/health"
    else
        echo "   生产环境: https://tgstate-prod.$CLOUDFLARE_ACCOUNT_ID.workers.dev"
        echo "   健康检查: https://tgstate-prod.$CLOUDFLARE_ACCOUNT_ID.workers.dev/health"
    fi
    echo ""
    echo "4. 监控和维护:"
    echo "   - GitHub Actions 会自动运行 CI/CD"
    echo "   - 每周自动清理和维护"
    echo "   - 查看 Cloudflare Dashboard 了解详细信息"
    echo ""
    echo -e "${YELLOW}📚 更多信息请查看: docs/DEPLOYMENT.md${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}开始设置 tgState GitHub Actions 自动部署...${NC}"
    
    check_requirements
    collect_config
    validate_config
    setup_github_secrets
    create_env_file
    validate_workflows
    test_deployment
    show_next_steps
    
    echo -e "\n${GREEN}🚀 设置完成！祝你使用愉快！${NC}"
}

# 运行主函数
main "$@"