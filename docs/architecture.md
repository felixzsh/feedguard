# FeedGuard Architecture

## Core Principle
Read-only scraping. Session-based authentication. Platform-agnostic core.

## Patterns

**Strategy Pattern - Platforms**
Each platform implements `IPlatform`. Adding a new platform doesn't touch other implementations.

**Factory Pattern - Registry**
`PlatformRegistry` manages platform discovery. CLI doesn't know which platforms exist.

**Chain of Responsibility - Filters**
Configurable filter chain. Easy to add semantic/LLM filters later.


## Module Boundaries

**CLI** - User interaction only. No platform knowledge.

**Platforms** - Platform-specific code only. Each contains:
- Implementation of `IPlatform`
- Authenticator with session validation tests
- Scraper with extraction logic
- `selectors.ts` - versioned CSS/XPath
- Own tests

**Core** - Business logic. Platform-agnostic:
- Browser management (Playwright lifecycle)
- Config validation (Zod schemas)
- Digest generation (orchestration)
- Session storage (encrypted)
- Filter chain execution

**Utils** - Pure functions. No dependencies on other layers.

## Data Flow

```
Config → Validation → Session Load → Browser Launch → Scrape → Filter → Format → Output
```

## Unified Post Type

All platforms normalize to:
```typescript
interface Post {
  id: string;
  platform: string;
  author: string;
  content: { text, images?, links? }
  metadata?: { timestamp, url }
}
```

Filters and formatters work on this, not platform-specific types.

## Platform Development

**Adding a platform requires:**
1. Implement `IPlatform` interface
2. Create authenticator with validation logic
3. Define selectors in `selectors.ts` (versioned)
4. Write tests for auth validation
5. Register in `registry.ts`

Core modules work automatically.

**Session validation:**
Each platform tests 2-3 specific logged-in elements. Must pass before saving session.

**Selector versioning:**
Track UI changes with version field in `selectors.ts`.

## Bot Detection Mitigation
* Occasional random delays (0.5-2s variance)
* TBD

## Error Strategy

**Platform errors** - Log and continue (partial digest OK)
**Config errors** - Fail fast with clear message
**Auth errors** - Prompt re-login

## Testing

**Unit** - Pure functions, filters, normalizers
**Integration** - Real browser with testing targets
**Fixtures** - TBD

## Future Notes

**LLM Integration** - for better post digestion
**Auto-Maintenance** - Vision-based selector recovery (experimental)
