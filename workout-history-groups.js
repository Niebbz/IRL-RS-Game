(function () {
  if (
    typeof renderLog !== "function" ||
    typeof workoutLog === "undefined" ||
    typeof emptyLog === "undefined" ||
    typeof state === "undefined"
  ) {
    return;
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
    const dungeonCompleteText = entry.dungeonCompleted
      ? `<div class="dungeon-note">Dungeon Cleared: ${entry.dungeonCompleted.dungeonName}<br>+${formatNumber(entry.dungeonCompleted.bonusXP)} bonus ${entry.dungeonCompleted.skillName} XP${materialEntries(entry.dungeonCompleted.materialRewards).length > 0 ? `<br>Materials: ${formatMaterials(entry.dungeonCompleted.materialRewards)}` : ""}</div>`
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

  renderLog = function renderGroupedLog() {
    workoutLog.innerHTML = "";
    emptyLog.hidden = state.log.length > 0;

    const groups = [];
    const groupsByMonth = new Map();

    for (const [index, entry] of state.log.entries()) {
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
  };

  render();
})();
