# 🛠️ Enterprise Examples Guide

Welcome to the **Forge Examples Guide**. This document provides comprehensive, real-world examples of how to integrate and use the powerful enterprise utilities located in the `forge/` directory within your business logic (`src/`).

---

## 1. 🗂️ Asynchronous Audit Logging (`forge/audit`)

The Audit module allows you to track mutating actions securely and asynchronously without tying your core utilities to a specific database.

### Example: Setting up Global and Route-Level Audit Logging

You can configure auditing globally for all mutating endpoints, or explicitly opt-out for specific routes. Furthermore, you can manually trigger custom audit logs inside your services.

```typescript
// src/routes/payment.route.ts
import { Router } from 'express';
import { auditMiddleware, noAudit } from '@forge/audit';
import * as paymentController from '@/controllers/payment.controller';

const router = Router();

// 1. Apply globally to this router (tracks all POST, PUT, DELETE)
router.use(auditMiddleware);

// This POST request is automatically audited!
// Action: 'payment.post', Success/Fail status captured automatically.
router.post('/charge', paymentController.chargeCustomer);

// 2. Opt-out of auditing using 'noAudit'
// Maybe we don't want to audit health pings or generic getters
router.get('/status', noAudit, paymentController.getStatus);

export default router;
```

### Example: Emitting Custom Audit Logs from a Service

Sometimes you need to log specific business events with deep contextual data (like `before` and `after` states).

```typescript
// src/services/user.service.ts
import { AuditLogger } from '@forge/audit';
import { User } from '@/models/user.model';

export const updateUserEmail = async (userId: string, newEmail: string, req: Request) => {
  const user = await User.findById(userId);
  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  // Manually trigger a detailed Audit Log
  await AuditLogger.logFromRequest(
    req,
    'user.update_email', // Custom Action
    'users', // Resource name
    true, // Success status
    userId, // Resource ID
    null, // Error Message (none)
    { email: oldEmail }, // Before state
    { email: newEmail }, // After state
  );

  return user;
};
```

---

## 2. 🔐 Authentication & Authorization (`forge/auth`)

Forge provides powerful factory functions that give you absolute control over how you authenticate and authorize users.

### Example: Advanced Authentication Strategy

Instead of strictly enforcing JWTs in headers, you can build a custom authentication strategy that checks cookies, headers, and validates against a database.

```typescript
// src/middleware/customAuth.middleware.ts
import { authenticate } from '@forge/middleware';
import { User } from '@/models/user.model';
import { AppError } from '@forge/errors';

export const requireVerifiedUser = authenticate({
  // Automatically check the 'accessToken' cookie FIRST, then fallback to Header
  extractFrom: ['cookie', 'header'],
  cookieName: 'accessToken',

  // Is this endpoint public but can show personalized data if logged in?
  optional: false,

  // Inject a custom verification strategy
  verify: async (token, req) => {
    // 1. Verify the JWT and find the user in the database
    const user = await User.findOne({ token, isActive: true });

    // 2. Throw an error if the user is banned or token is invalid
    if (!user) {
      throw new AppError('Invalid token or inactive account', 401);
    }

    // 3. Attach the full database object to req.user!
    return user;
  },
});
```

### Example: Complex Business Logic Authorization

Role-based access control (RBAC) is often not enough. Forge allows you to pass custom business-logic policies directly into the router.

```typescript
// src/routes/user.route.ts
import { Router } from 'express';
import { authorize } from '@forge/middleware';
import { requireVerifiedUser } from '@/middleware/customAuth.middleware';
import * as userController from '@/controllers/user.controller';

const router = Router();

// Apply the custom authentication we built above
router.use(requireVerifiedUser);

// 1. Simple Role-Based Authorization
// Only SuperAdmins can delete accounts
router.delete('/:id', authorize('superadmin'), userController.deleteUser);

// 2. Advanced Policy Authorization
// Users can update their OWN profile, or an Admin can update it for them.
router.patch(
  '/:id',
  authorize({
    policy: async (req) => {
      const isOwner = req.user._id.toString() === req.params.id;
      const isAdmin = req.user.role === 'admin';

      return isOwner || isAdmin; // If true, access granted. If false, 403 Forbidden!
    },
  }),
  userController.updateUser,
);

export default router;
```

