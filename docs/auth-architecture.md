# Rightsy Authentication Architecture

This document describes the custom JWT authentication system now used by Rightsy.

## 1. Architecture Overview

The auth system uses a hybrid model:

- Short-lived access JWT stored in an HTTP-only cookie.
- Long-lived opaque refresh token stored in a path-scoped HTTP-only cookie.
- Stateful session and refresh-token records in PostgreSQL.
- Refresh-token rotation on every refresh.
- Token-family invalidation when refresh-token replay is detected.
- Zod schemas shared between route handlers and React Hook Form.
- Same-origin checks on state-changing route handlers.
- In-memory rate limiting abstraction, ready to swap for Redis in distributed deployments.

Access tokens are stateless and fast to verify in `src/proxy.ts`. Refresh tokens are stateful and revocable in the database. This gives the app low-latency route protection while retaining real logout, session revocation, multi-device tracking, and replay detection.

## 2. Folder Structure

- `src/features/auth/schemas`: Zod schemas for login, signup, reset, and profile inputs.
- `src/features/auth/services/token-service.ts`: Access-token signing and verification.
- `src/features/auth/services/session-service.ts`: Sessions, refresh tokens, rotation, revocation, replay detection.
- `src/features/auth/services/session-cookie-service.ts`: HTTP-only cookie creation and cleanup.
- `src/features/auth/services/rate-limit-service.ts`: Abuse prevention abstraction.
- `src/features/auth/services/request-security-service.ts`: same-origin CSRF guard and request metadata extraction.
- `src/features/auth/components`: Login, signup, forgot password, and reset password UI.
- `src/app/api/auth/*`: Route handlers for auth endpoints.
- `src/proxy.ts`: App Router protection and RBAC-aware redirects.
- `prisma/schema.prisma`: Users, sessions, refresh tokens, verification tokens, reset tokens, and audit logs.

## 3. Database Schema

`User` stores the account identity, password hash, role, email verification state, lockout state, and login metadata.

`Session` stores one device/browser login. It lets the system revoke one device without affecting all devices.

`RefreshToken` stores HMAC hashes of opaque refresh tokens, never raw tokens. It tracks token family, rotation, replacement, revocation, and reuse detection.

`VerificationToken` stores hashed email-verification tokens with expiry and consumption state.

`PasswordResetToken` stores hashed password-reset tokens with expiry, consumption state, requester IP, and user agent.

`AuthAuditLog` records security-relevant events such as signup, login failure, login success, refresh rotation, password reset, and email verification.

Important indexes:

- `User.email` is unique for login lookup.
- `Session.userId/status/createdAt` supports session dashboards.
- `RefreshToken.tokenHash` is unique for constant-time lookup.
- `RefreshToken.tokenFamilyId` supports family-wide revocation on replay.
- Token expiry indexes support cleanup jobs.

Cleanup strategy:

- Delete consumed or expired `PasswordResetToken` rows older than 24 hours.
- Delete consumed or expired `VerificationToken` rows older than 7 days.
- Delete revoked refresh tokens after the maximum forensic retention window.
- Mark expired sessions as `EXPIRED`, then delete old sessions after retention.

## 4. JWT Strategy

The access token contains:

- `sub`: user id.
- `sid`: session id.
- `jti`: unique token id.
- `typ`: `access`.
- `role`: `USER` or `ADMIN`.
- `email` and `name` for lightweight user context.
- issuer, audience, issued-at, and expiry claims.

Access tokens expire in 15 minutes. Short expiry limits damage if a token is stolen through a browser exploit, reverse proxy log leak, or endpoint compromise.

Refresh tokens are not JWTs. They are opaque high-entropy random tokens. The database stores only an HMAC hash using `JWT_REFRESH_SECRET`, which means a database leak does not expose usable refresh tokens.

Separate access and refresh secrets reduce blast radius. Rotating an access-token secret does not necessarily invalidate refresh-token hashes, and rotating the refresh secret can force all sessions to reauthenticate.

## 5. Cookie Strategy

Cookies are HTTP-only, same-site, secure in production, and scoped:

- Access cookie: path `/`, short lifetime.
- Refresh cookie: path `/api/auth`, longer lifetime.

