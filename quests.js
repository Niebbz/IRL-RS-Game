// Quest board runtime: progress evaluation, rewards, repeatables, and rendering.
(function () {
  let questState = loadQuestState();

  function loadQuestState() {
    try {
      const saved = JSON.parse(localStorage.getItem(questStorageKey));
      const completed = {};
      const titles = {};
      const repeatable = {};

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

      if (saved?.repeatable && typeof saved.repeatable === "object") {
        for (const [questId, record] of Object.entries(saved.repeatable)) {
          const completions = Math.max(0, Number(record?.completions) || 0);
          repeatable[questId] = {
            completions,
            lastCompletedAt: record?.lastCompletedAt ?? null
          };
        }
      }

      return { completed, titles, repeatable };
    } catch {
      return { completed: {}, titles: {}, repeatable: {} };
    }
  }

  function saveQuestState() {
    localStorage.setItem(questStorageKey, JSON.stringify(questState));
  }

  window.resetLevelForgeQuests = function () {
    questState = { completed: {}, titles: {}, repeatable: {} };
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
    return skillId;
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

  function townshipBuildingCompleted(current, buildingId) {
    const completed = Boolean(current.township.completedBuildings?.[buildingId])
      || current.township.history.some((entry) => entry.buildingId === buildingId);

    return completed ? 1 : 0;
  }

  function repeatableRecord(questId) {
    questState.repeatable ||= {};
    questState.repeatable[questId] ||= { completions: 0, lastCompletedAt: null };
    return questState.repeatable[questId];
  }

  function repeatableCompletionCount(questId) {
    return Math.max(0, Number(repeatableRecord(questId).completions) || 0);
  }

  function scaledRequirement(requirement, quest) {
    if (!quest.repeatable || !Number.isFinite(requirement.repeatEvery)) return requirement;

    return {
      ...requirement,
      target: requirement.target + requirement.repeatEvery * repeatableCompletionCount(quest.id)
    };
  }

  function questsCompleted(excludeQuestId = null) {
    return Object.keys(questState.completed)
      .filter((questId) => questId !== excludeQuestId && baseQuestIds.has(questId))
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
    if (requirement.kind === "townshipBuildingCompleted") return townshipBuildingCompleted(current, requirement.buildingId);
    if (requirement.kind === "townshipHistory") return current.township.history.length;
    if (requirement.kind === "skillLevel") return levelForSkill(requirement.skillId, current);
    if (requirement.kind === "questsCompleted") return questsCompleted(questId);

    return 0;
  }

  function evaluateQuest(quest, current) {
    const requirements = quest.requirements.map((requirement) => {
      const activeRequirement = scaledRequirement(requirement, quest);
      const progress = requirementProgress(activeRequirement, current, quest.id);

      return {
        ...activeRequirement,
        progress,
        complete: progress >= activeRequirement.target
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
    if (quest.repeatable) {
      const completions = repeatableCompletionCount(quest.id);
      const completionText = completions
        ? ` | Completed ${numberText(completions)} ${completions === 1 ? "time" : "times"}`
        : "";

      if (!isUnlocked) return "Locked";
      return isReady ? `Ready to claim${completionText}` : `Repeatable${completionText}`;
    }

    if (isCompleted) {
      const completedAt = formatQuestDate(questState.completed[quest.id]?.completedAt);
      return completedAt ? `Completed ${completedAt}` : "Completed";
    }

    if (!isUnlocked) return `${quest.tier} locked at ${tierUnlockPoints[quest.tier]} QP`;
    return isReady ? "Ready to claim" : "Available";
  }

  function questButtonText(quest, isCompleted, isReady, isUnlocked) {
    if (quest.repeatable) {
      if (!isUnlocked) return "Locked";
      return isReady ? "Claim Reward" : "Repeatable";
    }

    if (isCompleted) return "Completed";
    if (!isUnlocked) return "Locked";
    if (isReady) return "Claim Reward";
    return "In Progress";
  }

  function questCategoryId(quest) {
    if (quest.type === "Starter") return "starter";
    if (quest.type === "Dungeon") return "dungeons";
    if (quest.type === "Township") return "township";
    if (quest.type === "Account") return "account";
    if (quest.type === "Guildhall") return "guildhall";
    return "training";
  }

  function questCategoryMeta(categoryId) {
    return questCategories.find((category) => category.id === categoryId) ?? {
      id: categoryId,
      name: categoryId,
      description: ""
    };
  }

  function renderRewardPanel(quest) {
    return `
      <div class="quest-block quest-rewards-panel" hidden>
        <div class="quest-block-title">Rewards</div>
        ${rewardRows(quest.rewards)}
      </div>
    `;
  }

  function toggleQuestRewards(button) {
    const card = button.closest(".quest-card");
    const panel = card?.querySelector(".quest-rewards-panel");
    if (!panel) return;

    const expanded = panel.hidden;
    panel.hidden = !expanded;
    button.setAttribute("aria-expanded", String(expanded));
    button.textContent = expanded ? "Hide Rewards" : "View Rewards";
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
    if (
      Object.keys(questState.completed).length === 0
      && Object.keys(questState.titles).length === 0
      && Object.keys(questState.repeatable ?? {}).length === 0
    ) return;
    if (!appLooksFresh(current)) return;

    questState = { completed: {}, titles: {}, repeatable: {} };
    saveQuestState();
  }

  function renderQuestSummary(current) {
    return `
      <section class="quest-summary" aria-label="Quest progress">
        <div>
          <span>Quest Points</span>
          <strong>${numberText(questPoints())}</strong>
        </div>
        <div>
          <span>Base Quests</span>
          <strong>${numberText(questsCompleted())} / ${numberText(baseQuests.length)}</strong>
        </div>
        <div>
          <span>Total XP</span>
          <strong>${numberText(totalXP(current))}</strong>
        </div>
      </section>
    `;
  }

  function renderQuestCard(quest, current) {
    const evaluation = evaluateQuest(quest, current);
    const isCompleted = !quest.repeatable && Boolean(questState.completed[quest.id]);
    const isUnlocked = questIsUnlocked(quest);
    const isReady = isUnlocked && evaluation.complete && !isCompleted;
    const card = document.createElement("article");
    const tierLabel = quest.repeatable ? "Repeatable" : quest.tier;

    card.className = `quest-card${isCompleted ? " completed" : ""}${isReady ? " ready" : ""}${!isUnlocked ? " locked" : ""}`;
    card.innerHTML = `
      <div class="quest-card-header">
        <div>
          <h3>${quest.name}</h3>
          <p class="quest-description">${quest.description}</p>
        </div>
        <div class="quest-tags" aria-label="Quest tags">
          <span class="quest-tag">${quest.type}</span>
          <span class="quest-tier-tag">${tierLabel}</span>
        </div>
      </div>
      <div class="quest-block">
        <div class="quest-block-title">Objectives</div>
        ${requirementRows(evaluation.requirements)}
      </div>
      <div class="quest-card-footer">
        <span class="quest-status">${questStatusText(quest, isCompleted, isReady, isUnlocked)}</span>
        <div class="quest-button-row">
          <button
            class="secondary-button quest-reward-toggle"
            type="button"
            data-toggle-quest-rewards
            aria-expanded="false"
          >View Rewards</button>
          <button
            class="${isReady ? "primary-button" : "secondary-button"}"
            type="button"
            data-claim-quest="${quest.id}"
            ${isReady ? "" : "disabled"}
          >${questButtonText(quest, isCompleted, isReady, isUnlocked)}</button>
        </div>
      </div>
      ${renderRewardPanel(quest)}
    `;

    return card;
  }

  function completedQuestList() {
    return baseQuests
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
        <div class="quest-tags" aria-label="Quest tags">
          <span class="quest-tag">${questCategoryMeta(questCategoryId(quest)).name}</span>
          <span class="quest-tier-tag">${quest.tier}</span>
        </div>
      </div>
      <div class="quest-card-footer">
        <span class="quest-status">${completedAt ? `Completed ${completedAt}` : "Completed"}</span>
        <div class="quest-button-row">
          <button
            class="secondary-button quest-reward-toggle"
            type="button"
            data-toggle-quest-rewards
            aria-expanded="false"
          >View Rewards</button>
        </div>
      </div>
      ${renderRewardPanel(quest)}
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
          <span>
            <strong>Completed Quests</strong>
            <small>Quests leave their category once claimed.</small>
          </span>
          <em>${numberText(completed.length)} / ${numberText(baseQuests.length)}</em>
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

  function renderQuestCategorySection(category, categoryQuests, current, categoryIndex) {
    const section = document.createElement("section");
    const lockedCount = categoryQuests.filter((quest) => !questIsUnlocked(quest)).length;
    const inProgressCount = categoryQuests.length - lockedCount;
    const progressText = `${numberText(inProgressCount)} in progress`;
    const lockedText = lockedCount ? ` | ${numberText(lockedCount)} locked` : "";

    section.className = "quest-category-section";
    section.innerHTML = `
      <details class="quest-category-details" ${categoryIndex === 0 ? "open" : ""}>
        <summary>
          <span>
            <strong>${category.name}</strong>
            <small>${category.description}</small>
          </span>
          <em>${progressText}${lockedText}</em>
        </summary>
        <div class="quest-category-grid"></div>
      </details>
    `;

    const grid = section.querySelector(".quest-category-grid");
    for (const quest of categoryQuests) grid.appendChild(renderQuestCard(quest, current));

    return section;
  }

  function renderQuests() {
    const questGrid = document.querySelector("#questGrid");
    if (!questGrid) return;

    const current = currentAppState();
    syncQuestReset(current);
    questGrid.innerHTML = renderQuestSummary(current);

    const activeQuests = quests.filter((quest) => quest.repeatable || !questState.completed[quest.id]);
    let renderedCategoryCount = 0;
    for (const category of questCategories) {
      const categoryQuests = activeQuests.filter((quest) => questCategoryId(quest) === category.id);
      if (categoryQuests.length === 0) continue;

      questGrid.appendChild(renderQuestCategorySection(category, categoryQuests, current, renderedCategoryCount));
      renderedCategoryCount += 1;
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
    if (!quest || (!quest.repeatable && questState.completed[quest.id]) || !questIsUnlocked(quest)) return;

    const current = currentAppState();
    const evaluation = evaluateQuest(quest, current);
    if (!evaluation.complete) return;

    const appliedRewards = applyRewards(current, quest);
    const completedAt = new Date().toISOString();

    if (quest.repeatable) {
      const record = repeatableRecord(quest.id);
      record.completions = repeatableCompletionCount(quest.id) + 1;
      record.lastCompletedAt = completedAt;
      record.lastRewards = appliedRewards;
    } else {
      questState.completed[quest.id] = {
        completedAt,
        questPoints: quest.rewards.questPoints ?? 0,
        rewards: appliedRewards
      };
    }

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
      const rewardButton = event.target.closest("[data-toggle-quest-rewards]");
      if (rewardButton) {
        toggleQuestRewards(rewardButton);
        return;
      }

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
