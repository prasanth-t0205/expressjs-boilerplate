# Contributing to Express.js Enterprise Boilerplate

First off, thank you for considering contributing to this boilerplate! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## 1. Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/expressjs-boilerplate.git
   cd expressjs-boilerplate
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```

## 2. Development Workflow

We enforce strict code quality standards to maintain the enterprise nature of this boilerplate.

- **Start the development server:**
  ```bash
  npm run dev
  ```
- **Lint your code** before committing:
  ```bash
  npm run lint
  ```
- **Run the typechecker**:
  ```bash
  npm run typecheck
  ```
- **Run tests**:
  ```bash
  npm test
  ```

## 3. Pull Request Guidelines

1. **Create a new branch** for your feature or bugfix (`git checkout -b feature/my-new-feature`).
2. **Make your changes**. Ensure you write tests for any new functionality.
3. **Commit your changes** using Conventional Commits. (e.g., `feat: add new logging feature`, `fix: resolve crash on startup`). Our Husky pre-commit hooks will automatically lint and verify your commit message.
4. **Push to your fork** and open a Pull Request against the `main` branch.
5. Ensure all GitHub Actions CI checks pass on your PR.

## 4. Architectural Rules

When contributing to the `forge/` utilities or `src/` business logic, please adhere to the patterns outlined in [PATTERNS.md](./PATTERNS.md). Specifically:

- **No tight coupling**: Services should not interact directly with HTTP request/response objects.
- **Database Agnosticism**: `forge/` utilities should never depend on `mongoose` directly unless it's a specific database adapter.

Thank you for contributing!
