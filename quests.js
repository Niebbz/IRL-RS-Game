(function () {
  const questStorageKey = "level-forge-quests-v1";
  const appStorageKeys = ["irl-rs-game-state-v2", "irl-rs-game-state-v1"];

  const skillNames = {
    attack: "Attack",
    strength: "Strength",
    defense: "Defense",
    agility: "Agility",
    discipline: "Discipline"
  };

  const baseXP = {
    attack: 0,
    strength: 0,
    defense: 0,
    agility: 0,
    discipline: 0
  };

  const quests = [
    {
      id: "first-spark",
      name: "First Spark",
      type: "Starter",
      description: "Log your first workout and light the forge.",
      requirements: [{ kind: "totalWorkouts", label: "Workouts logged", target: 1 }],
      rewards: { discipline: 100 }
    },
    {
      id: "blade-drill",
      name: "Blade Drill",
      type: "Attack",
      description: "Build consistency with push-day training.",
      requirements: [{ kind: "skillWorkouts", skillId: "attack", label: "Push-day workouts", target: 3 }],
      rewards: { attack: 250, discipline: 50 }
    },
    {
      id: "chain-pull",
      name: "Chain Pull",
      type: "Strength",
      description: "Stack pull-day sessions into real progress.",
      requirements: [{ kind: "skillWorkouts", skillId: "strength", label: "Pull-day workouts", target: 3 }],
      rewards: { strength: 250, discipline: 50 }
    },
    {
      id: "iron-stance",
      name: "Iron Stance",
      type: "Defense",
      description: "Train legs until the base is steady.",
      requirements: [{ kind: "skillWorkouts", skillId: "defense", label: "Leg-day workouts", target: 3 }],
      rewards: { defense: 250, discipline: 50 }
    },
    {
      id: "trail-scout",
      name: "Trail Scout",
      type: "Agility",
      description: "Complete running sessions to mark the trail.",
      requirements: [{ kind: "skillWorkouts", skillId: "agility", label: "Runs logged", target: 3 }],
      rewards: { agility: 250, discipline: 50 }
    },
    {
      id: "balanced-arsenal",
      name: "Balanced Arsenal",
      type: "Account",
      description: "Train each main style at least once.",
      requirements: [
        { kind: "skillWorkouts", skillId: "attack", label: "Push-day workouts", target: 1 },
        { kind: "skillWorkouts", skillId: "strength", label: "Pull-day workouts", target: 1 },
        { kind: "skillWorkouts", skillId: "defense", label: "Leg-day workouts", target: 1 },
        { kind: "skillWorkouts", skillId: "agility", label: "Runs logged", target: 1 }
      ],
      rewards: { attack: 150, strength: 150, defense: 150, agility: 150, discipline: 200 }
    },
    {
      id: "steady-routine",
      name: "Steady Routine",
      type: "Discipline",
      description: "Reach ten logged workouts.",
      requirements: [{ kind: "totalWorkouts", label: "Workouts logged", target: 10 }],
      rewards: { discipline: 500 }
    },
    {
      id: "forge-tempered",
      name: "Forge Tempered",
      type: "Account",
      description: "Earn 5,000 total XP across your account.",
      requirements: [{ kind: "totalXP", label: "Total XP earned", target: 5000 }],
      rewards: { attack: 500, strength: 500, defense: 500, agility: 500, discipline: 500 }
    }
  ];

  let questState = loadQuestState();

  function loadQuestState() {
    try {
      const saved = JSON.parse(localStorage.getItem(questStorageKey));
      const completed = {};

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

      return { completed };
    } catch {
      return { completed: {} };
    }
  }

  function saveQuestState() {
    localStorage.setItem(questStorageKey, JSON.stringify(questState));
  }

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

  function numberText(value) {
    const formatter = typeof formatNumber === "function"
      ? formatNumber
      : (amount) => Math.round(amount).toLocaleString();

    return formatter(value);
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

  function totalXP(current) {
    return Object.values(current.xp ?? {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  }

  function skillWorkoutCount(current, skillId) {
    return current.log.filter((entry) => skillIdForLogEntry(entry) === skillId).length;
  }

  function requirementProgress(requirement, current) {
    if (requirement.kind === "totalWorkouts") return current.log.length;
    if (requirement.kind === "skillWorkouts") return skillWorkoutCount(current, requirement.skillId);
    if (requirement.kind === "totalXP") return totalXP(current);
    if (requirement.kind === "skillXP") return Number(current.xp?.[requirement.skillId] ?? 0);

    return 0;
  }

  function requirementUnit(requirement) {
    if (requirement.kind === "totalXP" || requirement.kind === "skillXP") return "XP";
    return requirement.target === 1 ? "workout" : "workouts";
  }

  function evaluateQuest(quest, current) {
    const requirements = quest.requirements.map((requirement) => {
      const progress = requirementProgress(requirement, current);

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

  function rewardRows(rewards) {
    return Object.entries(rewards)
      .map(([skillId, amount]) => `
        <div class="quest-row quest-reward-row">
          <span>${skillNames[skillId] ?? skillId}</span>
          <strong>+${numberText(amount)} XP</strong>
        </div>
      `)
      .join("");
  }

  function requirementRows(requirements) {
    return requirements
      .map((requirement) => `
        <div class="quest-row">
          <span>${requirement.label}</span>
          <strong>${numberText(requirement.progress)} / ${numberText(requirement.target)} ${requirementUnit(requirement)}</strong>
        </div>
      `)
      .join("");
  }

  function questStatusText(quest, isCompleted, isReady) {
    if (isCompleted) {
      const completedAt = formatQuestDate(questState.completed[quest.id]?.completedAt);
      return completedAt ? `Completed ${completedAt}` : "Completed";
    }

    return isReady ? "Ready to claim" : "In progress";
  }

  function questButtonText(isCompleted, isReady) {
    if (isCompleted) return "Completed";
    if (isReady) return "Claim Reward";
    return "Locked";
  }

  function appLooksFresh(current) {
    const xpTotal = totalXP(current);
    const petValues = Object.values(current.pets ?? {});
    const keyValues = Object.values(current.keys ?? {});

    return xpTotal === 0
      && current.log.length === 0
      && current.gold === 0
      && petValues.every((value) => !value)
      && keyValues.every((value) => !value);
  }

  function syncQuestReset(current) {
    if (Object.keys(questState.completed).length === 0) return;
    if (!appLooksFresh(current)) return;

    questState = { completed: {} };
    saveQuestState();
  }

  function renderQuests() {
    const questGrid = document.querySelector("#questGrid");
    if (!questGrid) return;

    const current = currentAppState();
    syncQuestReset(current);
    questGrid.innerHTML = "";

    for (const quest of quests) {
      const evaluation = evaluateQuest(quest, current);
      const isCompleted = Boolean(questState.completed[quest.id]);
      const isReady = evaluation.complete && !isCompleted;
      const card = document.createElement("article");

      card.className = `quest-card${isCompleted ? " completed" : ""}${isReady ? " ready" : ""}`;
      card.innerHTML = `
        <div class="quest-card-header">
          <h3>${quest.name}</h3>
          <span class="quest-tag">${quest.type}</span>
        </div>
        <p class="quest-description">${quest.description}</p>
        <div class="quest-block">
          <div class="quest-block-title">Requirements</div>
          ${requirementRows(evaluation.requirements)}
        </div>
        <div class="quest-block">
          <div class="quest-block-title">Rewards</div>
          ${rewardRows(quest.rewards)}
        </div>
        <div class="quest-card-footer">
          <span class="quest-status">${questStatusText(quest, isCompleted, isReady)}</span>
          <button
            class="${isReady ? "primary-button" : "secondary-button"}"
            type="button"
            data-claim-quest="${quest.id}"
            ${isReady ? "" : "disabled"}
          >${questButtonText(isCompleted, isReady)}</button>
        </div>
      `;

      questGrid.appendChild(card);
    }
  }

  function claimQuest(questId) {
    const quest = quests.find((item) => item.id === questId);
    if (!quest || questState.completed[quest.id]) return;

    const current = currentAppState();
    const evaluation = evaluateQuest(quest, current);
    if (!evaluation.complete) return;

    for (const [skillId, amount] of Object.entries(quest.rewards)) {
      current.xp[skillId] = (Number(current.xp[skillId]) || 0) + amount;
    }

    questState.completed[quest.id] = {
      completedAt: new Date().toISOString(),
      rewards: { ...quest.rewards }
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
