# Frontend Architecture

This document describes the architecture of the Next.js frontend application.

## Overview

The frontend is a Next.js 16 application using the App Router. It serves as a BFF (Backend-for-Frontend), handling authentication, token management, and proxying requests to backend microservices.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Load Balancer + Firewall                      │
│                    (Cloud Run / GCP / AWS)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  React Pages     │  │  API Routes      │  │  Middleware   │  │
│  │  (Client)        │  │  (Server)        │  │  (Edge)       │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│           │                    │                                 │
│           │                    │   HttpOnly Cookies              │
│           │                    │   (accessToken, refreshToken)   │
│           ▼                    ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Internal API Client (axios)                    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Kong Gateway                               │
│              (Rate limiting, routing, auth headers)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Service │  │ BFF Service  │  │ Other APIs   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
apps/frontend/
├── app/                      # Next.js App Router
│   ├── (public)/             # Unauthenticated routes
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── confirm/          # Email confirmation landing
│   │   └── confirm-email/    # Unconfirmed email prompt
│   ├── (protected)/          # Authenticated routes
│   │   └── user/
│   │       └── home/
│   ├── api/                  # API route handlers
│   │   ├── auth/             # Authentication endpoints
│   │   └── user/             # User data endpoints
│   └── health/               # Health check endpoint
├── components/
│   ├── auth/                 # Authentication forms
│   ├── layout/               # App shell (sidebar, topbar)
│   ├── theme/                # Theme toggle
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── externalApi/          # Generated API clients
│   ├── nextApi/              # Internal API call utilities
│   ├── utils/                # Utility functions
│   └── validations/          # Zod schemas
└── providers/                # React context providers
```

## Authentication Flow

### Registration

```
User → Signup Form → /api/auth/signup → Auth Service
                          │
                          ▼
                    Bot Detection Check
                          │
                          ▼
                    Create Account
                          │
                          ▼
              Send Confirmation Email
                          │
                          ▼
              Redirect to /confirm-email
```

### Email Confirmation

```
User clicks email link → /confirm?token=xxx
                              │
                              ▼
                    /api/auth/confirm
                              │
                              ▼
                    Auth Service validates token
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
         Valid token                    Invalid/expired
              │                               │
              ▼                               ▼
    Set HttpOnly cookies              Show error + resend option
    Redirect to /user/home
```

### Login

```
User → Login Form → /api/auth/login → Auth Service
                         │
                         ▼
                   Bot Detection Check
                         │
                         ▼
                   Validate Credentials
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
    Success                         Failure
         │                               │
         ▼                               ▼
  Set HttpOnly cookies              Return error
  (accessToken, refreshToken)       (401/403)
         │
         ▼
  Redirect to /user/home
```

### Token Refresh

The `authenticatedClient` axios instance automatically handles token refresh:

```
API Request → 401 Response
                  │
                  ▼
        POST /api/auth/refresh-token
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
  Success                 Failure
      │                       │
      ▼                       ▼
  Set new cookies        Clear cookies
  Retry original         Redirect to /login
  request
```

## Bot Detection

Forms use behavioral analysis to detect bots without CAPTCHAs.

### Detection Signals

| Signal | What it measures |
|--------|------------------|
| Mouse movements | Natural cursor patterns |
| Typing events | Human-like keystroke patterns |
| Focus events | Tab/click interactions |
| Time spent | Form completion duration |
| Honeypot | Hidden field that bots fill |

### Integration

```tsx
import { useBotDetection, BotProtectedForm, Honeypot } from "@tsdevstack/react-bot-detection";