Tokens are not stored in `localStorage`. `localStorage` is readable by injected JavaScript, so an XSS bug can exfiltrate tokens. HTTP-only cookies are not readable by JavaScript, which materially reduces token theft risk. Cookies still need CSRF protection, so state-changing route handlers enforce same-origin requests and use `SameSite=Lax`.

In production, prefer `__Host-` cookie names when all traffic is HTTPS and the cookie path can be `/`.

## 6. Signup Flow

1. Browser submits to `/api/auth/signup`.
2. Route handler verifies same-origin request.
3. Zod validates and normalizes email/name/password.
4. Rate limiter throttles email/IP signup abuse.
5. Password is hashed with bcryptjs at cost 12.
6. User is inserted with a unique email constraint.
7. Email-verification token is created in hashed form.
8. Session row is created.
9. Refresh-token row is created with an HMAC hash.
10. Access token is signed.
11. HTTP-only cookies are set.
12. Response returns sanitized user data only.

Duplicate email checks happen before insert and are still protected by the database unique constraint to handle races.

## 7. Login Flow

1. Browser submits to `/api/auth/login`.
2. Same-origin and rate-limit checks run.
3. Zod validates payload.
4. User is looked up by normalized email.
5. Locked accounts are rejected.
6. bcrypt compares the candidate password with the stored hash.
7. Failed attempts increment account counters and can lock the account.
8. Successful login resets failed counters.
9. Session and refresh token are created.
10. Access token and refresh token cookies are set.
11. Audit log records the event.

The error response is intentionally generic for invalid credentials to reduce user enumeration.

## 8. Refresh Flow

The refresh flow rotates tokens on every use:

1. Browser posts to `/api/auth/refresh`.
2. Same-origin and refresh rate-limit checks run.
3. Refresh cookie is read server-side.
4. Token HMAC is looked up in `RefreshToken`.
5. If the token is expired or session is inactive, refresh fails.
6. If the token was already rotated or revoked, the entire token family and session are marked compromised.
7. A new refresh token is generated and stored.
8. The old refresh token is marked rotated, revoked, and linked to the replacement.
9. A new access token is signed.
10. Cookies are replaced atomically from the browser perspective.

Naive refresh systems often keep accepting the same refresh token until expiry. If that token is stolen, both the attacker and the real user can keep minting access tokens. Rotation makes reuse visible: after the legitimate client rotates, any later use of the old token is a replay signal.

## 9. Logout Flow

Logout revokes the active session and refresh tokens, then clears cookies. Because sessions are per device, this supports single-device logout. A future "logout all devices" endpoint should revoke all active sessions for the user.

## 10. Middleware and RBAC

`src/proxy.ts` verifies access JWTs at the edge for protected routes. It does not query the database because edge middleware should remain fast and avoid database connection limits. Stateful session validation still happens inside route handlers such as `/api/auth/me` and assessment APIs.

Protected routes:

- `/dashboard`
- `/forum`

Admin routes:

- `/govtadmin/database`

RBAC is ready through `User.role` and the JWT `role` claim. Admin access currently accepts either the legacy admin cookie or a database user with role `ADMIN`.

## 11. API Endpoints

`POST /api/auth/signup`

- Validates signup payload.
- Checks duplicate email.
- Hashes password.
- Creates user, email-verification token, session, refresh token, access JWT.
- Sets cookies.
- Returns sanitized user.

`POST /api/auth/login`

- Validates credentials.
- Checks account lockout.
- Verifies password.
- Creates session and token pair.
- Sets cookies.

`POST /api/auth/refresh`

- Reads refresh cookie.
- Rotates refresh token.
- Detects replay and revokes token family.
- Sets new cookies.

`POST /api/auth/logout`

- Revokes current session.
- Revokes refresh token session when available.
- Clears cookies.

`GET /api/auth/me`

- Verifies access JWT.
- Checks session status in DB.
- Returns current sanitized user.

`POST /api/auth/forgot-password`

- Validates email.
- Throttles reset requests.
- Always returns a generic response.
- Creates a hashed reset token if the account exists.
- Mail-provider integration belongs here.

`POST /api/auth/reset-password`

- Validates reset token and new password.
- Consumes reset token.
- Updates password hash.
- Revokes active sessions and refresh tokens.
- Clears auth cookies.

