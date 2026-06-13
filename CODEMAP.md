# Level Forge Code Map

This is the live GitHub Pages web app.

## Core Files

- `index.html` defines the page tabs and script loading order.
- `game-data.js` contains the stable game data used by the main app: skills, workouts, dungeon tiers, pet rates, starting state, and storage key.
- `app.js` contains the main runtime: saved-state migration, rendering, workout logging, dungeon progress, deletes, reset, and navigation.
- `styles.css` contains the shared app layout, cards, backgrounds, animations, and responsive styling.

## Feature Files

- `hp-skill.js` adds HP bodyweight workouts and the Phoenix pet.
- `distance-picker.js` controls the two-part run distance picker.
- `workout-history-groups.js` groups past workouts by month and type.
- `shop.js` and `shop.css` handle the market, materials, keys, and cosmetic backgrounds.
- `township.js` handles township buildings, materials, project progress, and standard dungeon chests.
- `township-upgrades.js` and `township-upgrades.css` handle township buffs and map dungeons.
- `quest-data.js` contains quest definitions.
- `quests.js` evaluates quest progress, gives rewards, handles repeatables, and renders the quest board.
- `dungeon-dropdowns.js` and `dungeon-rewards-panel.js` make the dungeon UI easier to scan.

## Load Order

1. Stylesheets load first.
2. `game-data.js` loads before `app.js`.
3. `app.js` creates the main state, render functions, and workout logic.
4. Feature scripts load after `app.js` and safely extend the main app.
5. `quest-data.js` loads before `quests.js`.

Keep IDs stable when possible because saved progress, quests, pets, dungeons, township buildings, and shop purchases reference IDs in browser storage.
