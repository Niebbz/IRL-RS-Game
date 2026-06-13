// Core Level Forge data. Keep IDs stable because saved progress references them.
const petDropRates = {
  attack: 1 / 15000,
  strength: 1 / 15000,
  defense: 1 / 15000,
  agility: 1 / 12000,
  hp: 1 / 30000,
  discipline: 1 / 30000
};

const petBonusMultiplier = 1.1;

const keyShopItems = [
  { id: "bronze", name: "Bronze Key", cost: 50 },
  { id: "iron", name: "Iron Key", cost: 150 },
  { id: "rune", name: "Gold Key", cost: 350 }
];

const tierOrder = ["bronze", "iron", "rune"];
const tierNames = {
  bronze: "Bronze",
  iron: "Iron",
  rune: "Gold"
};

const skills = [
  {
    id: "attack",
    name: "Attack",
    method: "Push day",
    rule: "10 XP per minute",
    skillImage: "Image%20Upload%20Clean%20V2/skill-attack.png",
    petImage: "Image%20Upload%20Clean%20V2/pet-cyclops.png",
    petName: "Cyclops",
    color: "#b84b43"
  },
  {
    id: "strength",
    name: "Strength",
    method: "Pull day",
    rule: "10 XP per minute",
    skillImage: "Image%20Upload%20Clean%20V2/skill-strength.png",
    petImage: "Image%20Upload%20Clean%20V2/pet-ram.png",
    petName: "Ram",
    color: "#386fa4"
  },
  {
    id: "defense",
    name: "Defense",
    method: "Leg day",
    rule: "10 XP per minute",
    skillImage: "Image%20Upload%20Clean%20V2/skill-defense.png",
    petImage: "Image%20Upload%20Clean%20V2/pet-armadillo.png",
    petName: "Armadillo",
    color: "#4f7d50"
  },
  {
    id: "agility",
    name: "Agility",
    method: "Running",
    rule: "100 XP per mile",
    skillImage: "Image%20Upload%20Clean%20V2/skill-agility.png",
    petImage: "Image%20Upload%20Clean%20V2/pet-deer.png",
    petName: "Deer",
    color: "#c8742a"
  },
  {
    id: "discipline",
    name: "Consistency",
    method: "Completed workouts",
    rule: "50 XP per workout",
    skillImage: "Image%20Upload%20Clean%20V2/skill-discipline.png",
    petImage: "Image%20Upload%20Clean%20V2/pet-eagle.png",
    petName: "Eagle",
    color: "#7351a6"
  }
];

const workoutMap = {
  push: {
    label: "Push day",
    skillId: "attack",
    unit: "Minutes",
    unitSingular: "minute",
    xpPerUnit: 10,
    goldPerUnit: 1,
    minAmount: 1,
    amountStep: 1,
    defaultAmount: 45
  },
  pull: {
    label: "Pull day",
    skillId: "strength",
    unit: "Minutes",
    unitSingular: "minute",
    xpPerUnit: 10,
    goldPerUnit: 1,
    minAmount: 1,
    amountStep: 1,
    defaultAmount: 45
  },
  legs: {
    label: "Leg day",
    skillId: "defense",
    unit: "Minutes",
    unitSingular: "minute",
    xpPerUnit: 10,
    goldPerUnit: 1,
    minAmount: 1,
    amountStep: 1,
    defaultAmount: 45
  },
  run: {
    label: "Run",
    skillId: "agility",
    unit: "Miles",
    unitSingular: "mile",
    xpPerUnit: 100,
    goldPerUnit: 10,
    minAmount: 0.1,
    amountStep: 0.1,
    defaultAmount: 3
  }
};

const dungeons = [
  {
    id: "attack-bronze",
    skillId: "attack",
    tier: "bronze",
    name: "Bandit Stronghold",
    requirement: 60,
    rewardXP: 90
  },
  {
    id: "attack-iron",
    skillId: "attack",
    tier: "iron",
    name: "Orc Warcamp",
    requirement: 180,
    rewardXP: 360
  },
  {
    id: "attack-rune",
    skillId: "attack",
    tier: "rune",
    name: "Warlord's Citadel",
    requirement: 360,
    rewardXP: 900
  },
  {
    id: "strength-bronze",
    skillId: "strength",
    tier: "bronze",
    name: "Ogre's Den",
    requirement: 60,
    rewardXP: 90
  },
  {
    id: "strength-iron",
    skillId: "strength",
    tier: "iron",
    name: "Ogre's Chainhold",
    requirement: 180,
    rewardXP: 360
  },
  {
    id: "strength-rune",
    skillId: "strength",
    tier: "rune",
    name: "Titan's Crucible",
    requirement: 360,
    rewardXP: 900
  },
  {
    id: "defense-bronze",
    skillId: "defense",
    tier: "bronze",
    name: "Stoneguard Crypt",
    requirement: 60,
    rewardXP: 90
  },
  {
    id: "defense-iron",
    skillId: "defense",
    tier: "iron",
    name: "Ironwall Bastion",
    requirement: 180,
    rewardXP: 360
  },
  {
    id: "defense-rune",
    skillId: "defense",
    tier: "rune",
    name: "Dragonbone Fortress",
    requirement: 360,
    rewardXP: 900
  },
  {
    id: "agility-bronze",
    skillId: "agility",
    tier: "bronze",
    name: "Thornwood Trail",
    requirement: 4,
    rewardXP: 60
  },
  {
    id: "agility-iron",
    skillId: "agility",
    tier: "iron",
    name: "Shadowfen Run",
    requirement: 12,
    rewardXP: 240
  },
  {
    id: "agility-rune",
    skillId: "agility",
    tier: "rune",
    name: "Skyreach Gauntlet",
    requirement: 24,
    rewardXP: 600
  }
];

const storageKey = "irl-rs-game-state-v2";
const startingState = {
  xp: {
    attack: 0,
    strength: 0,
    defense: 0,
    agility: 0,
    hp: 0,
    discipline: 0
  },
  pets: {
    attack: false,
    strength: false,
    defense: false,
    agility: false,
    hp: false,
    discipline: false
  },
  gold: 0,
  keys: {
    bronze: 0,
    iron: 0,
    rune: 0
  },
  activeDungeon: null,
  dungeonClears: {},
  dungeonHistory: [],
  cosmetics: {
    unlockedBackgrounds: ["default-forge"],
    activeBackground: "default-forge"
  },
  log: []
};
