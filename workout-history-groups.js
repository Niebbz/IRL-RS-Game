(function () {
  const storageKeys = ["irl-rs-game-state-v2", "irl-rs-game-state-v1"];
  const materialNames = { timber: "Timber", stone: "Stone", iron: "Iron", supplies: "Supplies" };
  const skillUnits = {
    attack: "minute",
    strength: "minute",
    defense: "minute",
    agility: "mile",
    discipline: "workout"
  };

  function readSavedState() {
    for (const key of storageKeys) {
      const saved = localStorage.getItem(key);
      if (!saved) continue;

      try {
        return JSON.parse(saved);
      } catch {
        return { log: [] };
      }
    }

    return { log: [] };
  }

  function formatNumber(value) {
    return Math.round(value ?? 0).toLocaleString();
  }

  function formatAmount(value) {
    return Number(value ?? 0).toLocaleString(undefined, {
      maximumFractionDigits: 1
    });
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

  function logMonthKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "unknown";

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function formatLoggedMonth(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unknown";

    return date.toLocaleString([], {
      month: "long",
      year: "numeric"
    });
  }

  function workoutCountText(count) {
    return `${count.toLocaleString()} workout${count === 1 ? "" : "s"}`;
  }

  function materialEntries(materials) {
    return Object.entries(materials ?? {}).filter(([, amount]) => amount > 0);
  }

  function formatMaterials(materials) {
    return materialEntries(materials)
      .map(([materialId, amount]) => `+${formatNumber(amount)} ${materialNames[materialId] ?? materialId}`)
      .join(", ");
  }

  function workoutRequirementText(skillId, amount) {
    const unit = skillUnits[skillId] ?? "unit";
    return `${formatAmount(amount)} ${unit}${amount === 1 ? "" : "s"}`;
  }

  function createWorkoutLogItem(entry, index) {
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
    const dungeonMaterials = formatMaterials(entry.dungeonCompleted?.materialRewards);
    const dungeonCompleteText = entry.dungeonCompleted
      ? `<div class="dungeon-note">Dungeon Cleared: ${entry.dungeonCompleted.dungeonName}<br>+${formatNumber(entry.dungeonCompleted.bonusXP)} bonus ${entry.dungeonCompleted.skillName} XP${dungeonMaterials ? `<br>Materials: ${dungeonMaterials}` : ""}</div>`
      : "";
    const townshipText = entry.townshipContribution
      ? `<div class="township-note">Township: ${Object.entries(entry.townshipContribution.contributions ?? {}).map(([skillId, value]) => workoutRequirementText(skillId, value)).join(", ")} toward ${entry.townshipContribution.buildingName}${entry.townshipContribution.completedBuilding ? `<br>Building Completed: ${entry.townshipContribution.completedBuilding.buildingName}` : ""}</div>`
      : "";

    item.innerHTML = `
      <div>
        <div class="log-title">${entry.title}</div>
        <div class="log-meta">${entry.detail}</div>
        <div class="log-date">${formatLoggedDate(entry.createdAt)}</div>
        ${goldText}
        ${dungeonProgressText}
        ${dungeonCompleteText}
        ${townshipText}
        ${dropText}
      </div>
      <div class="log-actions">
        <div class="log-xp">+${formatNumber(entry.mainXP)} ${entry.skillName}<br>+${formatNumber(entry.disciplineXP ?? 50)} Discipline</div>
        <button class="delete-workout-button" type="button" data-log-index="${index}">Delete</button>
      </div>
    `;

    return item;
  }

  function renderGroupedLog() {
    const workoutLog = document.querySelector("#workoutLog");
    const emptyLog = document.querySelector("#emptyLog");
    if (!workoutLog || !emptyLog) return;

    const savedState = readSavedState();
    const log = Array.isArray(savedState.log) ? savedState.log : [];

    workoutLog.innerHTML = "";
    emptyLog.hidden = log.length > 0;

    const groups = [];
    const groupsByMonth = new Map();

    for (const [index, entry] of log.entries()) {
      const key = logMonthKey(entry.createdAt);
      if (!groupsByMonth.has(key)) {
        const group = {
          key,
          label: formatLoggedMonth(entry.createdAt),
          entries: []
        };
        groupsByMonth.set(key, group);
        groups.push(group);
      }

      groupsByMonth.get(key).entries.push({ entry, index });
    }

    for (const [groupIndex, group] of groups.entries()) {
      const groupItem = document.createElement("li");
      groupItem.className = "workout-month-group";

      const details = document.createElement("details");
      details.className = "workout-month";
      details.open = groupIndex === 0;

      const summary = document.createElement("summary");
      summary.innerHTML = `
        <span class="workout-month-title">${group.label}</span>
        <span class="workout-month-count">${workoutCountText(group.entries.length)}</span>
      `;

      const monthList = document.createElement("ol");
      monthList.className = "month-workout-list";

      for (const { entry, index } of group.entries) {
        monthList.appendChild(createWorkoutLogItem(entry, index));
      }

      details.append(summary, monthList);
      groupItem.appendChild(details);
      workoutLog.appendChild(groupItem);
    }
  }

  function installGroupedHistoryRender() {
    if (typeof render === "function" && !render.__workoutHistoryGroups) {
      const baseRender = render;
      render = function renderWithGroupedHistory() {
        baseRender();
        renderGroupedLog();
      };
      render.__workoutHistoryGroups = true;
    }

    renderGroupedLog();

    const workoutLog = document.querySelector("#workoutLog");
    if (!workoutLog || workoutLog.__workoutHistoryObserver) return;

    let regroupQueued = false;
    const observer = new MutationObserver(() => {
      if (regroupQueued || workoutLog.firstElementChild?.classList.contains("workout-month-group")) return;

      regroupQueued = true;
      requestAnimationFrame(() => {
        regroupQueued = false;
        renderGroupedLog();
      });
    });

    observer.observe(workoutLog, { childList: true });
    workoutLog.__workoutHistoryObserver = observer;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installGroupedHistoryRender);
  } else {
    installGroupedHistoryRender();
  }
})();
