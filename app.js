const petDropRates = {
  attack: 1 / 15000,
  strength: 1 / 15000,
  defence: 1 / 15000,
  agility: 1 / 12000,
  discipline: 1 / 30000
};
const runMinutesPerMile = 10;

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
    name: "Defence",
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
    xpPerUnit: 10,
    amountStep: 1,
    defaultAmount: 45
  },
  pull: {
    label: "Pull day",
    skillId: "strength",
    unit: "Minutes",
    xpPerUnit: 10,
    amountStep: 1,
    defaultAmount: 45
  },
  legs: {
    label: "Leg day",
    skillId: "defence",
    unit: "Minutes",
    xpPerUnit: 10,
    amountStep: 1,
    defaultAmount: 45
  },
  run: {
    label: "Run",
    skillId: "agility",
    unit: "Miles",
    xpPerUnit: 100,
    amountStep: 0.1,
    defaultAmount: 3
  }
};

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
  log: []
};

const state = loadState();

const skillGrid = document.querySelector("#skillGrid");
const petGrid = document.querySelector("#petGrid");
const totalLevel = document.querySelector("#totalLevel");
const workoutForm = document.querySelector("#workoutForm");
const workoutType = document.querySelector("#workoutType");
const amountInput = document.querySelector("#amount");
const amountLabel = document.querySelector("#amountLabel");
const xpPreview = document.querySelector("#xpPreview");
const workoutLog = document.querySelector("#workoutLog");
const emptyLog = document.querySelector("#emptyLog");
const resetButton = document.querySelector("#resetButton");
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

function disciplineRollMinutesForWorkout(skillId, amount) {
  if (skillId === "agility") return amount * runMinutesPerMile;
  return amount;
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
        <span>${state.pets[skill.id] ? `${skill.petName} pet owned` : `${skill.petName} pet: 1 / ${formatDropRate(skill.id)} per ${dropRateUnit(skill.id)}`}</span>
      </div>
    `;

    skillGrid.appendChild(card);
  }

  totalLevel.textContent = total.toLocaleString();
}

function renderPets() {
  petGrid.innerHTML = "";

  for (const skill of skills) {
    const unlocked = state.pets[skill.id];
    const card = document.createElement("article");
    card.className = `pet-card ${unlocked ? "unlocked" : "locked"}`;
    card.innerHTML = `
      <img class="asset-icon pet-icon ${unlocked ? "" : "locked"}" src="${skill.petImage}" alt="${skill.petName}">
      <div class="pet-name">${skill.petName}</div>
      <div class="pet-source">${skill.name} pet</div>
      <div class="pet-status">${unlocked ? "Unlocked" : "Not found yet"}</div>
    `;
    petGrid.appendChild(card);
  }
}

function updateWorkoutFields() {
  const selected = workoutMap[workoutType.value];
  amountLabel.textContent = selected.unit;
  amountInput.step = selected.amountStep;

  if (!amountInput.value || Number(amountInput.value) <= 0) {
    amountInput.value = selected.defaultAmount;
  }

  updateXPPreview();
}

function updateXPPreview() {
  const selected = workoutMap[workoutType.value];
  const amount = Math.max(0, Number(amountInput.value) || 0);
  xpPreview.textContent = formatNumber(amount * selected.xpPerUnit);
}

function renderLog() {
  workoutLog.innerHTML = "";
  emptyLog.hidden = state.log.length > 0;

  for (const [index, entry] of state.log.entries()) {
    const item = document.createElement("li");
    const dropText = entry.petDrops?.length
      ? `<div class="pet-drop">Pet drop: ${entry.petDrops.join(", ")}</div>`
      : "";

    item.innerHTML = `
      <div>
        <div class="log-title">${entry.title}</div>
        <div class="log-meta">${entry.detail}</div>
        <div class="log-date">${formatLoggedDate(entry.createdAt)}</div>
        ${dropText}
      </div>
      <div class="log-actions">
        <div class="log-xp">+${formatNumber(entry.mainXP)} ${entry.skillName}<br>+50 Discipline</div>
        <button class="delete-workout-button" type="button" data-log-index="${index}">Delete</button>
      </div>
    `;
    workoutLog.appendChild(item);
  }
}

function addWorkout(event) {
  event.preventDefault();

  const selected = workoutMap[workoutType.value];
  const amount = Math.max(0, Number(amountInput.value) || 0);
  if (amount <= 0) return;

  const mainXP = Math.round(amount * selected.xpPerUnit);
  const skill = skills.find((item) => item.id === selected.skillId);
  const amountText = selected.unit === "Miles"
    ? `${amount.toLocaleString()} miles`
    : `${amount.toLocaleString()} minutes`;
  const mainPetRolls = amount;
  const disciplinePetRollMinutes = disciplineRollMinutesForWorkout(selected.skillId, amount);
  const petDrops = [];

  state.xp[selected.skillId] += mainXP;
  state.xp.discipline += 50;

  const mainPet = rollPet(selected.skillId, mainPetRolls);
  if (mainPet) petDrops.push(mainPet.petName);

  const disciplinePet = rollPet("discipline", disciplinePetRollMinutes);
  if (disciplinePet) petDrops.push(disciplinePet.petName);

  state.log.unshift({
    title: selected.label,
    detail: amountText,
    skillId: selected.skillId,
    skillName: skill.name,
    mainXP,
    mainPetRolls,
    disciplinePetRollMinutes,
    petDrops,
    createdAt: new Date().toISOString()
  });
  state.log = state.log.slice(0, 50);

  saveState();
  render();

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
  state.xp.discipline = Math.max(0, (state.xp.discipline ?? 0) - 50);

  state.log.splice(index, 1);

  for (const petName of entry.petDrops ?? []) {
    if (hasRemainingPetDrop(petName)) continue;

    const petSkillId = skillIdForPetName(petName);
    if (petSkillId) state.pets[petSkillId] = false;
  }

  saveState();
  render();
}

function resetProgress() {
  const confirmed = window.confirm("Reset all XP, pets, and workout history?");
  if (!confirmed) return;

  state.xp = { ...startingState.xp };
  state.pets = { ...startingState.pets };
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
  renderLog();
  updateXPPreview();
}

workoutType.addEventListener("change", updateWorkoutFields);
amountInput.addEventListener("input", updateXPPreview);
workoutForm.addEventListener("submit", addWorkout);
resetButton.addEventListener("click", resetProgress);
workoutLog.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-workout-button");
  if (!button) return;

  deleteWorkout(Number(button.dataset.logIndex));
});

for (const button of tabButtons) {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
}

updateWorkoutFields();
render();
