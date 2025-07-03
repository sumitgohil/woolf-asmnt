# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Initial Setup

```
npm run setup
```

## Development Workflow

### Code Quality

We use ESLint, Prettier, and Husky to maintain high code quality.

#### Automatic Formatting

- Code is automatically formatted on save (VS Code)
- Pre-commit hooks run linting and formatting
- Use `npm run quality` to fix all issues

#### Manual Commands

```
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors automatically
npm run format        # Format all code with Prettier
npm run format:check  # Check if code is properly formatted
```

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit (pre-commit hooks will run)
3. Run pre-push validation: `npm run pre-push`
4. Push and create pull request

### VS Code Setup

Install recommended extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Debugging

- **Server**: Use "Debug Server" launch configuration
- **Client**: Use "Debug Client" launch configuration
- **Both**: Use "Start Development" task

## Code Standards

### TypeScript

- Strict mode enabled
- No explicit `any` types (warnings)
- Proper type definitions for all functions

### Formatting

- 80 character line limit
- 2 space indentation
- Semicolons required
- Double quotes for strings

### Git Commits

- Use conventional commit format
- Keep commits focused and atomic
- Write descriptive commit messages

## Testing

### Manual Testing

```
npm run test
```

### Automated Testing

- Pre-commit hooks run linting
- Pre-push validation runs full test suite
- CI/CD pipeline validates all changes

## Troubleshooting

### Common Issues

**ESLint Errors**

- Run `npm run lint:fix` to auto-fix issues
- Check ESLint configuration in `eslint.config.cjs`

**Prettier Conflicts**

- Run `npm run format` to format all files
- Check `.prettierrc` configuration

**Husky Hooks Not Running**

- Ensure Husky is installed: `npx husky install`
- Check hook permissions: `chmod +x .husky/pre-commit`

### Getting Help

1. Check this documentation
2. Review VS Code problems panel
3. Run `npm run quality` to fix common issues
4. Check Git hooks are properly configured
