const petDropRates = {
  attack: 1 / 15000,
  strength: 1 / 15000,
  defence: 1 / 15000,
  agility: 1 / 12000,
  discipline: 1 / 30000
};

const petBonusMultiplier = 1.1;

const keyShopItems = [
  { id: "bronze", name: "Bronze Key", cost: 50 },
  { id: "iron", name: "Iron Key", cost: 150 },
  { id: "rune", name: "Rune Key", cost: 350 }
];

const tierOrder = ["bronze", "iron", "rune"];
const tierNames = {
  bronze: "Bronze",
  iron: "Iron",
  rune: "Rune"
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
    id: "defence",
    name: "Defense",
    method: "Leg day",
    rule: "10 XP per minute",
    skillImage: "Image%20Upload%20Clean%20V2/skill-defence.png",
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
    name: "Discipline",
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
    amountStep: 1,
    defaultAmount: 45
  },
  legs: {
    label: "Leg day",
    skillId: "defence",
    unit: "Minutes",
    unitSingular: "minute",
    xpPerUnit: 10,
    goldPerUnit: 1,
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
    id: "defence-bronze",
    skillId: "defence",
    tier: "bronze",
    name: "Stoneguard Crypt",
    requirement: 60,
    rewardXP: 90
  },
  {
    id: "defence-iron",
    skillId: "defence",
    tier: "iron",
    name: "Ironwall Bastion",
    requirement: 180,
    rewardXP: 360
  },
  {
    id: "defence-rune",
    skillId: "defence",
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
    defence: 0,
    agility: 0,
    discipline: 0
  },
  pets: {
    attack: false,
    strength: false,
    defence: false,
    agility: false,
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
  log: []
};

const state = loadState();

const skillGrid = document.querySelector("#skillGrid");
const petGrid = document.querySelector("#petGrid");
const totalLevel = document.querySelector("#totalLevel");
const goldBalance = document.querySelector("#goldBalance");
const workoutForm = document.querySelector("#workoutForm");
const workoutType = document.querySelector("#workoutType");
const amountInput = document.querySelector("#amount");
const amountLabel = document.querySelector("#amountLabel");
const xpPreview = document.querySelector("#xpPreview");
const goldPreview = document.querySelector("#goldPreview");
const workoutLog = document.querySelector("#workoutLog");
const emptyLog = document.querySelector("#emptyLog");
const resetButton = document.querySelector("#resetButton");
const keyInventory = document.querySelector("#keyInventory");
const keyShop = document.querySelector("#keyShop");
const activeDungeon = document.querySelector("#activeDungeon");
const dungeonSelection = document.querySelector("#dungeonSelection");
const dungeonHistory = document.querySelector("#dungeonHistory");
const emptyDungeonHistory = document.querySelector("#emptyDungeonHistory");
const tabButtons = document.querySelectorAll(".tab-button");
const tabViews = document.querySelectorAll(".tab-view");

function xpForLevel(level) {
  if (level <= 1) return 0;

  const cappedLevel = Math.min(level, 99);
  let points = 0;

  for (let currentLevel = 1; currentLevel < cappedLevel; currentLevel += 1) {
    points += Math.floor(currentLevel + 300 * Math.pow(2, currentLevel / 7));
  }

  return Math.floor(points / 4);
}

function levelForXP(xp) {
  let level = 1;

  for (let candidateLevel = 2; candidateLevel <= 99; candidateLevel += 1) {
    if (xp >= xpForLevel(candidateLevel)) {
      level = candidateLevel;
    } else {
      break;
    }
  }

  return level;
}

function progressForXP(xp) {
  const level = levelForXP(xp);
  if (level >= 99) return 1;

  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return (xp - current) / (next - current);
}

