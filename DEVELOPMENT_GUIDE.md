# Level Forge Development Guide

## Branches

- Use `main` for the live website.
- Use a `codex/...` branch for large changes.
- Merge or push to `main` only after the checklist passes.

## GitHub Issues

- Use issues as the project to-do list.
- Create one issue per bug, feature, balance pass, or image swap.
- Keep big ideas separate so each change can be tested cleanly.

## Code Changes

- Prefer local edits, checks, commits, and pushes over editing code directly in the GitHub website.
- Image uploads through GitHub are fine when they are added to the expected asset folder.
- Keep balance numbers in data files when practical:
  - `game-data.js` for skills, workout rates, pet rates, dungeons, keys, and starting state.
  - `quest-data.js` for quest requirements and rewards.
  - `shop.js` for shop prices and market behavior.
  - `township.js` and `township-upgrades.js` for township materials, buildings, and map dungeons.

## Release Flow

1. Create a branch for bigger work.
2. Make the change.
3. Run the checklist in `TEST_CHECKLIST.md`.
4. Commit the change.
5. Push to GitHub.
6. Confirm GitHub Pages passes.
