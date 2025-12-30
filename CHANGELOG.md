# Changelog

All notable changes to the Trix TypeScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-12-25

### Added

#### Core Features
- Initial release of Trix TypeScript SDK
- Full support for Trix API v1
- Type-safe client with full TypeScript support
- Promise-based async/await API
- Comprehensive type definitions for all API endpoints

#### Resources
- **Memories**: Full CRUD operations, bulk operations, audio transcription
- **Relationships**: Create, update, delete, and reinforce relationships
- **Clusters**: Manage clusters, add/remove memories, cluster expansion
- **Spaces**: Workspace organization and management
- **Graph**: Graph traversal, context retrieval, shortest path finding
- **Search**: Semantic and keyword search, embedding generation
- **Webhooks**: Event notifications and webhook management
- **Agent**: Session management and memory consolidation
- **Feedback**: Search result feedback and relationship creation
- **Highlights**: Text highlighting and auto-extraction
- **Jobs**: Background job monitoring and management

#### Developer Experience
- Automatic retry with exponential backoff for rate limits
- Comprehensive error handling with custom exception types
- Pagination helpers with automatic iteration
- Full IDE autocomplete and IntelliSense support
- Detailed JSDoc documentation
- CommonJS and ESM module support
- Tree-shakeable exports

#### Documentation
- Comprehensive README with examples
- API documentation via JSDoc
- Example scripts for common use cases
- Contributing guidelines

#### Testing
- Unit tests for core functionality
- Integration test structure
- GitHub Actions CI/CD pipeline
- Code coverage reporting

### Technical Details
- Minimum Node.js version: 18.0.0
- Built with TypeScript 5.x
- Dual package (CommonJS + ESM)
- Bundled with tsup for optimal package size
- Support for both API key and JWT authentication
- Optional OpenTelemetry integration

[Unreleased]: https://github.com/trix/trix-typescript-sdk/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/trix/trix-typescript-sdk/releases/tag/v1.0.0