function remainingForXP(xp) {
  const level = levelForXP(xp);
  if (level >= 99) return 0;
  return xpForLevel(level + 1) - xp;
}

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey) || localStorage.getItem("irl-rs-game-state-v1");
    if (!saved) return structuredClone(startingState);

    const parsed = JSON.parse(saved);
    return {
      xp: { ...startingState.xp, ...parsed.xp },
      pets: { ...startingState.pets, ...parsed.pets },
      gold: Number.isFinite(parsed.gold) ? parsed.gold : startingState.gold,
      keys: { ...startingState.keys, ...parsed.keys },
      activeDungeon: parsed.activeDungeon ?? null,
      dungeonClears: { ...startingState.dungeonClears, ...parsed.dungeonClears },
      dungeonHistory: Array.isArray(parsed.dungeonHistory) ? parsed.dungeonHistory : [],
      log: Array.isArray(parsed.log) ? parsed.log : []
    };
  } catch {
    return structuredClone(startingState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function formatNumber(value) {
  return Math.round(value).toLocaleString();
}

function formatAmount(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 1
  });
}

function formatDropRate(skillId) {
  return Math.round(1 / petDropRates[skillId]).toLocaleString();
}

function formatLoggedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unknown";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function skillById(skillId) {
  return skills.find((skill) => skill.id === skillId);
}

function dungeonById(dungeonId) {
  return dungeons.find((dungeon) => dungeon.id === dungeonId);
}

function skillIdForEntry(entry) {
  if (entry.skillId) return entry.skillId;

  return skills.find((skill) => skill.name === entry.skillName)?.id;
}

function skillIdForPetName(petName) {
  return skills.find((skill) => skill.petName === petName)?.id;
}

function hasRemainingPetDrop(petName) {
  return state.log.some((entry) => entry.petDrops?.includes(petName));
}

function dropRateUnit(skillId) {
  return skillId === "agility" ? "mile" : "minute";
}

function dropRateText(skillId) {
  if (skillId === "discipline") {
    return `Drop rate: 1 / ${formatDropRate(skillId)} per minute; Agility rolls per mile`;
  }

  return `Drop rate: 1 / ${formatDropRate(skillId)} per ${dropRateUnit(skillId)}`;
}

function unitForSkill(skillId) {
  return skillId === "agility" ? "mile" : "minute";
}

function unitForSkillPlural(skillId) {
  return skillId === "agility" ? "miles" : "minutes";
}

function workoutHint(skillId) {
  if (skillId === "attack") return "Complete push-day workouts to progress";
  if (skillId === "strength") return "Complete pull-day workouts to progress";
  if (skillId === "defence") return "Complete leg-day workouts to progress";
  return "Complete runs to progress";
}

function workoutForSkill(skillId) {
  return Object.values(workoutMap).find((workout) => workout.skillId === skillId);
}

function petBonusForSkill(skillId) {
  return state.pets[skillId] ? petBonusMultiplier : 1;
}

function xpForWorkout(selected, amount) {
  return Math.round(amount * selected.xpPerUnit * petBonusForSkill(selected.skillId));
}

function disciplineXPForWorkout() {
  return Math.round(50 * petBonusForSkill("discipline"));
}

function goldForWorkout(selected, amount) {
  return Math.floor(amount * selected.goldPerUnit * petBonusForSkill(selected.skillId));
}

function skillGoldRule(skill) {
  const workout = workoutForSkill(skill.id);
  if (!workout) return "Gold: none";

  const baseRate = `${formatAmount(workout.goldPerUnit)} gold per ${workout.unitSingular}`;
  if (!state.pets[skill.id]) return `Gold: ${baseRate}`;

  return `Gold: ${formatAmount(workout.goldPerUnit * petBonusMultiplier)} gold per ${workout.unitSingular} with pet`;
}

function clearCount(dungeonId) {
  return state.dungeonClears[dungeonId] ?? 0;
}

function previousDungeon(dungeon) {
  const tierIndex = tierOrder.indexOf(dungeon.tier);
  if (tierIndex <= 0) return null;

  const previousTier = tierOrder[tierIndex - 1];
  return dungeons.find((item) => item.skillId === dungeon.skillId && item.tier === previousTier);
}

