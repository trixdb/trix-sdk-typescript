# Gemini Instructions for trix-sdk-typescript

Official TypeScript SDK for Trix - A memory and knowledge management API.

## Coding Standards

**IMPORTANT**: Before writing or modifying code, review and follow the guidelines in [CODING_STANDARDS.md](./CODING_STANDARDS.md).

Key constraints:
- **File limit**: Keep files under 300 lines (hard limit: 500)
- **Function limit**: Keep functions under 25 lines (hard limit: 40)
- **Parameters**: Max 3 parameters per function (hard limit: 5) - use options objects
- **Nesting**: Max 2 levels deep (hard limit: 4) - extract or early return
- **Scope**: Only make changes directly requested - no speculative improvements
- **Coupling**: If a change touches >3 files, pause and discuss the approach first

## TypeScript-Specific Guidelines

### Type Safety
- Enable `strict` mode in tsconfig.json
- Prefer `unknown` over `any`; use type guards when narrowing
- Use discriminated unions for state machines
- Export types alongside functions that use them

### Code Style
- Use `tsc --noEmit` for type checking
- Run `eslint` for linting
- Follow existing patterns in the codebase
- Prefer interfaces for public APIs, types for internal utilities

### Error Handling
- Use typed errors with discriminated unions
- Throw `TrixError` subclasses for SDK-specific errors
- Include error codes for programmatic handling
- Never expose raw API errors to consumers

## Common Commands

```bash
# Build the SDK
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test

# Type check without emitting
npm run typecheck

# Run linter
npm run lint

# Generate documentation
npm run docs
```

## Project Structure

```
src/
  index.ts          # Main exports
  client.ts         # TrixClient class
  types/            # Type definitions
  resources/        # API resource classes (memories, search, etc.)
  errors/           # Error classes
  testing/          # Test utilities (exported as @trixdb/client/testing)
```

## SDK Design Patterns

### Client Initialization
```typescript
const client = new TrixClient({
  apiKey: process.env.TRIX_API_KEY,
  baseUrl: 'https://api.trixdb.com', // optional
});
```

### Resource Methods
- Use verb-noun naming: `createMemory`, `searchMemories`
- Return typed responses with proper generics
- Support both promise and callback patterns where appropriate

### Testing
- Write tests for public API surface
- Use the testing utilities in `src/testing/`
- Mock HTTP calls, don't hit real API in unit tests

## Code Quality Checklist

Before submitting changes:
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] No files exceed 300 lines (check with hook warnings)
- [ ] No functions exceed 25 lines
- [ ] Types are properly exported
- [ ] Error handling follows SDK patterns