### Example: Issuing Tokens & Setting Cookies

When a user logs in, Forge provides flexible utilities for generating tokens and securely setting HttpOnly cookies.

```typescript
// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { generateTokens, setRefreshCookie } from '@forge/auth';

export const login = async (req: Request, res: Response) => {
  // ... database verification logic ...
  const payload = { id: user._id, role: user.role };

  // 1. Generate Access & Refresh Tokens
  // You can optionally pass { secret: 'xxx', expiresIn: '1h' } to override defaults!
  const { accessToken, refreshToken } = generateTokens(payload);

  // 2. Set the Refresh Token in a highly-secure HttpOnly cookie
  setRefreshCookie(res, refreshToken, {
    cookieName: 'my_refresh_cookie',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
  });

  // 3. Return the Access Token to the client
  res.status(200).json({
    success: true,
    data: { accessToken, user },
  });
};
```

---

## 3. 📜 Auto-Generated Documentation (`forge/docs`)

Forge uses Zod to automatically generate your Swagger/OpenAPI documentation. This guarantees your runtime validation code and your API documentation are always 100% in sync!

### Example: Defining Schemas and Registering Routes

Instead of writing YAML files by hand, you register your Zod schemas and routes directly using the `registry`.

```typescript
// src/validators/user.validator.ts
import { z } from 'zod';
import { registry } from '@forge/docs';

// 1. Define your Zod schema as you normally would
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
  }),
});

// 2. Define the response schema
const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: z.string().datetime(),
});

// 3. Register the Route in the OpenAPI Spec!
registry.registerPath({
  method: 'post',
  path: '/api/users',
  description: 'Create a new user',
  summary: 'User Registration',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
      content: {
        'application/json': {
          schema: userResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation Error',
    },
  },
});
```

### Example: Registering Security Components (Bearer Auth)

You can register global security schemes (like JWT Bearer authentication) so the Swagger UI displays the "Authorize" padlock button.

```typescript
// src/forge/docs/security.ts
import { registry } from '@forge/docs';

// Register Bearer Auth Component
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// Now you can require this security scheme on specific paths:
registry.registerPath({
  method: 'get',
  path: '/api/users/me',
  description: 'Get current user profile',
  security: [{ bearerAuth: [] }], // <--- Attaches the padlock!
  responses: {
    200: { description: 'Success' },
  },
});
```

### Example: Initializing Swagger UI in your App

Finally, you wire up the generated documentation to your Express application with a highly customizable setup function.

```typescript
// src/app.ts
import express from 'express';
import { setupSwagger } from '@forge/docs';

const app = express();

// Configure and mount the Swagger documentation
setupSwagger(app, {
  enabled: process.env.NODE_ENV !== 'production', // Disable in prod for security
  title: 'My Enterprise SaaS API',
  version: '2.5.0',
  description: 'Internal API documentation for the billing and user services.',
  path: '/api-docs', // Available at http://localhost:5000/api-docs
});
```

---

## 4. 🚨 Standardized Error Handling (`forge/errors`)

In a massive enterprise application, throwing standard `Error` objects leads to chaotic, inconsistent API responses. The `forge/errors` module forces absolute consistency using the `AppError` class and a global error catcher.

### Example: Throwing an AppError in a Service

Whenever business logic fails, you simply throw an `AppError`. You provide the human-readable message and the HTTP status code (e.g., 404 Not Found, 400 Bad Request, 403 Forbidden).

```typescript
// src/services/user.service.ts
import { AppError } from '@forge/errors';
import { User } from '@/models/user.model';

export const processPayment = async (userId: string, amount: number) => {
  const user = await User.findById(userId);

  if (!user) {
    // Throws a beautifully formatted 404 error!
    throw new AppError('The requested user account could not be found.', 404);
  }

  if (user.balance < amount) {
    // Throws a 400 Bad Request error!
    throw new AppError('Insufficient funds to complete this transaction.', 400);
  }

  // ... continue processing
};
```

### Example: Wiring up the Global Error Handler

You don't need `try/catch` blocks inside every single controller. The `errorHandler` middleware catches any `AppError` thrown anywhere in your app and formats it perfectly for the client.

