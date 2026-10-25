# Requirements — baseline (v0, agreed 2026-10-24)

**Goal:** replace the physical flavour board (red paper, silver frame, cardboard cards) with a monitor that looks at least as good and is just as easy to change.

**Philosophy:** pretty configurable, sane defaults: plug and play, personalise if you like. No feature creep: it must look good and effectively substitute the physical board.

## Setup

- Monitor: Lenovo, 16:9, **landscape**, most likely 1920×1080 (maybe 2560×1440), on the counter.
- A Chromebook (or any PC with Chrome) under the counter runs the app.
- The board reaches the monitor through the existing Chromecast:
  - **A+ "Proietta"**: Presentation API, one click, the board is rendered off-screen at the TV's resolution.
  - **A "Cast tab"**: Chrome's Cast menu, casting only the board's tab.
  - **Backup:** HDMI cable from the Chromebook, with the board window full screen on the monitor.

## Functional

| # | Requirement |
|---|---|
| A1 | Display view: only the board. No cursor, menus, dialogs or errors. |
| A2 | Only the display view goes to the monitor; the PC stays usable for anything else. |
| A3 | If the board window closes or anything fails, projection stops. The desktop is never shown on the monitor. |
| A4 | Every change in the editor appears on the monitor within about 1 s. |
| B1 | Flavour cards: major text, optional minor text, vegan yes/no, sold out yes/no. Create, edit, delete. |
| B2 | Inventory: all cards, whether on the board or not. |
| B3 | Starts with today's 13 flavours. |
| B4 | Vegan is a property of the flavour. The style decides the colours: vegan = green, non-vegan = white/neutral. |
| B5 | Optional leaf icon on vegan cards. |
| B6 | "Esaurito / Sold out" mark without removing the card. |
| B7 | Optional icon of the flavour's main ingredient (toggle per preset). Guessed from the name, can be chosen by hand or turned off per flavour. Single-colour, following the vegan colour code. |
| C1 | Background + optional frame. Toggling the frame re-flows the cards to use the space. |
| C2 | **Grid**: rows × columns. Place or remove a card in any cell without moving the others. All cards have the same, configurable size. *(Manual free placement dropped on 2026-10-24: the grid is enough.)* |
| C4 | Effect: **Preciso / Naturale** (small random rotation and offset). Pressing Naturale again re-rolls. Stable across reloads. |
| D1 | Major/minor text slots. Without a minor, the major gets the whole card. |
| D2 | Font sizes consistent across cards (board-wide size). Only long names shrink or wrap to 2 lines. The minor is never bigger than the major. |
| D3 | Fonts chosen from a small curated list, bundled offline. |
| E1 | Style presets: **Classica** (replica of the real board); in the shop's logo colours **Carta**, **Fondente**, **Tavoletta**, **Etichetta**, **Polaroid**; then **Lavagna** and **Pastello**. Each keeps the vegan colour code. |
| E2 | Every preset is tunable (colours, frame, logo header, effect, size, fonts…) with a reset to its sane defaults. Tweaks are remembered per preset. |
| F2 | Undo/redo. |
| F1 | Italian, intuitive editor with a live preview. Works with mouse and touch. Autosave. |
| G1 | Data survives reload and reboot. Export/import backup file. App updates never lose data (versioned data + migrations). |
| H1 | Hosted at a fixed HTTPS address (GitHub Pages), published automatically from `main` once the tests pass. |
| H2 | Installable as an app; opens without internet; a reload picks up the latest version. |
| H3 | A drawing error never shows on the monitor, and the editor stays usable to fix it. The board window keeps the screen awake. No memory growth over long runs. |

## Non-functional

- Runs in Chrome (ChromeOS in production, Linux for development).
- Renders on a fixed 1920×1080 logical canvas scaled to any screen, so it stays sharp at any resolution.
- Works offline (fonts and textures bundled); the network is only needed for casting.
- Light: static page, no continuous animations.
- No accounts, no tracking; data stays on the device.
- TypeScript, unit tests for the layout logic, CHANGELOG, git tags per release.

## Parking lot (not now)

Phone control, prices, allergens, scheduled boards, multiple saved boards, publish/freeze mode, contrast warnings, custom Chromecast receiver.
