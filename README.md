# Maven AI

> An AI-powered assistant that researches, recommends, and compares electronic products for you.

![Maven - Maven v2 Homepage](https://res.cloudinary.com/dberoyocy/image/upload/v1750684251/Maven-v2-Instagram-Poster_rj5bb1.png)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

See the standalone showcase build: **[Maven v2](https://maven-ai-webpage.vercel.app/)**

## Overview

Maven is a Next.js web application that uses AI to help people research electronics — laptops, headphones, phones, and similar categorized products. Instead of manually cross-referencing spec sheets and reviews across multiple sites, a user chats with Maven, which searches the web, gathers product data, and streams back recommendations, detailed breakdowns, and side-by-side comparisons with plain-language insights.

## Purpose & intent

Maven is a developer portfolio project built to demonstrate practical use of AI agent orchestration, streamed generative UI, and real-world data gathering (web scraping plus external search APIs) inside a production-shaped Next.js app. It is explicitly non-commercial and not intended for production use — the Register and Terms of Service pages say so directly to visitors.

## Features

- **Personalized Recommendations (`recommendator`)** — product suggestions tailored to stated needs, with AI-generated reasoning.
- **Precise Product Search (`searchProduct`)** — finds specific products from full or partial names.
- **In-Depth Product Details (`getProductDetails`)** — pulls specifications, features, reviews, pricing, and availability from web scraping and external APIs.
- **Side-by-Side Comparisons (`productsComparison`)** — compares two previously-detailed products with AI-powered insights.
- **Interactive Inquiry (`inquireUser`)** — asks clarifying questions when a request is ambiguous.
- **Streamed results** — responses render progressively as the AI generates them, rather than all at once.
- **Related queries** — suggested follow-up searches after each result.
- **Public sharing** — any search, detail view, comparison, or full chat can be turned into a public read-only link.
- **Chat history** — past conversations are saved per-user and resumable.

## How it works

A visitor lands on the [Home](src/app/README.md) page, learns what Maven does, and continues to [Register](<src/app/(auth)/register/README.md>) and [Login](<src/app/(auth)/login/README.md>) via OAuth (Google or GitHub). Once signed in, they land in [Chat](src/app/chat/README.md), the core experience: they type a request, optionally attach a product or ask for a comparison, and Maven's orchestrator picks the right tool(s) to answer — searching, detailing, recommending, or comparing — streaming the result back into the conversation. Conversations persist and can be revisited from [Chat History](src/app/history/README.md), or published as a public [Shared](src/app/share/README.md) link. Along the way, users can consult [Features](<src/app/(blog)/features/README.md>), the [Cookbook](<src/app/(blog)/cookbook/README.md>) usage guide, or the technical [Workflow](<src/app/(blog)/workflow/README.md>) writeup, and can leave feedback on [Rate App](src/app/rate-app/README.md).

## Pages

| Page | Route | Description | Doc |
|------|-------|-------------|-----|
| Home | `/` | Marketing landing page and entry point | [README](src/app/README.md) |
| Login | `/login` | OAuth sign-in (Google, GitHub) | [README](<src/app/(auth)/login/README.md>) |
| Register | `/register` | Demo-app notice before signing up | [README](<src/app/(auth)/register/README.md>) |
| Cookbook | `/cookbook` | Guided usage recipes and best practices | [README](<src/app/(blog)/cookbook/README.md>) |
| Dev Portfolio | `/dev-portfolio` | Under-construction placeholder page | [README](<src/app/(blog)/dev-portfolio/README.md>) |
| Features | `/features` | Video showcase of each agent tool | [README](<src/app/(blog)/features/README.md>) |
| Reviews | `/reviews` | Public rating gallery | [README](<src/app/(blog)/reviews/README.md>) |
| Workflow | `/workflow` | Technical deep-dive into the agent pipeline | [README](<src/app/(blog)/workflow/README.md>) |
| Privacy Policy | `/privacy-policy` | Data collection and usage policy | [README](<src/app/(tos)/privacy-policy/README.md>) |
| Terms of Service | `/terms-of-service` | Usage terms and limitations | [README](<src/app/(tos)/terms-of-service/README.md>) |
| Chat | `/chat` | Main AI chat interface (new conversation) | [README](src/app/chat/README.md) |
| Chat (seeded query) | `/chat/c` | New chat pre-filled with a query | [README](src/app/chat/c/README.md) |
| Chat (existing) | `/chat/c/[id]` | Resume a past conversation | [README](<src/app/chat/c/[id]/README.md>) |
| Chat History | `/history` | Grid of past conversations | [README](src/app/history/README.md) |
| Rate App | `/rate-app` | Star-rating feedback form | [README](src/app/rate-app/README.md) |
| Shared Content | `/share` | Public read-only view of shared results | [README](src/app/share/README.md) |

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack) with React 19 and TypeScript
- **AI / orchestration:** Vercel AI SDK 7 (`@ai-sdk/rsc` for generative streamed UI, `streamText` / `generateText` with `Output` for structured data), Google Gemini via `@ai-sdk/google` with Google Search grounding
- **Web data:** Firecrawl for scraping, Tavily and Serper for external search
- **Auth:** NextAuth.js (Google, GitHub OAuth)
- **Data stores:** Neon (PostgreSQL) for persistent data, Upstash Redis for caching/session data
- **UI:** Radix UI primitives, Tailwind CSS 4, Sass, `class-variance-authority`, `next-themes`
- **Motion:** `motion` (formerly Framer Motion), GSAP, Lenis smooth scroll
- **Media:** Cloudinary
- **Other:** SWR for client data fetching, Zustand for client state, `react-markdown` + `remark-gfm` for rendering AI output
- **Deployment:** Vercel, with Vercel Analytics and Speed Insights

## Project structure

```
src/
  app/                # Next.js App Router routes (see Pages table above)
    (auth)/            # Login, Register — route group, no /(auth) segment in the URL
    (blog)/             # Cookbook, Features, Reviews, Workflow, Dev Portfolio
    (tos)/              # Privacy Policy, Terms of Service
    chat/               # Main chat app (new, seeded, and resumed conversations)
    history/            # Chat history grid
    rate-app/           # Feedback form
    share/              # Public shared-content viewer
    api/                # Route handlers (ratings, etc.)
    server/             # Agent render tools and shared streaming workflow helpers (workflow.tsx)
    action.tsx          # AI/RSC action definitions and server actions
  components/
    maven/              # App-specific feature components (chat UI, marketing pages, etc.)
    ui/                 # Shared design-system primitives (shadcn/ui-based)
  lib/                  # Agent tools, orchestrator, data services, types, utilities
  proxy.ts              # Next.js proxy (formerly middleware): NextAuth route protection
```

## Getting started

### Prerequisites

- Node.js v20.9+
- Bun (the project ships a `bun.lockb`), or npm/yarn/pnpm
- Git

### Installation

```bash
git clone https://github.com/rizzzky78/market-maven
cd market-maven
bun install
```

### Database setup (Neon / PostgreSQL)

Run the following against your Neon database before first use:

```sql
CREATE TABLE scrape_cache (
    key UUID PRIMARY KEY,
    query TEXT NOT NULL,
    response JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_scrape_cache_query ON scrape_cache (query);

CREATE TABLE markdown_store (
    key TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    owner TEXT NOT NULL,
    type TEXT NOT NULL,
    markdown TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_markdown_store_chat_id ON markdown_store (chat_id);
CREATE INDEX idx_markdown_store_owner ON markdown_store (owner);

CREATE TABLE object_store (
    key TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    owner TEXT NOT NULL,
    type TEXT NOT NULL,
    object JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_object_store_chat_id ON object_store (chat_id);
CREATE INDEX idx_object_store_owner ON object_store (owner);

CREATE TABLE tool_data_store (
    key TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    owner TEXT NOT NULL,
    tool_success BOOLEAN NOT NULL,
    tool_name TEXT NOT NULL,
    tool_args JSONB NOT NULL,
    tool_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tool_data_store_chat_id ON tool_data_store (chat_id);
CREATE INDEX idx_tool_data_store_owner ON tool_data_store (owner);

CREATE TABLE shares (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT NOT NULL,
    reference_id TEXT UNIQUE NOT NULL,
    component_id TEXT NOT NULL,
    component_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    access_count INTEGER DEFAULT 0
);
CREATE INDEX idx_shares_reference_id ON shares (reference_id);
CREATE INDEX idx_shares_user_id ON shares (user_id);
CREATE INDEX idx_shares_component_type ON shares (component_type);
```

| Table | Purpose |
|---|---|
| `scrape_cache` | Caches web scraping results by query to avoid redundant requests |
| `markdown_store` | Persists markdown content tied to a chat and owner |
| `object_store` | General-purpose JSON object storage tied to a chat and owner |
| `tool_data_store` | Records agent tool executions, arguments, results, and success status |
| `shares` | Tracks publicly shared content and access analytics |

### Environment variables

Create `.env.local` in the project root (never commit it):

```
LOG_LEVEL="info"

# Base URL search for Tokopedia (or other e-commerce site, if applicable)
TOKOPEDIA_SEARCH_BASE_URL="https://www.tokopedia.com/search?q="

# Models
GOOGLE_GENERATIVE_AI_API_KEY="YOUR_APIKEY"   # https://aistudio.google.com/app/apikey
XAI_API_KEY="YOUR_APIKEY"
DEEPSEEK_API_KEY="YOUR_APIKEY"

# External sources
TAVILY_API_KEY="YOUR_APIKEY"                 # https://app.tavily.com/home
SERPER_API_KEY="YOUR_APIKEY"                 # https://serper.dev/api-key
FIRECRAWL_API_KEY="YOUR_APIKEY"

# Databases
UPSTASH_REDIS_REST_URL="YOUR_APIKEY"
UPSTASH_REDIS_REST_TOKEN="YOUR_APIKEY"
NEON_DATABASE_URL="YOUR_APIKEY"

# Auth
NEXTAUTH_SECRET="USE_SECURE_STRING_OR_RANDSSL"   # e.g. openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
AUTH_GITHUB_ID="YOUR_GITHUB_AUTH_ID"
AUTH_GITHUB_SECRET="YOUR_GITHUB_AUTH_SECRET"
AUTH_GOOGLE_ID="YOUR_GOOGLE_AUTH_ID"
AUTH_GOOGLE_SECRET="YOUR_GOOGLE_AUTH_SECRET"

# Redis
USE_LOCAL_REDIS=false
LOCAL_REDIS_URL=redis://localhost:6379   # or redis://redis:6379 under docker compose

NEXT_PUBLIC_APP_URL=http://localhost:3000   # update for production
```

### Running the application

```bash
bun run dev
```

Open `http://localhost:3000`.

## Screenshots

<!-- Add screenshots here -->

## Agent tools reference

Maven's orchestrator automatically selects among five tools based on user intent:

| Tool | Purpose | Example input |
|---|---|---|
| `recommendator` | Personalized product suggestions | "best noise-canceling headphones for travel under $200" |
| `searchProduct` | Finds a specific product by name | "Sony WH-1000XM5" |
| `getProductDetails` | Full specs, reviews, pricing for one product | Attach a product via the UI |
| `productsComparison` | Side-by-side comparison of two products | Two `callId`s from prior `getProductDetails` calls |
| `inquireUser` | Clarifying question when intent is ambiguous | "Find me a good laptop." → Maven asks about intended use |

See the [Workflow](<src/app/(blog)/workflow/README.md>) page doc for how these fit into the request pipeline, and the [Cookbook](<src/app/(blog)/cookbook/README.md>) page doc for usage recipes.

## Deployment

1. Provision production instances of Neon (PostgreSQL) and Upstash Redis.
2. Set all environment variables listed above on your hosting platform.
3. Build with `bun run build`.
4. Deploy — the project is built and tested against Vercel.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Commit with clear, descriptive messages.
4. Push to your fork and open a pull request.

## License

Licensed under the [Apache License 2.0](LICENSE).

## Troubleshooting

- **App won't start:** double-check environment variables (especially database URLs and API keys) and confirm Postgres/Redis are reachable.
- **Features not working:** check the browser console for client-side errors and confirm API keys are valid.
- **Authentication issues:** verify GitHub/Google OAuth app settings and that `NEXTAUTH_URL` matches your current environment.
- **Database connection problems:** re-check `NEON_DATABASE_URL` and confirm the database user has the required permissions.

## Portfolio summary

Maven AI is a Next.js + TypeScript application that turns natural-language product questions into AI-driven recommendations, searches, detailed breakdowns, and comparisons for electronics. It showcases a full agentic pipeline — an orchestrator that routes user intent to specialized tools, generative streamed UI via the Vercel AI SDK, real web data via Firecrawl/Tavily scraping, and persistent chat history backed by Neon and Redis — wrapped in an animated, OAuth-gated Next.js frontend with public content sharing.
