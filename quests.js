(function () {
  const questStorageKey = "level-forge-quests-v2";
  const appStorageKeys = ["irl-rs-game-state-v2", "irl-rs-game-state-v1"];

  const skillIds = ["attack", "strength", "defense", "agility", "discipline"];
  const skillNames = {
    attack: "Attack",
    strength: "Strength",
    defense: "Defense",
    agility: "Agility",
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
  const tierOrder = ["Novice", "Apprentice", "Adept", "Veteran", "Master"];
  const tierUnlockPoints = {
    Novice: 0,
    Apprentice: 1,
    Adept: 4,
    Veteran: 8,
    Master: 15
  };

  const quests = [
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

  let questState = loadQuestState();

  function loadQuestState() {
    try {
      const saved = JSON.parse(localStorage.getItem(questStorageKey));
      const completed = {};
      const titles = {};

      if (Array.isArray(saved?.completedQuestIds)) {
        for (const questId of saved.completedQuestIds) completed[questId] = { completedAt: null };
      }

      if (saved?.completed && typeof saved.completed === "object") {
        for (const [questId, record] of Object.entries(saved.completed)) {
          completed[questId] = typeof record === "object" && record !== null
            ? record
            : { completedAt: null };
        }
      }

      if (saved?.titles && typeof saved.titles === "object") {
        for (const [title, record] of Object.entries(saved.titles)) titles[title] = record;
      }

      return { completed, titles };
    } catch {
      return { completed: {}, titles: {} };
    }
  }

  function saveQuestState() {
    localStorage.setItem(questStorageKey, JSON.stringify(questState));
  }

  window.resetLevelForgeQuests = function () {
    questState = { completed: {}, titles: {} };
    saveQuestState();
  };

  function readSavedAppState() {
    for (const key of appStorageKeys) {
      const saved = localStorage.getItem(key);
      if (!saved) continue;

      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }

    return {};
  }

  function currentAppState() {
    const current = typeof state !== "undefined" ? state : readSavedAppState();
    current.xp = { ...baseXP, ...(current.xp ?? {}) };
    current.log = Array.isArray(current.log) ? current.log : [];
    current.gold = Number.isFinite(current.gold) ? current.gold : 0;
    current.keys = { ...baseKeys, ...(current.keys ?? {}) };
    current.dungeonClears = current.dungeonClears ?? {};
    current.dungeonHistory = Array.isArray(current.dungeonHistory) ? current.dungeonHistory : [];
    current.township = current.township ?? {};
    current.township.materials = { ...baseMaterials, ...(current.township.materials ?? {}) };
    current.township.fundedProjects = current.township.fundedProjects ?? {};
    current.township.completedBuildings = current.township.completedBuildings ?? {};
    current.township.history = Array.isArray(current.township.history) ? current.township.history : [];
    return current;
  }

  function persistAppState(current) {
    if (typeof saveState === "function" && typeof state !== "undefined" && current === state) {
      saveState();
      return;
    }

    localStorage.setItem(appStorageKeys[0], JSON.stringify(current));
  }

  function normalizedSkillId(skillId) {
    return skillId === "defence" ? "defense" : skillId;
  }

  function skillIdForLogEntry(entry) {
    if (entry.skillId) return normalizedSkillId(entry.skillId);

    const skillName = String(entry.skillName ?? "").toLowerCase();
    return Object.entries(skillNames).find(([, name]) => name.toLowerCase() === skillName)?.[0] ?? null;
  }

  function entryAmount(entry) {
    if (Number.isFinite(entry.mainPetRolls)) return Number(entry.mainPetRolls);

    const match = String(entry.detail ?? "").replace(/,/g, "").match(/[\d.]+/);
    return match ? Number(match[0]) : 0;
  }

  function numberText(value, decimals = 0) {
    const numeric = Number(value) || 0;
    if (decimals > 0) {
      return numeric.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: numeric % 1 === 0 ? 0 : decimals
      });
    }

    const formatter = typeof formatNumber === "function"
      ? formatNumber
      : (amount) => Math.round(amount).toLocaleString();

    return formatter(numeric);
  }

  function formatQuestDate(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function xpForLevelFallback(level) {
    if (level <= 1) return 0;

    const cappedLevel = Math.min(level, 99);
    let points = 0;

    for (let currentLevel = 1; currentLevel < cappedLevel; currentLevel += 1) {
      points += Math.floor(currentLevel + 300 * Math.pow(2, currentLevel / 7));
    }

    return Math.floor(points / 4);
  }

  function levelForXPFallback(xp) {
    let level = 1;

    for (let candidateLevel = 2; candidateLevel <= 99; candidateLevel += 1) {
      if (xp >= xpForLevelFallback(candidateLevel)) {
        level = candidateLevel;
      } else {
        break;
      }
    }

    return level;
  }

  function levelForSkill(skillId, current) {
    const xp = Number(current.xp?.[skillId] ?? 0);
    return typeof levelForXP === "function" ? levelForXP(xp) : levelForXPFallback(xp);
  }

  function totalXP(current) {
    return skillIds.reduce((sum, skillId) => sum + (Number(current.xp?.[skillId]) || 0), 0);
  }

  function lifetimeGold(current) {
    const workoutGold = current.log.reduce((sum, entry) => sum + (Number(entry.goldEarned) || 0), 0);
    return Math.max(workoutGold, Number(current.gold) || 0);
  }

  function skillWorkoutCount(current, skillId) {
    return current.log.filter((entry) => skillIdForLogEntry(entry) === skillId).length;
  }

  function totalRunMiles(current) {
    return current.log
      .filter((entry) => skillIdForLogEntry(entry) === "agility")
      .reduce((sum, entry) => sum + entryAmount(entry), 0);
  }

  function longestRun(current) {
    return current.log
      .filter((entry) => skillIdForLogEntry(entry) === "agility")
      .reduce((max, entry) => Math.max(max, entryAmount(entry)), 0);
  }

  function differentWorkoutDays(current) {
    const days = new Set();

    for (const entry of current.log) {
      const date = new Date(entry.createdAt);
      if (!Number.isNaN(date.getTime())) days.add(date.toDateString());
    }

    return days.size;
  }

  function dungeonClearCount(current) {
    const clearMapTotal = Object.values(current.dungeonClears ?? {})
      .reduce((sum, value) => sum + (Number(value) || 0), 0);

    return Math.max(clearMapTotal, current.dungeonHistory.length);
  }

  function dungeonStartedCount(current) {
    return dungeonClearCount(current) + (current.activeDungeon ? 1 : 0);
  }

  function totalKeysHandled(current) {
    const currentKeys = Object.values(current.keys ?? {})
      .reduce((sum, value) => sum + (Number(value) || 0), 0);

    return currentKeys + dungeonStartedCount(current);
  }

  function normalizeChest(chest) {
    if (!chest) return { materials: {}, keys: {} };
    if (chest.materials || chest.keys) {
      return {
        materials: { ...(chest.materials ?? {}) },
        keys: { ...(chest.keys ?? {}) }
      };
    }

    const materials = {};
    for (const [id, amount] of Object.entries(chest)) {
      if (id in materialNames) materials[id] = amount;
    }

    return { materials, keys: {} };
  }

  function materialSum(materials) {
    return Object.values(materials ?? {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  }

  function dungeonMaterialsFound(current) {
    return current.dungeonHistory.reduce((sum, entry) => {
      const chest = normalizeChest(entry.supplyChest);
      return sum + materialSum(entry.materialRewards) + materialSum(chest.materials);
    }, 0);
  }

  function spentMaterials(current) {
    let total = 0;
    for (const [buildingId, costs] of Object.entries(buildingMaterialCosts)) {
      if (!current.township.fundedProjects?.[buildingId] && !current.township.completedBuildings?.[buildingId]) continue;
      total += materialSum(costs);
    }

    return total;
  }

  function totalMaterials(current) {
    return materialSum(current.township.materials) + spentMaterials(current);
  }

  function townshipProjectsStarted(current) {
    const fundedCount = Object.keys(current.township.fundedProjects ?? {}).length;
    const activeBonus = current.township.activeProjectId && !current.township.fundedProjects?.[current.township.activeProjectId] ? 1 : 0;
    return Math.max(fundedCount + activeBonus, current.township.history.length);
  }

  function townshipBuildingsCompleted(current) {
    return Math.max(Object.keys(current.township.completedBuildings ?? {}).length, current.township.history.length);
  }

  function questsCompleted(excludeQuestId = null) {
    return Object.keys(questState.completed)
      .filter((questId) => questId !== excludeQuestId)
      .length;
  }

  function requirementProgress(requirement, current, questId) {
    if (requirement.kind === "totalWorkouts") return current.log.length;
    if (requirement.kind === "skillWorkouts") return skillWorkoutCount(current, requirement.skillId);
    if (requirement.kind === "totalXP") return totalXP(current);
    if (requirement.kind === "lifetimeGold") return lifetimeGold(current);
    if (requirement.kind === "skillXP") return Number(current.xp?.[requirement.skillId] ?? 0);
    if (requirement.kind === "totalRunMiles") return totalRunMiles(current);
    if (requirement.kind === "runAtLeast") return Math.min(longestRun(current), requirement.target);
    if (requirement.kind === "differentWorkoutDays") return differentWorkoutDays(current);
    if (requirement.kind === "totalKeysHandled") return totalKeysHandled(current);
    if (requirement.kind === "dungeonStarted") return dungeonStartedCount(current);
    if (requirement.kind === "dungeonClears") return dungeonClearCount(current);
    if (requirement.kind === "dungeonChests") return dungeonClearCount(current);
    if (requirement.kind === "dungeonMaterials") return dungeonMaterialsFound(current);
    if (requirement.kind === "totalMaterials") return totalMaterials(current);
    if (requirement.kind === "materialsSpent") return spentMaterials(current);
    if (requirement.kind === "townshipProjectsStarted") return townshipProjectsStarted(current);
    if (requirement.kind === "townshipBuildings") return townshipBuildingsCompleted(current);
    if (requirement.kind === "townshipHistory") return current.township.history.length;
    if (requirement.kind === "skillLevel") return levelForSkill(requirement.skillId, current);
    if (requirement.kind === "questsCompleted") return questsCompleted(questId);

    return 0;
  }

  function evaluateQuest(quest, current) {
    const requirements = quest.requirements.map((requirement) => {
      const progress = requirementProgress(requirement, current, quest.id);

      return {
        ...requirement,
        progress,
        complete: progress >= requirement.target
      };
    });

    return {
      requirements,
      complete: requirements.every((requirement) => requirement.complete)
    };
  }

  function questPoints() {
    return Object.keys(questState.completed).reduce((sum, questId) => {
      const quest = quests.find((item) => item.id === questId);
      return sum + (Number(quest?.rewards.questPoints) || Number(questState.completed[questId]?.questPoints) || 0);
    }, 0);
  }

  function questIsUnlocked(quest) {
    return questPoints() >= (tierUnlockPoints[quest.tier] ?? 0);
  }

  function requirementRows(requirements) {
    return requirements
      .map((requirement) => {
        const unit = requirement.unit ? ` ${requirement.unit}` : "";
        const progress = numberText(requirement.progress, requirement.decimals ?? 0);
        const target = numberText(requirement.target, requirement.decimals ?? 0);
        const valueText = requirement.unit === "level"
          ? `Level ${progress} / ${target}`
          : `${progress} / ${target}${unit}`;

        return `
          <div class="quest-row ${requirement.complete ? "complete" : ""}">
            <span>${requirement.label}</span>
            <strong>${valueText}</strong>
          </div>
        `;
      })
      .join("");
  }

  function formatMaterialRewards(materials) {
    return Object.entries(materials ?? {})
      .filter(([, amount]) => amount > 0)
      .map(([id, amount]) => `+${numberText(amount)} ${materialNames[id] ?? id}`)
      .join(", ");
  }

  function formatKeyRewards(keys) {
    return Object.entries(keys ?? {})
      .filter(([, amount]) => amount > 0)
      .map(([id, amount]) => `+${numberText(amount)} ${keyNames[id] ?? id}`)
      .join(", ");
  }

  function rewardRows(rewards) {
    const rows = [];

    for (const [skillId, amount] of Object.entries(rewards.xp ?? {})) {
      rows.push([skillNames[skillId] ?? skillId, `+${numberText(amount)} XP`]);
    }

    if (rewards.allSkillsXP) rows.push(["All skills", `+${numberText(rewards.allSkillsXP)} XP each`]);
    if (rewards.lowestSkillXP) rows.push(["Lowest skill", `+${numberText(rewards.lowestSkillXP)} XP`]);
    if (rewards.gold) rows.push(["Gold", `+${numberText(rewards.gold)}`]);

    const materialText = formatMaterialRewards(rewards.materials);
    if (materialText) rows.push(["Materials", materialText]);

    const keyText = formatKeyRewards(rewards.keys);
    if (keyText) rows.push(["Keys", keyText]);

    if (rewards.title) rows.push(["Title", rewards.title]);
    if (rewards.questPoints) rows.push(["Quest Points", `+${numberText(rewards.questPoints)} QP`]);

    return rows
      .map(([label, value]) => `
        <div class="quest-row quest-reward-row">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `)
      .join("");
  }

  function questStatusText(quest, isCompleted, isReady, isUnlocked) {
    if (isCompleted) {
      const completedAt = formatQuestDate(questState.completed[quest.id]?.completedAt);
      return completedAt ? `Completed ${completedAt}` : "Completed";
    }

    if (!isUnlocked) return `${quest.tier} locked at ${tierUnlockPoints[quest.tier]} QP`;
    return isReady ? "Ready to claim" : "Available";
  }

  function questButtonText(isCompleted, isReady, isUnlocked) {
    if (isCompleted) return "Completed";
    if (!isUnlocked) return "Locked";
    if (isReady) return "Claim Reward";
    return "In Progress";
  }

  function appLooksFresh(current) {
    return totalXP(current) === 0
      && current.log.length === 0
      && current.gold === 0
      && materialSum(current.keys) === 0
      && current.dungeonHistory.length === 0
      && townshipBuildingsCompleted(current) === 0
      && materialSum(current.township.materials) === 0;
  }

  function syncQuestReset(current) {
    if (Object.keys(questState.completed).length === 0 && Object.keys(questState.titles).length === 0) return;
    if (!appLooksFresh(current)) return;

    questState = { completed: {}, titles: {} };
    saveQuestState();
  }

  function renderQuestSummary(current) {
    const titles = Object.keys(questState.titles);
    return `
      <section class="quest-summary" aria-label="Quest progress">
        <div>
          <span>Quest Points</span>
          <strong>${numberText(questPoints())}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>${numberText(questsCompleted())} / ${numberText(quests.length)}</strong>
        </div>
        <div>
          <span>Total XP</span>
          <strong>${numberText(totalXP(current))}</strong>
        </div>
        <div>
          <span>Titles</span>
          <strong>${titles.length ? titles.join(", ") : "None"}</strong>
        </div>
      </section>
    `;
  }

  function renderQuestCard(quest, current) {
    const evaluation = evaluateQuest(quest, current);
    const isCompleted = Boolean(questState.completed[quest.id]);
    const isUnlocked = questIsUnlocked(quest);
    const isReady = isUnlocked && evaluation.complete && !isCompleted;
    const card = document.createElement("article");

    card.className = `quest-card${isCompleted ? " completed" : ""}${isReady ? " ready" : ""}${!isUnlocked ? " locked" : ""}`;
    card.innerHTML = `
      <div class="quest-card-header">
        <div>
          <h3>${quest.name}</h3>
          <p class="quest-description">${quest.description}</p>
        </div>
        <span class="quest-tag">${quest.type}</span>
      </div>
      <div class="quest-block">
        <div class="quest-block-title">Objectives</div>
        ${requirementRows(evaluation.requirements)}
      </div>
      <div class="quest-block">
        <div class="quest-block-title">Rewards</div>
        ${rewardRows(quest.rewards)}
      </div>
      <div class="quest-card-footer">
        <span class="quest-status">${questStatusText(quest, isCompleted, isReady, isUnlocked)}</span>
        <button
          class="${isReady ? "primary-button" : "secondary-button"}"
          type="button"
          data-claim-quest="${quest.id}"
          ${isReady ? "" : "disabled"}
        >${questButtonText(isCompleted, isReady, isUnlocked)}</button>
      </div>
    `;

    return card;
  }

  function completedQuestList() {
    return quests
      .filter((quest) => questState.completed[quest.id])
      .sort((left, right) => {
        const leftDate = new Date(questState.completed[left.id]?.completedAt ?? 0).getTime();
        const rightDate = new Date(questState.completed[right.id]?.completedAt ?? 0).getTime();
        return rightDate - leftDate;
      });
  }

  function renderCompletedQuestCard(quest) {
    const completedAt = formatQuestDate(questState.completed[quest.id]?.completedAt);
    const card = document.createElement("article");

    card.className = "quest-card completed completed-quest-card";
    card.innerHTML = `
      <div class="quest-card-header">
        <div>
          <h3>${quest.name}</h3>
          <p class="quest-description">${completedAt ? `Completed ${completedAt}` : "Completed"}</p>
        </div>
        <span class="quest-tag">${quest.tier}</span>
      </div>
      <div class="quest-block">
        <div class="quest-block-title">Rewards</div>
        ${rewardRows(quest.rewards)}
      </div>
    `;

    return card;
  }

  function renderCompletedQuestSection() {
    const completed = completedQuestList();
    const section = document.createElement("section");

    section.className = "completed-quest-section";
    section.innerHTML = `
      <details class="completed-quest-details">
        <summary>
          <span>Completed Quests</span>
          <strong>${numberText(completed.length)} / ${numberText(quests.length)}</strong>
        </summary>
        <div class="completed-quest-grid"></div>
      </details>
    `;

    const grid = section.querySelector(".completed-quest-grid");
    if (completed.length === 0) {
      grid.innerHTML = `<div class="empty-state">No completed quests yet.</div>`;
      return section;
    }

    for (const quest of completed) grid.appendChild(renderCompletedQuestCard(quest));
    return section;
  }

  function renderQuests() {
    const questGrid = document.querySelector("#questGrid");
    if (!questGrid) return;

    const current = currentAppState();
    syncQuestReset(current);
    questGrid.innerHTML = renderQuestSummary(current);

    for (const tier of tierOrder) {
      const tierQuests = quests.filter((quest) => quest.tier === tier && !questState.completed[quest.id]);
      if (tierQuests.length === 0) continue;

      const tierSection = document.createElement("section");
      tierSection.className = "quest-tier-section";
      tierSection.innerHTML = `
        <div class="quest-tier-heading">
          <div>
            <p class="eyebrow">${tier}</p>
            <h3>${tier} Quests</h3>
          </div>
          <span>${tierUnlockPoints[tier]} QP unlock</span>
        </div>
        <div class="quest-tier-grid"></div>
      `;

      const tierGrid = tierSection.querySelector(".quest-tier-grid");
      for (const quest of tierQuests) tierGrid.appendChild(renderQuestCard(quest, current));
      questGrid.appendChild(tierSection);
    }

    questGrid.appendChild(renderCompletedQuestSection());
  }

  function lowestSkillId(current) {
    return skillIds.reduce((lowest, skillId) => {
      return (current.xp[skillId] ?? 0) < (current.xp[lowest] ?? 0) ? skillId : lowest;
    }, skillIds[0]);
  }

  function applyRewards(current, quest) {
    const rewards = quest.rewards;
    const applied = {
      xp: {},
      gold: rewards.gold ?? 0,
      materials: { ...(rewards.materials ?? {}) },
      keys: { ...(rewards.keys ?? {}) },
      questPoints: rewards.questPoints ?? 0,
      title: rewards.title ?? null
    };

    for (const [skillId, amount] of Object.entries(rewards.xp ?? {})) {
      current.xp[skillId] = (Number(current.xp[skillId]) || 0) + amount;
      applied.xp[skillId] = amount;
    }

    if (rewards.allSkillsXP) {
      for (const skillId of skillIds) {
        current.xp[skillId] = (Number(current.xp[skillId]) || 0) + rewards.allSkillsXP;
        applied.xp[skillId] = (applied.xp[skillId] ?? 0) + rewards.allSkillsXP;
      }
    }

    if (rewards.lowestSkillXP) {
      const skillId = lowestSkillId(current);
      current.xp[skillId] = (Number(current.xp[skillId]) || 0) + rewards.lowestSkillXP;
      applied.xp[skillId] = (applied.xp[skillId] ?? 0) + rewards.lowestSkillXP;
    }

    current.gold = (Number(current.gold) || 0) + (rewards.gold ?? 0);

    for (const [materialId, amount] of Object.entries(rewards.materials ?? {})) {
      if (!(materialId in current.township.materials)) current.township.materials[materialId] = 0;
      current.township.materials[materialId] += amount;
    }

    for (const [keyId, amount] of Object.entries(rewards.keys ?? {})) {
      if (!(keyId in current.keys)) current.keys[keyId] = 0;
      current.keys[keyId] += amount;
    }

    if (rewards.title) questState.titles[rewards.title] = { unlockedAt: new Date().toISOString() };

    return applied;
  }

  function claimQuest(questId) {
    const quest = quests.find((item) => item.id === questId);
    if (!quest || questState.completed[quest.id] || !questIsUnlocked(quest)) return;

    const current = currentAppState();
    const evaluation = evaluateQuest(quest, current);
    if (!evaluation.complete) return;

    const appliedRewards = applyRewards(current, quest);
    questState.completed[quest.id] = {
      completedAt: new Date().toISOString(),
      questPoints: quest.rewards.questPoints ?? 0,
      rewards: appliedRewards
    };

    saveQuestState();
    persistAppState(current);

    if (typeof render === "function") {
      render();
    } else {
      renderQuests();
    }
  }

  function installQuestBoard() {
    const questGrid = document.querySelector("#questGrid");
    if (!questGrid) return;

    if (typeof render === "function" && !render.__levelForgeQuests) {
      const baseRender = render;
      render = function renderWithQuestBoard() {
        baseRender();
        renderQuests();
      };
      render.__levelForgeQuests = true;
    }

    questGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-claim-quest]");
      if (!button) return;

      claimQuest(button.dataset.claimQuest);
    });

    renderQuests();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installQuestBoard);
  } else {
    installQuestBoard();
  }
})();
