# Ice Cream Board

A virtual flavour board for an ice cream shop: a web app that shows the available flavours on a monitor (through a Chromecast or HDMI) and lets the staff change them from a computer behind the counter.

- `index.html`: the **editor** (flavours, board, settings).
- `display.html`: the **board** only, the page that goes on the monitor.

## Develop

Requires Node.js (any recent version).

```sh
npm install        # once: downloads the libraries into node_modules/
npm run dev        # starts the dev server on http://localhost:5173 (reloads on save)
npm test           # runs the unit tests once (npm run test:watch keeps them running)
npm run build      # type-checks and builds the production files into dist/
npm run preview    # serves dist/ on http://localhost:4173
```

## How it works

| Piece | What it does |
|---|---|
| `src/model/` | The data (flavours, board, style) and every action that changes it. Stored with Zustand and saved to `localStorage`. |
| `src/board/` | Draws the board on a fixed 1920×1080 canvas, scaled to the screen. `textFit.ts` picks font sizes, `layout.ts` the geometry, `textures.ts` the procedural textures. |
| `src/editor/` | The editor UI. |
| `src/display/` | The display page. |
| `src/cast/` | "Proietta": casting with the Presentation API. |

Windows stay in sync through the browser's `storage` event. A cast receiver gets the state as messages from the editor.

## Stack

TypeScript · React · Vite · Zustand · Vitest · Fontsource fonts (SIL Open Font License).

See `docs/REQUIREMENTS.md` for the agreed requirements and `CHANGELOG.md` for the version history.
