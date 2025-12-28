# Contributing to Trix TypeScript SDK

Thank you for your interest in contributing to the Trix TypeScript SDK! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/trix-typescript-sdk.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Building

```bash
npm run build
```

This will compile TypeScript and generate both ESM and CJS bundles in the `dist/` directory.

### Development Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Project Structure

```
trix-typescript-sdk/
├── src/
│   ├── index.ts              # Main exports
│   ├── client.ts             # Trix client class
│   ├── types.ts              # TypeScript type definitions
│   ├── errors.ts             # Custom error classes
│   ├── resources/            # API resource implementations
│   │   ├── memories.ts
│   │   ├── relationships.ts
│   │   ├── clusters.ts
│   │   └── ...
│   └── utils/                # Utility functions
│       ├── pagination.ts
│       └── retry.ts
├── tests/                    # Test files
├── examples/                 # Usage examples
└── dist/                     # Build output (generated)
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all code
- Provide complete type definitions
- Use interfaces for public APIs
- Avoid `any` types when possible

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Example

```typescript
/**
 * Create a new memory
 *
 * @param params - Memory creation parameters
 * @returns Created memory
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
  return this.client.request<Memory>({
    method: 'POST',
    path: '/memories',
    body: params,
  });
}
```

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- Write tests for all new features
- Ensure edge cases are covered
- Mock API calls appropriately
- Use descriptive test names

Example test:

```typescript
describe('Memories', () => {
  it('should create a memory', async () => {
    const memory = await client.memories.create({
      content: 'Test memory',
      tags: ['test'],
    });

    expect(memory).toBeDefined();
    expect(memory.content).toBe('Test memory');
  });
});
```

## Adding New Features

### Adding a New Resource

1. Create a new file in `src/resources/`
2. Define the resource class with methods
3. Add type definitions in `src/types.ts`
4. Export from `src/resources/index.ts`
5. Add to client in `src/client.ts`
6. Write tests
7. Add examples
8. Update documentation

### Adding a New Method

1. Add the method to the appropriate resource class
2. Add type definitions for parameters and return types
3. Add JSDoc comments with examples
4. Write tests
5. Update documentation

## Documentation

### Code Documentation

- Use JSDoc comments for all public APIs
- Include parameter descriptions
- Provide usage examples
- Document exceptions/errors

### README Updates

When adding features, update:
- Usage examples
- API documentation
- Feature list
- Changelog

## Pull Request Process

1. **Create a feature branch**: Use a descriptive name like `feature/add-streaming-support`

2. **Make your changes**: Follow the coding guidelines

3. **Add tests**: Ensure your changes are tested

4. **Update documentation**: Add/update JSDoc comments and README

5. **Run checks**:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run build
   ```

6. **Commit your changes**: Use clear, descriptive commit messages
   ```
   feat: add streaming support for large responses
   fix: handle timeout errors correctly
   docs: update API documentation
   ```

7. **Push to your fork**: `git push origin feature/your-feature-name`

8. **Create a Pull Request**: Provide a clear description of changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No type errors
```

## Commit Message Convention

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add pagination support for webhooks
fix: handle rate limit errors correctly
docs: update README with new examples
```

## Reporting Bugs

1. Check if the bug already exists in Issues
2. Create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Code samples if applicable

## Suggesting Features

1. Check if the feature already exists in Issues
2. Create a new issue with:
   - Clear title
   - Use case description
   - Proposed API/implementation
   - Examples of how it would be used

## Questions?

- Open an issue for questions
- Tag with `question` label
- Provide context and what you've tried

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Trix TypeScript SDK!