`POST /api/auth/verify-email`

- Validates one-time token.
- Marks token consumed.
- Marks user email verified.

## 12. Rate Limiting

Implemented policies:

- Login: IP plus email.
- Signup: IP plus email.
- Password reset: IP plus email.
- Refresh: IP.

The current adapter is in-memory for local development and single-instance deployments. For multi-instance production, replace the backing map with Redis using the same API. Redis should use atomic increments with expiries.

## 13. Security Best Practices

Controls included:

- HTTP-only cookies.
- No localStorage token storage.
- Strong password policy.
- bcryptjs cost 12.
- Distinct access and refresh secrets.
- Opaque refresh tokens.
- Refresh rotation.
- Token-family replay detection.
- Per-device sessions.
- Account lockout fields.
- Same-origin checks for mutating requests.
- Zod validation on client and server.
- Sanitized API responses.
- Audit logging.
- Security headers in proxy.

Recommended production additions:

- Redis-backed rate limits and token invalidation fanout.
- Dedicated email provider for reset and verification links.
- TOTP/WebAuthn 2FA.
- Session dashboard and device revocation UI.
- OAuth account-linking tables.
- Risk scoring from IP, device, ASN, impossible travel, and failed-login clusters.
- CSP with per-request nonce when the frontend is ready for strict CSP.

## 14. Deployment Checklist

Required environment variables:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `AUTH_ISSUER`
- `AUTH_AUDIENCE`
- `ADMIN_PASSWORD` if admin password login is used

Secret rules:

- Use different access and refresh secrets.
- Use at least 32 random characters, preferably 48 or more bytes of entropy.
- Rotate access secrets with short overlap if supporting rolling deploys.
- Rotating the refresh secret invalidates all refresh tokens, which is useful for emergency revocation.

Database:

- Run Prisma migration against PostgreSQL.
- Ensure TLS to the database in production.
- Schedule token cleanup.
- Back up audit logs according to retention policy.

Cookies:

- Use HTTPS only in production.
- Set production cookie names to `__Host-*` if path/domain constraints allow it.
- Do not deploy with wildcard domains that allow untrusted sibling subdomains to set cookies.

## 15. Vulnerabilities Prevented

- Token theft through localStorage XSS.
- Long-lived bearer-token replay.
- Refresh-token replay after rotation.
- Account enumeration through password reset.
- Credential stuffing through route-level throttling.
- Brute-force login through lockout state.
- Session persistence after password reset.
- Direct DB reset-token leakage, because one-time tokens are hashed.
- Basic CSRF on mutating cookie-authenticated endpoints.

## 16. Interview Questions and Answers

Why JWT over server-only sessions?

JWT access tokens are fast for middleware and route protection because verification is local. The tradeoff is revocation latency, so this design keeps access tokens short-lived and uses stateful refresh/session checks where revocation matters.

Why refresh rotation?

Rotation turns stolen refresh-token reuse into a detectable event. Once a token has been rotated, any later use indicates replay, so the system revokes the session family.

Why opaque refresh tokens instead of refresh JWTs?

Refresh tokens need revocation and replay tracking. An opaque token with a database record is simpler to revoke and safer to hash at rest.

Why bcryptjs instead of argon2?

Argon2 is preferred when the runtime dependency is available. This repo already had bcryptjs and the requirement allowed bcrypt. The cost is raised to 12. For production at scale, benchmark argon2id or native bcrypt in the deployment runtime.

Why HTTP-only cookies?

They prevent JavaScript from reading tokens, reducing XSS token exfiltration. They must be paired with SameSite and same-origin checks because cookies are automatically sent by browsers.

Why Zod?

Zod gives a single source of truth for runtime validation and TypeScript inference. The same schemas power React Hook Form and server validation, reducing mismatches.

Why not query the DB in middleware?

Edge middleware should be low-latency and connection-light. JWT verification at the edge is enough for navigation protection; route handlers perform stateful checks for sensitive API work.

Why Redis?

Redis is the right production backing store for distributed rate limits and emergency invalidation because it supports low-latency atomic counters with expiry. This repo uses an adapter-shaped in-memory implementation for local development.
