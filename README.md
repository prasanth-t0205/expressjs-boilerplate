# 🚀 Ultimate Express.js & TypeScript Boilerplate

<div align="center">
  <p>A production-ready, highly scalable, and extremely robust boilerplate for building enterprise REST APIs with Node.js, Express, and TypeScript.</p>
</div>

---

## 🎯 Our Goal

Express.js is an incredibly unopinionated framework. While its flexibility is its greatest strength, it often leads to chaotic, unmaintainable codebases as projects scale.

**Our goal with this boilerplate is to provide a rigid, enterprise-grade foundation.** We have synthesized the best practices of clean architecture into a ready-to-deploy template. The cornerstone of this architecture is the **Forge Core Utility Layer**, which gives you pre-built, production-ready, database-agnostic building blocks (auth, tokens, standard errors, validation schemas) so you can focus purely on business logic. Whether you are building a small weekend project or a massive monolithic backend for millions of users, this architecture ensures your codebase remains pristine, testable, and highly secure.

## ✨ Key Features

- **Strict TypeScript**: 100% strongly typed with zero `any` usage.
- **Forge Core Utility Layer**: A centralized `src/forge/` layer providing production-ready modules for JWT authentication, bcrypt password hashing, secure httpOnly cookies, API response formatting, and common Zod validations.
- **Database Agnostic Architecture**: Implements the Repository and Service patterns so you can swap MongoDB for PostgreSQL without touching your core logic.
- **Strict Environment Validation**: Uses **Zod** to validate all environment variables on boot. The server strictly refuses to start if `.env` is misconfigured, preventing silent production crashes!
- **Security Hardened**: Pre-configured with `helmet`, strict `cors` policies, and payload size limitations.
- **Centralized Error Handling**: A global `errorHandler` and `AppError` class that seamlessly catches and formats asynchronous errors using a clean `catchAsync` wrapper.
- **Request Validation**: Uses **Zod** middleware to strictly type-check all incoming `req.body`, `req.query`, and `req.params`.
- **Automated Swagger / OpenAPI**: Your Zod schemas serve as the single source of truth, automatically generating beautiful, interactive Swagger documentation at `/api-docs`!
- **Enterprise Path Aliasing**: Uses `@/` aliases configured perfectly via `tsconfig-paths` for local development and securely rewritten via **`tsc-alias`** for production builds. No hacky runtime module interception required!
- **Production Docker Pipeline**: Ships with a multi-stage `Dockerfile` optimized for minimal size (`node:24-slim`), ready to deploy on AWS ECS, Render, or Railway.
- **Local Developer Environment**: A pre-configured `docker-compose.yml` to instantly spin up MongoDB and the API side-by-side.

---

## ⭐️ Show Your Support

If you find this boilerplate helpful in kickstarting your enterprise Express.js applications, please consider giving it a **Star** ⭐️ on GitHub! It helps others find this resource and encourages continuous updates and improvements.

---

## 💻 Getting Started

### 1. Clone the Repository

You can clone the repository via standard Git or using the GitHub CLI:

**Using Git:**

```bash
git clone https://github.com/prasanth-t0205/expressjs-boilerplate.git my-new-api
cd my-new-api
```

**Using GitHub CLI:**

```bash
gh repo clone prasanth-t0205/expressjs-boilerplate
cd expressjs-boilerplate
```

### 2. Rename the Project

Since this is a boilerplate, it defaults to the name `expressjs-boilerplate`. We've included a handy script to instantly rename the `package.json` and Docker containers to your new project name:

```bash
npm run rename my-cool-api
```

### 3. Reset the Boilerplate

When you are ready to start building your own features, you can clear out all the example "User" files (Controllers, Routes, Services, Models, etc.) by running:

```bash
npm run reset
```

You will be asked if you want to completely delete the example files or move them into an `/example` folder for future reference.

### 4. Install Dependencies

Make sure you have Node.js v20+ installed, then install the packages:

```bash
npm install
```

### 4. Environment Variables

Copy the example environment file and fill in your actual database credentials and secrets:

