# Development Guide

This guide will help you set up your development environment and start working on the TrixDB TypeScript SDK.

## Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm
- Git

## Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/trixdb/trix-typescript-sdk.git
   cd trix-typescript-sdk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

## Development Workflow

### Building

```bash
# One-time build
npm run build

# Watch mode (rebuilds on changes)
npm run dev
```

The build outputs to the `dist/` directory:
- `dist/index.js` - CommonJS bundle
- `dist/index.mjs` - ES Module bundle
- `dist/index.d.ts` - TypeScript declarations

### Type Checking

```bash
npm run typecheck
```

This runs the TypeScript compiler without emitting files to check for type errors.

### Linting

```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint -- --fix
```

### Testing

```bash
npm test
```

Note: You'll need to configure your test framework (Jest, Vitest, etc.) and implement the test suite.

## Project Structure

```
trix-typescript-sdk/
├── src/
│   ├── index.ts              # Main entry point, exports
│   ├── client.ts             # TrixDB client class
│   ├── types.ts              # All TypeScript type definitions
│   ├── errors.ts             # Custom error classes
│   ├── resources/            # API resource implementations
│   │   ├── index.ts          # Resource exports
│   │   ├── memories.ts       # Memories API
│   │   ├── relationships.ts  # Relationships API
│   │   ├── clusters.ts       # Clusters API
│   │   ├── spaces.ts         # Spaces API
│   │   ├── graph.ts          # Graph traversal API
│   │   ├── search.ts         # Search and embeddings API
│   │   ├── webhooks.ts       # Webhooks API
│   │   ├── agent.ts          # Agent sessions API
│   │   ├── feedback.ts       # Feedback API
│   │   ├── highlights.ts     # Highlights API
│   │   └── jobs.ts           # Background jobs API
│   └── utils/
│       ├── index.ts          # Utility exports
│       ├── pagination.ts     # Pagination helpers
│       └── retry.ts          # Retry logic with backoff
├── tests/
│   └── client.test.ts        # Test examples
├── examples/
│   ├── basic-usage.ts        # Basic usage example
│   ├── agent-session.ts      # Agent session example
│   ├── webhooks.ts           # Webhooks example
│   └── graph-traversal.ts    # Graph traversal example
├── dist/                     # Build output (generated)
├── package.json
├── tsconfig.json             # TypeScript configuration
├── tsup.config.ts            # Build configuration
├── .eslintrc.json            # ESLint configuration
├── .gitignore
├── .npmignore
├── LICENSE
├── README.md
├── CONTRIBUTING.md
└── DEVELOPMENT.md            # This file
```

## Key Files

### src/client.ts

The main `TrixDB` class that:
- Handles HTTP requests
- Manages authentication
- Implements retry logic
- Initializes all resource classes

### src/types.ts

All TypeScript type definitions including:
- Request/response types
- Configuration types
- API object types

### src/errors.ts

Custom error classes:
- `TrixDBError` - Base error
- `AuthenticationError` - 401 errors
- `NotFoundError` - 404 errors
- `ValidationError` - 422 errors
- `RateLimitError` - 429 errors
- `NetworkError` - Network failures
- `TimeoutError` - Request timeouts
- `APIError` - General API errors

### src/resources/*.ts

Individual resource classes that implement API endpoints. Each resource:
- Takes the client instance in constructor
- Provides typed methods for API operations
- Includes JSDoc comments with examples

### src/utils/

Utility functions:
- `pagination.ts` - Async iterators for paginated results
- `retry.ts` - Exponential backoff retry logic

## Adding a New Resource

1. **Create the resource file**
   ```bash
   touch src/resources/my-resource.ts
   ```

2. **Define the resource class**
   ```typescript
   import type { TrixDB } from '../client.js';

   export class MyResource {
     constructor(private readonly client: TrixDB) {}

     async myMethod(params: MyParams): Promise<MyResult> {
       return this.client.request<MyResult>({
         method: 'POST',
         path: '/my-resource',
         body: params,
       });
     }
   }
   ```

3. **Add types in src/types.ts**
   ```typescript
   export interface MyParams {
     // ...
   }

   export interface MyResult {
     // ...
   }
   ```

