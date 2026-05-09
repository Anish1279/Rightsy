<div align="center">

<img src="/public/infi.webp" alt="Rightsy Logo" width="120" height="120" style="border-radius: 24px;" />

# Rightsy

### *Know Your Rights. Learn Through Play.*

**The world's most immersive educational platform for children ages 8–14 to discover their rights, laws, and civic responsibilities — through games, quizzes, SRT missions, and AI-powered challenges.**

<br />

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)

<br />

[![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red.svg?style=flat-square)](https://rightsy.vercel.app)
[![Safe for Kids](https://img.shields.io/badge/Safe%20for-Kids%208%E2%80%9314-8B5CF6.svg?style=flat-square)](https://rightsy.vercel.app)

<br />

<a href="https://rightsy.vercel.app">
  <img src="/public/main.webp" alt="Rightsy Platform Preview" width="860" style="border-radius: 16px; box-shadow: 0 32px 80px rgba(124,58,237,0.3);" />
</a>

<br /><br />

[🚀 Live Demo](https://rightsy.vercel.app) · [📖 Docs](https://rightsy.vercel.app/docs) · [🐛 Report Bug](https://github.com/rightsy/rightsy/issues) · [✨ Request Feature](https://github.com/rightsy/rightsy/discussions)

</div>

---

## 🌟 Why Rightsy?

> *"Understanding your rights shouldn't be a lecture — it should be an adventure."*

Rightsy is not just another edtech app. It is a **full-stack, production-grade platform** that blends cutting-edge web technology with child development science to make legal literacy genuinely exciting.

| 🎮 **Interactive Games** | 🧠 **Adaptive Assessments** | 🛡️ **Safe by Design** | 🏆 **Real Progress** |
|:---:|:---:|:---:|:---:|
| Word Scramble, Sudoku, Memory Test, Jigsaw Puzzle — each wired to a learning video system | Quizzes + Situation Reaction Tests with integrity scoring and XP | No ads, no tracking, HTTP-only JWT auth, same-origin CSRF guards | Mastery scoring, streaks, achievements, and a full PostgreSQL-backed progress graph |

---

## 📸 Platform Screenshots

<div align="center">

### 🏠 Landing Page — Immersive Dark Hero with 3D Octahedron
<img src="/public/Preview.png" alt="Landing Page" width="860" style="border-radius: 12px;" />

<br />

### 🎮 Game Zone — Activity Hub
<img src="/public/gamezone.jpg" alt="Game Zone" width="860" style="border-radius: 12px;" />

<br />

### 📊 Assessment Hub — Quiz
<img src="/public/quiz.jpg" alt="Assessment Hub" width="860" style="border-radius: 12px;" />

<br />

### 🧩 Puzzle Game — Drag & Drop with Motion Physics
<img src="/public/screenshots/puzzle.png" alt="Puzzle Game" width="860" style="border-radius: 12px;" />

<br />

### 🔐 Sign In — Premium Auth UI
<img src="/public/screenshots/signin.png" alt="Sign In" width="860" style="border-radius: 12px;" />

</div>

---

## ✨ Feature Deep-Dive

### 🎲 Game Zone

Four original mini-games — each integrated with the **Learning Video Orchestrator** system that plays curated educational YouTube videos when players need a boost:

| Game | Mechanic | Learning Integration |
|------|----------|---------------------|
| **Word Scramble** | Unscramble rights-related keywords in 30s | Video triggered on timeout or 3 wrong answers |
| **Sudoku** | Classic 9×9 puzzle, 3 difficulty levels | Video triggered on 3 mistakes or hint request |
| **Memory Test** | Card-flip matching with 8 image pairs | Video triggered on 4 mismatches |
| **Jigsaw Puzzle** | 3×3 drag-and-drop tile puzzle | Video triggered on 60s idle (stuck detection) |

```
Every game → useLearningVideo hook → LearningVideoOrchestrator → YouTube IFrame API
```

### 📺 Learning Video System

A fully custom **state-machine orchestrator** built in React:

```
idle → queued → loading → playing → unlocked → dismissed
         ↑                              ↓
      cooldown ←────────────────── completion
```

- **5 trigger reasons**: `hint`, `lose`, `failure-threshold`, `stuck`, `manual`
- **Cooldown management**: 90-second cooldown between videos (bypass for hints)
- **Anti-skip protection**: 2-minute minimum watch time with navigation guards (`beforeunload`, `popstate`, keyboard blocks)
- **Progress persistence**: LocalStorage with HMAC-signed tamper detection
- **Stuck detection**: IntersectionObserver + idle timer (configurable per game)

### 🎓 Assessment Engine

A sophisticated scoring system with two assessment types:

**Quiz** (`QUIZ`):
- Multi-select, MCQ, True/False, and Image-question types
- Per-question confidence tracking (1–5 scale)
- Combo bonus system (3× = +10 XP, 5× = +20 XP)
- Integrity flags: `FAST_COMPLETION`, `RAPID_ANSWER`, `UNKNOWN_OPTION`, `DUPLICATE_QUESTION`
- Mastery delta calculation: `(accuracy - 50) / 250`

**Situation Reaction Test** (`SRT`):
- Branching scenario trees with `nextScenarioId` decision routing
- 4D judgment scoring: **Safety**, **Empathy**, **Responsibility**, **Rights Awareness**
- Partial credit on risky (non-dangerous) decisions
- XP bonuses for safety-first choices (`dimensions.safety ≥ 85`)

### 🔐 Authentication Architecture

A production-grade JWT system documented in [`docs/auth-architecture.md`](docs/auth-architecture.md):

```
POST /api/auth/signup   → bcrypt hash → Session + RefreshToken → HTTP-only cookies
POST /api/auth/login    → verify hash → rate-limit check → issue tokens
POST /api/auth/refresh  → rotate token → detect replay → revoke token family
POST /api/auth/logout   → revoke session → clear cookies
```

- **Short-lived access tokens** (15 min) — stateless, verified at edge
- **Opaque refresh tokens** — HMAC-hashed, never stored raw, 30-day lifetime
- **Token family replay detection** — any reuse marks entire family `COMPROMISED`
- **Account lockout** — 10 failed attempts → 15-minute lock
- **Same-origin CSRF guard** on all mutating endpoints

### 🌐 3D Octahedron Hero

The landing page features a mesmerizing **Three.js octahedron** with 8 video-textured faces (`OctahedronVideo.jsx`):

- Custom **GLSL shaders** for rainbow border animation and glow effects
- Per-face **dynamic UV rotation** to keep videos upright as the shape spins
- **Two-phase motion state machine**: slow idle drift → sudden spring-eased flip
- **80 particle physics simulation** with push/pull forces and frame-rate-independent damping
- **IntersectionObserver + Page Visibility API** — zero CPU/GPU when off-screen

---

## 🗂️ Project Structure

```
rightsy/
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router
│   │   ├── 📁 (auth)/                   # Auth route group
│   │   │   ├── sign-in/[[...sign-in]]/
│   │   │   ├── sign-up/[[...sign-up]]/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── 📁 api/
│   │   │   ├── admin/login/             # Admin JWT auth
│   │   │   ├── assessments/
│   │   │   │   ├── attempts/            # Submit quiz/SRT results
│   │   │   │   └── progress/            # Fetch user progress
│   │   │   └── auth/
│   │   │       ├── login/  logout/  me/
│   │   │       ├── refresh/  register/
│   │   │       ├── forgot-password/
│   │   │       ├── reset-password/
│   │   │       └── verify-email/
│   │   ├── 📁 dashboard/
│   │   │   ├── game-zone/
│   │   │   │   ├── memory-test/
│   │   │   │   ├── puzzle/
│   │   │   │   ├── sudoko/
│   │   │   │   └── word-scramble/
│   │   │   ├── quiz/[level]/
│   │   │   ├── srt/[mission]/
│   │   │   └── about/
│   │   ├── 📁 chatbot/
│   │   ├── 📁 govtadmin/
│   │   │   └── database/
│   │   ├── 📁 situation-test/
│   │   ├── layout.js                    # Root layout + Toaster
│   │   └── page.js                      # Landing page
│   │
│   ├── 📁 components/
│   │   └── 📁 ui/
│   │       ├── OctahedronVideo.jsx      # 🌟 3D Three.js hero
│   │       └── [shadcn components]
│   │
│   ├── 📁 constants/
│   │   └── auth.ts                      # Cookie names, token TTLs
│   │
│   ├── 📁 features/                     # Feature-sliced architecture
│   │   ├── 📁 admin/
│   │   │   ├── components/
│   │   │   ├── schemas/
│   │   │   └── services/
│   │   ├── 📁 assessment/               # 🧠 Core learning engine
│   │   │   ├── components/
│   │   │   │   ├── AssessmentHub.jsx    # Quiz + SRT hub with progress
│   │   │   │   ├── QuizRunner.jsx       # Full quiz experience
│   │   │   │   └── SrtRunner.jsx        # Branching SRT scenarios
│   │   │   ├── data/
│   │   │   │   └── assessment-content.js # 5 quiz modules, 3 SRT missions
│   │   │   └── services/
│   │   │       ├── assessment-engine.js  # Scoring, XP, mastery
│   │   │       ├── assessment-api-client.js
│   │   │       └── progress-storage.js  # LocalStorage + server merge
│   │   ├── 📁 auth/                     # 🔐 JWT auth system
│   │   │   ├── components/              # Sign in/up, forgot/reset password
│   │   │   ├── schemas/                 # Zod validation schemas
│   │   │   ├── services/
│   │   │   │   ├── auth-service.ts      # Business logic
│   │   │   │   ├── token-service.ts     # JWT sign/verify
│   │   │   │   ├── session-service.ts   # Refresh rotation, replay detection
│   │   │   │   ├── crypto-service.ts    # HMAC hashing
│   │   │   │   ├── password-service.ts  # bcrypt
│   │   │   │   ├── rate-limit-service.ts
│   │   │   │   └── request-security-service.ts  # CSRF guard
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── 📁 chatbot/                  # 🤖 AI Chatbot
│   │   ├── 📁 dashboard/
│   │   │   └── components/
│   │   │       ├── DashboardHome.jsx
│   │   │       ├── Header.jsx           # Sticky glassmorphic nav
│   │   │       └── AboutPage.jsx
│   │   ├── 📁 game-zone/                # 🎮 Mini-games
│   │   │   └── components/
│   │   │       ├── SudokuPage.jsx
│   │   │       ├── MemoryTestPage.jsx
│   │   │       └── GameZonePage.jsx
│   │   ├── 📁 landing/                  # 🏠 Marketing site
│   │   │   └── components/
│   │   │       ├── HeroSection.jsx      # 3D octahedron hero
│   │   │       ├── AboutSection.jsx
│   │   │       ├── GameZoneSection.jsx
│   │   │       ├── QuizSection.jsx
│   │   │       ├── VideoSection.jsx
│   │   │       └── ChatbotSection.jsx
│   │   ├── 📁 learning-videos/          # 📺 Video orchestrator
│   │   │   ├── components/
│   │   │   │   ├── LearningVideoModal.tsx
│   │   │   │   ├── LearningVideoPlayer.tsx
│   │   │   │   ├── LearningVideoOrchestrator.tsx
│   │   │   │   ├── MascotPanel.tsx
│   │   │   │   └── ProgressRing.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-learning-video.ts # Game integration hook
│   │   │   ├── lib/
│   │   │   │   ├── youtube-api.ts        # YT IFrame API loader
│   │   │   │   ├── youtube-id.ts         # URL → video ID extractor
│   │   │   │   ├── pick-video.ts         # Smart randomizer
│   │   │   │   └── persistence.ts        # HMAC-signed LocalStorage
│   │   │   ├── store/
│   │   │   │   └── orchestrator-store.tsx # State machine + context
│   │   │   ├── constants.ts
│   │   │   └── types.ts
│   │   ├── 📁 puzzle/                   # 🧩 Jigsaw puzzle game
│   │   │   ├── components/
│   │   │   │   ├── PuzzleGamePage.jsx
│   │   │   │   └── PuzzleGrid.jsx       # Drag/touch physics
│   │   │   └── services/
│   │   │       └── puzzle-game.js       # Solvability checks, tile logic
│   │   ├── 📁 quiz/                     # Legacy quiz (re-exports assessment)
│   │   ├── 📁 user/
│   │   │   ├── services/user-service.ts
│   │   │   └── types/user-types.ts
│   │   └── 📁 word-scramble/            # 🔤 Word scramble game
│   │
│   ├── 📁 hooks/
│   │   ├── use-game-state.js
│   │   └── use-scroll-state.js          # RAF-throttled scroll detection
│   │
│   ├── 📁 lib/
│   │   ├── api/                         # Route handler utilities
│   │   ├── config/auth-env.ts           # Zod-validated env config
│   │   ├── errors/app-error.ts          # Typed error class
│   │   ├── prisma.ts                    # Singleton Prisma client
│   │   └── utils.js                     # cn() utility
│   │
│   ├── 📁 styles/
│   │   └── globals.css                  # Rightsy design system tokens
│   │
│   └── proxy.ts                         # Next.js middleware (edge auth)
│
├── 📁 prisma/
│   ├── schema.prisma                    # 12-model schema
│   └── migrations/
│
├── 📁 docs/
│   └── auth-architecture.md             # Deep auth documentation
│
├── 📁 tests/
│   └── auth-security.test.ts            # Vitest auth tests
│
├── next.config.mjs
├── tailwind.config.js
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router + Turbopack) | SSR, API routes, edge middleware |
| **Language** | TypeScript 6 + JavaScript | Type safety across the full stack |
| **Styling** | Tailwind CSS 4 + Custom Design Tokens | Responsive, themeable UI |
| **Animation** | Motion/React (Framer) + Three.js r183 | Fluid UI + 3D hero octahedron |
| **Database** | PostgreSQL + Prisma ORM | 11-model relational schema |
| **Auth** | Custom JWT (jose) + bcryptjs | Stateful sessions, refresh rotation |
| **State** | React Context + useReducer | Orchestrator pattern for video system |
| **Forms** | React Hook Form + Zod | Shared client/server validation |
| **Testing** | Vitest | Auth security unit tests |
| **Deployment** | Vercel (recommended) | Edge middleware, ISR |

</div>

---

## 🗄️ Database Schema

```prisma
// 11 models powering Rightsy's learning platform

model User {
  id, email, passwordHash, role (USER|ADMIN)
  emailVerifiedAt, failedLoginCount, lockedUntil
  ↓
  sessions, refreshTokens, verificationTokens
  passwordResetTokens, authAuditLogs
  assessmentAttempts, assessmentProgress
  achievements, learningEvents, assessmentSummary
}

model Session {
  status: ACTIVE | REVOKED | COMPROMISED | EXPIRED
  refreshTokenFamily (unique per device)
  userAgent, ipAddress, expiresAt
}

model RefreshToken {
  tokenHash (HMAC-SHA256, never raw)
  tokenFamilyId (for replay detection)
  rotatedAt, revokedAt, replacedByTokenId
  reuseDetectedAt
}

model AssessmentAttempt {
  kind: QUIZ | SRT
  score, maxScore, xpEarned, accuracy
  masteryDelta, answersJson, breakdownJson
  integrityFlagsJson
}

model AssessmentProgress {
  bestScore, bestAccuracy, mastery (0–1)
  xp, level, streakCount, weakTopicsJson
}
```

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 20.0.0
npm >= 10.0.0
postgresql >= 14
```

### 1. Clone & Install

```bash
git clone https://github.com/your-username/rightsy.git
cd rightsy
npm install
```

### 2. Environment Variables

Create a `.env` file (see `.env.example`):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rightsy"

# JWT Secrets (minimum 32 characters each — use different values!)
JWT_ACCESS_SECRET="your-super-secret-access-token-key-at-least-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key-at-least-32-chars"

# JWT Configuration
AUTH_ISSUER="rightsy"
AUTH_AUDIENCE="rightsy-web"

# Admin Configuration
ADMIN_PASSWORD="your-secure-admin-password"
ADMIN_JWT_SECRET="optional-separate-admin-jwt-secret"

# Email Configuration
MAIL_PROVIDER_API_KEY="optional-email-provider-key"
MAIL_FROM="Rightsy <security@example.com>"

# Optional: External game links
NEXT_PUBLIC_CAR_RACING_LINK="https://your-car-racing-app.vercel.app"
NEXT_PUBLIC_TANK_GAME_LINK="https://your-tank-game.vercel.app"
NEXT_PUBLIC_CHESS_GAME_LINK="https://your-chess-game.vercel.app"
```

### 3. Database Setup

```bash
# Run Prisma migrations
npx prisma migrate deploy

# Or for development
npx prisma migrate dev --name init

# View your database (optional)
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the platform is live! 🎉

---

## 📜 Available Scripts

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check (src/ only)
npm run test         # Run all Vitest tests
npm run test:auth    # Run auth security tests only
```

---

## 🔒 Security Features

Rightsy is built with security-first principles:

```
✅ HTTP-only cookies (no localStorage token storage)
✅ SameSite=Lax + Secure (in production)
✅ Same-origin CSRF check on all mutating endpoints
✅ bcryptjs cost 12 password hashing
✅ Token rotation on every refresh
✅ Token family replay detection + session compromise
✅ Account lockout after 10 failed attempts (15 min)
✅ Separate access & refresh JWT secrets
✅ Rate limiting: login, signup, password reset, refresh
✅ Zod input validation on client + server
✅ Sanitized API responses (no password hashes exposed)
✅ Security headers: X-Content-Type-Options, X-Frame-Options, etc.
✅ Audit logging for all auth events
✅ Argon2-ready architecture (bcryptjs for current deployment)
```

---

## 🧪 Testing

```bash
# Run the auth security test suite
npm run test:auth

# Tests cover:
# - Weak password rejection
# - Email normalization
# - JWT sign/verify with session context
# - Tampered token detection
# - Refresh token HMAC hashing
# - Rate limiter threshold enforcement
```

Sample test output:

```
✓ auth validation > rejects weak signup passwords
✓ auth validation > normalizes login email addresses
✓ access tokens > signs and verifies short-lived access tokens
✓ access tokens > rejects tampered tokens
✓ refresh token storage > hashes refresh tokens with server-side secret
✓ rate limiting > blocks requests after the policy limit

Test Files: 1 passed (1)
Tests:      6 passed (6)
```

---

## 🎨 Design System

Rightsy ships with a comprehensive design token system in `src/styles/globals.css`:

```css
/* Brand Colors */
--rightsy-violet: #7C3AED        /* Primary brand */
--rightsy-coral: #F97066         /* Energy / action */
--rightsy-teal: #14B8A6          /* Success / safety */
--rightsy-amber: #F59E0B         /* Achievements / rewards */

/* Surfaces */
--rightsy-cream: #FFFBF5         /* Warm page background */

/* Shadows */
--shadow-card: 0 4px 16px rgba(124, 58, 237, 0.08)
--shadow-glow-violet: 0 0 24px rgba(124, 58, 237, 0.25)

/* Animations */
.animate-float-slow              /* 8s gentle float for hero elements */
.animate-bounce-gentle           /* 2s bounce for UI accents */
.animate-pulse-soft              /* 3s breathing glow effect */
.animate-marquee                 /* Infinite ticker marquee */
```

Utility classes:

```css
.glass              /* Glassmorphic surface (backdrop-blur + rgba) */
.text-gradient-brand /* Violet → Coral gradient text */
.bg-brand-gradient  /* Deep violet hero gradient */
.card-hover         /* Lift + shadow on hover */
.section-container  /* Max-width + responsive padding */
.badge              /* Pill badge with color variants */
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register with name, email, password |
| `POST` | `/api/auth/login` | Login with email, password |
| `POST` | `/api/auth/logout` | Revoke session + clear cookies |
| `POST` | `/api/auth/refresh` | Rotate refresh token |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Complete password reset |
| `POST` | `/api/auth/verify-email` | Verify email address |

### Assessments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/assessments/attempts` | Submit quiz or SRT attempt |
| `GET` | `/api/assessments/progress` | Fetch full user progress |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Admin password login |

---

## 🎮 Content Library

### Quiz Modules (5 Levels)

| Level | Title | Questions | Difficulty |
|-------|-------|-----------|-----------|
| 1 | Basic Rights | 5 | Foundation |
| 2 | Constitutional Laws | 5 | Foundation+ |
| 3 | Child Rights | 5 | Applied |
| 4 | Environmental Rights | 5 | Applied |
| 5 | Consumer Rights | 5 | Capstone |

> **Progressive unlock**: each level requires 70%+ accuracy on the previous level

### SRT Missions (3 Missions)

| Mission | Category | Scenarios | Skills Assessed |
|---------|----------|-----------|----------------|
| Safe School Choices | Bullying | 2 | Safety, Empathy, Responsibility |
| Digital Safety Decisions | Cyber Safety | 2 | Privacy, Self-Control, Legality |
| Fair Community Reactions | Equality | 2 | Fairness, Honesty, Civic Duty |

### Learning Videos (11 curated clips)

All videos are child-safe, minimum 2-minute watch requirement, served via YouTube IFrame API with anti-skip protection.

---

## 🤝 Contributing

We welcome contributions from developers, educators, and designers! Here's how:

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-new-game

# 3. Make your changes
# 4. Run the test suite
npm run test

# 5. Lint your code
npm run lint

# 6. Commit with a clear message
git commit -m "feat: add amazing new educational game"

# 7. Push and open a PR
git push origin feature/amazing-new-game
```

**Areas we especially welcome contributions:**
- New quiz modules on additional rights topics
- New SRT mission scenarios
- Translations / i18n support
- Accessibility improvements (WCAG 2.1 AA)
- Additional mini-games
- Mobile app (React Native)

---

## 📄 License

```
MIT License

Copyright (c) 2026 Rightsy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```


---


</div>

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) — The React framework for the web
- [Prisma](https://prisma.io) — Next-generation ORM for Node.js
- [Three.js](https://threejs.org) — 3D library powering the hero octahedron
- [Framer Motion](https://www.framer.com/motion/) — Production-ready animations
- [shadcn/ui](https://ui.shadcn.com) — Accessible component primitives
- [jose](https://github.com/panva/jose) — JavaScript Object Signing and Encryption
- [canvas-confetti](https://github.com/catdad/canvas-confetti) — Celebration animations

---

<div align="center">

**Built with ❤️ for curious young minds**

*Making rights education fun, safe, and unforgettable — one game at a time.*

<br />

[![Star this repo](https://img.shields.io/github/stars/rightsy/rightsy?style=social)](https://github.com/rightsy/rightsy)
[![Follow on Twitter](https://img.shields.io/twitter/follow/rightsyapp?style=social)](https://twitter.com/rightsyapp)

<br />

<sub>© 2026 Rightsy. All rights reserved. Safe for kids.</sub>

</div>