```bash
cp .env.example .env
```

_Note: The server will automatically crash on boot if you forget to fill in the required `MONGO_URI` thanks to our Zod environment validation!_

### 5. Start the Development Server

Run the local server with hot-reloading enabled. It will automatically recompile your TypeScript code whenever you save a file:

```bash
npm run dev
```

---

## 🐳 Docker Setup

If you don't want to install MongoDB locally, or if you want to test the production build, use Docker!

### Local Development (with auto-provisioned MongoDB)

```bash
docker-compose up --build
```

This instantly spins up a local MongoDB container and your Node.js API, automatically connecting them.

### Production Deployment

The included `Dockerfile` uses a multi-stage build. It securely compiles the TypeScript code in Stage 1, then creates a highly-optimized Debian slim container running a non-root `node` user in Stage 2. It is strictly configured for production platforms like Render or AWS.

---

## 📁 Project Structure

```text
expressjs-boilerplate/
├── src/
│   ├── config/           # Strict Zod environment validation & DB configurations
│   ├── controllers/      # Route handlers (Extracts params, calls services, sends JSON response)
│   ├── dto/              # Data Transfer Objects (Strict TS interfaces for API payloads)
│   ├── middleware/       # Global error handler, URL-based rate limiters, Zod validators
│   ├── models/           # Database Schemas (e.g., Mongoose or Prisma)
│   ├── providers/        # 3rd-party SDK Integrations (Stripe, SendGrid, etc.)
│   ├── routes/           # Express Routers mapping endpoints to controllers
│   ├── services/         # Core Business Logic (DB-agnostic)
│   ├── utils/            # Helpers (AppError, catchAsync, Winston logger)
│   ├── validators/       # Zod schemas defining the shape of incoming requests
│   └── app.ts            # Express application configuration
├── tests/                # Unit and Integration tests
├── .env.example          # Template for environment variables
├── .gitignore            # Git ignore file
├── .dockerignore         # Docker ignore file
├── docker-compose.yml    # Local development Docker setup
├── Dockerfile            # Production multi-stage build file
├── package.json          # Project dependencies and scripts
├── server.ts             # Application entry point & graceful shutdown
└── tsconfig.json         # TypeScript compiler configuration
```

---

## 📜 Available Scripts

| Command                   | Description                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`             | Starts the development server using `ts-node-dev` with hot-reloading.          |
| `npm run build`           | Compiles the TypeScript source code and rewrites path aliases via `tsc-alias`. |
| `npm start`               | Runs the compiled output in production using `node dist/server.js`.            |
| `npm run reset`           | Interactively strips or moves the example boilerplate code.                    |
| `npm run typecheck`       | Runs the TypeScript compiler in dry-run mode to check for any type errors.     |
| `npm run lint`            | Lints the codebase using ESLint.                                               |
| `npm run update:packages` | Interactively updates all dependencies to their latest major/minor versions.   |
| `npm run test`            | Runs the Jest test suite.                                                      |
| `npm run test:watch`      | Runs the test suite in watch mode (useful during development).                 |
| `npm run test:coverage`   | Generates a test coverage report.                                              |

---

## 🧪 Testing

This boilerplate uses **Jest** and **Supertest** for robust testing.

1. **Unit Tests**: Place your unit tests for services, utilities, and standalone functions in the `tests/` directory (or alongside the files they test, e.g., `user.service.test.ts`).
2. **Integration Tests**: Test your Express routes using `Supertest` to simulate HTTP requests (see `tests/app.test.ts` for an example).

Run the tests using:

```bash
npm run test
```

---

## ⚡️ Distributed Rate Limiting (Valkey / Redis)

This boilerplate avoids using naive in-memory rate limiters that fail when your application horizontally scales. Instead, it is designed to integrate with **Valkey** (or Redis) for enterprise-grade distributed rate limiting.

Here is the perfect approach to building rate limiters using a distributed key-value store:

### 1. Limiting by User ID (The Best Approach)

For authenticated users, completely ignore their IP address. Apply the limit directly to their unique User ID. This ensures that if a user switches between their phone and laptop, they share the same rate limit pool.
**Valkey Key Format:** `"ratelimit:user:<USER_ID>"`

### 2. Limiting by User ID + Endpoint

Some endpoints (like PDF exports or AI generation) are significantly more computationally expensive than others (like fetching a profile). You should rate limit these expensive endpoints independently of the user's global limit.
**Valkey Key Format:** `"ratelimit:user:<USER_ID>:endpoint:<ENDPOINT_PATH>"`

### 3. Limiting by IP + Endpoint (For Unauthenticated Users)

If the user isn't logged in (e.g., the login screen or public search API), you must fall back to their IP address. However, always combine it with the specific endpoint. This ensures that if they spam the login route, they only get blocked from the login route, rather than being blocked from the entire public application.
**Valkey Key Format:** `"ratelimit:ip:<IP_ADDRESS>:endpoint:<ENDPOINT_PATH>"`

### 🛠️ How to Implement Valkey Rate Limiting

**1. Install Dependencies**
To connect Express to Valkey, install `ioredis` and `rate-limit-redis`:

```bash
npm install express-rate-limit rate-limit-redis ioredis
```

**2. Create the Middleware (`src/middleware/rateLimiter.middleware.ts`)**
Here is a production-ready example using the Boilerplate's standards:

```typescript
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request } from 'express';

