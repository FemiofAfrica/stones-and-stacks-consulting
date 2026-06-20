# Stones and Stacks Consulting

The firm behind the ones who win.

## Structure

```
├── index.html          # Main site
├── styles.css          # Design system + layout (CSS custom properties)
├── script.js           # Scroll reveal, nav, expand/collapse, contact form
├── package.json        # Build tooling (npm run build → dist/)
├── scripts/
│   └── build.js        # Minifies CSS (+24%), HTML (+21%), copies assets
├── content/            # Source docs (MISSION.md, service-offerings.md, etc.)
├── hero-bg.jpg         # Hero background (JPEG fallback)
├── hero-bg.webp        # Hero background (WebP — modern browsers)
└── .gitignore
```

## Local dev

```bash
npm run dev
# → http://localhost:4173
```

## Build for production

```bash
npm run build
# → dist/
```

```bash
npm run preview
# → serves dist/ on http://localhost:4173
```

## Deploy

This repo is configured for Cloudflare Pages:

- **Build command:** `npm ci && npm run build`
- **Root directory:** `dist`
- **Domain:** stonesandstacks.com
