// Quest board data. Base quests and Guildhall repeatables live here; quest behavior lives in quests.js.
const questStorageKey = "level-forge-quests-v2";
const appStorageKeys = ["irl-rs-game-state-v2", "irl-rs-game-state-v1"];

const skillIds = ["attack", "strength", "defense", "agility", "hp", "discipline"];
const skillNames = {
  attack: "Attack",
  strength: "Strength",
  defense: "Defense",
  agility: "Agility",
  hp: "HP",
  discipline: "Discipline"
};
const materialNames = {
  timber: "Timber",
  stone: "Stone",
  iron: "Iron",
  supplies: "Supplies"
};
const keyNames = {
  bronze: "Bronze Key",
  iron: "Iron Key",
  rune: "Gold Key"
};
const baseXP = {
  attack: 0,
  strength: 0,
  defense: 0,
  agility: 0,
  hp: 0,
  discipline: 0
};
const baseMaterials = {
  timber: 0,
  stone: 0,
  iron: 0,
  supplies: 0
};
const baseKeys = {
  bronze: 0,
  iron: 0,
  rune: 0
};
const buildingMaterialCosts = {
  storehouse: {},
  palisade: { timber: 12, stone: 6 },
  "trade-post": { timber: 10, supplies: 8 },
  blacksmith: { timber: 6, stone: 12, iron: 8 },
  watchtower: { timber: 18, stone: 12, supplies: 8 },
  barracks: { timber: 24, stone: 14, iron: 8 },
  stables: { timber: 20, stone: 6, supplies: 16 },
  marketplace: { timber: 24, stone: 10, iron: 6, supplies: 18 },
  "stone-walls": { timber: 16, stone: 40, iron: 18 },
  "guild-hall": { timber: 32, stone: 28, iron: 14, supplies: 18 },
  "cartographers-lodge": { timber: 28, stone: 12, iron: 6, supplies: 24 },
  "town-hall": { timber: 50, stone: 45, iron: 24, supplies: 30 }
};
const tierUnlockPoints = {
  Novice: 0,
  Apprentice: 1,
  Adept: 4,
  Veteran: 8,
  Master: 15
};
const questCategories = [
  { id: "starter", name: "Starter", description: "First steps and account setup." },
  { id: "training", name: "Training", description: "Workout, skill, and consistency goals." },
  { id: "account", name: "Account", description: "Broad milestones across the full game." },
  { id: "dungeons", name: "Dungeons", description: "Keys, clears, chests, and dungeon rewards." },
  { id: "township", name: "Township", description: "Forgehold building and material goals." },
  { id: "guildhall", name: "Guildhall", description: "Repeatable long-term contracts unlocked through the Guild Hall." }
];

