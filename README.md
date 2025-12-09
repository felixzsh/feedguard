# FeedGuard

FeedGuard is a minimalist, command-line tool designed to help users regain control over their social media consumption by filtering out toxic, distracting, or irrelevant content, and delivering a clean, curated digest.

Its core mission is to act as a digital shield against algorithmic manipulation, allowing users to safely decommission their social media apps while staying informed on genuinely valuable information.

## Features

- Multi-Platform Aggregation: Gathers posts from supported social media platforms (Facebook, X, Instagram)
- Custom Filtering Engine: Applies precise user-defined rules (Blacklist) based on keywords to filter content
(this could evolve in regex filtration or AI based filtration)
- Digest Output: Generates all curated content into a single, structured Markdown (.md) file for clean, distraction-free.

## Getting Started

### Prerequisites

- Chromium browser (installed automatically by Playwright)


### Configuration (`config.yaml`)

FeedGuard operates based on a single YAML configuration file where you define all sources and filtering rules.

Example `config.yaml` Structure:

```yaml
output_file: daily_digest.md

sources:
  - platform: facebook
    handle: CNN
    limit: 10
    filters:
      blacklist: ["politics", "celebrity"]
      whitelist: ["technology", "science"]

  - platform: facebook
    handle: NASA
    limit: 5
    filters:
      whitelist: ["space", "mission", "rocket"]
```

### Running FeedGuard

```bash
# Development mode
bun run dev --config=config.yaml

# Or directly
bun run src/cli.ts --config=config.yaml

# Build and run production version
bun run build
./dist/cli.js --config=config.yaml
```


## Technical Details

- **Language/Stack:** TypeScript with Bun runtime
- **Scraping Method:** Playwright (Chromium-based automation)
- **Output Format:** Standardized Markdown with frontmatter
- **Browser Dependency:** Chromium (installed automatically by Playwright)
- **Rate Limiting:** Built-in human-like delays (2-5 seconds) between requests

### Development Commands

```bash
bun install              # Install dependencies
bun run dev              # Run in development mode
bun run build            # Build production version
bun test                 # Run tests
bun run lint             # Lint code
bun run typecheck        # TypeScript type checking
bun run playwright:install # Install Playwright Chromium
```

## Contribution

Contributions, bug reports, and suggestions are welcome.
