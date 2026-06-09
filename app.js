const skills = [
  {
    id: "attack",
    name: "Attack",
    method: "Push day",
    rule: "10 XP per minute",
    mark: "ATK",
    color: "#b84b43"
  },
  {
    id: "strength",
    name: "Strength",
    method: "Pull day",
    rule: "10 XP per minute",
    mark: "STR",
    color: "#386fa4"
  },
  {
    id: "defence",
    name: "Defence",
    method: "Leg day",
    rule: "10 XP per minute",
    mark: "DEF",
    color: "#4f7d50"
  },
  {
    id: "agility",
    name: "Agility",
    method: "Running",
    rule: "100 XP per mile",
    mark: "AGI",
    color: "#c8742a"
  },
  {
    id: "discipline",
    name: "Discipline",
    method: "Completed workouts",
    rule: "50 XP per workout",
    mark: "DIS",
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

const storageKey = "irl-rs-game-state-v1";
const startingState = {
  xp: {
    attack: 0,
    strength: 0,
    defence: 0,
    agility: 0,
    discipline: 0
  },
  log: []
};

const state = loadState();

const skillGrid = document.querySelector("#skillGrid");
const totalLevel = document.querySelector("#totalLevel");
const workoutForm = document.querySelector("#workoutForm");
const workoutType = document.querySelector("#workoutType");
const amountInput = document.querySelector("#amount");
const amountLabel = document.querySelector("#amountLabel");
const xpPreview = document.querySelector("#xpPreview");
const workoutLog = document.querySelector("#workoutLog");
const emptyLog = document.querySelector("#emptyLog");
const resetButton = document.querySelector("#resetButton");

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
    const saved = localStorage.getItem(storageKey);
    if (!saved) return structuredClone(startingState);

    const parsed = JSON.parse(saved);
    return {
      xp: { ...startingState.xp, ...parsed.xp },
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
          <div class="skill-mark" style="background: ${skill.color}">${skill.mark}</div>
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
      </div>
    `;

    skillGrid.appendChild(card);
  }

  totalLevel.textContent = total.toLocaleString();
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

  for (const entry of state.log.slice(0, 8)) {
    const item = document.createElement("li");
    item.innerHTML = `
      <div>
        <div class="log-title">${entry.title}</div>
        <div class="log-meta">${entry.detail}</div>
      </div>
      <div class="log-xp">+${formatNumber(entry.mainXP)} ${entry.skillName}<br>+50 Discipline</div>
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

  state.xp[selected.skillId] += mainXP;
  state.xp.discipline += 50;
  state.log.unshift({
    title: selected.label,
    detail: amountText,
    skillName: skill.name,
    mainXP,
    createdAt: new Date().toISOString()
  });
  state.log = state.log.slice(0, 20);

  saveState();
  render();
}

function resetProgress() {
  const confirmed = window.confirm("Reset all XP and workout history?");
  if (!confirmed) return;

  state.xp = { ...startingState.xp };
  state.log = [];
  saveState();
  render();
}

function render() {
  renderSkills();
  renderLog();
  updateXPPreview();
}

workoutType.addEventListener("change", updateWorkoutFields);
amountInput.addEventListener("input", updateXPPreview);
workoutForm.addEventListener("submit", addWorkout);
resetButton.addEventListener("click", resetProgress);

updateWorkoutFields();
render();