const starterBaseQuests = [
  {
    id: "forge-awakens",
    name: "The Forge Awakens",
    tier: "Novice",
    type: "Starter",
    description: "Begin your account and start turning real workouts into progress.",
    requirements: [
      { kind: "totalWorkouts", label: "Log 1 workout", target: 1, unit: "workout" },
      { kind: "totalXP", label: "Earn 250 total XP", target: 250, unit: "XP" },
      { kind: "lifetimeGold", label: "Earn 50 gold", target: 50, unit: "gold" }
    ],
    rewards: {
      xp: { discipline: 150 },
      gold: 75,
      materials: { supplies: 5 },
      questPoints: 1
    }
  },
  {
    id: "weapons-of-the-body",
    name: "Weapons of the Body",
    tier: "Novice",
    type: "Combat",
    description: "Train the three combat foundations: push, pull, and legs.",
    requirements: [
      { kind: "skillWorkouts", skillId: "attack", label: "Log 1 push-day workout", target: 1, unit: "workout" },
      { kind: "skillWorkouts", skillId: "strength", label: "Log 1 pull-day workout", target: 1, unit: "workout" },
      { kind: "skillWorkouts", skillId: "defense", label: "Log 1 leg-day workout", target: 1, unit: "workout" }
    ],
    rewards: {
      xp: { attack: 150, strength: 150, defense: 150, discipline: 100 },
      gold: 100,
      questPoints: 1
    }
  },
  {
    id: "road-to-the-outskirts",
    name: "Road to the Outskirts",
    tier: "Novice",
    type: "Agility",
    description: "Use running to open the first road beyond the forge.",
    requirements: [
      { kind: "skillWorkouts", skillId: "agility", label: "Complete 3 runs", target: 3, unit: "runs" },
      { kind: "totalRunMiles", label: "Run 3 total miles", target: 3, unit: "miles", decimals: 1 },
      { kind: "runAtLeast", label: "Complete 1 run of at least 1 mile", target: 1, unit: "mile", decimals: 1 }
    ],
    rewards: {
      xp: { agility: 400, discipline: 100 },
      gold: 100,
      questPoints: 1
    }
  },
  {
    id: "steady-flame",
    name: "A Steady Flame",
    tier: "Apprentice",
    type: "Discipline",
    description: "Prove the forge is becoming a routine, not a one-off spark.",
    requirements: [
      { kind: "totalWorkouts", label: "Log 10 total workouts", target: 10, unit: "workouts" },
      { kind: "differentWorkoutDays", label: "Log workouts on 3 different days", target: 3, unit: "days" },
      { kind: "skillXP", skillId: "discipline", label: "Earn 1,000 Discipline XP", target: 1000, unit: "XP" }
    ],
    rewards: {
      xp: { discipline: 750 },
      gold: 300,
      materials: { supplies: 10 },
      questPoints: 2
    }
  },
  {
    id: "balanced-arsenal-v2",
    name: "Balanced Arsenal",
    tier: "Apprentice",
    type: "Account",
    description: "Build early consistency across every main training style.",
    requirements: [
      { kind: "skillWorkouts", skillId: "attack", label: "Log 3 push-day workouts", target: 3, unit: "workouts" },
      { kind: "skillWorkouts", skillId: "strength", label: "Log 3 pull-day workouts", target: 3, unit: "workouts" },
      { kind: "skillWorkouts", skillId: "defense", label: "Log 3 leg-day workouts", target: 3, unit: "workouts" },
      { kind: "skillWorkouts", skillId: "agility", label: "Log 3 runs", target: 3, unit: "runs" }
    ],
    rewards: {
      xp: { attack: 400, strength: 400, defense: 400, agility: 400, discipline: 500 },
      gold: 500,
      keys: { bronze: 1 },
      questPoints: 2
    }
  },
  {
    id: "first-descent",
    name: "First Descent",
    tier: "Apprentice",
    type: "Dungeon",
    description: "Spend a key, enter a dungeon, and clear your first run.",
    requirements: [
      { kind: "totalKeysHandled", label: "Earn, buy, find, or spend 1 dungeon key", target: 1, unit: "key" },
      { kind: "dungeonStarted", label: "Start 1 dungeon", target: 1, unit: "dungeon" },
      { kind: "dungeonClears", label: "Clear 1 dungeon", target: 1, unit: "clear" }
    ],
    rewards: {
      xp: { discipline: 300 },
      gold: 300,
      materials: { timber: 10, stone: 10, iron: 5 },
      questPoints: 2
    }
  },
  {
    id: "storehouse-foundations",
    name: "Storehouse Foundations",
    tier: "Apprentice",
    type: "Township",
    description: "Turn collected supplies into the first permanent part of Forgehold.",
    requirements: [
      { kind: "totalMaterials", label: "Collect 10 total materials", target: 10, unit: "materials" },
      { kind: "townshipProjectsStarted", label: "Start 1 township project", target: 1, unit: "project" },
      { kind: "townshipBuildings", label: "Complete 1 township building", target: 1, unit: "building" }
    ],
    rewards: {
      xp: { discipline: 250 },
      gold: 400,
      materials: { supplies: 15 },
      title: "Founder",
      questPoints: 2
    }
  },
  {
    id: "tempered-by-routine",
    name: "Tempered by Routine",
    tier: "Adept",
    type: "Account",
    description: "Move from early progress into a real training rhythm.",
    requirements: [
      { kind: "totalWorkouts", label: "Log 25 total workouts", target: 25, unit: "workouts" },
      { kind: "skillWorkouts", skillId: "attack", label: "Complete 5 push-day workouts", target: 5, unit: "workouts" },
      { kind: "skillWorkouts", skillId: "strength", label: "Complete 5 pull-day workouts", target: 5, unit: "workouts" },
      { kind: "skillWorkouts", skillId: "defense", label: "Complete 5 leg-day workouts", target: 5, unit: "workouts" },
      { kind: "skillWorkouts", skillId: "agility", label: "Complete 5 runs", target: 5, unit: "runs" }
    ],
    rewards: {
      xp: { discipline: 1000 },
      gold: 750,
      materials: { timber: 20, stone: 20, iron: 10 },
      questPoints: 3
    }
  },
  {
    id: "into-the-deep",
    name: "Into the Deep",
    tier: "Adept",
    type: "Dungeon",
    description: "Push beyond a single clear and start building dungeon momentum.",
    requirements: [
      { kind: "dungeonClears", label: "Clear 3 dungeons", target: 3, unit: "clears" },
      { kind: "dungeonChests", label: "Open 3 dungeon chests", target: 3, unit: "chests" },
      { kind: "dungeonMaterials", label: "Find 25 total materials from dungeons", target: 25, unit: "materials" }
    ],
    rewards: {
      lowestSkillXP: 750,
      gold: 1000,
      keys: { bronze: 1 },
      materials: { supplies: 25 },
      questPoints: 3
    }
  },
  {
    id: "settlement-rising",
    name: "Settlement Rising",
    tier: "Adept",
    type: "Township",
    description: "Grow Forgehold from a camp into a real settlement.",
    requirements: [
      { kind: "townshipBuildings", label: "Complete 3 township buildings", target: 3, unit: "buildings" },
      { kind: "materialsSpent", label: "Spend 50 total materials", target: 50, unit: "materials" },
      { kind: "townshipHistory", label: "Complete 5 township projects", target: 5, unit: "projects" }
    ],
    rewards: {
      xp: { discipline: 1000 },
      gold: 1000,
      materials: { supplies: 30 },
      questPoints: 3
    }
  },
  {
    id: "fivefold-path",
    name: "The Fivefold Path",
    tier: "Veteran",
    type: "Account",
    description: "Bring every skill to a meaningful baseline.",
    requirements: [
      { kind: "skillLevel", skillId: "attack", label: "Reach level 20 Attack", target: 20, unit: "level" },
      { kind: "skillLevel", skillId: "strength", label: "Reach level 20 Strength", target: 20, unit: "level" },
      { kind: "skillLevel", skillId: "defense", label: "Reach level 20 Defense", target: 20, unit: "level" },
      { kind: "skillLevel", skillId: "agility", label: "Reach level 20 Agility", target: 20, unit: "level" },
      { kind: "skillLevel", skillId: "discipline", label: "Reach level 20 Discipline", target: 20, unit: "level" }
    ],
    rewards: {
      allSkillsXP: 1000,
      gold: 2500,
      keys: { iron: 2 },
      title: "Fivefold",
      questPoints: 5
    }
  },
  {
    id: "forge-tempered-v2",
    name: "Forge Tempered",
    tier: "Veteran",
    type: "Account",
    description: "Tie together training, dungeons, township progress, and questing.",
    requirements: [
      { kind: "totalXP", label: "Earn 25,000 total XP", target: 25000, unit: "XP" },
      { kind: "totalWorkouts", label: "Log 50 total workouts", target: 50, unit: "workouts" },
      { kind: "dungeonClears", label: "Clear 5 dungeons", target: 5, unit: "clears" },
      { kind: "townshipBuildings", label: "Complete 5 township buildings", target: 5, unit: "buildings" },
      { kind: "questsCompleted", label: "Claim 10 total quests", target: 10, unit: "quests" }
    ],
    rewards: {
      allSkillsXP: 1500,
      gold: 3000,
      materials: { timber: 15, stone: 15, iron: 10, supplies: 10 },
      keys: { rune: 1 },
      title: "Forge Tempered",
      questPoints: 5
    }
  }
];

