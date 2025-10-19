(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/src/worker.js b/src/worker.js
--- a/src/worker.js
+++ b/src/worker.js
@@ -0,0 +1,379 @@
+/**
+ * tgState Cloudflare Workers 版本
+ * 基于原 Go 版本改写为 JavaScript
+ */
+
+// 配置常量
+const FILE_ROUTE = '/d/';
+const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';
+
+// HTML 模板
+const HTML_TEMPLATE = `
+<!DOCTYPE html>
+<html lang="zh-CN">
+<head>
+    <meta charset="UTF-8">
+    <meta name="viewport" content="width=device-width, initial-scale=1.0">
+    <title>tgState - Telegram 文件外链系统</title>
+    <style>
+        * { margin: 0; padding: 0; box-sizing: border-box; }
+        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
+        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
+        .header { text-align: center; margin-bottom: 40px; }
+        .header h1 { color: #333; margin-bottom: 10px; }
+        .header p { color: #666; }
+        .upload-area { background: white; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px; }
+        .upload-zone { border: 2px dashed #ddd; border-radius: 8px; padding: 40px; transition: all 0.3s; }
+        .upload-zone:hover { border-color: #007bff; background: #f8f9ff; }
+        .upload-zone.dragover { border-color: #007bff; background: #f0f8ff; }
+        .file-input { display: none; }
+        .upload-btn { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; margin-top: 20px; }
+        .upload-btn:hover { background: #0056b3; }
+        .progress { display: none; margin-top: 20px; }
+        .progress-bar { width: 100%; height: 6px; background: #eee; border-radius: 3px; overflow: hidden; }
+        .progress-fill { height: 100%; background: #007bff; width: 0%; transition: width 0.3s; }
+        .result { margin-top: 20px; padding: 15px; border-radius: 6px; display: none; }
+        .result.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
+        .result.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
+        .footer { text-align: center; color: #666; font-size: 14px; }
+        .footer a { color: #007bff; text-decoration: none; }
+    </style>
+</head>
+<body>
+    <div class="container">
+        <div class="header">
+            <h1>📁 tgState</h1>
+            <p>基于 Telegram 的文件外链系统</p>
+        </div>
+        
+        <div class="upload-area">
+            <div class="upload-zone" id="uploadZone">
+                <div>📤</div>
+                <h3>拖拽文件到此处或点击上传</h3>
+                <p>支持所有文件格式，无大小限制</p>
+                <input type="file" id="fileInput" class="file-input" multiple>
+                <button class="upload-btn" onclick="document.getElementById('fileInput').click()">选择文件</button>
+            </div>
+            
+            <div class="progress" id="progress">
+                <div class="progress-bar">
+                    <div class="progress-fill" id="progressFill"></div>
+                </div>
+                <p id="progressText">上传中...</p>
+            </div>
+            
+            <div class="result" id="result"></div>
+        </div>
+        
+        <div class="footer">
+            <p>Powered by <a href="https://github.com/csznet/tgState" target="_blank">tgState</a> & Cloudflare Workers</p>
+        </div>
+    </div>
+
+    <script>
+        const uploadZone = document.getElementById('uploadZone');
+        const fileInput = document.getElementById('fileInput');
+        const progress = document.getElementById('progress');
+        const progressFill = document.getElementById('progressFill');
+        const progressText = document.getElementById('progressText');
+        const result = document.getElementById('result');
+
+        // 拖拽上传
+        uploadZone.addEventListener('dragover', (e) => {
+            e.preventDefault();
+            uploadZone.classList.add('dragover');
+        });
+
+        uploadZone.addEventListener('dragleave', () => {
+            uploadZone.classList.remove('dragover');
+        });
+
+        uploadZone.addEventListener('drop', (e) => {
+            e.preventDefault();
+            uploadZone.classList.remove('dragover');
+            const files = e.dataTransfer.files;
+            if (files.length > 0) {
+                uploadFiles(files);
+            }
+        });
+
+        // 文件选择上传
+        fileInput.addEventListener('change', (e) => {
+            if (e.target.files.length > 0) {
+                uploadFiles(e.target.files);
+            }
+        });
+
+        async function uploadFiles(files) {
+            for (let i = 0; i < files.length; i++) {
+                await uploadFile(files[i], i + 1, files.length);
+            }
+        }
+
+        async function uploadFile(file, index, total) {
+            const formData = new FormData();
+            formData.append('image', file);
+
+            progress.style.display = 'block';
+            result.style.display = 'none';
+            progressText.textContent = \`上传文件 \${index}/\${total}: \${file.name}\`;
+
+            try {
+                const response = await fetch('/api', {
+                    method: 'POST',
+                    body: formData
+                });
+
+                const data = await response.json();
+
+                if (data.code === 1) {
+                    showResult('success', \`文件上传成功！<br>访问链接: <a href="\${data.url}" target="_blank">\${data.url}</a>\`);
+                } else {
+                    showResult('error', \`上传失败: \${data.message || '未知错误'}\`);
+                }
+            } catch (error) {
+                showResult('error', \`上传失败: \${error.message}\`);
+            }
+
+            progressFill.style.width = \`\${(index / total) * 100}%\`;
+            
+            if (index === total) {
+                setTimeout(() => {
+                    progress.style.display = 'none';
+                    progressFill.style.width = '0%';
+                }, 1000);
+            }
+        }
+
+        function showResult(type, message) {
+            result.className = \`result \${type}\`;
+            result.innerHTML = message;
+            result.style.display = 'block';
+        }
+    </script>
+</body>
+</html>
+`;
+
+const PASSWORD_TEMPLATE = `
+<!DOCTYPE html>
+<html lang="zh-CN">
+<head>
+    <meta charset="UTF-8">
+    <meta name="viewport" content="width=device-width, initial-scale=1.0">
+    <title>访问验证 - tgState</title>
+    <style>
+        * { margin: 0; padding: 0; box-sizing: border-box; }
+        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
+        .login-box { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; min-width: 300px; }
+        .login-box h2 { margin-bottom: 20px; color: #333; }
+        .form-group { margin-bottom: 20px; }
+        .form-control { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
+        .btn { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; width: 100%; }
+        .btn:hover { background: #0056b3; }
+        .error { color: #dc3545; margin-top: 10px; }
+    </style>
+</head>
+<body>
+    <div class="login-box">
+        <h2>🔐 访问验证</h2>
+        <form method="post" action="/pwd">
+            <div class="form-group">
+                <input type="password" name="password" class="form-control" placeholder="请输入访问密码" required>
+            </div>
+            <button type="submit" class="btn">验证</button>
+        </form>
+    </div>
+</body>
+</html>
+`;
+
+export default {
+    async fetch(request, env, ctx) {
+        const url = new URL(request.url);
+        const path = url.pathname;
+
+        // 检查密码保护
+        if (env.PASS && env.PASS !== 'none') {
+            const authCookie = request.headers.get('cookie');
+            const isAuthenticated = authCookie && authCookie.includes('auth=true');
+            
+            if (!isAuthenticated && path !== '/pwd') {
+                if (path === '/api') {
+                    const password = url.searchParams.get('pass');
+                    if (!password || password !== env.PASS) {
+                        return new Response(JSON.stringify({
+                            code: 0,
+                            message: '需要访问密码'
+                        }), {
+                            status: 401,
+                            headers: { 'Content-Type': 'application/json' }
+                        });
+                    }
+                } else {
+                    return new Response(PASSWORD_TEMPLATE, {
+                        headers: { 'Content-Type': 'text/html; charset=utf-8' }
+                    });
+                }
+            }
+        }
+
+        // 路由处理
+        if (path.startsWith(FILE_ROUTE)) {
+            return handleFileRequest(request, env, path);
+        }
+
+        switch (path) {
+            case '/api':
+                return handleAPI(request, env);
+            case '/pwd':
+                return handlePassword(request, env);
+            default:
+                // 检查模式
+                if (env.MODE === 'm') {
+                    return new Response('此模式下不支持网页访问', { status: 403 });
+                }
+                return new Response(HTML_TEMPLATE, {
+                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
+                });
+        }
+    }
+};
+
+async function handleFileRequest(request, env, path) {
+    const fileId = path.substring(FILE_ROUTE.length);
+    
+    if (!fileId) {
+        return new Response('文件ID不能为空', { status: 400 });
+    }
+
+    try {
+        // 从 Telegram 获取文件
+        const telegramUrl = \`\${TELEGRAM_API_BASE}\${env.TOKEN}/getFile?file_id=\${fileId}\`;
+        const response = await fetch(telegramUrl);
+        const data = await response.json();
+
+        if (!data.ok) {
+            return new Response('文件不存在或已过期', { status: 404 });
+        }
+
+        // 获取文件内容
+        const fileUrl = \`https://api.telegram.org/file/bot\${env.TOKEN}/\${data.result.file_path}\`;
+        const fileResponse = await fetch(fileUrl);
+        
+        if (!fileResponse.ok) {
+            return new Response('无法获取文件内容', { status: 404 });
+        }
+
+        // 返回文件
+        const headers = new Headers(fileResponse.headers);
+        headers.set('Cache-Control', 'public, max-age=31536000'); // 缓存1年
+        
+        return new Response(fileResponse.body, {
+            headers: headers
+        });
+    } catch (error) {
+        console.error('File request error:', error);
+        return new Response('服务器错误', { status: 500 });
+    }
+}
+
+async function handleAPI(request, env) {
+    if (request.method !== 'POST') {
+        return new Response(JSON.stringify({
+            code: 0,
+            message: '只支持POST请求'
+        }), {
+            status: 405,
+            headers: { 'Content-Type': 'application/json' }
+        });
+    }
+
+    try {
+        const formData = await request.formData();
+        const file = formData.get('image');
+
+        if (!file) {
+            return new Response(JSON.stringify({
+                code: 0,
+                message: '没有找到文件'
+            }), {
+                headers: { 'Content-Type': 'application/json' }
+            });
+        }
+
+        // 上传到 Telegram
+        const uploadFormData = new FormData();
+        uploadFormData.append('chat_id', env.TARGET);
+        uploadFormData.append('document', file);
+
+        const telegramUrl = \`\${TELEGRAM_API_BASE}\${env.TOKEN}/sendDocument\`;
+        const response = await fetch(telegramUrl, {
+            method: 'POST',
+            body: uploadFormData
+        });
+
+        const data = await response.json();
+
+        if (!data.ok) {
+            return new Response(JSON.stringify({
+                code: 0,
+                message: \`Telegram API错误: \${data.description || '未知错误'}\`
+            }), {
+                headers: { 'Content-Type': 'application/json' }
+            });
+        }
+
+        // 获取文件ID
+        const fileId = data.result.document.file_id;
+        const filePath = \`\${FILE_ROUTE}\${fileId}\`;
+        const fullUrl = env.URL ? \`\${env.URL}\${filePath}\` : \`\${new URL(request.url).origin}\${filePath}\`;
+
+        return new Response(JSON.stringify({
+            code: 1,
+            message: filePath,
+            url: fullUrl
+        }), {
+            headers: { 'Content-Type': 'application/json' }
+        });
+
+    } catch (error) {
+        console.error('API error:', error);
+        return new Response(JSON.stringify({
+            code: 0,
+            message: \`服务器错误: \${error.message}\`
+        }), {
+            status: 500,
+            headers: { 'Content-Type': 'application/json' }
+        });
+    }
+}
+
+async function handlePassword(request, env) {
+    if (request.method === 'GET') {
+        return new Response(PASSWORD_TEMPLATE, {
+            headers: { 'Content-Type': 'text/html; charset=utf-8' }
+        });
+    }
+
+    if (request.method === 'POST') {
+        const formData = await request.formData();
+        const password = formData.get('password');
+
+        if (password === env.PASS) {
+            return new Response('', {
+                status: 302,
+                headers: {
+                    'Location': '/',
+                    'Set-Cookie': 'auth=true; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400'
+                }
+            });
+        } else {
+            return new Response(PASSWORD_TEMPLATE.replace('</form>', '<div class="error">密码错误</div></form>'), {
+                headers: { 'Content-Type': 'text/html; charset=utf-8' }
+            });
+        }
+    }
+
+    return new Response('Method not allowed', { status: 405 });
+}
EOF
)