// Connect to Valkey (or Redis)
const valkeyClient = new Redis(process.env.VALKEY_URI || 'redis://localhost:6379');

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each user to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,

  // Connect to Valkey Store
  store: new RedisStore({
    sendCommand: (...args: string[]) => valkeyClient.call(...args),
  }),

  // Generate Key based on User ID (or fallback to IP + Endpoint)
  keyGenerator: (req: Request): string => {
    // If the user is logged in, limit by their User ID
    if (req.user && req.user.id) {
      return `ratelimit:user:${req.user.id}`;
    }
    // Fallback for unauthenticated users: IP + Endpoint
    const ip = req.ip || 'unknown';
    return `ratelimit:ip:${ip}:endpoint:${req.originalUrl}`;
  },

  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});
```

**3. Apply it in `src/app.ts`**

```typescript
import { apiRateLimiter } from '@/middleware/rateLimiter.middleware';

// Apply to all API routes
app.use('/api', apiRateLimiter);
```

---

## ⚒️ Forge Core Utility Layer

The `src/forge/` directory is the heart of this boilerplate. It is a collection of pre-built, production-ready, database-agnostic utility modules that every feature in your application can import and use.

Instead of rebuilding auth or error handling from scratch for every project, you write your own business logic and simply **import what you need from forge**.

### What's inside Forge?

1. **`Auth & Tokens`**: Secure JWT generation and verification, cookie handling, and 12-round bcrypt hashing.
2. **`Response & Errors`**: Standardizes all API responses (`ApiResponse.success()`) and provides a global, predictable error handler (`AppError`).
3. **`Middlewares`**: Plug-and-play route guards for authentication (`authenticate`) and role-based access control (`authorize('admin')`).
4. **`Validation`**: Reusable Zod schemas for things like strong passwords, emails, and object IDs.

### How to use it in your code:

```typescript
// 1. Secure Route Guards
import { authenticate, authorize } from '@/forge/middleware';
router.delete('/users/:id', authenticate, authorize('admin'), userController.delete);

// 2. Standardized API Responses
import { ApiResponse } from '@/forge/response';
return ApiResponse.success(res, user, 'User created successfully', 201);

// 3. Easy Password Hashing
import { hashPassword } from '@/forge/auth';
const hashed = await hashPassword('mySecurePassword123!');

