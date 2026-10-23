# Changelog

## v0.3.0: shop-ready (burst 3, to be confirmed at the shop)

- Published on GitHub Pages: https://michesm.github.io/ice-cream-board/, rebuilt and republished automatically on every push to `main` (only if the tests pass).
- Installable as an app ("Lavagna dei gusti", with the shop's logo as icon).
- Works offline: a service worker saves every file of the app; a reload gets the latest version when online.
- If the board ever fails to draw, the monitor shows nothing instead of an error, the editor stays usable, and the board comes back with the next change.
- The board window (HDMI / Cast tab) keeps the screen from sleeping.
- Asks the browser to keep the saved flavours even when the disk is nearly full.
- App version in "? Aiuto", plus tips on backup, offline use and updates.
- `docs/SHOP-SETUP.md`: Chromebook setup, casting options, test checklist.
- Checked on a CPU slowed down 6×: the monitor loads in about 0.6 s, a sold-out toggle shows in about 80 ms, and a preset switch in under 0.3 s. After 1000 changes memory and page size stay flat.

## v0.2.0: style presets (2026-10-24)

- Four presets, each with live thumbnails in the editor:
  - **Classica**: the real board.
  - **Argento**: inspired by the shop's logo and poster: gold and silver frame, chocolate polaroids, header with the logo.
  - **Lavagna**: slate chalkboard with a wood frame, chalk lettering.
  - **Pastello**: bright pastel colours, white rounded cards.
- Every preset is tunable (background and card colours, frame, logo header with editable title, effect, card size, fonts, uppercase, leaf). Tweaks are kept per preset; "Ripristina" goes back to the preset's defaults.
- Effect is now just Preciso / Naturale (pressing Naturale again re-rolls).
- Undo/redo (buttons, Ctrl+Z / Ctrl+Y).
- The vegan leaf never overlaps the text.
- 4 more bundled fonts (Bebas Neue, Amatic SC, Fredoka, Nunito).
- Saved data format v2: data from v0.1 (and old backup files) is converted automatically.

## v0.1.0: first prototype (2026-10-24)

- "Originale" look: hammered chrome frame, red paper, dark cardboard cards with hand-cut edges, chalk-marker font. Green = vegan, white = not.
- Today's 13 flavours preloaded.
- Grid mode: rows × columns, card size, frame on/off; empty cells stay empty.
- Effect: Preciso / Naturale 1–3 (pressing again re-rolls).
- Text engine: consistent sizes across cards, 2-line wrap for long names, the major takes the whole card when there's no minor.
- Leaf icon on vegan cards; "Esaurito · Sold out" strip.
- Editor (Italian): flavour list, create/edit/delete, click or drag to place/move/remove, live preview.
- Monitor: "Apri lavagna" window (for Cast tab or HDMI), "Proietta" button (Presentation API, to be tested on the real Chromecast).
- Autosave, live sync between windows, export/import backup.