```typescript
// src/app.ts
import express from 'express';
import { errorHandler } from '@forge/errors';
import userRoutes from '@/routes/user.route';

const app = express();

// 1. Mount your routes
app.use('/api/users', userRoutes);

// 2. Mount the Global Error Handler at the very end!
// If an AppError is thrown in any route, it skips down to here.
app.use(errorHandler);
```

### Expected Output

When an `AppError` is caught, the global handler automatically converts it into a standardized JSON payload so the frontend always knows exactly how to parse errors:

```json
{
  "success": false,
  "error": "Insufficient funds to complete this transaction.",
  "statusCode": 400
}
```

## 5. 📡 Decoupled Domain Logic (`forge/events`)

When a user registers for your application, you might need to: save them to the database, send a welcome email, create a Stripe customer, and log an audit trail.
Doing all of this synchronously inside the Controller leads to incredibly slow API responses and massive spaghetti code. The `forge/events` module uses a native `EventBus` to completely decouple side-effects!

### Example: Emitting an Event from a Service

In your core business logic, you only do the _absolute minimum_ required work (saving the user). Then, you emit an event and immediately return the response to the user.

```typescript
// src/services/user.service.ts
import { eventBus } from '@forge/events';
import { User } from '@/models/user.model';

export const createUser = async (userData: any) => {
  // 1. Save the user to the database
  const user = await User.create(userData);

  // 2. Fire and Forget!
  // We emit an event to the rest of the application so other modules can react.
  // We DO NOT wait for emails or Stripe to finish!
  eventBus.emit('user.registered', {
    userId: user._id,
    email: user.email,
    name: user.name,
  });

  // 3. Immediately return the fast response
  return user;
};
```

### Example: Registering Event Listeners

You create separate files (subscribers) that listen for these events and handle the heavy lifting asynchronously in the background.

```typescript
// src/subscribers/user.subscriber.ts
import { eventBus } from '@forge/events';
import { logger } from '@forge/logger';
import { sendWelcomeEmail } from '@/providers/email.provider';
import { createStripeCustomer } from '@/providers/stripe.provider';

// 1. Listen for the event emitted by the UserService
eventBus.on('user.registered', async (data: { userId: string; email: string; name: string }) => {
  try {
    logger.info(`Processing background tasks for new user: ${data.email}`);

    // 2. Execute slow, third-party tasks asynchronously
    await Promise.all([sendWelcomeEmail(data.email, data.name), createStripeCustomer(data.email)]);

    logger.info(`Successfully onboarded user: ${data.email}`);
  } catch (error) {
    // 3. Catch errors silently so they don't crash the main Express server
    logger.error(
      { err: error, userId: data.userId },
      'Failed to process user registration side-effects',
    );
  }
});
```

### Example: Bootstrapping Subscribers

To ensure your listeners are actively waiting for events, you simply import the subscriber file once when the application boots up.

```typescript
// src/app.ts
import express from 'express';

// Initialize background event subscribers
import '@/subscribers/user.subscriber';

const app = express();
// ... rest of your app logic
```

---

## 6. 📝 High-Performance Logging (`forge/logger`)

Using `console.log` in an enterprise application is a massive anti-pattern. It blocks the main thread, lacks log levels, and is impossible to index in systems like Datadog, ELK, or CloudWatch. The `forge/logger` uses `pino` to write highly-structured, ultra-fast JSON logs.

### Example: Basic Logging vs Structured Logging

Always prefer structured logging (passing an object as the first parameter) so you can easily query your logs in production.

```typescript
// src/services/billing.service.ts
import { logger } from '@forge/logger';

export const processSubscription = async (userId: string, planId: string) => {
  // ❌ BAD: Hard to parse in production
  // logger.info(`User ${userId} started subscription for ${planId}`);

  // ✅ GOOD: Structured logging.
  // In Datadog, you can simply query: `userId:"12345"`
  logger.info({ userId, planId }, 'User started subscription process');

  try {
    // ... complex billing logic ...

    logger.info({ userId, planId, status: 'success' }, 'Subscription processed successfully');
  } catch (error) {
    // ✅ GOOD: Always pass the actual Error object under 'err' or 'error'
    // so Pino can automatically extract the stack trace!
    logger.error({ err: error, userId, planId }, 'Failed to process subscription');

    throw error;
  }
};
```

