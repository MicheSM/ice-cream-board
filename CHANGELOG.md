# Changelog

## v0.4.0: Argento styles (2026-10-25)

- Four new presets in the colours of the shop's logo (chocolate brown, gold, silver), simple rather than fancy:
  - **Carta**: like a printed menu. No cards, just the names in columns on light paper, spaced capitals, gold hairlines between flavours (or between columns, or none), a thick-and-thin gold border.
  - **Fondente**: dark chocolate background, gold frame with the logo's silver line, each flavour in a thin gold frame (or a plain gold line, or no frame at all).
  - **Tavoletta**: the board is a bar of chocolate in crumpled gold foil, with a paper band carrying the logo. Every flavour is a square of the bar; empty cells are plain squares. Dark, milk or white chocolate.
  - **Etichetta**: every flavour is a white label with a gold border and a silver line, like the logo, on light oak slats like the wall behind the counter (or white, grey or chocolate).
- **Ingredient icons** (new "Icona dell'ingrediente" option in every preset, off by default): each flavour shows a small drawing of its main ingredient, in a column on the left of the card (in the menu layouts, just before the name). 27 icons drawn for the app in one line style: fruits, nuts, chocolate, coffee, milk, custard, vanilla, yogurt, licorice, mint, caramel, honey, cookie, cake, cone. They take the preset's ink, and are green on vegan flavours.
  - The icon is guessed from the name (in Italian or English): "Cioccolato al latte" gets chocolate rather than milk, "Crema al caffè" gets coffee. The flavour form has an **Icona** picker to choose another one or none; "Auto" goes back to the guess.
- The old Argento preset is now called **Polaroid**.
- 3 more bundled fonts, all clean sans-serifs: Josefin Sans ("Geometrico"), Jost ("Essenziale"), League Spartan ("Locandina", like the inauguration poster). In capitals they get a little extra letter spacing, which the text fitting takes into account.
- In the menu-style layouts, the vegan leaf follows the name like a word instead of sitting in a corner.
- The "Esaurito · Sold out" strip uses each preset's own header font, and shrinks to fit narrow cards.
- The card colour option is named after what it changes in each preset (Decorazione, Riquadri, Cioccolato, Etichette), and the size slider is just "Dimensione".
- Fix: changing a font or size could silently reset the line spacing of two-line names.
- Checked on a CPU slowed down 6× with the 8 live thumbnails and icons on everywhere: a preset switch shows in about 60 ms, saving a flavour in about 55 ms.

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
