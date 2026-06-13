# Level Forge Test Checklist

Use this before pushing large changes to `main`.

## Core App

- The page opens without a blank screen.
- The hamburger menu opens, closes, and switches tabs.
- Total level and gold render in the header.
- The footer shows the current app version.
- Mobile layout is readable on a phone-width screen.

## Workout Logging

- Push day logs Attack XP, Consistency XP, and gold.
- Pull day logs Strength XP, Consistency XP, and gold.
- Leg day logs Defense XP, Consistency XP, and gold.
- Run logs Agility XP by miles only.
- HP logs each bodyweight exercise.
- Sit-ups give the same XP and gold rate as push-ups.
- Past workouts show under the correct month and workout type.
- A specific workout can be deleted.

## Rewards

- Pets stay hidden behind question marks until unlocked.
- Pet bonuses increase matching XP and gold by 10%.
- Agility pet rolls by mile.
- Other pet rolls use the intended workout unit.
- Dungeon rewards and chest rewards display correctly.

## Quests

- Active quests are grouped by category.
- Locked quests show separately from in-progress quests.
- Completed quests move into the completed quest dropdown.
- Base quest count is 30.
- Guildhall quest count is 10.
- Guildhall quests are repeatable.

## Township, Dungeons, And Shop

- Township loads without the fallback error.
- Storehouse inventory updates after rewards.
- Buildings can be started and completed when requirements are met.
- Dungeons are grouped by skill.
- Dungeon reward buttons open the reward details.
- Map dungeons show reward buttons.
- Shop buy and sell actions update gold and inventory.
- Cosmetic background purchases and active background selection work.

## Account Safety

- Export Save downloads a `.json` backup.
- Import Save restores a valid backup.
- Reset All Progress shows a warning first.
- Reset All Progress clears XP, pets, gold, keys, quests, shop purchases, backgrounds, township progress, and history.

## Offline Safety

- The service worker file loads without syntax errors.
- The service worker cache list only references files that exist.
- After the site loads once, the home-screen app can reopen when the phone is briefly offline.