function SignupForm() {
  const { botDetection, startTracking, stopTracking, setHoneypotTriggered } = useBotDetection();

  const onSubmit = async (data) => {
    await api.post("/api/auth/signup", {
      ...data,
      botDetection: stopTracking(), // Get final detection result
    });
  };

  return (
    <BotProtectedForm onSubmit={onSubmit}>
      {/* Form fields */}
      <Honeypot onTrigger={() => setHoneypotTriggered(true)} />
    </BotProtectedForm>
  );
}
```

### Server-Side Validation

```typescript
// In API route
if (botDetection.isBot || botDetection.score > 50) {
  return NextResponse.json(
    { error: "Suspicious activity detected" },
    { status: 429 }
  );
}
```

## Token Management

### Storage Strategy

Tokens are stored in HttpOnly cookies, not accessible to JavaScript:

| Cookie | Purpose | Lifetime |
|--------|---------|----------|
| `accessToken` | API authentication | 15 minutes |
| `refreshToken` | Obtain new access tokens | 7 days |

### Cookie Configuration

```typescript
// lib/utils/cookies.ts
setHttpOnlyCookie(response, name, value, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});
```

### Why HttpOnly?

- **XSS Protection**: JavaScript cannot read tokens, preventing theft via XSS
- **Automatic Sending**: Browser automatically includes cookies in requests
- **Server Control**: Only server can set/clear tokens

## Validation

All form data is validated using Zod schemas with a two-layer approach:

### Frontend Schema (UI validation)
```typescript
// User-friendly messages for form fields
export const signupFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  acceptedTerms: z.literal(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### API Schema (Server validation)
```typescript
// Validates what gets sent to backend (no confirmPassword or acceptedTerms)
const signupApiSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  botDetection: botDetectionSchema,
});
```

### Login Schema
```typescript
// Login only validates non-empty fields — no password complexity rules.
// The server returns "Invalid credentials" for wrong passwords.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
```

### Schema Organization

```
lib/validations/
├── base.schemas.ts           # Reusable field schemas
├── signup.schemas.ts         # Signup form + API schemas
├── login.schemas.ts          # Login schemas
├── forgot-password.schemas.ts
├── reset-password.schemas.ts
└── auth.schemas.ts           # Barrel file (re-exports all)
```

## Route Groups

Next.js route groups organize routes without affecting URLs:

### `(public)` - Unauthenticated Routes

No authentication required. Contains:
- Login, signup, password reset flows
- Email confirmation pages

### `(protected)` - Authenticated Routes

Wrapped with `ProtectedProviders` that:
1. Load user data via `UserDataProvider`
2. Check email confirmation status
3. Verify account is active
4. Redirect to appropriate page if checks fail

## API Route Pattern

All API routes follow a consistent pattern:

```typescript
// app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate with Zod
    const validation = validateLoginRequest(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: "Invalid request", details: validation.errors }, { status: 400 });
    }

    // 3. Bot detection check
    if (botDetection.isBot || botDetection.score > 50) {
      return NextResponse.json({ error: "Suspicious activity" }, { status: 429 });
    }

    // 4. Call backend service
    const response = await authClient.v1.login(validation.data);

    // 5. Handle tokens (if applicable)
    const res = NextResponse.json({ message: "Success" });
    setTokenCookies(res, accessToken, refreshToken);

    return res;
  } catch (error) {
    // 6. Consistent error handling
    return handleApiError(error, "User-friendly error message");
  }
}
```

## Security

### Headers

Security headers are configured in `next.config.ts`:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-DNS-Prefetch-Control` | `on` | Improve performance |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |

### Open Redirect Prevention

Login redirect URLs are validated to prevent open redirect attacks:

```typescript
// Only allow relative paths starting with /
const safeUrl = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
  ? callbackUrl
  : "/user/home";
router.push(safeUrl);
```

### Password Requirements

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

## Testing

Tests use Vitest with React Testing Library:

```bash
npm run test              # Run tests
npm run test:coverage     # Run with coverage report
```

### Coverage Thresholds

The project enforces 80% coverage across:
- Statements
- Branches
- Functions
- Lines

### Excluded from Coverage

- `components/ui/` - Third-party shadcn components
- `lib/externalApi/` - Generated API client wiring

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ACCESS_TOKEN_TTL` | Access token lifetime (seconds) | 900 (15 min) |
| `REFRESH_TOKEN_TTL` | Refresh token lifetime (seconds) | 604800 (7 days) |
| `NODE_ENV` | Environment mode | development |

## Dependencies

### Core
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### Validation & Forms
- **Zod** - Schema validation

### UI
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **Lucide React** - Icons

### HTTP
- **Axios** - HTTP client with interceptors

### Bot Detection
- **@tsdevstack/react-bot-detection** - Behavioral bot detection