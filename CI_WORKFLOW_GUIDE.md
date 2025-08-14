# CI Workflow Guide

## Overview

This document describes the Continuous Integration (CI) workflow implemented for the EduBus Web project using GitHub Actions. The workflow ensures code quality and prevents broken builds from being merged into the main branch.

## Workflow Configuration

The CI workflow is defined in `.github/workflows/ci.yml` and runs automatically on:

- **Pull Requests**: Every time a PR is created or updated
- **Main Branch Pushes**: Every time code is pushed directly to the main branch

## Workflow Steps

### 1. Checkout

- Uses `actions/checkout@v4` to fetch the latest code
- Ensures we're working with the most recent changes

### 2. Node.js Setup

- Uses `actions/setup-node@v4` with Node.js version 20
- Enables npm caching for faster dependency installation
- Optimizes build performance

### 3. Dependency Installation

- Runs `npm ci` for clean, reproducible installations
- Uses package-lock.json for exact version matching
- Faster than `npm install` for CI environments

### 4. Code Quality Checks

#### Linting

- Runs `npm run lint` to check code style and potential issues
- Uses ESLint configuration from the project
- Fails if linting errors are found

#### Type Checking

- Runs `npm run type-check` to verify TypeScript types
- Uses `tsc --noEmit` to check types without generating output
- Ensures type safety across the codebase

#### Testing

- Runs `npm test` if test scripts are configured
- Optional step that only runs if tests are present
- Ensures code functionality is maintained

### 5. Build Verification

- Runs `npm run build` to ensure the project can be built successfully
- Verifies that all dependencies are correctly resolved
- Ensures the production build process works

## Concurrency Control

The workflow includes concurrency settings to:

- Cancel in-progress jobs when new commits are pushed
- Prevent resource waste from outdated builds
- Ensure only the latest changes are tested

## Required Scripts

The following npm scripts must be defined in `package.json`:

```json
{
  "scripts": {
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "build": "next build"
  }
}
```

## Best Practices

### For Developers

1. **Always create feature branches** from main
2. **Run local checks** before pushing:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```
3. **Create Pull Requests** for all changes
4. **Wait for CI to pass** before merging

### For Maintainers

1. **Review CI results** before approving PRs
2. **Ensure all checks pass** before merging
3. **Monitor workflow performance** and optimize if needed

## Troubleshooting

### Common Issues

1. **Linting Errors**
   - Run `npm run lint` locally to see issues
   - Fix formatting and style violations
   - Consider using `npm run format` for auto-fixing

2. **Type Errors**
   - Run `npm run type-check` locally
   - Fix TypeScript type issues
   - Ensure all imports and exports are properly typed

3. **Build Failures**
   - Check for missing dependencies
   - Verify all imports are correct
   - Ensure environment variables are properly configured

### Local Development

To run the same checks locally:

```bash
# Install dependencies
npm ci

# Run all checks
npm run lint
npm run type-check
npm run build

# Optional: Run tests if available
npm test
```

## Integration with Vercel

This CI workflow is designed to work with Vercel's automatic deployments:

1. **CI passes** → Vercel automatically deploys
2. **CI fails** → Deployment is blocked
3. **Git Integration** → Vercel monitors the main branch

## Security Considerations

- Workflow runs in isolated environments
- No sensitive data is exposed in logs
- Dependencies are verified against package-lock.json
- All actions use official, verified versions

## Performance Optimization

- Uses npm caching for faster installs
- Concurrency control prevents resource waste
- Only runs necessary steps for each change
- Optimized for Next.js projects

## Future Enhancements

Potential improvements to consider:

1. **Test Coverage Reports**
2. **Performance Testing**
3. **Security Scanning**
4. **Dependency Vulnerability Checks**
5. **Automated Code Review**

---
