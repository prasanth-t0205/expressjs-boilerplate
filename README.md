<div align="center">
  <h1>🚀 Express.js Enterprise Boilerplate</h1>
  <p>A strictly-typed, production-ready, and highly scalable Express framework powered by TypeScript.</p>
</div>

<hr/>

## 📖 Overview

Welcome to the **Express.js Enterprise Boilerplate**. This isn't just another Express starter template—it is an expertly engineered microservice-ready architecture designed to give you the developer experience of massive enterprise frameworks (like NestJS or ASP.NET) while retaining the simplicity, speed, and flexibility of Express.

This project introduces **Forge**, our custom-built, zero-dependency, database-agnostic enterprise utility layer. By extracting framework complexities into `forge/` and keeping your business logic in `src/`, this boilerplate ensures your application stays impossibly clean.

## ✨ Core Features (The Forge)

The `forge/` directory contains all the plug-and-play enterprise utilities that power your application.

### 🔐 Advanced Authentication & Authorization

Highly flexible factory functions that adapt to your architecture.

- **Tokens & Cookies**: Generate JWTs and secure HttpOnly cookies with absolute freedom.
- **`authenticate()` Middleware**: Extract tokens from cookies, headers, or query parameters. Easily inject your own `verify` logic (e.g., Database, Auth0, Firebase) without rewriting error handling.
- **`authorize()` Middleware**: Apply complex, async business-logic policies inline for fine-grained access control.
- **Security Extensions**: Built-in logic for 2FA and API Key validation.

### 🌐 Microservice Resilience

Transitioning from a monolith to microservices is seamless.

- **Service Client**: A strictly-typed, native `fetch` wrapper for inter-service communication.
- **Circuit Breaker**: Built-in state machine (Closed, Open, Half-Open) to instantly isolate and recover from failing microservices, preventing cascading system failures.
- **Dynamic Registry**: Programmatically register downstream services at runtime without cluttering your `.env` file.

### 📊 Enterprise Observability

Never guess why your application is slow again.

- **OpenTelemetry (Tracing)**: Automatically instruments Express and your database to generate beautiful waterfall latency graphs.
- **Prometheus Metrics**: Built-in `/metrics` endpoint to feed dashboards like Grafana.
- **Health Checks**: Standardized `/health` endpoints for Kubernetes/Docker container orchestration.

### 📜 Auto-Generated Documentation

- **Zod to OpenAPI**: Define your validation schemas once using `Zod`, and Forge automatically translates them into a stunning, interactive Swagger UI documentation site.

### 🗂️ Asynchronous Audit Logging

- **Database Agnostic**: Intercepts mutating requests (POST, PUT, DELETE) and emits strongly-typed events to a local `EventBus`. Your application can listen to these events and save them to MongoDB, Postgres, or Elasticsearch without the boilerplate ever forcing a specific database on you.

### 🏢 Multi-Tenancy & Webhooks

- **Tenant Context**: Automatically resolve and isolate tenant identifiers for SaaS applications.
- **Secure Webhooks**: Safely parse raw bodies and verify cryptographic signatures from providers like Stripe or GitHub.

### 🛡️ Enterprise Core Utilities

- **High-Performance Logger**: Built on `pino`, providing JSON logs in production and pretty-printed logs in development.
- **EventBus**: Decouple your domain logic natively! Emit events (like `user.created`) and let decoupled listeners handle side-effects (emails, analytics).
- **Standardized Responses & Errors**: Never write inconsistent API responses again. Uses `ApiResponse` builders for successes and a global Error Handler that catches `AppError` instances to format beautiful error payloads.
- **Zod Request Validation**: Intercept and validate request bodies, query strings, and params using strictly-typed Zod schemas before they ever reach your controllers.

### 🔒 Security & Data Integrity

- **Environment Validation**: Uses `zod` to strictly validate `process.env` variables on boot. The server will not start if required secrets are missing.
- **Security Headers & CORS**: Integrated with `helmet` and highly configurable `cors` to protect against common web vulnerabilities.
- **Database Ready**: Pre-configured with a clean `Mongoose` setup for MongoDB, but abstracted cleanly so you can easily swap to Prisma, Postgres, or MySQL.

### 🛠️ Developer Experience (DX) & Tooling

- **Hot-Reloading**: Uses `ts-node-dev` for instant, blazing-fast recompilation during development.
- **Strict Code Quality**: Pre-configured with `ESLint`, `Prettier`, and `Husky` pre-commit hooks (`lint-staged`, `commitlint`) to enforce immaculate code standards across your team.
- **Testing Suite Ready**: Configured with `Jest` and `supertest` for unit and integration testing.
- **Clean Imports**: Fully configured TypeScript path aliases (`@/*` and `@forge/*`) to eliminate ugly relative imports.
- **Dockerized**: Includes a production-ready, multi-stage `Dockerfile` and a `docker-compose.yml` for local development.

---

## 📁 Architecture & Folder Structure

We enforce a strict separation between framework utilities and your actual application logic:

