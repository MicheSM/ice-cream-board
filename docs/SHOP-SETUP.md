# Setting up the shop

The app lives at **https://michesm.github.io/ice-cream-board/**: the Chromebook only needs Chrome and that address.

## 0. Before you go (optional)

The Chromebook starts with today's 13 flavours and the Classica style. To bring what you set up on another computer, open the editor there, go to **Backup → Esporta**, and copy the `.json` file to the Chromebook (USB stick, Drive, email). Then use **Backup → Importa…** on the Chromebook.

## 1. Chromebook, once

1. Connect it to the shop's Wi-Fi, **the same network as the Chromecast**. Guest networks often block casting.
2. Open Chrome and go to the address above.
3. **Install it as an app.** Use the install icon at the right end of the address bar, or **⋮ → Cast, save and share → Install page as app**. It becomes "Lavagna dei gusti", with its own window and an icon in the launcher. To pin it, right-click the icon on the shelf → **Pin**.
4. **Power:** Settings → System preferences → Power. Keep it plugged in.
   - When idle, while charging: **Turn off display**, not *Sleep*. The screen goes dark but the Chromebook keeps casting. If it sleeps, the monitor goes black.
   - **Sleep when cover is closed: off** if it will live with the lid closed.
5. **After a restart:** Settings → Apps → **Restore apps on startup → Always**. The app window then comes back by itself after a restart or an update. Casting has to be restarted by hand, because Chrome needs a click to pick the Chromecast.

## 2. Getting the board on the monitor

Try these in order. The first one that works is the routine.

| | How | Notes |
|---|---|---|
| **A+ Proietta** | In the app: **▶ Proietta** → pick the Chromecast | Best: the board is drawn straight at the TV's resolution, and the Chromebook's screen stays on the editor. |
| **A Cast tab** | **Apri lavagna ↗** → in the board window: right-click → **Cast…** → Chromecast. Under *Sources*, choose **Cast tab**, never the screen. | Keep the board window open. Minimising it is fine. |
| **B HDMI cable** | Cable from the Chromebook to the monitor. In Settings → Device → Displays, make sure it **doesn't mirror**. Then **Apri lavagna ↗**, drag the window onto the monitor, and double-click it for full screen. | The fallback if casting gives trouble. The board window keeps the screen awake by itself. |

## 3. Test checklist

Note ✓ or ✗ (and what you saw) for each, so we know what to fix:

1. Does **Proietta** list the Chromecast? Does the board appear on the monitor, and is the text sharp?
2. Change a flavour or mark one sold out: how quickly does the monitor follow?
3. Leave everything alone for 10+ minutes until the Chromebook's screen turns off. Is the monitor still showing the board?
4. If it will live with the lid closed: close it. Still casting?
5. Close the app window. What does the monitor do? Reopen the app: does the button say **■ Stop proiezione** (it reconnected), or do you have to press Proietta again?
6. If Proietta fails: does **Cast tab** work? Are there black bars around the board?
7. Is anything cut off at the edges of the monitor? Some screens zoom the HDMI picture ("overscan"). In the monitor's menu, look for an aspect setting like *1:1*, *Just scan* or *Pixel to pixel*.
8. Turn the Wi-Fi off and reload the app (Ctrl+R). Does it still open?
9. Restart the Chromebook. Does the app window come back?
10. If you can see it in the monitor's menu: what resolution does it report?

## 4. Everyday use

- **Morning:** open the app if it isn't already, then press **▶ Proietta** unless the monitor already shows the board.
- **Changing flavours:**
  - Click a cell on the board, or drag cards between the list and the board.
  - **Esaurito** marks a card sold out without removing it.
- **Help:** **? Aiuto** in the app has the short guide in Italian, and the app's version at the bottom.

## Updates and data

- **Updates:** when a change lands on `main`, GitHub tests it and publishes it in about a minute. On the Chromebook, reload the app (Ctrl+R) to get it. To check which version is running, look at the bottom of **? Aiuto** (e.g. `v0.3.0 · 1a2b3c4`) and compare it with the latest commit on GitHub. Without internet, the app opens the last version it saved.
- **Data:** the flavours live only in the Chromebook's browser. Clearing Chrome's "cookies and site data" deletes them, so make a **Backup → Esporta** once in a while.