function isDungeonUnlocked(dungeon) {
  if (dungeon.tier === "bronze") return true;

  const previous = previousDungeon(dungeon);
  return previous ? clearCount(previous.id) > 0 : false;
}

function keyItemForTier(tier) {
  return keyShopItems.find((item) => item.id === tier);
}

function rollPet(skillId, rollCount = 1) {
  if (state.pets[skillId]) return null;

  const rate = petDropRates[skillId];
  const dropChance = 1 - Math.pow(1 - rate, Math.max(0, rollCount));
  if (Math.random() >= dropChance) return null;

  state.pets[skillId] = true;
  return skills.find((skill) => skill.id === skillId);
}

function renderSkills() {
  skillGrid.innerHTML = "";
  let total = 0;

  for (const skill of skills) {
    const xp = state.xp[skill.id] ?? 0;
    const level = levelForXP(xp);
    const progress = progressForXP(xp);
    const remaining = remainingForXP(xp);
    total += level;

    const card = document.createElement("article");
    card.className = `skill-card ${skill.id}`;
    card.innerHTML = `
      <div class="skill-top">
        <div>
          <img class="asset-icon skill-icon" src="${skill.skillImage}" alt="${skill.name}">
          <div class="skill-name">${skill.name}</div>
          <div class="skill-method">${skill.method}</div>
        </div>
        <div class="level-block">
          <span>Level</span>
          <strong>${level}</strong>
        </div>
      </div>
      <div class="progress-track" aria-label="${skill.name} level progress">
        <div class="progress-fill" style="width: ${Math.max(0, Math.min(1, progress)) * 100}%; background: ${skill.color}"></div>
      </div>
      <div class="skill-footer">
        <span>${formatNumber(xp)} XP</span>
        <span>${level === 99 ? "Maxed" : `${formatNumber(remaining)} XP left`}</span>
      </div>
      <div class="skill-footer">
        <span>${skill.rule}</span>
        <span>${skillGoldRule(skill)}</span>
      </div>
    `;

    skillGrid.appendChild(card);
  }

  totalLevel.textContent = total.toLocaleString();
  goldBalance.textContent = formatNumber(state.gold);
}

function renderPets() {
  petGrid.innerHTML = "";

  for (const skill of skills) {
    const unlocked = state.pets[skill.id];
    const card = document.createElement("article");
    card.className = `pet-card ${unlocked ? "unlocked" : "locked"}`;
    const petVisual = unlocked
      ? `<img class="asset-icon pet-icon" src="${skill.petImage}" alt="${skill.petName}">`
      : `<div class="pet-placeholder" style="display:grid;width:150px;height:150px;max-width:100%;margin:0 auto 12px;place-items:center;border:1px solid rgba(255,255,255,0.14);border-radius:8px;color:rgba(244,247,251,0.72);background:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03));box-shadow:inset 0 0 34px rgba(0,0,0,0.28);font-size:4rem;font-weight:950;line-height:1;" aria-label="${skill.petName} locked">?</div>`;

    card.innerHTML = `
      ${petVisual}
      <div class="pet-name">${skill.petName}</div>
      <div class="pet-source">${skill.name} pet</div>
      <div class="pet-source">${dropRateText(skill.id)}</div>
      <div class="pet-source">${skill.id === "discipline" ? "Bonus: +10% Discipline XP" : "Bonus: +10% XP and gold"}</div>
      <div class="pet-status">${unlocked ? "Unlocked" : "Not found yet"}</div>
    `;
    petGrid.appendChild(card);
  }
}

function renderKeyInventory() {
  keyInventory.innerHTML = `
    <div><span>Gold</span><strong>${formatNumber(state.gold)}</strong></div>
    <div><span>Bronze Keys</span><strong>${state.keys.bronze}</strong></div>
    <div><span>Iron Keys</span><strong>${state.keys.iron}</strong></div>
    <div><span>Rune Keys</span><strong>${state.keys.rune}</strong></div>
  `;
}