const additionalBaseQuests = [
  {
    id: "push-path-initiate",
    name: "Push Path Initiate",
    tier: "Novice",
    type: "Combat",
    description: "Start building Attack through push-day training.",
    requirements: [
      { kind: "skillWorkouts", skillId: "attack", label: "Log 5 push-day workouts", target: 5, unit: "workouts" },
      { kind: "skillXP", skillId: "attack", label: "Earn 2,000 Attack XP", target: 2000, unit: "XP" }
    ],
    rewards: {
      xp: { attack: 500, discipline: 150 },
      gold: 250,
      questPoints: 1
    }
  },
  {
    id: "pull-path-initiate",
    name: "Pull Path Initiate",
    tier: "Novice",
    type: "Combat",
    description: "Start building Strength through pull-day training.",
    requirements: [
      { kind: "skillWorkouts", skillId: "strength", label: "Log 5 pull-day workouts", target: 5, unit: "workouts" },
      { kind: "skillXP", skillId: "strength", label: "Earn 2,000 Strength XP", target: 2000, unit: "XP" }
    ],
    rewards: {
      xp: { strength: 500, discipline: 150 },
      gold: 250,
      questPoints: 1
    }
  },
  {
    id: "iron-legs",
    name: "Iron Legs",
    tier: "Novice",
    type: "Combat",
    description: "Use leg days to build a stronger defensive base.",
    requirements: [
      { kind: "skillWorkouts", skillId: "defense", label: "Log 5 leg-day workouts", target: 5, unit: "workouts" },
      { kind: "skillXP", skillId: "defense", label: "Earn 2,000 Defense XP", target: 2000, unit: "XP" }
    ],
    rewards: {
      xp: { defense: 500, discipline: 150 },
      gold: 250,
      questPoints: 1
    }
  },
  {
    id: "mile-marker",
    name: "Mile Marker",
    tier: "Novice",
    type: "Agility",
    description: "Turn short runs into a reliable Agility habit.",
    requirements: [
      { kind: "totalRunMiles", label: "Run 10 total miles", target: 10, unit: "miles", decimals: 1 },
      { kind: "runAtLeast", label: "Complete 1 run of at least 2 miles", target: 2, unit: "miles", decimals: 1 }
    ],
    rewards: {
      xp: { agility: 800, discipline: 150 },
      gold: 300,
      questPoints: 1
    }
  },
  {
    id: "first-payday",
    name: "First Payday",
    tier: "Apprentice",
    type: "Account",
    description: "Earn enough gold to feel the early economy moving.",
    requirements: [
      { kind: "lifetimeGold", label: "Earn 1,000 lifetime gold", target: 1000, unit: "gold" },
      { kind: "totalWorkouts", label: "Log 15 total workouts", target: 15, unit: "workouts" }
    ],
    rewards: {
      xp: { discipline: 500 },
      gold: 500,
      materials: { supplies: 15 },
      questPoints: 2
    }
  },
  {
    id: "key-bearer",
    name: "Key Bearer",
    tier: "Apprentice",
    type: "Dungeon",
    description: "Handle enough keys to make dungeon runs part of the loop.",
    requirements: [
      { kind: "totalKeysHandled", label: "Earn, buy, find, or spend 3 dungeon keys", target: 3, unit: "keys" },
      { kind: "dungeonStarted", label: "Start 2 dungeons", target: 2, unit: "dungeons" }
    ],
    rewards: {
      xp: { discipline: 450 },
      gold: 600,
      keys: { bronze: 1 },
      questPoints: 2
    }
  },
  {
    id: "chest-hauler",
    name: "Chest Hauler",
    tier: "Apprentice",
    type: "Dungeon",
    description: "Start turning dungeon chests into real township resources.",
    requirements: [
      { kind: "dungeonChests", label: "Open 5 dungeon chests", target: 5, unit: "chests" },
      { kind: "dungeonMaterials", label: "Find 75 materials from dungeons", target: 75, unit: "materials" }
    ],
    rewards: {
      xp: { discipline: 500 },
      gold: 700,
      materials: { timber: 12, stone: 12, iron: 6 },
      questPoints: 2
    }
  },
  {
    id: "palisade-raised",
    name: "Palisade Raised",
    tier: "Apprentice",
    type: "Township",
    description: "Push Forgehold past its first building and into protection.",
    requirements: [
      { kind: "townshipBuildings", label: "Complete 2 township buildings", target: 2, unit: "buildings" },
      { kind: "materialsSpent", label: "Spend 25 total materials", target: 25, unit: "materials" }
    ],
    rewards: {
      xp: { discipline: 600 },
      gold: 800,
      materials: { supplies: 25 },
      questPoints: 2
    }
  },
  {
    id: "stone-and-iron",
    name: "Stone and Iron",
    tier: "Adept",
    type: "Township",
    description: "Stock and spend heavier materials as Forgehold expands.",
    requirements: [
      { kind: "totalMaterials", label: "Collect 150 total materials", target: 150, unit: "materials" },
      { kind: "materialsSpent", label: "Spend 100 total materials", target: 100, unit: "materials" }
    ],
    rewards: {
      xp: { discipline: 800 },
      gold: 1200,
      materials: { stone: 20, iron: 12 },
      questPoints: 3
    }
  },
  {
    id: "long-road",
    name: "The Long Road",
    tier: "Adept",
    type: "Agility",
    description: "Stretch Agility into longer runs and meaningful mileage.",
    requirements: [
      { kind: "totalRunMiles", label: "Run 25 total miles", target: 25, unit: "miles", decimals: 1 },
      { kind: "runAtLeast", label: "Complete 1 run of at least 5 miles", target: 5, unit: "miles", decimals: 1 }
    ],
    rewards: {
      xp: { agility: 2000, discipline: 300 },
      gold: 1000,
      questPoints: 3
    }
  },
  {
    id: "upper-body-forged",
    name: "Upper Body Forged",
    tier: "Adept",
    type: "Combat",
    description: "Build both push and pull progress into your account.",
    requirements: [
      { kind: "skillXP", skillId: "attack", label: "Earn 5,000 Attack XP", target: 5000, unit: "XP" },
      { kind: "skillXP", skillId: "strength", label: "Earn 5,000 Strength XP", target: 5000, unit: "XP" }
    ],
    rewards: {
      xp: { attack: 1000, strength: 1000, discipline: 300 },
      gold: 1200,
      questPoints: 3
    }
  },
  {
    id: "lower-body-forged",
    name: "Lower Body Forged",
    tier: "Adept",
    type: "Combat",
    description: "Anchor your account with serious leg-day progress.",
    requirements: [
      { kind: "skillXP", skillId: "defense", label: "Earn 5,000 Defense XP", target: 5000, unit: "XP" },
      { kind: "skillWorkouts", skillId: "defense", label: "Log 10 leg-day workouts", target: 10, unit: "workouts" }
    ],
    rewards: {
      xp: { defense: 1500, discipline: 300 },
      gold: 1200,
      materials: { stone: 15 },
      questPoints: 3
    }
  },
  {
    id: "workweek-warrior",
    name: "Workweek Warrior",
    tier: "Adept",
    type: "Account",
    description: "Show up across enough days to prove consistency.",
    requirements: [
      { kind: "differentWorkoutDays", label: "Log workouts on 7 different days", target: 7, unit: "days" },
      { kind: "totalWorkouts", label: "Log 35 total workouts", target: 35, unit: "workouts" }
    ],
    rewards: {
      allSkillsXP: 500,
      gold: 1500,
      materials: { supplies: 20 },
      questPoints: 3
    }
  },
  {
    id: "bronze-delver",
    name: "Bronze Delver",
    tier: "Adept",
    type: "Dungeon",
    description: "Clear enough dungeons to make the board feel earned.",
    requirements: [
      { kind: "dungeonClears", label: "Clear 10 dungeons", target: 10, unit: "clears" },
      { kind: "dungeonChests", label: "Open 10 dungeon chests", target: 10, unit: "chests" }
    ],
    rewards: {
      lowestSkillXP: 1000,
      gold: 1800,
      keys: { iron: 1 },
      materials: { timber: 15, stone: 15, iron: 8 },
      questPoints: 3
    }
  },
  {
    id: "township-foreman",
    name: "Township Foreman",
    tier: "Veteran",
    type: "Township",
    description: "Lead Forgehold through a larger wave of upgrades.",
    requirements: [
      { kind: "townshipBuildings", label: "Complete 8 township buildings", target: 8, unit: "buildings" },
      { kind: "materialsSpent", label: "Spend 250 total materials", target: 250, unit: "materials" }
    ],
    rewards: {
      xp: { discipline: 1600 },
      gold: 3000,
      materials: { timber: 30, stone: 30, iron: 18, supplies: 20 },
      questPoints: 4
    }
  },
  {
    id: "distance-runner",
    name: "Distance Runner",
    tier: "Veteran",
    type: "Agility",
    description: "Turn running into a major part of the account.",
    requirements: [
      { kind: "totalRunMiles", label: "Run 50 total miles", target: 50, unit: "miles", decimals: 1 },
      { kind: "runAtLeast", label: "Complete 1 run of at least 8 miles", target: 8, unit: "miles", decimals: 1 }
    ],
    rewards: {
      xp: { agility: 4000, discipline: 750 },
      gold: 2500,
      keys: { iron: 1 },
      questPoints: 4
    }
  },
  {
    id: "keymaster",
    name: "Keymaster",
    tier: "Veteran",
    type: "Dungeon",
    description: "Prove your dungeon loop has become a long-term system.",
    requirements: [
      { kind: "totalKeysHandled", label: "Earn, buy, find, or spend 10 dungeon keys", target: 10, unit: "keys" },
      { kind: "dungeonClears", label: "Clear 12 dungeons", target: 12, unit: "clears" }
    ],
    rewards: {
      lowestSkillXP: 1500,
      gold: 3500,
      keys: { rune: 1 },
      materials: { supplies: 40 },
      questPoints: 4
    }
  },
  {
    id: "base-game-cape",
    name: "Base Game Cape",
    tier: "Master",
    type: "Account",
    description: "Complete the base quest board and prove the whole account is forged.",
    requirements: [
      { kind: "questsCompleted", label: "Claim 29 base quests", target: 29, unit: "quests" },
      { kind: "totalXP", label: "Earn 100,000 total XP", target: 100000, unit: "XP" },
      { kind: "totalWorkouts", label: "Log 100 total workouts", target: 100, unit: "workouts" }
    ],
    rewards: {
      allSkillsXP: 3000,
      gold: 10000,
      keys: { rune: 2 },
      materials: { timber: 50, stone: 50, iron: 30, supplies: 50 },
      questPoints: 8
    }
  }
];