```text
.
├── forge/                  # 🛡️ The Enterprise Framework Layer
│   ├── audit/              # Event-driven asynchronous audit logging
│   ├── auth/               # JWTs, Cookies, 2FA, API Keys
│   ├── docs/               # Auto-generated Swagger/OpenAPI via Zod
│   ├── errors/             # Standardized AppError and global error handlers
│   ├── events/             # Native EventBus for decoupled domain logic
│   ├── logger/             # High-performance Pino logger configuration
│   ├── middleware/         # Flexible Auth, Error, & Tenancy middleware
│   ├── observability/      # OpenTelemetry tracing, Metrics, Health checks
│   ├── response/           # Standardized API response formatting (Success/Fail)
│   ├── service-client/     # Native Circuit Breakers & HTTP microservice clients
│   ├── tenancy/            # Multi-tenancy context isolation and resolution
│   ├── validation/         # Request validation logic using Zod
│   └── webhooks/           # Cryptographic signature validation for raw payloads
│
├── src/                    # 🚀 Your Application Logic
│   ├── config/             # Zod-validated environment config
│   ├── controllers/        # Express route handlers
│   ├── dto/                # Data Transfer Objects
│   ├── middleware/         # App-specific custom middleware
│   ├── models/             # Database schemas (e.g., Mongoose/Prisma)
│   ├── providers/          # Third-party service integrations
│   ├── routes/             # Express routers and endpoint definitions
│   ├── services/           # Core business logic layer
│   ├── types/              # TypeScript global type definitions
│   ├── utils/              # Helper functions and utilities
│   ├── validators/         # Zod schemas for input validation
│   └── app.ts              # Express application assembly
│
├── .github/workflows/      # ⚙️ CI/CD Pipelines (Build, Test, Deploy)
├── server.ts               # 🚀 Application Entry Point (Bootstrapper)
└── tsconfig.json           # 🛠️ Path aliases (@/* and @forge/*)
```

---

## 🚀 Getting Started

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/prasanth-t0205/expressjs-boilerplate.git
cd expressjs-boilerplate
npm install
```

_(Optional)_ Run the interactive rename script to automatically update the boilerplate name to your custom project name across all files:

```bash
npm run rename
```

### 2. Environment Configuration

Copy the sample environment file. Note that we strictly limit `.env` variables to infrastructure secrets (Database URI, JWT Secrets). All feature flags are configured programmatically in code!

```bash
cp .env.example .env
```

### 3. Running the Server

Start the development server with hot-reloading:

```bash
npm run dev
```

To compile and run in production mode:

```bash
npm run build
npm start
```

### 4. 📜 Available Scripts

This boilerplate includes a comprehensive suite of scripts to manage the entire application lifecycle.

| Command                   | Description                                                                               |
| :------------------------ | :---------------------------------------------------------------------------------------- |
| `npm run dev`             | Starts the development server with blazing-fast hot-reloading via `ts-node-dev`.          |
| `npm run build`           | Compiles the TypeScript application into the `dist/` directory and resolves path aliases. |
| `npm start`               | Runs the compiled production code (`node dist/server.js`).                                |
| `npm run typecheck`       | Runs the TypeScript compiler strictly to check for typing errors without emitting files.  |
| `npm run lint`            | Lints the entire codebase using ESLint to enforce code quality.                           |
| `npm test`                | Executes the Jest testing suite.                                                          |
| `npm run test:watch`      | Runs Jest in interactive watch mode for active development.                               |
| `npm run test:coverage`   | Runs Jest and generates a detailed test coverage report.                                  |
| `npm run rename`          | Runs a custom script to quickly rename the boilerplate to your new project's name.        |
| `npm run reset`           | Runs a clean-up script to wipe boilerplate-specific git history and reset the repository. |
| `npm run update:packages` | Automatically checks for and safely updates all `package.json` dependencies.              |

---

## ⚙️ CI/CD Pipelines

This boilerplate includes robust GitHub Actions workflows out of the box, ensuring absolute confidence in your deployments.

### Continuous Integration (`ci.yml`)

Triggers on Pull Requests to `main`.

- Validates the codebase using `ESLint`.
- Ensures strict TypeScript compliance using `npm run typecheck`.
- Executes the Jest testing suite.

### Continuous Deployment (`cd.yml`)

Triggers on pushes to `main`.

1. Compiles the TypeScript application.
2. Builds a lightweight Docker Image using the included multi-stage `Dockerfile`.
3. Pushes the Docker image to the GitHub Container Registry (`ghcr.io`).
4. (Optional) Triggers a deployment webhook for platforms like Render, Railway, or Fly.io.

---

## 🤝 Contributing

Contributions are always welcome! If you want to add new enterprise features to the `forge/` directory or improve existing logic:

1. **Fork the Repository**: Create your own copy of the project.
2. **Create a Branch**: `git checkout -b feature/amazing-feature`
3. **Make your Changes**: Ensure you adhere to the strict TypeScript configuration.
4. **Run the Checks**: Ensure `npm run typecheck` and `npm run lint` pass successfully.
5. **Open a Pull Request**: Submit your PR with a detailed explanation of your changes. We will review and merge it!

<div align="center">
  <p>Built with ❤️ for developers who love clean architecture.</p>
</div>
