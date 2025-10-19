/**
 * 工具函数和错误处理
 */

// 错误类型定义
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TELEGRAM_API_ERROR: 'TELEGRAM_API_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

// 自定义错误类
export class TgStateError extends Error {
  constructor(message, type = ErrorTypes.INTERNAL_ERROR, statusCode = 500) {
    super(message);
    this.name = 'TgStateError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

// 环境变量验证
export function validateEnvironment(env) {
  const required = ['TOKEN', 'TARGET'];
  const missing = required.filter(key => !env[key]);

  if (missing.length > 0) {
    throw new TgStateError(
      `Missing required environment variables: ${missing.join(', ')}`,
      ErrorTypes.VALIDATION_ERROR,
      500
    );
  }
}

// 文件大小验证 (Cloudflare Workers 限制 100MB)
export function validateFileSize(size) {
  const MAX_SIZE = 100 * 1024 * 1024; // 100MB
  if (size > MAX_SIZE) {
    throw new TgStateError(
      'File size exceeds 100MB limit',
      ErrorTypes.FILE_TOO_LARGE,
      413
    );
  }
}

// 速率限制检查 (简单实现)
export function checkRateLimit(_request, _env) {
  // 可以使用 KV 存储实现更复杂的速率限制
  // const userIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  // 这里可以添加基于 IP 的速率限制逻辑
  return true;
}

// 响应格式化
export function formatResponse(data, success = true, statusCode = 200) {
  return new Response(
    JSON.stringify({
      success,
      timestamp: new Date().toISOString(),
      ...data,
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

// 错误响应格式化
export function formatErrorResponse(error) {
  if (error instanceof TgStateError) {
    return formatResponse(
      {
        error: {
          type: error.type,
          message: error.message,
        },
      },
      false,
      error.statusCode
    );
  }

  // 未知错误
  return formatResponse(
    {
      error: {
        type: ErrorTypes.INTERNAL_ERROR,
        message: 'Internal server error',
      },
    },
    false,
    500
  );
}

// 日志记录
export function log(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(logEntry));
}
