# FeedGuard

**View social media without entering social media. Take back control of your attention.**

## The Problem

Modern social media is engineered to be addictive—hijacking attention, eroding cognitive abilities, manipulating decisions, and consuming hours through endless scrolling. The rise of AI-generated content has worsened this, flooding feeds with a convincing but artificial reality that undermines authenticity and trust.

Self-control doesn't work against intentionally addictive design. That's why many quit entirely.

## The Proposal

FeedGuard offers a different approach: **conscious consumption**. View posts from accounts you care about, without algorithms, notifications, or endless feeds.

### Technical Approach

FeedGuard is a simple CLI tool built with Bun and Playwright that achieves read-only social media scraping. By leveraging Playwright's browser automation capabilities, it can access social platforms in a logged-in state while maintaining a strict read-only policy—no interactions, no engagement metrics, just viewing.

**Core Commands:**

- `feedguard auth` - Authenticate with social platforms
- `feedguard run` - Generate a new digest
- `feedguard view` - View previously generated digests
- Config file support - Define sources, filters, and output settings

## Getting Started

### 1. Installation

```bash
# Clone and setup
git clone https://github.com/felixzsh/feedguard.git
cd feedguard
bun install
```

### 2. Setup

**Authentication:**
Authenticate with each platform once (currently Facebook only in MVP):

```bash
feedguard auth facebook
# More platforms coming soon
```

FeedGuard will open a browser for you to log in manually, then stores the combined session for future use.

**Configuration:**
Create config files in `~/.config/feedguard/`:

```yaml
# daily_digest.yml
outputFile: ~/Documents/feedguard/daily.md
outputViewer: glow  # or typora, vscode, obsidian, etc.
sources:
  - platform: facebook
    handle: CNN
    limit: 10
    filters:
      blacklist: ["politics", "celebrity"]
  - platform: facebook
    handle: NASA
    limit: 5
    filters:
      blacklist: ["job opening", "career"]
```

Key configuration options:

- `outputFile`: Path where the markdown digest will be saved
- `outputViewer`: Executable name to open markdown files (e.g., `glow`, `typora`, `code`)
- `sources`: List of accounts to scrape with their limits and filters

### 3. Usage

**Manual Usage:**

```bash
# Generate a new digest
feedguard run

# If a digest already exists for today, use:
feedguard run --ignore-daily

# View your most recent digest
feedguard view --last

# List and choose from available digests
feedguard view
```

When you run `feedguard run`:

1. Scrapes posts from all configured sources
2. Filters out blacklisted content
3. Generates a clean Markdown file (timestamped)
4. Shows a system notification: "Your social media digest is ready!"
5. Click the notification to automatically run `feedguard view --last`

**Automated Usage (Recommended):**
Add `feedguard run` to your system startup. This way:

- Daily digests are generated automatically
- You get a notification when ready
- No manual intervention needed
- Control frequency with `--ignore-daily` flag if needed more than once daily

## Roadmap

### MVP (Current)

- [ ] Session persistence
- [ ] Basic CLI with auth/run commands
- [ ] Facebook platform support
- [ ] Keyword-based filtering (blacklists)
- [ ] Markdown output generation
- [ ] System notifications
- [ ] Digest viewer command

### Near Future

1. **Auto-Maintenance System** (Experimental)
   - AI-powered self-repair for breaking UI changes
   - Optional integration with OpenCode
   - Fallback to manual maintenance if disabled
   - Critical for long-term viability
2. **Enhanced Digestion**
   - LLM-powered summaries and curation
   - Semantic filtering beyond keywords
   - Image collection from posts
3. **Extended Platform Support**
   - Twitter/X
   - Instagram
   - Reddit
   - LinkedIn
   - Modular architecture for community contributions

## Philosophy

FeedGuard isn't just another scraping tool. It's part of a movement to:

1. **Reclaim intentionality** - Choose what you see, consciously
2. **Eliminate manipulation** - No algorithms dictating your attention
3. **Save time** - Get the information you want without the infinite scroll
4. **Improve focus** - View content in a distraction-free format

## Contributing

We welcome contributions, especially:

- Platform scrapers for new social networks (starting with Twitter/X)
- Filtering improvements
- Output format options
- Integration with other tools (read-it-later apps, etc.)

See `CONTRIBUTING.md` for development setup and guidelines.

## License

MIT License - See `LICENSE` for details.
