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
- **AI / orchestration:** Vercel AI SDK 7 (AI SDK UI: `useChat` from `@ai-sdk/react` over a UI message stream for generative streamed UI, `streamText` / `generateText` with `Output` for structured data), Google Gemini via `@ai-sdk/google` with Google Search grounding by default; users can switch to their own provider and API key (OpenAI, Anthropic, Gemini, Vercel AI Gateway, OpenRouter, Groq, xAI, DeepSeek, Mistral, Together or any OpenAI-compatible API) from **AI provider** in the chat sidebar, kept in their browser and sent per request. Providers without built-in web search use a Tavily search tool
- **Web data:** Firecrawl for scraping, Tavily and Serper for external search
- **Auth:** NextAuth.js (Google, GitHub OAuth)
- **Data stores:** PostgreSQL (self-hosted, Neon or compatible) via Prisma ORM with `@prisma/adapter-pg` for chats and all persistent data, Upstash Redis for rate limiting and short-lived session state
- **UI:** Radix UI primitives, Tailwind CSS 4, Sass, `class-variance-authority`, `next-themes`
- **Motion:** `motion` (formerly Framer Motion), GSAP, Lenis smooth scroll
- **Media:** Cloudinary
- **Other:** SWR for client data fetching, Zustand for client state, `react-markdown` + `remark-gfm` for rendering AI output
- **Deployment:** self-hosted Node.js server on an Ubuntu VPS (systemd + Nginx reverse proxy)

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
    api/                # Route handlers (chat stream for useChat, ratings, etc.)
    server/             # Orchestrator, agent render tools, stream runtime (stream-ui.ts) and workflow helpers (workflow.ts)
  database/             # Prisma client (PostgreSQL)
  components/
    maven/              # App-specific feature components (chat UI, marketing pages, etc.)
    ui/                 # Shared design-system primitives (shadcn/ui-based)
  lib/                  # Agent tools, orchestrator, data services, types, utilities
  proxy.ts              # Next.js proxy (formerly middleware): NextAuth route protection
```

## Getting started

### Prerequisites

- Node.js v20.19+ / v22.12+ / v24+ (required by Prisma 7)
- Bun (the project ships a `bun.lockb`), or npm/yarn/pnpm
- Git

### Installation

```bash
git clone https://github.com/rizzzky78/market-maven
cd market-maven
bun install
```

### Database setup (PostgreSQL via Prisma)

Persistent data is modeled in [`prisma/schema.prisma`](prisma/schema.prisma) and accessed with Prisma ORM over the `node-postgres` driver adapter (`@prisma/adapter-pg`), so any PostgreSQL-compatible database works: self-hosted Postgres, Neon, Supabase, RDS and similar. Set `DATABASE_URL` to its connection string (`postgresql://user:password@host:5432/db`; add `?sslmode=require` for hosted providers that need TLS).

The Prisma client is generated into the project at `src/generated/prisma` (imported as `@/generated/prisma/client`), not into `node_modules`; it is gitignored and rebuilt by `npm install`, `npm run build` and `npm run db:generate`. Then apply the migrations:

```bash
# New database: create all tables
npx prisma migrate deploy

# Existing database created from the previous hand-written SQL:
# mark the baseline as applied, then apply the remaining migrations
npx prisma migrate resolve --applied 0_init
npx prisma migrate deploy
```

After changing the schema, create a new migration with `npm run db:migrate -- --name <change>` (`npx prisma migrate dev`).

Chats are stored in PostgreSQL since migration `2_chats`; chats previously kept in Redis are not copied over. Records that referenced them get a placeholder chat (no messages, hidden from the history list) so their links keep resolving.

