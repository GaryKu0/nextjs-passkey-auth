# Contributing to Passkey Authentication

Thank you for your interest in contributing to this project! This guide will help you get started.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/passkey-nextjs.git
   cd passkey-nextjs
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Set up environment**: Copy `.env.example` to `.env` and configure
5. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for type safety
- **ESLint**: Follow the configured ESLint rules
- **Formatting**: Use Prettier for consistent formatting
- **Naming**: Use descriptive variable and function names

### Testing

Before submitting a PR:

```bash
# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Build the project
pnpm build

# Test the application
pnpm dev
```

### Commit Messages

Use conventional commit format:

```
feat: add new authentication method
fix: resolve token validation issue
docs: update API documentation
style: format code with prettier
refactor: simplify auth logic
test: add unit tests for validation
chore: update dependencies
```

## 🔧 Project Structure

```
passkey-nextjs/
├── app/                    # Next.js App Router
│   ├── api/auth/          # Authentication API routes
│   └── ...
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # UI components
├── lib/                  # Utility libraries
└── hooks/                # Custom React hooks
```

## 🐛 Bug Reports

When filing a bug report, please include:

1. **Description**: Clear description of the issue
2. **Steps to reproduce**: Detailed steps to recreate the bug
3. **Expected behavior**: What you expected to happen
4. **Actual behavior**: What actually happened
5. **Environment**: Browser, OS, Node.js version
6. **Screenshots**: If applicable

## 💡 Feature Requests

For feature requests, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** if you have one in mind
4. **Consider alternatives** and their trade-offs

## 🔄 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update the README** if necessary
5. **Write a clear PR description**:
   - What changes were made
   - Why they were made
   - How to test them

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All checks pass

## 🚫 What Not to Include

- **Sensitive data**: API keys, passwords, personal information
- **Large files**: Avoid committing large binary files
- **Generated files**: Don't commit build artifacts
- **IDE files**: Personal IDE configuration files

## 📝 Documentation

Help improve documentation by:

- Fixing typos and grammar errors
- Adding examples and use cases
- Improving clarity and organization
- Translating content (if applicable)

## 🤝 Community Guidelines

- **Be respectful** and inclusive
- **Help others** learn and grow
- **Give constructive feedback**
- **Follow the code of conduct**

## 📞 Getting Help

If you need help:

1. **Check the documentation** first
2. **Search existing issues** for similar problems
3. **Ask in discussions** for general questions
4. **Create an issue** for bugs or feature requests

## 🏷️ Labels

We use these labels to organize issues and PRs:

- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation updates
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information requested

## 🎉 Recognition

Contributors will be recognized in:

- README acknowledgments
- Release notes
- Project documentation

Thank you for contributing to make passwordless authentication more accessible! 🔐
