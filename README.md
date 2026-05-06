# PlateUp! Toolkit

A browser-based control panel for [PlateUp!](https://store.steampowered.com/app/1599600/PlateUp/) that connects to the game's built-in Twitch integration WebSocket so you can spawn appliances, create cards, and toggle game state directly from your browser.

## How to use

1. Launch **PlateUp!**
2. Go to **Options → Advanced** and click the **"Open Chef"** button. This opens the game's Twitch integration server (it listens on `ws://localhost:12392`).
3. Open this site in your browser.
4. Once the "Disconnected!" modal goes away, you can:
   - **Appliances** — pick one or more appliances and click *Add* to spawn blueprints.
   - **Game** — set arbitrary game state values (e.g. `SET_UI_VISIBILITY`).
   - **Cards** — pick one or more cards and click *Add* to create them.

The live game state is shown in the table at the top of the page.

## Local development

Just serve the folder with any static server, e.g.:

```bash
npx serve .
```

Then open `http://localhost:3000` while PlateUp! is running with "Open Chef" enabled.

## How it works

The page opens a WebSocket to `ws://localhost:12392` (the local server that PlateUp!'s Twitch integration starts when you click "Open Chef"), sends `WEB_JOIN` + a `REQUEST_DATA` message to retrieve appliances/cards, then forwards your UI actions as `ADD_BLUEPRINT` / `CREATE_CARD` / state-change messages.

## Disclaimer

This is an unofficial fan tool. PlateUp! is © It's Happening LTD.
