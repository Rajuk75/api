# School SaaS API

Backend service for an enterprise multi-tenant EdTech platform built with **NestJS**, **TypeScript**, **Prisma**, and **Neon PostgreSQL**.

---

## 🛠 Tech Stack

- **Framework:** NestJS 10 (TypeScript)
- **Database & ORM:** PostgreSQL (Neon Serverless) via Prisma ORM 6
- **Logging:** Winston (`winston-daily-rotate-file`, trace-id tracking)
- **Validation:** `class-validator`, `class-transformer`
- **Testing:** Jest, Supertest

---

## 📁 Project Structure

```text
api/
├── prisma/               # Database schema & migrations
├── src/
│   ├── common/           # Shared guards, decorators, utils, constants
│   ├── config/           # App configuration & environment loader
│   ├── core/             # Core platform features (auth, users, tenants, roles)
│   ├── health/           # Health check endpoints (/health)
│   ├── infrastructure/   # External integrations (database, storage, email)
│   ├── modules/          # Academic product features (students, fees, attendance)
│   ├── super-admin/      # SaaS management (billing, tenant management)
│   ├── app.module.ts     # Root module
│   └── main.ts           # App bootstrap & global middleware
├── test/                 # E2E test suites
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:<PASSWORD>@ep-quiet-hall-ahk9fdsr-pooler.c-3.us-east-1.aws.neon.tech/school?sslmode=require"

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Redis / Queue
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=debug
ENABLE_FILE_LOGGING=false
LOG_MAX_FILES=14d
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run Development Server
```bash
npm run start:dev
```
The server will start at `http://localhost:5000`.

---

## 🧩 Core Patterns & Utilities

### 1. Request Validation (DTOs)
All incoming payloads are automatically validated via NestJS `ValidationPipe` using `class-validator`.

```typescript
// src/modules/students/dto/create-student.dto.ts
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
```

- **`whitelist: true`**: Automatically strips any properties not defined in the DTO.
- **`forbidNonWhitelisted: true`**: Throws an error if unknown properties are passed.
- **`transform: true`**: Automatically casts primitives (e.g. string IDs to numbers).

---

### 2. Standardized Response Helper
Located at `src/common/utils/response.helper.ts`. All controllers use these helpers to maintain consistent JSON response formats across the entire API:

| Helper Function | HTTP Status | Use Case |
| :--- | :---: | :--- |
| `setSuccess(res, data)` | `200` | Successful retrieval or general update |
| `setCreateSuccess(res, data)` | `201` | Resource successfully created |
| `setBadRequest(res, error)` | `400` | Validation or malformed input error |
| `setNotAuthorized(res, error)` | `401` | Missing or invalid authentication token |
| `setForbidden(res, error)` | `403` | Authenticated but lacks required role/permission |
| `setNotFoundError(res, error)` | `404` | Requested record does not exist |
| `setConflictError(res, error)` | `409` | Duplicate resource (e.g., email already taken) |
| `setServerError(res, error)` | `500` | Unexpected server or database exception |

#### Controller Usage Example:
```typescript
import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateStudentDto } from './dto/create-student.dto';
import { setCreateSuccess, setServerError } from '../../common/utils/response.helper';
import logger from '../../common/utils/logger';

@Controller('students')
export class StudentsController {
  @Post()
  async create(@Body() dto: CreateStudentDto, @Res() res: Response) {
    try {
      const student = await this.studentsService.create(dto);
      return setCreateSuccess(res, {
        message: 'Student registered successfully',
        data: student,
      });
    } catch (error) {
      logger.error('Failed to create student', error);
      return setServerError(res, error);
    }
  }
}
```

---

### 3. Winston Logger with Trace ID
Located at `src/common/utils/logger.ts`. Automatically generates a unique UUID `traceID` for each log entry.

```typescript
import logger from '../common/utils/logger';

logger.info('Database connected successfully');
logger.debug('Executing query with parameters', { id: 123 });
logger.error('Failed to process payment', err);
```

**Log Output:**
```text
10-09-26 23:30:15|info|traceID: 4f3a9e22-8d7b-45c1-bc6e-1d9e2a3b4c5d|Server running on port: 5000
```

---

### 4. Health Check
`GET /health`

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Server is healthy and running",
  "status": "ok",
  "uptime": 24.35,
  "timestamp": "2026-10-09T18:00:00.000Z",
  "environment": "development"
}
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run start:dev` | Start the development server with hot-reload |
| `npm run build` | Compile the TypeScript project into `/dist` |
| `npm run start:prod` | Run the compiled production build |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end integration tests |
| `npx prisma studio` | Open the Prisma database management UI |
| `npx prisma db push` | Push Prisma schema changes directly to the database |