### Example: Environment-Aware Output

The beauty of the `forge/logger` is that it automatically detects your environment.

If `NODE_ENV=development`:

```text
[21:45:01.123] INFO (12345): User started subscription process
    userId: "user_abc123"
    planId: "premium_tier"
```

If `NODE_ENV=production`:

```json
{
  "level": 30,
  "time": 1717517101123,
  "pid": 12345,
  "userId": "user_abc123",
  "planId": "premium_tier",
  "msg": "User started subscription process"
}
```

This raw JSON is instantly digestible by log aggregators!

---

## 7. 🛡️ Route Protection Factories (`forge/middleware`)

We have separated core authentication logic (`forge/auth`) from the actual Express route protection layer (`forge/middleware`). This layer contains incredibly flexible factory functions that generate Express middleware on the fly.

_(Note: We already showcased basic usage in Section 2, but here is how you can compose them for Enterprise applications!)_

### Example: Composing Reusable Middleware

Instead of defining complex policies inline on every single route, you can use the factories to generate pre-packaged, highly reusable middleware for your specific business domains.

```typescript
// src/middleware/roles.middleware.ts
import { authenticate, authorize } from '@forge/middleware';

// 1. Generate the Authentication layer
export const requireLogin = authenticate({
  extractFrom: ['cookie', 'header'],
  cookieName: 'accessToken',
});

// 2. Generate a standard Role check
export const requireAdmin = authorize('admin', 'superadmin');

// 3. Generate a Complex Policy Check
export const requireSubscription = authorize({
  policy: (req) => req.user.hasActiveSubscription === true,
});

// 4. Group them into a single reusable Express array!
export const requirePaidAdmin = [requireLogin, requireAdmin, requireSubscription];
```

### Example: Applying Composed Middleware

Now your router files remain incredibly clean, readable, and highly secure.

```typescript
// src/routes/dashboard.route.ts
import { Router } from 'express';
import { requirePaidAdmin, requireLogin } from '@/middleware/roles.middleware';
import * as dashboardController from '@/controllers/dashboard.controller';

const router = Router();

// Basic protection
router.get('/profile', requireLogin, dashboardController.getProfile);

// Complex composed protection applied in a single variable!
router.post('/admin/reports', requirePaidAdmin, dashboardController.generateReport);

export default router;
```

---

## 8. 🔍 Enterprise Observability (`forge/observability`)

"Why is the API slow?" In a microservice architecture, finding the bottleneck is impossible without Observability. The `forge/observability` module gives you absolute visibility into your system through Tracing (OpenTelemetry), Metrics (Prometheus), and Health Checks (Kubernetes Probes).

### Example: OpenTelemetry Distributed Tracing

OpenTelemetry hooks into Express, Mongoose, and HTTP out-of-the-box. It tracks exactly how long a request took across every single internal function and database call, rendering beautiful waterfall charts in platforms like Jaeger, Datadog, or Honeycomb.

> [!WARNING]
> Tracing MUST be initialized in `server.ts` **before** importing Express or any other dependencies, otherwise it cannot hook into them!

```typescript
// server.ts
import { initTracing } from '@forge/observability/tracing';

// 1. MUST BE CALLED FIRST!
// This automatically instruments HTTP, Express, and Database queries.
initTracing('expressjs-boilerplate');

// 2. NOW you can safely import the rest of your app
import app from '@/app';
import { env } from '@/config/env.config';
import mongoose from 'mongoose';

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] Running on port: ${PORT}`);
});
```

### Example: Prometheus Metrics

Metrics provide high-level aggregations (e.g., Request Rate, Error Rate, CPU usage) that are scraped by Prometheus and visualized in Grafana dashboards.

```typescript
// src/app.ts
import express from 'express';
import { setupMetrics } from '@forge/observability/metrics';

const app = express();

// 1. Setup the metrics middleware
// This automatically records request durations, status codes, and active connections
setupMetrics(app, {
  path: '/metrics', // The endpoint Prometheus will scrape
  enableDefault: true, // Captures CPU, Memory, and Node.js Event Loop lag
});
```

### Example: Kubernetes Health Checks

If your app is running in Docker, Kubernetes, or AWS ECS, the orchestrator needs to know if the application is alive (`liveness`) and ready to accept traffic (`readiness`).

```typescript
// src/app.ts
import express from 'express';
import { setupHealthChecks } from '@forge/observability/health';
import mongoose from 'mongoose';