4. **Export from src/resources/index.ts**
   ```typescript
   export * from './my-resource.js';
   ```

5. **Add to client in src/client.ts**
   ```typescript
   import { MyResource } from './resources/my-resource.js';

   export class TrixDB {
     public readonly myResource: MyResource;

     constructor(config: TrixDBConfig) {
       // ...
       this.myResource = new MyResource(this);
     }
   }
   ```

6. **Add to main exports in src/index.ts**
   ```typescript
   export type { MyResource } from './resources/index.js';
   ```

## Running Examples

```bash
# Set your API key
export TRIXDB_API_KEY=your_api_key

# Run an example
npx tsx examples/basic-usage.ts
npx tsx examples/agent-session.ts
npx tsx examples/webhooks.ts
npx tsx examples/graph-traversal.ts
```

## Testing Locally

To test the SDK locally in another project:

1. **Build the SDK**
   ```bash
   npm run build
   ```

2. **Link the package**
   ```bash
   npm link
   ```

3. **In your test project**
   ```bash
   npm link trixdb
   ```

4. **Use it**
   ```typescript
   import { TrixDB } from 'trixdb';
   const client = new TrixDB({ apiKey: 'test' });
   ```

## Publishing

Before publishing:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Build the project
4. Test thoroughly
5. Commit all changes

```bash
npm version patch  # or minor, or major
npm run build
npm test
git push --tags
npm publish
```

## Code Style Guidelines

### TypeScript

- Use strict mode
- Provide complete type definitions
- Avoid `any` types
- Use interfaces for public APIs
- Use type aliases for unions/intersections

### Naming Conventions

- Classes: PascalCase (e.g., `TrixDB`, `Memories`)
- Interfaces/Types: PascalCase (e.g., `Memory`, `CreateMemoryParams`)
- Functions/Methods: camelCase (e.g., `create`, `listAll`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- Files: kebab-case (e.g., `retry.ts`, `agent-session.ts`)

### Documentation

- Add JSDoc comments to all public APIs
- Include parameter descriptions
- Provide usage examples
- Document thrown errors

Example:
```typescript
/**
 * Create a new memory
 *
 * @param params - Memory creation parameters
 * @returns Created memory
 * @throws {ValidationError} If parameters are invalid
 *
 * @example
 * ```typescript
 * const memory = await client.memories.create({
 *   content: 'Important note',
 *   tags: ['work']
 * });
 * ```
 */
async create(params: CreateMemoryParams): Promise<Memory> {
  // Implementation
}
```

### Error Handling

- Throw specific error types
- Include helpful error messages
- Preserve error context
- Document possible errors

### Async/Await

- Use async/await over promises
- Handle errors properly
- Don't block unnecessarily

## Debugging

### Enable verbose logging

Add console.log statements in development:

```typescript
if (process.env.DEBUG) {
  console.log('Request:', options);
}
```

Run with:
```bash
DEBUG=1 npx tsx examples/basic-usage.ts
```

### Use Node debugger

```bash
node --inspect-brk node_modules/.bin/tsx examples/basic-usage.ts
```

Then attach your debugger (VS Code, Chrome DevTools, etc.)

## Common Issues

### Build errors

If you encounter build errors:
1. Delete `dist/` directory
2. Delete `node_modules/`
3. Run `npm install`
4. Run `npm run build`

### Type errors

- Run `npm run typecheck` to see all type errors
- Check `tsconfig.json` settings
- Ensure all imports use `.js` extension (for ESM compatibility)

### Module resolution

The SDK uses ESM with `.js` extensions in imports. This is required for proper ESM support:

```typescript
// Correct
import { retry } from './utils/retry.js';

// Wrong
import { retry } from './utils/retry';
```

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [tsup Documentation](https://tsup.egoist.dev/)
- [ESLint Documentation](https://eslint.org/docs/)
- [TrixDB API Documentation](https://docs.trixdb.com)

## Getting Help

- Open an issue on GitHub
- Check existing issues and discussions
- Read the CONTRIBUTING.md guide

Happy coding!
