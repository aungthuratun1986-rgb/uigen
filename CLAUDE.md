# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (installs deps, generates Prisma client, runs migrations)
npm run setup

# Development server (Windows — uses cross-env)
npm run dev

# Production build
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx

# Reset the database
npm run db:reset
```

> `npm run dev` / `build` / `start` require `cross-env` because the scripts set
> `NODE_OPTIONS` — Linux-style single-quote syntax will fail on Windows.

## Environment Variables (`.env`)

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Without it, `MockLanguageModel` is used instead |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | No | Defaults to `"development-secret-key"` |

## Architecture Overview

### Request Flow
1. User types a prompt → `ChatInterface` → `useChat()` (chat-context) → `POST /api/chat`
2. `/api/chat/route.ts` reconstructs the `VirtualFileSystem` from serialized client state, streams a response from Claude (or `MockLanguageModel`) with two tools attached: `str_replace_editor` and `file_manager`
3. AI calls tools to create/edit files inside the `VirtualFileSystem`; the updated FS is sent back to the client and stored in `FileSystemContext`
4. `PreviewFrame` renders the virtual files live in an iframe using `@babel/standalone` for JSX transpilation
5. On finish, if the user is authenticated and a `projectId` exists, the full message history and serialized FS are persisted to the database via Prisma

### Virtual File System
`VirtualFileSystem` (`src/lib/file-system.ts`) is an **in-memory** tree — no files are written to disk. It is serialized to a plain `Record<string, FileNode>` for transport over HTTP and for database storage (stored as JSON strings in the `Project` model). Two AI tools operate on it:
- `str_replace_editor` — create files or apply string-replace patches
- `file_manager` — move, delete, list files

### State Management
All state lives in two React contexts, both mounted inside `MainContent`:
- `FileSystemContext` — owns the `VirtualFileSystem` instance; handles `onToolCall` callbacks from the AI stream to mutate FS in real time
- `ChatContext` — wraps Vercel AI SDK's `useChat`; exposes `messages`, `input`, `setInput`, `handleInputChange`, `handleSubmit`, `status`

### Auth
Cookie-based JWT auth (`src/lib/auth.ts`). `getSession()` is server-only (uses `next/headers`). `verifySession()` is used in middleware. Passwords are hashed with `bcrypt`. Anonymous users can generate components; project persistence requires sign-in.

### Theming
`ThemeProvider` (`src/components/ThemeProvider.tsx`) manages dark/light mode:
- Reads from `localStorage` on mount; defaults to `"dark"`
- Adds `dark` or `light` class to `<html>`
- A flash-prevention inline `<script>` in `layout.tsx` applies the saved class before React hydrates
- All colors are CSS custom properties in `globals.css` — edit `--accent-from`, `--accent-mid`, `--accent-to` to change the gradient palette

### Mock Provider
When `ANTHROPIC_API_KEY` is absent, `getLanguageModel()` (`src/lib/provider.ts`) returns `MockLanguageModel`, which simulates the tool-calling loop with hardcoded components (Counter, Card, ContactForm). This lets the app run without an API key.

### `node-compat.cjs`
Injected via `NODE_OPTIONS=--require` to delete `globalThis.localStorage` and `globalThis.sessionStorage` on the server. Required because Node 25+ ships a non-functional Web Storage API that breaks SSR guards in dependencies.

## Comments

Use comments sparingly. Only comment complex or non-obvious code — self-explanatory code needs no comment.

## Database

Schema is defined in `prisma/schema.prisma` — reference it whenever you need to understand stored data structure. Two models:
- **User** — `id`, `email` (unique), `password` (bcrypt), timestamps, relation to projects
- **Project** — `id`, `name`, optional `userId`, `messages` (JSON string array), `data` (JSON string of serialized VirtualFileSystem), timestamps

## Key Conventions

- **Server Actions** live in `src/actions/` and are called directly from client components (Next.js Server Actions pattern)
- **Tailwind v4** — uses CSS `@theme inline` block instead of `tailwind.config.js`; add new design tokens as CSS variables
- UI primitives come from **shadcn/ui** (`src/components/ui/`) — prefer extending these over writing raw HTML
- The AI model is hardcoded to `claude-haiku-4-5` in `src/lib/provider.ts`; change `MODEL` there to switch models
