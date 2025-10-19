# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-19

### Added
- Initial release of tgState Cloudflare Workers version
- File upload and download functionality via Telegram
- Web interface for file uploads
- Password protection support
- API endpoints for programmatic access
- Health check endpoints (`/health`, `/ping`)
- Version information endpoint (`/version`)
- Comprehensive error handling and logging
- TypeScript support and type definitions
- ESLint and Prettier configuration
- Jest testing framework setup
- GitHub Actions CI/CD pipeline
- Environment variable validation
- CORS support
- Rate limiting foundation

### Features
- 📁 File upload through web interface or API
- 🔗 Direct download links via Telegram
- 🔐 Optional password protection
- 🌐 Custom domain support
- 📱 Responsive web design
- 🚀 Global CDN acceleration via Cloudflare
- 📊 Structured logging
- 🔍 Health monitoring endpoints

### Technical
- Built for Cloudflare Workers runtime
- ES2022 JavaScript with modern features
- Modular architecture with utility functions
- Comprehensive test coverage
- Automated deployment via GitHub Actions
- Environment-based configuration