function renderKeyShop() {
  keyShop.innerHTML = "";

  for (const item of keyShopItems) {
    const canAfford = state.gold >= item.cost;
    const row = document.createElement("div");
    row.className = "shop-row";
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <span>${item.cost.toLocaleString()} gold</span>
      </div>
      <button class="secondary-button" type="button" data-buy-key="${item.id}" ${canAfford ? "" : "disabled"}>Buy</button>
    `;
    keyShop.appendChild(row);
  }
}

function renderActiveDungeon() {
  if (!state.activeDungeon) {
    activeDungeon.innerHTML = `<div class="empty-state">No active dungeon. Choose a dungeon below to spend a key and begin.</div>`;
    return;
  }

  const dungeon = dungeonById(state.activeDungeon.dungeonId);
  if (!dungeon) {
    state.activeDungeon = null;
    saveState();
    renderActiveDungeon();
    return;
  }

  const skill = skillById(dungeon.skillId);
  const progress = Math.min(state.activeDungeon.progress ?? 0, dungeon.requirement);
  const percent = (progress / dungeon.requirement) * 100;
  const unit = unitForSkillPlural(dungeon.skillId);

  activeDungeon.innerHTML = `
    <article class="dungeon-card active-dungeon-card">
      <div class="dungeon-card-top">
        <div>
          <div class="dungeon-name">${dungeon.name}</div>
          <div class="dungeon-meta">${tierNames[dungeon.tier]} ${skill.name} Dungeon</div>
        </div>
        <button class="danger-button" type="button" id="abandonDungeonButton">Abandon</button>
      </div>
      <div class="dungeon-hint">${workoutHint(dungeon.skillId)}</div>
      <div class="progress-track" aria-label="${dungeon.name} progress">
        <div class="progress-fill" style="width: ${Math.max(0, Math.min(100, percent))}%; background: ${skill.color}"></div>
      </div>
      <div class="skill-footer">
        <span>${formatAmount(progress)} / ${formatAmount(dungeon.requirement)} ${unit}</span>
        <span>Completion reward: +${formatNumber(dungeon.rewardXP)} ${skill.name} XP</span>
      </div>
    </article>
  `;
}

function renderDungeonSelection() {
  dungeonSelection.innerHTML = "";

  for (const skill of skills.filter((item) => item.id !== "discipline")) {
    const group = document.createElement("section");
    group.className = "dungeon-skill-group";
    const skillDungeons = dungeons.filter((dungeon) => dungeon.skillId === skill.id);
    group.innerHTML = `
      <div class="dungeon-group-heading">
        <h3>${skill.name}</h3>
        <span>${workoutHint(skill.id)}</span>
      </div>
      <div class="dungeon-tier-grid"></div>
    `;

    const grid = group.querySelector(".dungeon-tier-grid");
    for (const dungeon of skillDungeons) {
      const unlocked = isDungeonUnlocked(dungeon);
      const hasKey = state.keys[dungeon.tier] > 0;
      const activeBlocked = Boolean(state.activeDungeon);
      const disabled = !unlocked || !hasKey || activeBlocked;
      const reason = !unlocked
        ? `Clear ${tierNames[previousDungeon(dungeon)?.tier]} ${skill.name} first`
        : !hasKey
          ? `Requires ${tierNames[dungeon.tier]} Key`
          : activeBlocked
            ? "Dungeon already active"
            : "Ready";

      const card = document.createElement("article");
      card.className = `dungeon-card ${unlocked ? "" : "locked"}`;
      card.innerHTML = `
        <div class="dungeon-name">${dungeon.name}</div>
        <div class="dungeon-meta">${tierNames[dungeon.tier]} ${skill.name} Dungeon</div>
        <div class="dungeon-detail">${formatAmount(dungeon.requirement)} ${unitForSkillPlural(dungeon.skillId)} required</div>
        <div class="dungeon-detail">Reward: +${formatNumber(dungeon.rewardXP)} ${skill.name} XP</div>
        <div class="dungeon-detail">Clears: ${clearCount(dungeon.id)}</div>
        <button class="secondary-button" type="button" data-enter-dungeon="${dungeon.id}" ${disabled ? "disabled" : ""}>Enter</button>
        <div class="dungeon-status">${reason}</div>
      `;
      grid.appendChild(card);
    }

    dungeonSelection.appendChild(group);
  }
}

function renderDungeonHistory() {
  dungeonHistory.innerHTML = "";
  emptyDungeonHistory.hidden = state.dungeonHistory.length > 0;

  for (const entry of state.dungeonHistory.slice(0, 30)) {
    const skill = skillById(entry.skillId);
    const item = document.createElement("li");
    item.innerHTML = `
      <div>
        <div class="log-title">${entry.dungeonName} - ${tierNames[entry.tier]} ${skill?.name ?? entry.skillName} Dungeon</div>
        <div class="log-meta">Completed ${formatLoggedDate(entry.completedAt)}</div>
      </div>
      <div class="log-xp">+${formatNumber(entry.bonusXP)} ${skill?.name ?? entry.skillName} XP</div>
    `;
    dungeonHistory.appendChild(item);
  }
}

function renderDungeons() {
  renderKeyInventory();
  renderKeyShop();
  renderActiveDungeon();
  renderDungeonSelection();
  renderDungeonHistory();
}

function updateWorkoutFields() {
  const selected = workoutMap[workoutType.value];
  amountLabel.textContent = selected.unit;
  amountInput.step = selected.amountStep;

  if (!amountInput.value || Number(amountInput.value) <= 0) {
    amountInput.value = selected.defaultAmount;
  }

  updatePreviews();
}

function updatePreviews() {
  const selected = workoutMap[workoutType.value];
  const amount = Math.max(0, Number(amountInput.value) || 0);
  xpPreview.textContent = formatNumber(xpForWorkout(selected, amount));
  goldPreview.textContent = formatNumber(goldForWorkout(selected, amount));
}

function renderLog() {
  workoutLog.innerHTML = "";
  emptyLog.hidden = state.log.length > 0;

  for (const [index, entry] of state.log.entries()) {
    const item = document.createElement("li");
    const dropText = entry.petDrops?.length
      ? `<div class="pet-drop">Pet drop: ${entry.petDrops.join(", ")}</div>`
      : "";
    const goldText = Number.isFinite(entry.goldEarned)
      ? `<div class="gold-drop">+${formatNumber(entry.goldEarned)} gold</div>`
      : "";
    const dungeonProgressText = entry.dungeonContribution
      ? `<div class="dungeon-note">+${formatAmount(entry.dungeonContribution.amount)} ${entry.dungeonContribution.unit} toward ${entry.dungeonContribution.dungeonName}</div>`
      : "";
    const dungeonCompleteText = entry.dungeonCompleted
      ? `<div class="dungeon-note">Dungeon Cleared: ${entry.dungeonCompleted.dungeonName}<br>+${formatNumber(entry.dungeonCompleted.bonusXP)} bonus ${entry.dungeonCompleted.skillName} XP</div>`
      : "";

    item.innerHTML = `
      <div>
        <div class="log-title">${entry.title}</div>
        <div class="log-meta">${entry.detail}</div>
        <div class="log-date">${formatLoggedDate(entry.createdAt)}</div>
        ${goldText}
        ${dungeonProgressText}
        ${dungeonCompleteText}
        ${dropText}
      </div>
      <div class="log-actions">
        <div class="log-xp">+${formatNumber(entry.mainXP)} ${entry.skillName}<br>+${formatNumber(entry.disciplineXP ?? 50)} Discipline</div>
        <button class="delete-workout-button" type="button" data-log-index="${index}">Delete</button>
      </div>
    `;
    workoutLog.appendChild(item);
  }
}

function progressActiveDungeon(selected, amount) {
  if (!state.activeDungeon) return {};

  const dungeon = dungeonById(state.activeDungeon.dungeonId);
  if (!dungeon || dungeon.skillId !== selected.skillId) return {};

  const current = state.activeDungeon.progress ?? 0;
  const remaining = Math.max(0, dungeon.requirement - current);
  const contribution = Math.min(amount, remaining);
  if (contribution <= 0) return {};

  state.activeDungeon.progress = current + contribution;

  const skill = skillById(dungeon.skillId);
  const contributionRecord = {
    dungeonId: dungeon.id,
    dungeonName: dungeon.name,
    skillId: dungeon.skillId,
    amount: contribution,
    unit: unitForSkillPlural(dungeon.skillId)
  };

  if (state.activeDungeon.progress < dungeon.requirement) {
    return { contribution: contributionRecord };
  }

  state.xp[dungeon.skillId] += dungeon.rewardXP;
  state.dungeonClears[dungeon.id] = clearCount(dungeon.id) + 1;

  const completedRecord = {
    dungeonId: dungeon.id,
    dungeonName: dungeon.name,
    tier: dungeon.tier,
    skillId: dungeon.skillId,
    skillName: skill.name,
    bonusXP: dungeon.rewardXP,
    completedAt: new Date().toISOString()
  };

  state.dungeonHistory.unshift(completedRecord);
  state.dungeonHistory = state.dungeonHistory.slice(0, 50);
  state.activeDungeon = null;

  return {
    contribution: contributionRecord,
    completed: completedRecord
  };
}

function addWorkout(event) {
  event.preventDefault();

  const selected = workoutMap[workoutType.value];
  const amount = Math.max(0, Number(amountInput.value) || 0);
  if (amount <= 0) return;

  const mainXP = xpForWorkout(selected, amount);
  const disciplineXP = disciplineXPForWorkout();
  const goldEarned = goldForWorkout(selected, amount);
  const skill = skills.find((item) => item.id === selected.skillId);
  const amountText = selected.unit === "Miles"
    ? `${amount.toLocaleString()} miles`
    : `${amount.toLocaleString()} minutes`;
  const mainPetRolls = amount;
  const disciplinePetRolls = amount;
  const petDrops = [];

  state.xp[selected.skillId] += mainXP;
  state.xp.discipline += disciplineXP;
  state.gold += goldEarned;

  const dungeonResult = progressActiveDungeon(selected, amount);

  const mainPet = rollPet(selected.skillId, mainPetRolls);
  if (mainPet) petDrops.push(mainPet.petName);

  const disciplinePet = rollPet("discipline", disciplinePetRolls);
  if (disciplinePet) petDrops.push(disciplinePet.petName);

  state.log.unshift({
    title: selected.label,
    detail: amountText,
    skillId: selected.skillId,
    skillName: skill.name,
    mainXP,
    disciplineXP,
    goldEarned,
    mainPetRolls,
    disciplinePetRolls,
    dungeonContribution: dungeonResult.contribution ?? null,
    dungeonCompleted: dungeonResult.completed ?? null,
    petDrops,
    createdAt: new Date().toISOString()
  });
  state.log = state.log.slice(0, 50);

  saveState();
  render();

  if (dungeonResult.completed) {
    window.alert(`Dungeon cleared: ${dungeonResult.completed.dungeonName}! +${formatNumber(dungeonResult.completed.bonusXP)} ${dungeonResult.completed.skillName} XP`);
  }

  if (petDrops.length > 0) {
    window.alert(`Pet drop: ${petDrops.join(", ")}!`);
  }
}

function deleteWorkout(index) {
  const entry = state.log[index];
  if (!entry) return;

  const confirmed = window.confirm(`Delete ${entry.title} from ${formatLoggedDate(entry.createdAt)}?`);
  if (!confirmed) return;

  const skillId = skillIdForEntry(entry);
  if (skillId) {
    state.xp[skillId] = Math.max(0, (state.xp[skillId] ?? 0) - (entry.mainXP ?? 0));
  }
  state.xp.discipline = Math.max(0, (state.xp.discipline ?? 0) - (entry.disciplineXP ?? 50));
  state.gold = Math.max(0, (state.gold ?? 0) - (entry.goldEarned ?? 0));

  if (entry.dungeonContribution && state.activeDungeon?.dungeonId === entry.dungeonContribution.dungeonId) {
    state.activeDungeon.progress = Math.max(0, (state.activeDungeon.progress ?? 0) - entry.dungeonContribution.amount);
  }

  state.log.splice(index, 1);

  for (const petName of entry.petDrops ?? []) {
    if (hasRemainingPetDrop(petName)) continue;

    const petSkillId = skillIdForPetName(petName);
    if (petSkillId) state.pets[petSkillId] = false;
  }

  saveState();
  render();
}

function buyKey(tier) {
  const item = keyItemForTier(tier);
  if (!item || state.gold < item.cost) return;

  state.gold -= item.cost;
  state.keys[tier] += 1;
  saveState();
  render();
}

function enterDungeon(dungeonId) {
  const dungeon = dungeonById(dungeonId);
  if (!dungeon || state.activeDungeon || !isDungeonUnlocked(dungeon) || state.keys[dungeon.tier] <= 0) return;

  state.keys[dungeon.tier] -= 1;
  state.activeDungeon = {
    dungeonId: dungeon.id,
    progress: 0,
    startedAt: new Date().toISOString()
  };
  saveState();
  render();
}

function abandonDungeon() {
  if (!state.activeDungeon) return;

  const dungeon = dungeonById(state.activeDungeon.dungeonId);
  const confirmed = window.confirm(`Abandon ${dungeon?.name ?? "this dungeon"}? Progress will be lost and the key will not be refunded.`);
  if (!confirmed) return;

  state.activeDungeon = null;
  saveState();
  render();
}

function resetProgress() {
  const confirmed = window.confirm("Reset all XP, pets, gold, keys, dungeons, and workout history?");
  if (!confirmed) return;

  state.xp = { ...startingState.xp };
  state.pets = { ...startingState.pets };
  state.gold = 0;
  state.keys = { ...startingState.keys };
  state.activeDungeon = null;
  state.dungeonClears = {};
  state.dungeonHistory = [];
  state.log = [];
  saveState();
  render();
}

function switchTab(tabId) {
  for (const button of tabButtons) {
    button.classList.toggle("active", button.dataset.tab === tabId);
  }

  for (const view of tabViews) {
    view.classList.toggle("active", view.id === `${tabId}Tab`);
  }
}

function render() {
  renderSkills();
  renderPets();
  renderDungeons();
  renderLog();
  updatePreviews();
}

workoutType.addEventListener("change", updateWorkoutFields);
amountInput.addEventListener("input", updatePreviews);
workoutForm.addEventListener("submit", addWorkout);
resetButton.addEventListener("click", resetProgress);
workoutLog.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-workout-button");
  if (!button) return;

  deleteWorkout(Number(button.dataset.logIndex));
});

keyShop.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-key]");
  if (!button) return;

  buyKey(button.dataset.buyKey);
});

dungeonSelection.addEventListener("click", (event) => {
  const button = event.target.closest("[data-enter-dungeon]");
  if (!button) return;

  enterDungeon(button.dataset.enterDungeon);
});

activeDungeon.addEventListener("click", (event) => {
  if (event.target.closest("#abandonDungeonButton")) {
    abandonDungeon();
  }
});

for (const button of tabButtons) {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
}

updateWorkoutFields();
render();