Authentication data (Better Auth's `users`, `sessions`, `accounts` and `verifications` tables) lives in the same database since migration `3_better_auth`.

| Model (table) | Purpose |
|---|---|
| `User` (`users`) | Signed-in people, created by Better Auth on first OAuth sign-in |
| `Session` (`sessions`) | Better Auth login sessions (cookie token, expiry, IP / user agent) |
| `Account` (`accounts`) | OAuth provider identities (Google, GitHub) and their tokens, linked to a user |
| `Verification` (`verifications`) | Short-lived verification values such as OAuth state |
| `Chat` (`chats`) | A user's conversation; owns its messages and tool, object and markdown records (deleted together) |
| `ChatMessage` (`chat_messages`) | Ordered AI state messages of a chat (role enum + JSON content) |
| `ScrapeCache` (`scrape_cache`) | Caches web scraping results by query to avoid redundant requests |
| `MarkdownStore` (`markdown_store`) | Persists scraped markdown tied to a chat and owner |
| `ObjectStore` (`object_store`) | Structured tool output (search results, product details, comparisons) tied to a chat and owner |
| `ToolDataStore` (`tool_data_store`) | Records agent tool executions, arguments, results, and success status |
| `Share` (`shares`) | Tracks publicly shared content and access analytics |
| `Rating` (`ratings`) | App ratings and feedback shown on the reviews page |

### Environment variables

Create `.env.local` in the project root (never commit it):

```
LOG_LEVEL="info"

# Base URL search for Tokopedia (or other e-commerce site, if applicable)
TOKOPEDIA_SEARCH_BASE_URL="https://www.tokopedia.com/search?q="

# Models
GOOGLE_GENERATIVE_AI_API_KEY="YOUR_APIKEY"   # https://aistudio.google.com/app/apikey
# MAVEN_REASONING_MODEL="gemini-2.5-flash"     # optional: routing, research, analysis
# MAVEN_LIGHT_MODEL="gemini-2.5-flash-lite"    # optional: related queries, inquiries, titles
XAI_API_KEY="YOUR_APIKEY"
DEEPSEEK_API_KEY="YOUR_APIKEY"

# External sources
TAVILY_API_KEY="YOUR_APIKEY"                 # https://app.tavily.com/home
SERPER_API_KEY="YOUR_APIKEY"                 # https://serper.dev/api-key
FIRECRAWL_API_KEY="YOUR_APIKEY"

# Databases
UPSTASH_REDIS_REST_URL="YOUR_APIKEY"
UPSTASH_REDIS_REST_TOKEN="YOUR_APIKEY"
DATABASE_URL="postgresql://user:password@localhost:5432/maven"   # any PostgreSQL (self-hosted, Neon, ...)

# Auth
NEXTAUTH_SECRET="USE_SECURE_STRING_OR_RANDSSL"   # e.g. openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
AUTH_GITHUB_ID="YOUR_GITHUB_AUTH_ID"
AUTH_GITHUB_SECRET="YOUR_GITHUB_AUTH_SECRET"
AUTH_GOOGLE_ID="YOUR_GOOGLE_AUTH_ID"
AUTH_GOOGLE_SECRET="YOUR_GOOGLE_AUTH_SECRET"

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

Maven's orchestrator automatically selects among six tools based on user intent:

| Tool | Purpose | Example input |
|---|---|---|
| `recommendator` | Personalized product suggestions | "best noise-canceling headphones for travel under $200" |
| `searchProduct` | Finds a specific product by name | "Sony WH-1000XM5" |
| `getProductDetails` | Full specs, reviews, pricing for one product | Attach a product via the UI |
| `productsComparison` | Side-by-side comparison of two products | Two `callId`s from prior `getProductDetails` calls |
| `webResearch` | Search-grounded answer with cited sources for a factual question | "Is the Galaxy S25 screen brighter than the Pixel 9?" |
| `inquireUser` | Clarifying question when intent is ambiguous | "Find me a good laptop." → Maven asks about intended use |

See the [Workflow](<src/app/(blog)/workflow/README.md>) page doc for how these fit into the request pipeline, and the [Cookbook](<src/app/(blog)/cookbook/README.md>) page doc for usage recipes.

## Deployment (Ubuntu VPS)

Maven runs as a regular Node.js server (`next start`) behind Nginx. The AI prompts are bundled in the repository, so no hosting-platform services are required; the external dependencies are PostgreSQL, Upstash Redis and the API keys listed above.

### 1. Install Node.js and PostgreSQL

```bash
# Node.js 22 LTS (package.json engines: ^20.19 || ^22.12 || >=24)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx postgresql

# Database and user
sudo -u postgres psql -c "CREATE USER maven WITH PASSWORD 'change-me';"
sudo -u postgres psql -c "CREATE DATABASE maven OWNER maven;"
```

### 2. Build the app

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin maven
sudo -u maven git clone https://github.com/rizzzky78/market-maven.git /home/maven/app
cd /home/maven/app
sudo -u maven cp example.env .env   # fill in every value, see "Environment variables"
sudo -u maven npm ci                # also runs `prisma generate`
sudo -u maven npx prisma migrate deploy
sudo -u maven npm run build
```

In `.env`, set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your public URL (e.g. `https://maven.example.com`) and `DATABASE_URL` to the database created above. `NEXT_PUBLIC_APP_URL` is inlined at build time, so rebuild after changing it. Add `https://<your-domain>/api/auth/callback/google` and `.../callback/github` as OAuth redirect URLs.

### 3. Run it with systemd

`/etc/systemd/system/maven.service`:

```ini
[Unit]
Description=Maven AI (Next.js)
After=network.target postgresql.service

[Service]
User=maven
WorkingDirectory=/home/maven/app
# Next.js loads .env from WorkingDirectory itself
Environment=NODE_ENV=production
ExecStart=/home/maven/app/node_modules/.bin/next start -p 3000 -H 127.0.0.1
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now maven
journalctl -u maven -f   # logs
```

### 4. Nginx reverse proxy and HTTPS

`/etc/nginx/sites-available/maven`:

```nginx
server {
    listen 80;
    server_name maven.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Agent responses are streamed (React Server Components); buffering
        # would hold them back until the whole multi-step answer is done.
        proxy_buffering off;
        proxy_cache off;
        # Agent tool chains (scrape + several model calls) can take minutes.
        proxy_read_timeout 300s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/maven /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d maven.example.com
```

### Updating

```bash
cd /home/maven/app
sudo -u maven git pull
sudo -u maven npm ci
sudo -u maven npx prisma migrate deploy
sudo -u maven npm run build
sudo systemctl restart maven
```

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
- **Database connection problems:** re-check `DATABASE_URL` and confirm the database user has the required permissions.

## Portfolio summary

Maven AI is a Next.js + TypeScript application that turns natural-language product questions into AI-driven recommendations, searches, detailed breakdowns, and comparisons for electronics. It showcases a full agentic pipeline — an orchestrator that routes user intent to specialized tools, generative streamed UI via the Vercel AI SDK, real web data via Firecrawl/Tavily scraping, and chats and data persisted in PostgreSQL (Prisma), with Redis for rate limiting — wrapped in an animated, OAuth-gated Next.js frontend with public content sharing.