// Repeatable Guildhall quests use lifetime counters with rising targets after each claim.
const guildhallQuests = [
  {
    id: "guildhall-push-contract",
    name: "Guildhall Push Contract",
    tier: "Guildhall",
    type: "Guildhall",
    repeatable: true,
    description: "Take a repeatable Attack contract from the Guild Hall.",
    requirements: [
      { kind: "townshipBuildingCompleted", buildingId: "guild-hall", label: "Complete the Guild Hall", target: 1, unit: "building" },
      { kind: "skillWorkouts", skillId: "attack", label: "Log 10 push-day workouts", target: 10, repeatEvery: 10, unit: "workouts" }
    ],
    rewards: {
      xp: { attack: 1000, discipline: 250 },
      gold: 1200,
      materials: { supplies: 10 }
    }
  },
  {
    id: "guildhall-pull-contract",
    name: "Guildhall Pull Contract",
    tier: "Guildhall",
    type: "Guildhall",
    repeatable: true,
    description: "Take a repeatable Strength contract from the Guild Hall.",
    requirements: [
      { kind: "townshipBuildingCompleted", buildingId: "guild-hall", label: "Complete the Guild Hall", target: 1, unit: "building" },
      { kind: "skillWorkouts", skillId: "strength", label: "Log 10 pull-day workouts", target: 10, repeatEvery: 10, unit: "workouts" }
    ],
    rewards: {
      xp: { strength: 1000, discipline: 250 },
      gold: 1200,
      materials: { timber: 10 }
    }
  },
  {
    id: "guildhall-guard-contract",
    name: "Guildhall Guard Contract",
    tier: "Guildhall",
    type: "Guildhall",
    repeatable: true,
    description: "Take a repeatable Defense contract from the Guild Hall.",
    requirements: [
      { kind: "townshipBuildingCompleted", buildingId: "guild-hall", label: "Complete the Guild Hall", target: 1, unit: "building" },
      { kind: "skillWorkouts", skillId: "defense", label: "Log 10 leg-day workouts", target: 10, repeatEvery: 10, unit: "workouts" }
    ],
    rewards: {
      xp: { defense: 1000, discipline: 250 },
      gold: 1200,
      materials: { stone: 10 }
    }
  },
  {
    id: "guildhall-road-contract",
    name: "Guildhall Road Contract",
    tier: "Guildhall",
    type: "Guildhall",
    repeatable: true,
    description: "Take a repeatable Agility contract from the Guild Hall.",
    requirements: [
      { kind: "townshipBuildingCompleted", buildingId: "guild-hall", label: "Complete the Guild Hall", target: 1, unit: "building" },
      { kind: "totalRunMiles", label: "Run 20 total miles", target: 20, repeatEvery: 20, unit: "miles", decimals: 1 }
    ],
    rewards: {
      xp: { agility: 2000, discipline: 250 },
      gold: 1400,
      materials: { supplies: 12 }
    }
  },
  {
    id: "guildhall-discipline-contract",
    name: "Guildhall Discipline Contract",
    tier: "Guildhall",
    type: "Guildhall",
    repeatable: true,
    description: "Take a repeatable Discipline contract from the Guild Hall.",
    requirements: [
      { kind: "townshipBuildingCompleted", buildingId: "guild-hall", label: "Complete the Guild Hall", target: 1, unit: "building" },
      { kind: "differentWorkoutDays", label: "Log workouts on 5 different days", target: 5, repeatEvery: 5, unit: "days" },
      { kind: "skillXP", skillId: "discipline", label: "Earn 2,500 Discipline XP", target: 2500, repeatEvery: 2500, unit: "XP" }
    ],
    rewards: {
      xp: { discipline: 1500 },
      gold: 1500,
      materials: { supplies: 15 }
    }
  },
  {
    id: "guildhall-delver-contract",
    name: "Guildhall Delver Contract",
    tier: "Guildhall",
    type: "Guildhall",
    repeatable: true,
    description: "Take a repeatable dungeon-clearing contract from the Guild Hall.",
    requirements: [
      { kind: "townshipBuildingCompleted", buildingId: "guild-hall", label: "Complete the Guild Hall", target: 1, unit: "building" },
      { kind: "dungeonClears", label: "Clear 5 dungeons", target: 5, repeatEvery: 5, unit: "clears" }
    ],
    rewards: {
      lowestSkillXP: 1000,
      gold: 2000,
      keys: { bronze: 1 },
      materials: { timber: 8, stone: 8, iron: 4 }
    }
  },
  {
    id: "guildhall-chest-contract",
    name: "Guildhall Chest Contract",
    tier: "Guildhall",
    type: "Guildhall",
    repeatable: true,
    description: "Take a repeatable material-recovery contract from the Guild Hall.",
    requirements: [
      { kind: "townshipBuildingCompleted", buildingId: "guild-hall", label: "Complete the Guild Hall", target: 1, unit: "building" },
      { kind: "dungeonMaterials", label: "Find 100 materials from dungeons", target: 100, repeatEvery: 100, unit: "materials" }
    ],
    rewards: {
      xp: { discipline: 800 },
      gold: 1800,
      materials: { timber: 15, stone: 15, iron: 8, supplies: 10 }
    }
  },
  {
    id: "guildhall-builder-contract",
    name: "Guildhall Builder Contract",
    tier: "Guildhall",
    type: "Guildhall",
    repeatable: true,
    description: "Take a repeatable township-building contract from the Guild Hall.",
    requirements: [
      { kind: "townshipBuildingCompleted", buildingId: "guild-hall", label: "Complete the Guild Hall", target: 1, unit: "building" },
      { kind: "townshipProjectsStarted", label: "Start 3 township projects", target: 3, repeatEvery: 3, unit: "projects" }
    ],
    rewards: {
      xp: { discipline: 1000 },
      gold: 2200,
      materials: { timber: 20, stone: 16, supplies: 12 }
    }
  },
  {
    id: "guildhall-supplier-contract",
    name: "Guildhall Supplier Contract",
    tier: "Guildhall",
    type: "Guildhall",
    repeatable: true,
    description: "Take a repeatable storehouse contract from the Guild Hall.",
    requirements: [
      { kind: "townshipBuildingCompleted", buildingId: "guild-hall", label: "Complete the Guild Hall", target: 1, unit: "building" },
      { kind: "totalMaterials", label: "Collect 150 total materials", target: 150, repeatEvery: 150, unit: "materials" }
    ],
    rewards: {
      xp: { discipline: 800 },
      gold: 1800,
      materials: { timber: 12, stone: 12, iron: 8, supplies: 18 }
    }
  },
  {
    id: "guildhall-gold-contract",
    name: "Guildhall Gold Contract",
    tier: "Guildhall",
    type: "Guildhall",
    repeatable: true,
    description: "Take a repeatable economy contract from the Guild Hall.",
    requirements: [
      { kind: "townshipBuildingCompleted", buildingId: "guild-hall", label: "Complete the Guild Hall", target: 1, unit: "building" },
      { kind: "lifetimeGold", label: "Earn 5,000 lifetime gold", target: 5000, repeatEvery: 5000, unit: "gold" }
    ],
    rewards: {
      lowestSkillXP: 750,
      gold: 2500,
      keys: { iron: 1 },
      materials: { supplies: 20 }
    }
  }
];

const baseQuests = [...starterBaseQuests, ...additionalBaseQuests];
const quests = [...baseQuests, ...guildhallQuests];
const baseQuestIds = new Set(baseQuests.map((quest) => quest.id));
