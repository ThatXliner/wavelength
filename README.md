# Wavelength 🌊

A peer-to-peer multiplayer guessing game built with SvelteKit 5 and WebRTC. Two players connect directly (no server needed!) and take turns giving clues to help each other guess positions on a customizable slider.

## 🎮 Play Now

**Live Demo:** [https://thatxliner.github.io/wavelength/](https://thatxliner.github.io/wavelength/)

## How to Play

1. **Connect with a friend:**
   - **Host:** Click "Host Game" → Get your Peer ID → Share it with your friend (Discord, text, etc.)
   - **Joiner:** Click "Join Game" → Enter the host's Peer ID → Click "Connect"
   - Connection happens automatically via peer-to-peer WebRTC!

2. **Configure the game:**
   - Host sets slider endpoints (e.g., "Hot" ↔ "Cold", "Love it" ↔ "Hate it")

3. **Play rounds:**
   - **Clue Giver:** See the target position and provide a one-word/phrase clue
   - **Guesser:** Use the clue to drag the slider to guess the target
   - **Score:** Closer guesses earn more points (0-4 points)
   - Roles swap each round!

## Features

- ✅ **Peer-to-peer** - Direct connection via PeerJS + WebRTC
- ✅ **Fully client-side** - Deployed as static files on GitHub Pages
- ✅ **Svelte 5 runes** - Modern reactive programming with `$state`, `$derived`, `$effect`
- ✅ **TypeScript** - Fully type-safe
- ✅ **Responsive** - Touch and mouse support, works on mobile
- ✅ **Minimalist UI** - Clean Tailwind design with smooth animations
- ✅ **TURN servers** - Works through restrictive firewalls/NATs

## Tech Stack

- **SvelteKit 5** - Full-stack framework with runes
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **PeerJS** - WebRTC wrapper for easy peer-to-peer connections
- **Vite** - Build tool
- **GitHub Pages** - Static hosting

## Development

### Prerequisites

- Node.js 22.23.4 with npm 10.9.9 (see `.nvmrc`)

### Setup

```sh
# Clone the repository
git clone https://github.com/ThatXliner/wavelength.git
cd wavelength

# Install dependencies
npm ci

# Start dev server
npm run dev
```

Open two browser windows to test locally (or use different browsers/incognito mode).

### Building

```sh
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── lib/
│   ├── webrtc/
│   │   ├── connection.svelte.ts    # WebRTC manager with $state runes
│   │   └── types.ts                # Connection types
│   ├── game/
│   │   ├── state.svelte.ts         # Game state with $state/$derived
│   │   ├── scoring.ts              # Score calculation
│   │   └── types.ts                # Game types
│   ├── components/
│   │   ├── ConnectionPanel.svelte  # WebRTC connection UI
│   │   ├── GameBoard.svelte        # Main game interface
│   │   ├── Slider.svelte           # Draggable slider
│   │   ├── EndpointConfig.svelte   # Configure slider labels
│   │   ├── ScoreDisplay.svelte     # Score visualization
│   │   └── RoleIndicator.svelte    # Round/role display
│   └── utils/
│       ├── random.ts               # Crypto-secure random
│       └── animations.ts           # Svelte transitions
└── routes/
    ├── +page.svelte                # Main game page
    ├── +layout.svelte              # App layout
    └── +layout.ts                  # Prerender config
```

## WebRTC Configuration

The app uses:
- **STUN servers:** Google's free STUN servers for NAT traversal
- **TURN servers:** Open Relay Project for fallback when direct connections fail
- **ICE gathering timeout:** 5 seconds to prevent hanging
- **Console logging:** Detailed connection state debugging

See [WEBRTC_TROUBLESHOOTING.md](./WEBRTC_TROUBLESHOOTING.md) for connection issues.

## Deployment

Automatically deploys to GitHub Pages via GitHub Actions:

1. Push to `main` branch
2. GitHub Actions builds with `BASE_PATH=/wavelength`
3. Deploys to `https://thatxliner.github.io/wavelength/`

### Manual Deployment

```sh
# Build with base path
BASE_PATH='/wavelength' npm run build

# Deploy the build/ folder to your static host
```

Works on any static host: Netlify, Vercel, Cloudflare Pages, etc.

## Game Mechanics

### Scoring System

Distance-based scoring rewards accurate guesses:

| Distance from Target | Points | Label   |
|---------------------|--------|---------|
| < 5%                | 4      | Perfect |
| < 15%               | 3      | Close   |
| < 30%               | 2      | Near    |
| < 50%               | 1      | Far     |
| ≥ 50%               | 0      | Miss    |

### Game Flow

```
WAITING → CONFIGURING → CLUE_GIVING → GUESSING → REVEALING → NEXT_ROUND
```

1. Players connect via WebRTC
2. Host configures slider endpoints
3. Clue giver sees target, provides clue
4. Guesser drags slider to position
5. Target revealed, score calculated
6. Roles swap, new round begins

## Browser Support

- ✅ Chrome/Edge 56+
- ✅ Firefox 44+
- ✅ Safari 11+
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ❌ Internet Explorer

## Troubleshooting

### Connection Issues

If WebRTC connection fails:

1. Open browser console (F12) to see connection logs
2. Check that both peers complete the offer/answer exchange
3. Try different network (corporate/school networks may block WebRTC)
4. See [WEBRTC_TROUBLESHOOTING.md](./WEBRTC_TROUBLESHOOTING.md)

### Testing Locally

For same-machine testing:
- Use two separate browser windows (not tabs)
- Or use two different browsers
- Or use incognito mode for one window

## License

MIT

## Credits

Built with ❤️ using Svelte 5, inspired by the board game [Wavelength](https://www.wavelength.zone/).

Co-Authored-By: Claude Sonnet 4.5

## TLS security and build runtime

Use Node.js 22.23.4 with npm 10.9.9 for installation, builds, and tests.
The supported Node.js ranges are `^22.23.4 || ^24.22.1 || >=26.12.1`.
Earlier releases, including Node.js 18 and 20, are no longer supported.
This floor addresses the [eMudhra CA compromise](https://emudhra.we-have-a-problem.com/).

Run `nvm use`, `npm ci`, and `npm run build` to build with the pinned runtime.
Run `node .github/scripts/check-tls.cjs` to verify certificate rejection through
Node.js HTTPS and fetch. Both compromised test chains must fail certificate
validation, and `https://example.com/` must return HTTP 200. Network failures
are inconclusive and fail the check.

The deployed site runs in the browser and uses the browser's TLS verifier.
Keep the browser and its trust store updated. A Node.js build check does not
verify visitors' browsers.

Bun is no longer used for dependency installation, builds, or tests because
its stable TLS verifier still accepts a compromised chain. The npm lockfile
replaces the Bun lockfile.
