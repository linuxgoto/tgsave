#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 验证所有必要的配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查部署配置...\n');

// 检查必要文件
const requiredFiles = [
    'package.json',
    'wrangler.toml',
    'src/worker.js',
    '.github/workflows/deploy-cloudflare.yml'
];

let hasErrors = false;

console.log('📁 检查必要文件:');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - 文件不存在`);
        hasErrors = true;
    }
});

// 检查 package.json
console.log('\n📦 检查 package.json:');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (pkg.devDependencies && pkg.devDependencies.wrangler) {
        console.log('  ✅ wrangler 依赖已配置');
    } else {
        console.log('  ❌ 缺少 wrangler 依赖');
        hasErrors = true;
    }
    
    if (pkg.scripts && pkg.scripts.deploy) {
        console.log('  ✅ 部署脚本已配置');
    } else {
        console.log('  ❌ 缺少部署脚本');
        hasErrors = true;
    }
} catch (e) {
    console.log('  ❌ package.json 格式错误');
    hasErrors = true;
}

// 检查 wrangler.toml
console.log('\n⚙️  检查 wrangler.toml:');
try {
    const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
    
    if (wranglerConfig.includes('name = "tgstate"')) {
        console.log('  ✅ Worker 名称已配置');
    } else {
        console.log('  ❌ Worker 名称未配置');
        hasErrors = true;
    }
    
    if (wranglerConfig.includes('main = "src/worker.js"')) {
        console.log('  ✅ 入口文件已配置');
    } else {
        console.log('  ❌ 入口文件未配置');
        hasErrors = true;
    }
    
    if (wranglerConfig.includes('compatibility_date')) {
        console.log('  ✅ 兼容性日期已配置');
    } else {
        console.log('  ❌ 兼容性日期未配置');
        hasErrors = true;
    }
} catch (e) {
    console.log('  ❌ wrangler.toml 读取失败');
    hasErrors = true;
}

// 检查 GitHub Actions
console.log('\n🚀 检查 GitHub Actions:');
try {
    const workflow = fs.readFileSync('.github/workflows/deploy-cloudflare.yml', 'utf8');
    
    if (workflow.includes('cloudflare/wrangler-action@v3')) {
        console.log('  ✅ Wrangler Action 已配置');
    } else {
        console.log('  ❌ Wrangler Action 未配置');
        hasErrors = true;
    }
    
    const requiredSecrets = [
        'CLOUDFLARE_API_TOKEN',
        'CLOUDFLARE_ACCOUNT_ID',
        'TELEGRAM_BOT_TOKEN',
        'TELEGRAM_TARGET'
    ];
    
    let secretsConfigured = true;
    requiredSecrets.forEach(secret => {
        if (workflow.includes(`secrets.${secret}`)) {
            console.log(`  ✅ ${secret} 引用已配置`);
        } else {
            console.log(`  ❌ ${secret} 引用未配置`);
            hasErrors = true;
            secretsConfigured = false;
        }
    });
    
    if (secretsConfigured) {
        console.log('  ✅ 所有必需的 Secrets 引用已配置');
    }
} catch (e) {
    console.log('  ❌ GitHub Actions 配置读取失败');
    hasErrors = true;
}

// 检查 Worker 代码
console.log('\n💻 检查 Worker 代码:');
try {
    const workerCode = fs.readFileSync('src/worker.js', 'utf8');
    
    if (workerCode.includes('export default')) {
        console.log('  ✅ ES6 模块导出已配置');
    } else {
        console.log('  ❌ 缺少 ES6 模块导出');
        hasErrors = true;
    }
    
    if (workerCode.includes('async fetch(request, env, ctx)')) {
        console.log('  ✅ Fetch 处理器已配置');
    } else {
        console.log('  ❌ Fetch 处理器未配置');
        hasErrors = true;
    }
    
    if (workerCode.includes('TELEGRAM_API_BASE')) {
        console.log('  ✅ Telegram API 集成已配置');
    } else {
        console.log('  ❌ Telegram API 集成未配置');
        hasErrors = true;
    }
} catch (e) {
    console.log('  ❌ Worker 代码读取失败');
    hasErrors = true;
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
    console.log('❌ 发现配置问题，请修复后再部署');
    console.log('\n📚 参考文档: docs/DEPLOYMENT.md');
    process.exit(1);
} else {
    console.log('✅ 所有配置检查通过，可以开始部署！');
    console.log('\n🎯 下一步:');
    console.log('1. 在 GitHub 仓库中配置必要的 Secrets');
    console.log('2. 推送代码到 main/master 分支');
    console.log('3. 查看 GitHub Actions 部署状态');
    console.log('\n📚 详细说明: docs/DEPLOYMENT.md');
    process.exit(0);
}