const app = express();

// 1. Setup advanced health checks
setupHealthChecks(app, {
  path: '/health',
  checks: [
    {
      name: 'mongodb',
      // The orchestrator hits /health to ensure the DB is actually connected!
      check: async () => mongoose.connection.readyState === 1,
    },
  ],
});
```

---

## 9. 🔌 Microservice Resilience (`forge/service-client`)

In an enterprise environment, microservices talk to each other constantly. If one service goes down, it can cause a cascading failure that takes down your entire system. The `forge/service-client` module provides a dynamic Service Registry and a Circuit Breaker-protected HTTP Client to guarantee absolute resilience.

### Example: Programmatic Service Registration

Instead of hardcoding URLs or bloating your `.env` file, you can dynamically register your microservices in `app.ts` so they are available globally.

```typescript
// src/app.ts
import { serviceRegistry } from '@forge/service-client/serviceRegistry';

// Register external APIs or internal Microservices at runtime!
serviceRegistry.register('billing-service', 'http://billing-api:4000/api/v1');
serviceRegistry.register('auth-service', 'http://auth-api:3000/api/v1');
serviceRegistry.register('github-api', 'https://api.github.com');
```

### Example: The Circuit Breaker HTTP Client

You don't need `axios` or messy `node-fetch` wrappers. `httpClient` is a strictly-typed, native fetch wrapper.
More importantly, if the downstream service fails repeatedly, the internal **Circuit Breaker** "Opens" and instantly rejects new requests without waiting for timeouts, saving your server from memory exhaustion!

```typescript
// src/services/subscription.service.ts
import { httpClient } from '@forge/service-client/httpClient';

export const upgradeUserPlan = async (userId: string, planName: string) => {
  try {
    // 1. We call the billing-service (automatically resolves the URL from the registry!)
    // 2. We pass generic types <ResponseData, RequestBody> for perfect TypeScript inference.
    const response = await httpClient.post<
      { success: boolean; invoiceId: string },
      { userId: string; plan: string }
    >(
      'billing-service', // Service name from the registry
      '/subscriptions/upgrade', // Endpoint path
      {
        body: { userId, plan: planName },
        headers: { 'X-Internal-Token': 'super-secret' },
        timeout: 5000, // Fails fast if the billing service is slow!
      },
    );

    return response.invoiceId;
  } catch (error) {
    // If the billing service is down, the Circuit Breaker will "Open".
    // Subsequent calls will instantly throw an error here, giving the billing service time to recover!
    throw new Error('Failed to communicate with the billing service.');
  }
};
```

---

## 10. 🏢 Multi-Tenancy Isolation (`forge/tenancy`)

If you are building a B2B SaaS application (e.g., Shopify, Slack), your database contains data for hundreds of different companies. A massive security risk is accidentally leaking data from "Tenant A" to "Tenant B". The `forge/tenancy` module solves this by extracting the Tenant ID and injecting it into a globally accessible `AsyncLocalStorage` context, meaning you never have to manually pass `req.tenantId` deep into your services!

### Example: The Tenant Middleware

You can configure the middleware to automatically extract the Tenant ID from a subdomain (e.g., `acme.myapp.com`), a custom header, or a query parameter.

```typescript
// src/app.ts
import express from 'express';
import { tenantMiddleware } from '@forge/tenancy/tenant.middleware';

const app = express();

// 1. Mount the Tenancy Middleware globally
// It will automatically check the 'x-tenant-id' header or the 'tenant' query param
app.use(
  tenantMiddleware({
    headerName: 'x-tenant-id',
    queryParam: 'tenant',
    requireTenant: false, // Set to true if EVERY route strictly requires a tenant
  }),
);
```

### Example: Accessing Tenant Context in Deep Services

Because Forge uses `AsyncLocalStorage`, the Tenant ID is magically available ANYWHERE in your codebase for the duration of that specific HTTP request. You do not need to pass the `req` object down into your repositories!

```typescript
// src/repositories/product.repository.ts
import { getTenantId, getTenantContext } from '@forge/tenancy/tenantContext';
import { Product } from '@/models/product.model';

