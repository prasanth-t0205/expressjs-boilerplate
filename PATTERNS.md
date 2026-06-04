# 🏗️ Architecture Patterns

While the `src/forge/` directory contains real, working code that you can import and execute, this document outlines the **recommended conventions and architectural patterns** for building inside this boilerplate. These patterns describe _how_ to build your database access and feature modules.

---

## 1. Soft Delete Convention

Instead of permanently deleting records from the database, we recommend marking them as deleted with a timestamp.

**The Implementation Pattern:**

1. Add `deletedAt: Date | null` and `isDeleted: boolean` to your database schema.
2. In your queries, always include `{ isDeleted: false }` to hide deleted records.
3. Instead of running a `DELETE` command, perform an `UPDATE` that sets `isDeleted: true` and `deletedAt: new Date()`.

**GDPR Erasure Note:**
Soft delete is NOT a substitute for GDPR erasure requests. When a user requests data deletion, you must truly erase their PII (Personally Identifiable Information). Soft delete is for operational safety, auditing, and recovery. For GDPR compliance, implement a separate routine that hard-deletes or fully anonymizes PII fields.

---

## 2. Repository Pattern

We enforce the Repository Pattern to completely decouple your business logic from your database ORM.

**The Implementation Pattern:**

1. **Controllers** parse the HTTP request, pass data to the Service, and format the response.
2. **Services** contain pure business rules. They NEVER import Mongoose models directly.
3. **Repositories** handle all direct database access.

This ensures that if you ever need to switch from MongoDB to PostgreSQL, you only rewrite the Repository files, and your core business logic remains completely untouched.

---

## 3. Pagination Convention

Never invent your own pagination response formats. Always use the standardized `paginate` utility provided in the Forge core layer.

**The Implementation Pattern:**
When returning a list of resources from a Controller, use `ApiResponse.paginate()` to guarantee a consistent API contract across your entire application.

```typescript
import { ApiResponse } from '@/forge/response';

return ApiResponse.paginate(res, items, 1, 10, totalCount, 'Items retrieved successfully');
```

---

## 4. Error Handling Convention

Do not use `res.status(500).json(...)` manually anywhere in your code. We rely on a centralized error handling strategy.

**The Implementation Pattern:**
Always throw an `AppError` and let the global error handler catch it and format the response for the client.

```typescript
import { AppError } from '@/forge/errors';

if (!user) {
  throw new AppError('User not found', 404);
}
```

This guarantees that all error responses follow the exact same JSON structure, and that internal server errors do not leak stack traces into production.
