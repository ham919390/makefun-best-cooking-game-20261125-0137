# Simmer & Serve — a cozy diner cooking game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/ham919390/makefun-best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/ham919390/makefun-best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A free make.fun bounty entry: run the coziest diner kitchen in town. Orders
roll in on the board — chop, grill and boil, stack the plate, and serve
before patience runs out. Built with plain HTML, CSS and canvas JavaScript,
no libraries and no network requests.

Play it on [make.fun](https://make.fun/bounty/best-cooking-game-20261125-0137)
(referral code `ej1tk366`).

## How to play

- **Orders** appear on the board with a patience bar. Each lists the dish and
  its ingredients; serve the exact dish before the bar runs out.
- **Ingredients** (bins, keys 1–8): click a bin to pick an ingredient up.
  - Bun, cheese and sauce go straight on the plate.
  - Lettuce, tomato and onion need **chopping** — put them on the board and
    click it 3 times.
  - Patties need **grilling** — 5 seconds on the grill, then take them off
    before they burn.
  - Pasta needs **boiling** — 4 seconds in the pot, then take it out before
    it goes soggy.
- **Plate**: click it with an item in hand to stack it. **SERVE** (or Space)
  when the plate matches an open order. Fast service pays a tip, and serving
  in a row builds a combo multiplier.
- **Trash** (or T) throws away what's in hand, or the top item on the plate.
- A shift lasts 3 minutes. 4 dishes on the menu: Classic Burger ($12),
  Cheesy Pasta ($11), Garden Salad ($9) and Patty Melt ($13).

## Controls

Mouse: click bins, stations, the plate and SERVE.
Keys: `1–8` pick ingredients · `Space` serve · `T` trash · `M` mute ·
`P` pause · `R` play again after a shift ends.

## Run it

Serve `game/` with any static server and open it in a desktop browser:

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080
```

Or run the entry program, which copies `game/` and `screenshots/` to the
output directory and writes `dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of the game's own code, staged
with `?shot=` (`play`, `serve`, `rush`, `start`) — see `shots.json`.