// 4. Custom Errors
import { AppError } from '@/forge/errors';
if (!user) throw new AppError('User not found', 404);
```

By keeping these tools completely separated from your database models, your core architecture remains pristine and highly portable!

---

## 📖 Automated Swagger / OpenAPI Documentation

Writing and maintaining API documentation manually is a burden. In this boilerplate, **your Zod validation schemas automatically generate your Swagger UI documentation!**

Because we use Zod as the single source of truth, whenever you update a request schema or add a new field, the Swagger documentation is instantly updated in real-time.

### How it works:

1. **Define your Schema**: You write a Zod schema for request validation (e.g. `UserSchema`).
2. **Register the Path**: You register the endpoint with the `forge/docs` registry.
3. **View the Docs**: Swagger UI automatically renders the interactive documentation at `/api-docs`.

### Example (as seen in `src/app.ts`):

```typescript
import { registry, successResponse } from '@/forge/docs';
import { z } from 'zod';

// 1. Register a schema
const HealthResponseSchema = registry.register(
  'HealthResponse',
  z.object({
    status: z.string(),
    timestamp: z.string(),
  }),
);

// 2. Register the endpoint path
registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Check API health status',
  responses: {
    200: successResponse(HealthResponseSchema, 'API is healthy'),
  },
});
```

To view your interactive documentation, just run the server (`npm run dev`) and visit **`http://localhost:3000/api-docs`**! You can easily toggle documentation on or off in production using the `SWAGGER_ENABLED` environment variable.

---

## ⚙️ CI/CD & Automation

This boilerplate comes with a professional-grade CI/CD pipeline out of the box, designed to keep the codebase perfectly clean and automate deployments.

### 1. Local Git Hooks (Husky & lint-staged)

Before a commit is ever created, **Husky** intercepts the process and runs `lint-staged`. This ensures that ESLint and Prettier are run automatically on your staged files.
Additionally, **commitlint** enforces the [Conventional Commits](https://www.conventionalcommits.org/) standard on all commit messages (e.g., `feat: add user login`, `fix: resolve crash on startup`). If your code fails linting or your commit message is formatted incorrectly, the commit is safely blocked so you can fix it locally!

> ⚠️ **Important**: Under the Conventional Commits standard, the first line of your commit message **must not exceed 100 characters**. If it is too long, the commit will be blocked!

### 2. The Quality Gate (`ci.yml`)

When you open a Pull Request against `main`, the `ci.yml` GitHub Action automatically runs. This acts as a strict quality gate that:

- Typechecks the entire project (`tsc --noEmit`)
- Lints the codebase
- Runs the Jest test suite
- Verifies a 70% test coverage threshold
- Ensures the production build compiles successfully

### 3. The Deploy Pipeline (`cd.yml`)

When code is successfully merged into `main`, the `cd.yml` pipeline triggers. It builds a highly-optimized multi-stage Docker image and deploys it.

> 💡 **Developer Setup**: Inside `.github/workflows/cd.yml`, there are templates for **Render, Railway, Fly.io, and AWS ECS**. Simply uncomment the one you use and add the required secret (like `RENDER_DEPLOY_HOOK_URL`) to your GitHub repository secrets!

### 🛡️ Recommended Branch Protection Rules

For the CI/CD pipeline to be effective, you should enable strict branch protection on `main` in your GitHub repository settings:

1. Require a pull request before merging
2. Require status checks to pass before merging (Search and select the `quality-gate` action)
3. Do not allow bypassing the above settings

---

## 🏗️ Design Patterns (How to build features)

To maintain clean architecture, follow this exact request lifecycle when building new features:

1. **Route** (`user.route.ts`): Receives the HTTP request.
2. **Validator** (`validate.middleware.ts`): Intercepts the request and parses the body against a Zod schema (`user.validator.ts`). If invalid, instantly returns `400 Bad Request` before the controller even executes.
3. **Controller** (`user.controller.ts`): Wrapped in `catchAsync`. It extracts the typed data and passes it to the Service layer. **Do not write database queries here!**
4. **Service** (`user.service.ts`): Performs the core business logic (e.g., checking if an email exists) and queries the database via Repositories or Models.
5. **Controller**: Receives the data back from the Service and sends the successful JSON response to the client.

By strictly decoupling the controller from the service, your codebase becomes significantly easier to test, maintain, and scale!
