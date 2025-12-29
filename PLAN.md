# Auth Implementation Plan

## Overview
Implement authentication system based on openapi.yaml spec using NextAuth v5 + Prisma.

## Phase 1: Database Setup (P0)

### 1.1 Prisma Client Singleton
- Create `src/lib/prisma.ts` - singleton pattern for Prisma client
- Prevents connection exhaustion in development

### 1.2 Database Migration
- Run `npx prisma migrate dev --name init` to create tables
- Verify User, Account, Session, VerificationToken tables created

## Phase 2: NextAuth Configuration (P0)

### 2.1 Auth Configuration
- Create `src/lib/auth.ts` with NextAuth v5 config
- Providers:
  - **Credentials** (email/password) - primary
  - **Google** (OAuth) - optional, env-based
  - **Facebook** (OAuth) - optional, env-based
- Prisma adapter for session/account storage
- Custom session callback to include user ID, chips, rating

### 2.2 Auth Route Handler
- Create `src/app/api/auth/[...nextauth]/route.ts`
- Export GET and POST handlers from NextAuth

### 2.3 Auth Middleware
- Create `src/middleware.ts` for protected routes
- Protect: `/play`, `/api/games/*`, `/api/users/*`, `/api/friends/*`
- Allow: `/`, `/api/auth/*`

## Phase 3: Custom Auth Endpoints (P0)

### 3.1 Registration API
`POST /api/auth/register`
- Validate email, password (min 8 chars), name with Zod
- Check if email already exists
- Hash password with bcryptjs
- Create user with default chips (1000), rating (1000)
- Create UserStats record
- Return user (without password)

### 3.2 Phone Auth APIs (P1 - after core auth works)
`POST /api/auth/phone/send-code`
- Rate limit: 1 per minute per phone
- Generate 6-digit code
- Store in VerificationToken with 10min expiry
- Send via Twilio (configured in .env)

`POST /api/auth/phone/verify`
- Validate phone + code
- Create/update user
- Create session

## Phase 4: Auth UI Components (P0)

### 4.1 Auth Modal Component
`src/components/auth/AuthModal.tsx`
- Glass-morphism style (matching existing UI)
- Tabs: Login / Register
- Form fields with validation
- Error display
- Loading states

### 4.2 Login Form
- Email input
- Password input
- "Forgot password" link (placeholder)
- Submit button
- OAuth buttons (Google, Facebook)

### 4.3 Register Form
- Name input
- Email input
- Password input (with strength indicator)
- Confirm password
- Terms checkbox
- Submit button

### 4.4 Auth Provider Wrapper
`src/components/providers/AuthProvider.tsx`
- SessionProvider from next-auth/react
- Wrap app in layout.tsx

### 4.5 Header Auth Buttons
- Update home page header
- Show Login/Register when logged out
- Show user avatar + name + chips when logged in
- Dropdown menu: Profile, Settings, Logout

## Phase 5: User API Endpoints (P0)

### 5.1 Current User
`GET /api/users/me` - Get profile
`PATCH /api/users/me` - Update profile (name, locale, cosmetics)

### 5.2 User Stats
`GET /api/users/me/stats` - Get game statistics

### 5.3 Public Profile
`GET /api/users/[userId]` - Public profile view

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── phone/
│   │   │       ├── send-code/route.ts
│   │   │       └── verify/route.ts
│   │   └── users/
│   │       ├── me/
│   │       │   ├── route.ts
│   │       │   └── stats/route.ts
│   │       └── [userId]/route.ts
│   ├── layout.tsx (wrap with AuthProvider)
│   └── page.tsx (add auth buttons to header)
├── components/
│   ├── auth/
│   │   ├── AuthModal.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── UserMenu.tsx
│   └── providers/
│       └── AuthProvider.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── validations/
│       └── auth.ts (Zod schemas)
└── middleware.ts
```

## Implementation Order

1. `src/lib/prisma.ts` - Database client
2. Run migrations
3. `src/lib/auth.ts` - NextAuth config
4. `src/app/api/auth/[...nextauth]/route.ts` - Auth routes
5. `src/app/api/auth/register/route.ts` - Registration
6. `src/lib/validations/auth.ts` - Zod schemas
7. `src/components/providers/AuthProvider.tsx` - Session provider
8. Update `src/app/layout.tsx` - Wrap with provider
9. `src/components/auth/AuthModal.tsx` - Modal container
10. `src/components/auth/LoginForm.tsx` - Login UI
11. `src/components/auth/RegisterForm.tsx` - Register UI
12. `src/components/auth/UserMenu.tsx` - Logged-in menu
13. Update `src/app/page.tsx` - Header auth buttons
14. `src/middleware.ts` - Route protection
15. `src/app/api/users/me/route.ts` - User profile API
16. `src/app/api/users/me/stats/route.ts` - Stats API

## UI Design Notes

- Match existing glass-morphism style: `bg-white/10 backdrop-blur-lg`
- Use amber accent color for CTAs
- Form inputs: `bg-white/20 border-white/30 text-white`
- Error states: red border + text
- Success states: green
- Loading: spinner animation
- Responsive: modal centered, mobile-friendly

## Environment Variables Needed

```env
# Already in .env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=... (generate with: openssl rand -base64 32)

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Phone auth (optional, P1)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```
