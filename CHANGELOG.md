# Changelog

## v0.2.0: style presets (burst 2, awaiting approval)

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
