# Changelog

All notable changes to the Trix TypeScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Search contract breaks (#6):** `client.search.query()` now reads `results`
  from the unified-search response (`GET /v1/search` returns `{ results, facets }`,
  never a `data` wrapper) and returns `UnifiedSearchResult[]` instead of `Memory[]`.
  `client.bots.buildContext()` now calls `POST /v1/search` (the removed
  `POST /search/query` route 404'd) and maps each result's `score` to `similarity`.

### Added
- `UnifiedSearchResult` and `UnifiedSearchResponse` types describing the
  `GET`/`POST /v1/search` response shape.

## [0.1.1] - 2025-12-30

### Changed
- Updated package name from @trix/client to @trixdb/client to match npm organization
- Updated homepage to https://trixdb.com
- Updated support URLs to trixdb.com resources
- Removed GitHub repository links (private repository)
- Changed license to proprietary (UNLICENSED)
- Updated README with correct package references and support links
- Removed npm provenance flag for private repository compatibility

## [0.1.0] - 2025-12-30

### Fixed
- Fixed invites test suite that was incorrectly importing from vitest instead of Jest
- Fixed test assertion in invites.test.ts to use `query` instead of `params`

### Changed
- Migrated from Husky to Lefthook for git hooks
- Added comprehensive pre-commit hooks: lint, typecheck, and tests
- Added pre-push hooks: tests with coverage and build verification
- Ensures tests run before commits to catch issues locally before CI

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

[Unreleased]: https://github.com/trix/trix-typescript-sdk/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/trix/trix-typescript-sdk/releases/tag/v0.1.1
[0.1.0]: https://github.com/trix/trix-typescript-sdk/releases/tag/v0.1.0
[1.0.0]: https://github.com/trix/trix-typescript-sdk/releases/tag/v1.0.0
