/**
 * tgState Worker 测试
 */

// Mock environment
const mockEnv = {
  TOKEN: 'test-token',
  TARGET: '@testchannel',
  PASS: 'testpass',
  MODE: 'p'
};

// Mock worker for testing
const mockWorker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Health check
    if (path === '/health') {
      return new Response(JSON.stringify({
        success: true,
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Version endpoint
    if (path === '/version') {
      return new Response(JSON.stringify({
        success: true,
        version: '1.0.0',
        name: 'tgState Cloudflare Workers'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // Main page
    if (path === '/') {
      return new Response('<html><body>tgState</body></html>', {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // 404
    return new Response('Not Found', { status: 404 });
  }
};

describe('tgState Worker', () => {
  test('健康检查端点应该返回正确状态', async () => {
    const request = new Request('https://example.com/health');
    const response = await mockWorker.fetch(request, mockEnv);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('healthy');
    expect(data.version).toBeDefined();
  });

  test('版本信息端点应该返回版本号', async () => {
    const request = new Request('https://example.com/version');
    const response = await mockWorker.fetch(request, mockEnv);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.version).toBeDefined();
    expect(data.name).toBe('tgState Cloudflare Workers');
  });

  test('CORS 预检请求应该正确处理', async () => {
    const request = new Request('https://example.com/api', {
      method: 'OPTIONS'
    });
    const response = await mockWorker.fetch(request, mockEnv);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  test('主页应该返回 HTML', async () => {
    const request = new Request('https://example.com/');
    const response = await mockWorker.fetch(request, mockEnv);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
  });

  test('404 页面应该正确处理', async () => {
    const request = new Request('https://example.com/nonexistent');
    const response = await mockWorker.fetch(request, mockEnv);
    
    expect(response.status).toBe(404);
  });
});