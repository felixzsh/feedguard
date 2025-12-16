# FeedGuard

## Project Context
Read-only social media scraper. Session-based auth, no interactions during scraping.

## Stack

* **Runtime:** Bun 1.x
* **Language:** TypeScript 5.x (strict mode)
* **Browser Automation:** Playwright with chromium
* **CLI Framework:** commander
* **Config:** js-yaml + Zod validation
* **Testing:** Bun's built-in test runner

## Commands

* `bun install` - install dependencies
* `bun run dev` - run CLI in dev mode (only run and view subcommands)
* `bun test` - run all tests
* `bun test path/to/test.ts` - run single test
* `bun test:watch` - watch mode
* `bun run build` - compile to single binary

## Codebase structure

```
src/
├── cli/
│   ├── index.ts              # CLI entry point
│   ├── commands/             # login, run, view commands
│   └── ui/                   # notifications, prompts
├── platforms/
│   ├── base/                 # Platform interface & shared types
│   ├── facebook/             # Facebook scraper + auth
│   ├── twitter/              # Future platforms...
│   └── registry.ts           # Platform factory
├── core/
│   ├── browser/              # Playwright + session management
│   ├── config/               # YAML config + validation
│   ├── digest/               # Generation, filtering, formatting
│   └── storage/              # Persist digests & sessions
├── utils/                    # logger, retry, sanitize, date
└── types/                    # Shared TypeScript types
```
