#!/bin/bash

# tgState 部署状态检查脚本
# 使用方法: ./scripts/check-deployment-status.sh [environment]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认环境
ENVIRONMENT=${1:-production}

echo -e "${BLUE}🔍 tgState 部署状态检查${NC}"
echo "========================================"
echo -e "环境: ${YELLOW}$ENVIRONMENT${NC}"
echo ""

# 检查 GitHub Actions 状态
check_github_actions() {
    echo -e "${BLUE}📊 GitHub Actions 状态${NC}"
    
    if command -v gh &> /dev/null; then
        if gh auth status &> /dev/null; then
            echo "最近的工作流运行:"
            gh run list --limit 5 --json status,conclusion,workflowName,createdAt,url \
                --template '{{range .}}{{.workflowName}} | {{.status}} | {{.conclusion}} | {{timeago .createdAt}} | {{.url}}
{{end}}'
        else
            echo -e "${YELLOW}⚠️  GitHub CLI 未登录，跳过 Actions 状态检查${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  GitHub CLI 未安装，跳过 Actions 状态检查${NC}"
    fi
    echo ""
}

# 检查部署 URL
check_deployment_urls() {
    echo -e "${BLUE}🌐 检查部署 URL${NC}"
    
    # 读取环境变量或使用默认值
    if [[ -f ".env.local" ]]; then
        source .env.local
    fi
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if [[ -n "$URL" ]]; then
            DEPLOYMENT_URL="$URL"
        else
            DEPLOYMENT_URL="https://tgstate-prod.${CLOUDFLARE_ACCOUNT_ID}.workers.dev"
        fi
    else
        DEPLOYMENT_URL="https://tgstate-dev.${CLOUDFLARE_ACCOUNT_ID}.workers.dev"
    fi
    
    echo "部署 URL: $DEPLOYMENT_URL"
    
    # 健康检查
    echo -e "\n${YELLOW}🏥 健康检查${NC}"
    HEALTH_URL="$DEPLOYMENT_URL/health"
    
    if curl -f -s "$HEALTH_URL" > /tmp/health_response.json; then
        echo -e "${GREEN}✅ 健康检查通过${NC}"
        
        if command -v jq &> /dev/null; then
            echo "响应详情:"
            cat /tmp/health_response.json | jq .
        else
            echo "响应内容:"
            cat /tmp/health_response.json
        fi
    else
        echo -e "${RED}❌ 健康检查失败${NC}"
        echo "URL: $HEALTH_URL"
    fi
    
    # 版本检查
    echo -e "\n${YELLOW}🏷️  版本信息${NC}"
    VERSION_URL="$DEPLOYMENT_URL/version"
    
    if curl -f -s "$VERSION_URL" > /tmp/version_response.json; then
        if command -v jq &> /dev/null; then
            cat /tmp/version_response.json | jq .
        else
            cat /tmp/version_response.json
        fi
    else
        echo -e "${YELLOW}⚠️  无法获取版本信息${NC}"
    fi
    
    # 性能测试
    echo -e "\n${YELLOW}⚡ 性能测试${NC}"
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$DEPLOYMENT_URL")
    echo "响应时间: ${RESPONSE_TIME}s"
    
    if (( $(echo "$RESPONSE_TIME > 2.0" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${YELLOW}⚠️  响应时间较慢 (>${RESPONSE_TIME}s)${NC}"
    else
        echo -e "${GREEN}✅ 响应时间正常${NC}"
    fi
    
    # 清理临时文件
    rm -f /tmp/health_response.json /tmp/version_response.json
    echo ""
}

# 检查 Cloudflare Workers 状态
check_cloudflare_status() {
    echo -e "${BLUE}☁️  Cloudflare Workers 状态${NC}"
    
    if command -v npx &> /dev/null; then
        if [[ -f "wrangler.toml" ]] || [[ -n "$CLOUDFLARE_API_TOKEN" ]]; then
            echo "Workers 列表:"
            npx wrangler list 2>/dev/null || echo -e "${YELLOW}⚠️  无法获取 Workers 列表，请检查认证${NC}"
            
            echo -e "\n最近的部署:"
            npx wrangler deployments list --name "tgstate-$ENVIRONMENT" 2>/dev/null || echo -e "${YELLOW}⚠️  无法获取部署历史${NC}"
        else
            echo -e "${YELLOW}⚠️  未找到 Cloudflare 配置${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  未安装 Node.js/npm，跳过 Cloudflare 检查${NC}"
    fi
    echo ""
}

# 检查环境配置
check_environment_config() {
    echo -e "${BLUE}⚙️  环境配置检查${NC}"
    
    # 检查必需的环境变量
    REQUIRED_VARS=("CLOUDFLARE_API_TOKEN" "CLOUDFLARE_ACCOUNT_ID" "TELEGRAM_BOT_TOKEN" "TELEGRAM_TARGET")
    
    if [[ -f ".env.local" ]]; then
        source .env.local
        echo "从 .env.local 加载配置"
    fi
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -n "${!var}" ]]; then
            echo -e "${GREEN}✅ $var${NC}: 已设置"
        else
            echo -e "${RED}❌ $var${NC}: 未设置"
        fi
    done
    
    # 检查可选变量
    OPTIONAL_VARS=("ACCESS_PASSWORD" "CUSTOM_DOMAIN" "RUN_MODE")
    
    echo -e "\n可选配置:"
    for var in "${OPTIONAL_VARS[@]}"; do
        if [[ -n "${!var}" ]]; then
            if [[ "$var" == "ACCESS_PASSWORD" ]]; then
                echo -e "${GREEN}✅ $var${NC}: ****"
            else
                echo -e "${GREEN}✅ $var${NC}: ${!var}"
            fi
        else
            echo -e "${YELLOW}⚠️  $var${NC}: 未设置"
        fi
    done
    echo ""
}

# 检查最近的错误
check_recent_errors() {
    echo -e "${BLUE}🚨 最近的错误检查${NC}"
    
    if command -v gh &> /dev/null && gh auth status &> /dev/null; then
        echo "最近失败的工作流:"
        gh run list --status failure --limit 3 --json workflowName,createdAt,url,conclusion \
            --template '{{range .}}{{.workflowName}} | {{.conclusion}} | {{timeago .createdAt}} | {{.url}}
{{end}}' || echo "无最近失败的工作流"
    else
        echo -e "${YELLOW}⚠️  无法检查 GitHub Actions 错误${NC}"
    fi
    
    # 检查 Cloudflare Workers 错误
    if command -v npx &> /dev/null && [[ -n "$CLOUDFLARE_API_TOKEN" ]]; then
        echo -e "\n检查 Workers 日志..."
        # 这里可以添加获取 Workers 日志的逻辑
        echo -e "${YELLOW}💡 提示: 使用 'npx wrangler tail' 查看实时日志${NC}"
    fi
    echo ""
}

# 生成状态报告
generate_status_report() {
    echo -e "${BLUE}📋 状态报告摘要${NC}"
    echo "========================================"
    
    # 总体状态
    if curl -f -s "$DEPLOYMENT_URL/health" > /dev/null 2>&1; then
        echo -e "总体状态: ${GREEN}✅ 正常${NC}"
    else
        echo -e "总体状态: ${RED}❌ 异常${NC}"
    fi
    
    echo "环境: $ENVIRONMENT"
    echo "检查时间: $(date)"
    
    if [[ -n "$DEPLOYMENT_URL" ]]; then
        echo "部署 URL: $DEPLOYMENT_URL"
    fi
    
    echo ""
    echo -e "${YELLOW}💡 有用的命令:${NC}"
    echo "- 查看实时日志: npx wrangler tail"
    echo "- 重新部署: git push origin main"
    echo "- 查看 Actions: gh run list"
    echo "- 手动部署: npx wrangler deploy"
    echo ""
    echo -e "${YELLOW}📚 更多信息:${NC}"
    echo "- 部署文档: docs/DEPLOYMENT.md"
    echo "- GitHub Actions: https://github.com/$(git remote get-url origin 2>/dev/null | sed 's/.*github.com[:/]\([^.]*\).*/\1/' 2>/dev/null)/actions"
    echo "- Cloudflare Dashboard: https://dash.cloudflare.com/"
}

# 主函数
main() {
    check_github_actions
    check_environment_config
    check_deployment_urls
    check_cloudflare_status
    check_recent_errors
    generate_status_report
}

# 运行主函数
main "$@"