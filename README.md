# Wavelength 🌊

A peer-to-peer multiplayer guessing game built with SvelteKit 5 and WebRTC. Two players connect directly (no server needed!) and take turns giving clues to help each other guess positions on a customizable slider.

## 🎮 Play Now

**Live Demo:** [https://thatxliner.github.io/wavelength/](https://thatxliner.github.io/wavelength/)

## How to Play

1. **Connect with a friend:**
   - One player hosts, the other joins
   - Exchange WebRTC offers/answers via copy/paste (Discord, text, etc.)
   - No server needed - direct peer-to-peer connection!

2. **Configure the game:**
   - Host sets slider endpoints (e.g., "Hot" ↔ "Cold", "Love it" ↔ "Hate it")

3. **Play rounds:**
   - **Clue Giver:** See the target position and provide a one-word/phrase clue
   - **Guesser:** Use the clue to drag the slider to guess the target
   - **Score:** Closer guesses earn more points (0-4 points)
   - Roles swap each round!

## Features

- ✅ **Peer-to-peer** - No server, no backend, just WebRTC magic
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
- **WebRTC** - Peer-to-peer connections
- **Vite** - Build tool
- **GitHub Pages** - Static hosting

## Development

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js 20+)

### Setup

```sh
# Clone the repository
git clone https://github.com/ThatXliner/wavelength.git
cd wavelength

# Install dependencies
bun install

# Start dev server
bun run dev
```

Open two browser windows to test locally (or use different browsers/incognito mode).

### Building

```sh
# Build for production
bun run build

# Preview production build
bun run preview
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
BASE_PATH='/wavelength' bun run build

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