export const getProductsForCurrentTenant = async () => {
  // 1. Retrieve the Tenant ID globally without needing the Express 'req' object!
  const tenantId = getTenantId();

  if (!tenantId) {
    throw new Error('This internal function cannot be called without an active Tenant Context!');
  }

  // 2. Query the database strictly for this tenant
  return await Product.find({ tenantId: tenantId });
};
```

### Example: The Full Context Object

You can also store entire objects (like the full Tenant database record) inside the context so it can be accessed globally.

```typescript
// src/middleware/loadTenant.middleware.ts
import { getTenantContext } from '@forge/tenancy/tenantContext';
import { Tenant } from '@/models/tenant.model';

export const loadFullTenant = async (req: Request, res: Response, next: NextFunction) => {
  const context = getTenantContext();
  if (!context || !context.tenantId) return next();

  // Load from database
  const fullTenant = await Tenant.findById(context.tenantId);

  // Attach it to the global async context
  context.tenant = fullTenant;

  next();
};

// Now anywhere in your app:
// const { tenant } = getTenantContext()!;
// console.log(tenant.name); // "Acme Corp"
```

---

## 11. ✅ Request Validation (`forge/validation`)

Never trust client data. The `forge/validation` module uses Zod to strictly validate and strip incoming requests before they ever reach your controllers. If a payload is bad, it automatically throws a 400 Bad Request error.

### Example: Validating Body, Params, and Query

You define Zod schemas for the exact structure you expect. The middleware automatically validates all three components (`body`, `params`, `query`) simultaneously.

```typescript
// src/validators/search.validator.ts
import { z } from 'zod';
import { validate } from '@forge/validation/validate.middleware';

// 1. Define the schema
export const searchProductsSchema = z.object({
  query: z.object({
    searchTerm: z.string().min(3),
    category: z.enum(['electronics', 'clothing', 'home']).optional(),
    page: z.coerce.number().int().min(1).default(1),
  }),
});

// src/routes/product.route.ts
import { Router } from 'express';
import { validate } from '@forge/validation/validate.middleware';
import { searchProductsSchema } from '@/validators/search.validator';
import * as productController from '@/controllers/product.controller';

const router = Router();

// 2. Intercept the request!
// If the user searches for '?searchTerm=ab' (too short), they instantly get a 400 error!
router.get('/search', validate(searchProductsSchema), productController.searchProducts);
```

---

## 12. 🪝 Secure Webhooks (`forge/webhooks`)

When third-party providers (like Stripe or GitHub) send events to your server, you MUST verify that the request actually came from them. You do this by comparing a cryptographic signature against the raw, unparsed request body.

### Example: Preserving the Raw Body

If Express parses the request into JSON before you verify it, the signature will fail! Forge provides `captureRawBody` to safely cache the unparsed buffer.

```typescript
// src/app.ts
import express from 'express';
import { captureRawBody } from '@forge/webhooks/rawBody';

const app = express();

// 1. You MUST apply the raw body capturer globally BEFORE express.json()
app.use(captureRawBody);

// 2. Now you can safely parse JSON for the rest of your app
app.use(express.json());
```

### Example: Verifying Stripe Webhooks

Forge includes built-in signature verifiers for major platforms. Simply pass the Express request, your secret, and Forge guarantees the webhook is authentic.

```typescript
// src/controllers/webhook.controller.ts
import { Request, Response } from 'express';
import { verifyStripeSignature } from '@forge/webhooks/stripe';
import { env } from '@/config/env.config';

export const handleStripeWebhook = (req: Request, res: Response) => {
  try {
    // 1. This function automatically extracts the 'stripe-signature' header,
    // grabs the raw buffer we saved earlier, and cryptographically verifies it!
    const event = verifyStripeSignature(req, env.STRIPE_WEBHOOK_SECRET);

    // 2. Safely handle the event now that we know it's truly from Stripe
    if (event.type === 'payment_intent.succeeded') {
      console.log('Payment received!');
    }

    res.status(200).send('Webhook Received');
  } catch (error) {
    // If the signature doesn't match, someone is trying to hack your server!
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
```
