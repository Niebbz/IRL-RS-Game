// Township is kept local so the page does not depend on downloading code at runtime.
(function () {
  if (window.__levelForgeTownshipEngine) return;
  window.__levelForgeTownshipEngine = true;

  const materialIds = ["timber", "stone", "iron", "supplies"];
  const materialNames = { timber: "Timber", stone: "Stone", iron: "Iron", supplies: "Supplies" };
  const emptyMaterials = { timber: 0, stone: 0, iron: 0, supplies: 0 };
  const starterMaterials = { timber: 10, stone: 5, iron: 2, supplies: 5 };
  const buildingImageBase = "level-forge-building-icons-transparent-fixed/";
  const dungeonMaterials = {
    attack: { bronze: { timber: 6, supplies: 2 }, iron: { timber: 18, supplies: 6 }, rune: { timber: 36, supplies: 12 } },
    strength: { bronze: { stone: 5, timber: 2 }, iron: { stone: 15, timber: 6 }, rune: { stone: 30, timber: 12 } },
    defense: { bronze: { iron: 3, stone: 3 }, iron: { iron: 9, stone: 9 }, rune: { iron: 18, stone: 18 } },
    agility: { bronze: { supplies: 6, timber: 2 }, iron: { supplies: 18, timber: 6 }, rune: { supplies: 36, timber: 12 } }
  };

  const townshipBuildings = [
    {
      id: "storehouse",
      name: "Storehouse",
      stage: 1,
      stageName: "Frontier Camp",
      role: "Unlocks Storehouse inventory and dungeon material rewards.",
      funding: { gold: 300, materials: {} },
      workouts: { strength: 120, agility: 5 }
    },
    {
      id: "palisade",
      name: "Palisade",
      stage: 1,
      stageName: "Frontier Camp",
      role: "Reinforces the first settlement boundary.",
      funding: { gold: 400, materials: { timber: 12, stone: 6 } },
      workouts: { strength: 60, defense: 120 }
    },
    {
      id: "trade-post",
      name: "Trade Post",
      stage: 1,
      stageName: "Frontier Camp",
      role: "Secures trade roads and supply routes.",
      funding: { gold: 500, materials: { timber: 10, supplies: 8 } },
      workouts: { attack: 60, agility: 10 }
    },
    {
      id: "blacksmith",
      name: "Blacksmith",
      stage: 1,
      stageName: "Frontier Camp",
      role: "Turns raw work into stronger town infrastructure.",
      funding: { gold: 750, materials: { timber: 6, stone: 12, iron: 8 } },
      workouts: { strength: 180, agility: 8, discipline: 5 }
    },
    {
      id: "watchtower",
      name: "Watchtower",
      stage: 2,
      stageName: "Fortified Village",
      role: "Improves scouting routes and settlement oversight.",
      funding: { gold: 1000, materials: { timber: 18, stone: 12, supplies: 8 } },
      workouts: { strength: 120, defense: 180, agility: 8 }
    },
    {
      id: "barracks",
      name: "Barracks",
      stage: 2,
      stageName: "Fortified Village",
      role: "Builds the town's training core.",
      funding: { gold: 1250, materials: { timber: 24, stone: 14, iron: 8 } },
      workouts: { attack: 240, defense: 180, discipline: 5 }
    },
    {
      id: "stables",
      name: "Stables",
      stage: 2,
      stageName: "Fortified Village",
      role: "Supports hauling, route work, and town movement.",
      funding: { gold: 1500, materials: { timber: 20, stone: 6, supplies: 16 } },
      workouts: { strength: 120, agility: 20, discipline: 5 }
    },
    {
      id: "marketplace",
      name: "Marketplace",
      stage: 2,
      stageName: "Fortified Village",
      role: "Brings the settlement economy together.",
      funding: { gold: 1750, materials: { timber: 24, stone: 10, iron: 6, supplies: 18 } },
      workouts: { attack: 120, strength: 120, agility: 15, discipline: 6 }
    },
    {
      id: "stone-walls",
      name: "Stone Walls",
      stage: 3,
      stageName: "Forgehold",
      role: "Locks in the foundation for a permanent town.",
      funding: { gold: 2500, materials: { timber: 16, stone: 40, iron: 18 } },
      workouts: { strength: 360, defense: 360, discipline: 8 }
    },
    {
      id: "guild-hall",
      name: "Guild Hall",
      stage: 3,
      stageName: "Forgehold",
      role: "Coordinates every training path in the settlement.",
      funding: { gold: 3000, materials: { timber: 32, stone: 28, iron: 14, supplies: 18 } },
      workouts: { attack: 180, strength: 180, defense: 180, agility: 15, discipline: 10 }
    },
    {
      id: "cartographers-lodge",
      name: "Cartographer's Lodge",
      stage: 3,
      stageName: "Forgehold",
      role: "Maps new routes for supply runs and expansion.",
      funding: { gold: 3500, materials: { timber: 28, stone: 12, iron: 6, supplies: 24 } },
      workouts: { attack: 180, strength: 120, agility: 30, discipline: 10 }
    },
    {
      id: "town-hall",
      name: "Town Hall",
      stage: 3,
      stageName: "Forgehold",
      role: "Completes the first full Forgehold buildout.",
      funding: { gold: 5000, materials: { timber: 50, stone: 45, iron: 24, supplies: 30 } },
      workouts: { attack: 240, strength: 240, defense: 240, agility: 25, discipline: 15 }
    }
  ].map((building) => ({
    ...building,
    image: `${buildingImageBase}building-${building.id}.png`
  }));

  const startingTownship = {
    materials: { ...emptyMaterials },
    activeProjectId: null,
    fundedProjects: {},
    projectProgress: {},
    completedBuildings: {},
    storehouseStarterGranted: false,
    history: []
  };

  const townshipSummary = document.querySelector("#townshipSummary");
  const storehouseInventory = document.querySelector("#storehouseInventory");
  const activeTownshipProject = document.querySelector("#activeTownshipProject");
  const townshipBuildingsList = document.querySelector("#townshipBuildings");
  const townshipHistory = document.querySelector("#townshipHistory");
  const emptyTownshipHistory = document.querySelector("#emptyTownshipHistory");

  if (!townshipSummary || !storehouseInventory || !activeTownshipProject || !townshipBuildingsList) return;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function savedTownship() {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem("irl-rs-game-state-v1");
      return saved ? JSON.parse(saved).township : null;
    } catch {
      return null;
    }
  }

  function migrateMaterials(saved) {
    const migrated = { ...emptyMaterials };
    for (const [id, value] of Object.entries(saved ?? {})) {
      if (id in migrated && Number.isFinite(value)) migrated[id] = value;
    }
    return migrated;
  }

  function migrateSkills(saved) {
    const migrated = {};
    for (const [id, value] of Object.entries(saved ?? {})) {
      const skillId = normalizeSkillId(id);
      if (skills.some((skill) => skill.id === skillId) && Number.isFinite(value)) {
        migrated[skillId] = value;
      }
    }
    return migrated;
  }

  function migrateFlags(saved) {
    const migrated = {};
    if (Array.isArray(saved)) {
      for (const id of saved) if (typeof id === "string") migrated[id] = true;
      return migrated;
    }
    for (const [id, value] of Object.entries(saved ?? {})) migrated[id] = value;
    return migrated;
  }

  function migrateProjectProgress(saved) {
    const migrated = {};
    for (const [id, value] of Object.entries(saved ?? {})) migrated[id] = migrateSkills(value);
    return migrated;
  }

  function migrateTownship(saved) {
    if (!saved) return clone(startingTownship);
    return {
      materials: migrateMaterials(saved.materials),
      activeProjectId: saved.activeProjectId ?? saved.activeProject ?? null,
      fundedProjects: migrateFlags(saved.fundedProjects),
      projectProgress: migrateProjectProgress(saved.projectProgress),
      completedBuildings: migrateFlags(saved.completedBuildings),
      storehouseStarterGranted: Boolean(saved.storehouseStarterGranted),
      history: Array.isArray(saved.history) ? saved.history : []
    };
  }

  state.township = migrateTownship(state.township ?? savedTownship());

  function buildingById(id) {
    return townshipBuildings.find((item) => item.id === id);
  }

  function built(id) {
    return Boolean(state.township.completedBuildings[id]);
  }

  function storehouseBuilt() {
    return built("storehouse");
  }

  function previousBuilding(buildingItem) {
    const index = townshipBuildings.findIndex((item) => item.id === buildingItem.id);
    return index > 0 ? townshipBuildings[index - 1] : null;
  }

  function buildingUnlocked(buildingItem) {
    const previous = previousBuilding(buildingItem);
    return buildingItem.id === "storehouse" || !previous || built(previous.id);
  }

  function funded(id) {
    return Boolean(state.township.fundedProjects[id]);
  }

  function projectProgress(id) {
    if (!state.township.projectProgress[id]) state.township.projectProgress[id] = {};
    return state.township.projectProgress[id];
  }

  function materialEntries(materials) {
    return materialIds.map((id) => [id, materials?.[id] ?? 0]).filter(([, amount]) => amount > 0);
  }

  function formatMaterials(materials, emptyText = "None") {
    const entries = materialEntries(materials);
    return entries.length
      ? entries.map(([id, amount]) => `${formatNumber(amount)} ${materialNames[id]}`).join(", ")
      : emptyText;
  }

  function addMaterials(materials) {
    for (const [id, amount] of Object.entries(materials ?? {})) {
      if (id in state.township.materials) state.township.materials[id] += amount;
    }
  }

  function subtractMaterials(materials) {
    for (const [id, amount] of Object.entries(materials ?? {})) {
      if (id in state.township.materials) {
        state.township.materials[id] = Math.max(0, state.township.materials[id] - amount);
      }
    }
  }

  function canFund(buildingItem) {
    return state.gold >= buildingItem.funding.gold
      && materialEntries(buildingItem.funding.materials).every(([id, amount]) => (
        (state.township.materials[id] ?? 0) >= amount
      ));
  }

  function dungeonMaterialReward(dungeon) {
    return storehouseBuilt() ? dungeonMaterials[dungeon.skillId]?.[dungeon.tier] ?? {} : {};
  }

  function requirementText(skillId, amount) {
    const unit = skillId === "discipline" ? "workouts" : unitForSkillPlural(skillId);
    return `${skillById(skillId)?.name ?? skillId}: ${formatAmount(amount)} ${unit}`;
  }

  function currentTownStageName() {
    const stage = townshipBuildings.reduce((highest, item) => (
      built(item.id) ? Math.max(highest, item.stage) : highest
    ), 1);
    return townshipBuildings.find((item) => item.stage === stage)?.stageName ?? "Frontier Camp";
  }

  function completeProject(buildingItem) {
    const completedAt = new Date().toISOString();
    const starter = buildingItem.id === "storehouse" && !state.township.storehouseStarterGranted
      ? { ...starterMaterials }
      : {};

    if (materialEntries(starter).length) {
      addMaterials(starter);
      state.township.storehouseStarterGranted = true;
    }

    state.township.completedBuildings[buildingItem.id] = completedAt;
    state.township.activeProjectId = null;

    const record = {
      buildingId: buildingItem.id,
      buildingName: buildingItem.name,
      stageName: buildingItem.stageName,
      completedAt,
      starterMaterials: starter
    };
    state.township.history.unshift(record);
    state.township.history = state.township.history.slice(0, 50);
    return record;
  }

  function projectComplete(buildingItem) {
    const itemProgress = projectProgress(buildingItem.id);
    return Object.entries(buildingItem.workouts).every(([skillId, needed]) => (
      (itemProgress[skillId] ?? 0) >= needed
    ));
  }

  function progressTownshipProject(selected, amount) {
    const id = state.township.activeProjectId;
    const buildingItem = buildingById(id);
    if (!buildingItem || built(id)) return null;

    const itemProgress = projectProgress(id);
    const contributions = {};

    if (buildingItem.workouts[selected.skillId]) {
      const remaining = Math.max(0, buildingItem.workouts[selected.skillId] - (itemProgress[selected.skillId] ?? 0));
      const added = Math.min(amount, remaining);
      if (added > 0) {
        itemProgress[selected.skillId] = (itemProgress[selected.skillId] ?? 0) + added;
        contributions[selected.skillId] = added;
      }
    }

    if (buildingItem.workouts.discipline) {
      const remaining = Math.max(0, buildingItem.workouts.discipline - (itemProgress.discipline ?? 0));
      const added = Math.min(1, remaining);
      if (added > 0) {
        itemProgress.discipline = (itemProgress.discipline ?? 0) + added;
        contributions.discipline = added;
      }
    }

    if (!Object.keys(contributions).length) return null;

    const result = {
      buildingId: id,
      buildingName: buildingItem.name,
      contributions,
      completedBuilding: null
    };

    if (projectComplete(buildingItem)) result.completedBuilding = completeProject(buildingItem);
    return result;
  }

  function removeTownshipHistoryEntry(completedBuilding) {
    state.township.history = state.township.history.filter((entry) => (
      entry.buildingId !== completedBuilding.buildingId
        || entry.completedAt !== completedBuilding.completedAt
    ));
  }

  function reverseTownshipContribution(entry) {
    const contribution = entry.townshipContribution;
    if (!contribution) return;

    const completedBuilding = contribution.completedBuilding;
    if (completedBuilding) {
      delete state.township.completedBuildings[completedBuilding.buildingId];
      removeTownshipHistoryEntry(completedBuilding);
      if (!state.township.activeProjectId) state.township.activeProjectId = completedBuilding.buildingId;

      if (materialEntries(completedBuilding.starterMaterials).length) {
        subtractMaterials(completedBuilding.starterMaterials);
        if (completedBuilding.buildingId === "storehouse") state.township.storehouseStarterGranted = false;
      }
    } else if (built(contribution.buildingId)) {
      return;
    }

    const itemProgress = projectProgress(contribution.buildingId);
    for (const [skillId, amount] of Object.entries(contribution.contributions ?? {})) {
      itemProgress[skillId] = Math.max(0, (itemProgress[skillId] ?? 0) - amount);
    }
  }

  function reverseDungeonMaterialReward(entry) {
    const materials = entry.dungeonCompleted?.materialRewards;
    if (materialEntries(materials).length) subtractMaterials(materials);
  }

  if (typeof progressActiveDungeon === "function" && !progressActiveDungeon.__townshipMaterials) {
    const baseProgressActiveDungeon = progressActiveDungeon;
    progressActiveDungeon = function (selected, amount) {
      const result = baseProgressActiveDungeon(selected, amount);
      if (result.completed) {
        const materials = dungeonMaterialReward(dungeonById(result.completed.dungeonId));
        addMaterials(materials);
        result.completed.materialRewards = materials;
      }
      return result;
    };
    progressActiveDungeon.__townshipMaterials = true;
  }

  function renderTownshipSummary() {
    const next = townshipBuildings.find((item) => !built(item.id));
    townshipSummary.innerHTML = `<div class="township-summary-grid">
      <div><span>Stage</span><strong>${currentTownStageName()}</strong></div>
      <div><span>Buildings</span><strong>${townshipBuildings.filter((item) => built(item.id)).length} / ${townshipBuildings.length}</strong></div>
      <div><span>Gold</span><strong>${formatNumber(state.gold)}</strong></div>
      <div><span>Inventory</span><strong>${storehouseBuilt() ? "Storehouse online" : "Storehouse needed"}</strong></div>
      <div><span>Next</span><strong>${next?.name ?? "Complete"}</strong></div>
    </div>`;
  }

  function renderStorehouse() {
    storehouseInventory.innerHTML = storehouseBuilt()
      ? `<div class="material-grid">${materialIds.map((id) => `
        <div class="material-card">
          <span>${materialNames[id]}</span>
          <strong>${formatNumber(state.township.materials[id] ?? 0)}</strong>
        </div>
      `).join("")}</div>`
      : `<div class="empty-state">Build the Storehouse to unlock materials. Starter stockpile: 10 Timber, 5 Stone, 2 Iron, 5 Supplies.</div>`;
  }

  function renderActiveProject() {
    const item = buildingById(state.township.activeProjectId);
    if (!item || built(item.id)) {
      activeTownshipProject.innerHTML = `<div class="empty-state">No active project. Choose a building below to fund and start.</div>`;
      return;
    }

    const itemProgress = projectProgress(item.id);
    activeTownshipProject.innerHTML = `<article class="township-project-card">
      <div class="building-heading">
        <img class="building-image" src="${item.image}" alt="${item.name}">
        <div>
          <div class="building-name">${item.name}</div>
          <div class="building-stage">${item.stageName}</div>
          <div class="building-role">${item.role}</div>
        </div>
      </div>
      <div class="project-progress-list">${Object.entries(item.workouts).map(([skillId, needed]) => {
        const current = Math.min(itemProgress[skillId] ?? 0, needed);
        const percent = needed ? Math.min(100, current / needed * 100) : 100;
        const unit = skillId === "discipline" ? "workouts" : unitForSkillPlural(skillId);
        return `<div class="project-progress-row">
          <div>
            <strong>${skillById(skillId)?.name ?? skillId}</strong>
            <span>${formatAmount(current)} / ${formatAmount(needed)} ${unit}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${percent}%;background:${skillById(skillId)?.color ?? "#35d19f"}"></div>
          </div>
        </div>`;
      }).join("")}</div>
      <button class="secondary-button" type="button" id="pauseTownshipProjectButton">Pause</button>
    </article>`;
  }

  function buildingStatusText(item) {
    if (built(item.id)) return "Completed";
    if (state.township.activeProjectId === item.id) return "Active";
    if (state.township.activeProjectId) return "Another project is active";
    if (!buildingUnlocked(item)) return `Locked until ${previousBuilding(item)?.name}`;
    if (funded(item.id)) return "Funded";
    if (!canFund(item)) return "Needs gold or materials";
    return "Ready";
  }

  function renderBuildings() {
    townshipBuildingsList.innerHTML = "";
    for (const stage of [1, 2, 3]) {
      const stageBuildings = townshipBuildings.filter((item) => item.stage === stage);
      const group = document.createElement("section");
      group.className = "building-stage-group";
      group.innerHTML = `<div class="dungeon-group-heading"><h3>${stageBuildings[0].stageName}</h3><span>Stage ${stage}</span></div><div class="building-grid"></div>`;

      const grid = group.querySelector(".building-grid");
      for (const item of stageBuildings) {
        const itemProgress = projectProgress(item.id);
        const canStart = !built(item.id)
          && state.township.activeProjectId !== item.id
          && !state.township.activeProjectId
          && buildingUnlocked(item)
          && (funded(item.id) || canFund(item));
        const buttonText = built(item.id)
          ? "Completed"
          : state.township.activeProjectId === item.id
            ? "Active"
            : funded(item.id)
              ? "Resume"
              : canStart
                ? "Fund and Start"
                : "View Cost";

        const card = document.createElement("article");
        card.className = `building-card ${built(item.id) ? "completed" : ""} ${buildingUnlocked(item) ? "" : "locked"}`;
        const disabled = built(item.id)
          || state.township.activeProjectId === item.id
          || !buildingUnlocked(item);

        card.innerHTML = `<div class="building-heading">
            <img class="building-image" src="${item.image}" alt="${item.name}">
            <div>
              <div class="building-name">${item.name}</div>
              <div class="building-stage">${item.stageName}</div>
            </div>
          </div>
          <div class="building-role">${item.role}</div>
          <div class="building-costs">
            <div><span>Gold</span><strong>${formatNumber(item.funding.gold)}</strong></div>
            <div><span>Materials</span><strong>${formatMaterials(item.funding.materials)}</strong></div>
          </div>
          <div class="requirement-list">${Object.entries(item.workouts).map(([skillId, needed]) => `
            <div>
              <span>${requirementText(skillId, needed)}</span>
              <strong>${formatAmount(Math.min(itemProgress[skillId] ?? 0, needed))} / ${formatAmount(needed)}</strong>
            </div>
          `).join("")}</div>
          <button class="secondary-button" type="button" data-start-building="${item.id}" ${disabled ? "disabled" : ""}>${buttonText}</button>
          <div class="building-status">${buildingStatusText(item)}</div>`;
        grid.appendChild(card);
      }

      townshipBuildingsList.appendChild(group);
    }
  }

  function renderTownshipHistory() {
    if (!townshipHistory || !emptyTownshipHistory) return;

    townshipHistory.innerHTML = "";
    emptyTownshipHistory.hidden = state.township.history.length > 0;
    for (const entry of state.township.history.slice(0, 30)) {
      const item = buildingById(entry.buildingId);
      const stockpile = materialEntries(entry.starterMaterials).length
        ? `<div class="dungeon-note">Storehouse stockpile: ${formatMaterials(entry.starterMaterials)}</div>`
        : "";
      const row = document.createElement("li");
      row.innerHTML = `<div>
        <div class="log-title">${entry.buildingName}</div>
        <div class="log-meta">${entry.stageName}</div>
        <div class="log-date">Completed ${formatLoggedDate(entry.completedAt)}</div>
        ${stockpile}
      </div>
      <img class="history-building-image" src="${item?.image ?? ""}" alt="${entry.buildingName}">`;
      townshipHistory.appendChild(row);
    }
  }

  function renderTownship() {
    renderTownshipSummary();
    renderStorehouse();
    renderActiveProject();
    renderBuildings();
    renderTownshipHistory();
  }

  function startProject(id) {
    const item = buildingById(id);
    if (!item || built(item.id)) return;
    if (!buildingUnlocked(item)) {
      window.alert(`${previousBuilding(item)?.name ?? "Previous building"} must be completed first.`);
      return;
    }
    if (state.township.activeProjectId && state.township.activeProjectId !== item.id) {
      window.alert("Pause the active project before starting another one.");
      return;
    }
    if (!funded(item.id)) {
      if (!canFund(item)) {
        window.alert("Not enough gold or materials for this building.");
        return;
      }
      state.gold -= item.funding.gold;
      subtractMaterials(item.funding.materials);
      state.township.fundedProjects[item.id] = true;
      projectProgress(item.id);
    }
    state.township.activeProjectId = item.id;
    saveState();
    render();
  }

  townshipBuildingsList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-start-building]");
    if (button) startProject(button.dataset.startBuilding);
  });

  activeTownshipProject.addEventListener("click", (event) => {
    if (event.target.closest("#pauseTownshipProjectButton")) {
      state.township.activeProjectId = null;
      saveState();
      render();
    }
  });

  if (typeof deleteWorkout === "function" && !deleteWorkout.__townshipEngine) {
    const baseDeleteWorkout = deleteWorkout;
    deleteWorkout = function (index) {
      const entry = state.log[index];
      baseDeleteWorkout(index);
      if (!entry || state.log.includes(entry)) return;

      reverseTownshipContribution(entry);
      reverseDungeonMaterialReward(entry);
      saveState();
      render();
    };
    deleteWorkout.__townshipEngine = true;
  }

  if (typeof resetProgress === "function" && typeof resetButton !== "undefined" && !resetProgress.__townshipEngine) {
    resetButton.removeEventListener("click", resetProgress);
    resetProgress = function () {
      if (!window.confirm("Reset all XP, pets, gold, keys, dungeons, Township, quests, shop purchases, backgrounds, and workout history?")) return;
      state.xp = { ...startingState.xp };
      state.pets = { ...startingState.pets };
      state.gold = 0;
      state.keys = { ...startingState.keys };
      state.activeDungeon = null;
      state.dungeonClears = {};
      state.dungeonHistory = [];
      state.cosmetics = clone(startingState.cosmetics);
      state.township = clone(startingTownship);
      state.townshipUpgrades = {};
      state.log = [];
      if (typeof resetSavedQuestProgress === "function") resetSavedQuestProgress();
      saveState();
      render();
    };
    resetProgress.__townshipEngine = true;
    resetButton.addEventListener("click", resetProgress);
  }

  if (typeof render === "function" && !render.__townshipEngine) {
    const baseRender = render;
    render = function () {
      baseRender();
      renderTownship();
    };
    render.__townshipEngine = true;
  }

  window.townshipBuildings = townshipBuildings;
  window.currentTownStageName = currentTownStageName;
  window.isStorehouseBuilt = storehouseBuilt;
  window.addMaterials = addMaterials;
  window.progressTownshipProject = progressTownshipProject;

  saveState();
  render();
})();
// Dungeon chests are layered on top of the base dungeon system so older saves still work.
(function(){
  const materialNames = { timber: "Timber", stone: "Stone", iron: "Iron", supplies: "Supplies" };
  const keyNames = { bronze: "Bronze Key", iron: "Iron Key", rune: "Gold Key" };
  const keyOrder = ["bronze", "iron", "rune"];
  const legacySupplyByTier = { bronze: 5, iron: 15, rune: 40 };
  // Higher-tier chests give more rolls, but rare keys stay unlikely enough to protect the key shop.
  const chestTables = {
    bronze: {
      supplies: [2, 5],
      rolls: 1,
      materialText: "small material chance",
      drops: [
        { id: null, weight: 70 },
        { id: "timber", weight: 15, min: 1, max: 2 },
        { id: "stone", weight: 10, min: 1, max: 2 },
        { id: "iron", weight: 5, min: 1, max: 1 }
      ],
      keyDrops: { bronze: 0.02, iron: 0.0035, rune: 0.0003 }
    },
    iron: {
      supplies: [6, 12],
      rolls: 1,
      materialText: "1 material roll",
      drops: [
        { id: "timber", weight: 35, min: 2, max: 5 },
        { id: "stone", weight: 35, min: 2, max: 5 },
        { id: "iron", weight: 20, min: 1, max: 3 },
        { id: "supplies", weight: 10, min: 2, max: 4 }
      ],
      keyDrops: { bronze: 0.025, iron: 0.01, rune: 0.001 }
    },
    rune: {
      supplies: [14, 28],
      rolls: 2,
      materialText: "2 material rolls",
      drops: [
        { id: "timber", weight: 25, min: 5, max: 10 },
        { id: "stone", weight: 25, min: 5, max: 10 },
        { id: "iron", weight: 25, min: 3, max: 7 },
        { id: "supplies", weight: 25, min: 6, max: 12 }
      ],
      keyDrops: { bronze: 0.03, iron: 0.0175, rune: 0.0035 }
    }
  };

  function tableForTier(tier) {
    return chestTables[tier] ?? chestTables.bronze;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function addReward(rewards, id, amount) {
    if (!id || amount <= 0) return;
    rewards[id] = (rewards[id] ?? 0) + amount;
  }

  function formatAmount(amount) {
    return typeof formatNumber === "function" ? formatNumber(amount) : Number(amount).toLocaleString();
  }

  function formatPercent(value) {
    return `${(value * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
  }

  function rollWeightedDrop(drops) {
    const total = drops.reduce((sum, drop) => sum + drop.weight, 0);
    let roll = Math.random() * total;
    for (const drop of drops) {
      roll -= drop.weight;
      if (roll <= 0) return drop;
    }
    return drops[drops.length - 1];
  }

  function rollKeyDrop(keyDrops) {
    const roll = Math.random();
    let threshold = 0;
    // Check rarest keys first so one chest can only award one key.
    for (const id of ["rune", "iron", "bronze"]) {
      threshold += keyDrops[id] ?? 0;
      if (roll < threshold) return id;
    }
    return null;
  }

  function rollSupplyChest(tier) {
    const table = tableForTier(tier);
    const rewards = { materials: {}, keys: {} };
    addReward(rewards.materials, "supplies", randomInt(table.supplies[0], table.supplies[1]));
    for (let index = 0; index < table.rolls; index += 1) {
      const drop = rollWeightedDrop(table.drops);
      if (drop?.id) addReward(rewards.materials, drop.id, randomInt(drop.min, drop.max));
    }
    const keyDrop = rollKeyDrop(table.keyDrops);
    if (keyDrop) addReward(rewards.keys, keyDrop, 1);
    return rewards;
  }

  function keyPreviewText(tier) {
    const table = tableForTier(tier);
    return keyOrder
      .map((id) => `${keyNames[id]} ${formatPercent(table.keyDrops[id] ?? 0)}`)
      .join(", ");
  }

  function chestPreviewText(tier) {
    const table = tableForTier(tier);
    return `Chest: ${formatAmount(table.supplies[0])}-${formatAmount(table.supplies[1])} Supplies + ${table.materialText}. Key chance: ${keyPreviewText(tier)}`;
  }

  function normalizeChest(chest) {
    if (!chest) return null;
    if (chest.materials || chest.keys) {
      return {
        materials: { ...(chest.materials ?? {}) },
        keys: { ...(chest.keys ?? {}) }
      };
    }

    const materials = {};
    // Older chests were saved as flat material maps; keep them readable and reversible.
    for (const [id, amount] of Object.entries(chest)) {
      if (id in materialNames) materials[id] = amount;
    }
    return { materials, keys: {} };
  }

  function formatChestReward(chest) {
    const normalized = normalizeChest(chest);
    const entries = [
      ...Object.entries(normalized?.materials ?? {})
        .filter(([, amount]) => amount > 0)
        .map(([id, amount]) => `+${formatAmount(amount)} ${materialNames[id] ?? id}`),
      ...Object.entries(normalized?.keys ?? {})
        .filter(([, amount]) => amount > 0)
        .map(([id, amount]) => `+${formatAmount(amount)} ${keyNames[id] ?? id}`)
    ];
    return entries.length
      ? entries.join(", ")
      : "";
  }

  function chestForCompleted(completed) {
    if (!completed) return null;
    if (completed.supplyChest) return normalizeChest(completed.supplyChest);
    const supplies = legacySupplyByTier[completed.tier] ?? legacySupplyByTier.bronze;
    return { materials: { supplies }, keys: {} };
  }

  function applyChestRewards(chest, direction) {
    if (typeof state === "undefined") return;
    const normalized = normalizeChest(chest);
    if (!normalized) return;

    if (state.township?.materials) {
      for (const [id, amount] of Object.entries(normalized.materials ?? {})) {
        if (!(id in state.township.materials) || amount <= 0) continue;
        state.township.materials[id] = Math.max(0, (state.township.materials[id] ?? 0) + amount * direction);
      }
    }

    if (state.keys) {
      for (const [id, amount] of Object.entries(normalized.keys ?? {})) {
        if (!(id in state.keys) || amount <= 0) continue;
        state.keys[id] = Math.max(0, (state.keys[id] ?? 0) + amount * direction);
      }
    }
  }

  function decorateDungeonRewards() {
    document.querySelectorAll("#keyInventory span").forEach((span) => {
      if (span.textContent.trim() === "Rune Keys") span.textContent = "Gold Keys";
    });

    document.querySelectorAll("#dungeonSelection [data-enter-dungeon]").forEach((button) => {
      if (typeof dungeonById !== "function") return;
      const dungeon = dungeonById(button.dataset.enterDungeon);
      const card = button.closest(".dungeon-card");
      if (!dungeon || !card || card.querySelector(".supply-chest-note")) return;
      const note = document.createElement("div");
      note.className = "dungeon-detail supply-chest-note";
      note.textContent = chestPreviewText(dungeon.tier);
      card.insertBefore(note, button);
    });

    if (typeof state !== "undefined" && state.activeDungeon && typeof dungeonById === "function" && typeof activeDungeon !== "undefined") {
      const dungeon = dungeonById(state.activeDungeon.dungeonId);
      const card = activeDungeon.querySelector(".active-dungeon-card");
      if (dungeon && card && !card.querySelector(".supply-chest-note")) {
        const note = document.createElement("div");
        note.className = "dungeon-detail supply-chest-note";
        note.textContent = `${chestPreviewText(dungeon.tier)} when cleared`;
        card.appendChild(note);
      }
    }

    if (typeof state !== "undefined" && typeof dungeonHistory !== "undefined") Array.from(dungeonHistory.children).forEach((item, index) => {
      const entry = state.dungeonHistory[index];
      const chestText = formatChestReward(chestForCompleted(entry));
      if (!entry || !chestText || item.querySelector(".supply-chest-note")) return;
      const note = document.createElement("div");
      note.className = "dungeon-note supply-chest-note";
      note.textContent = `Chest: ${chestText}`;
      item.firstElementChild?.appendChild(note);
    });

    if (typeof state !== "undefined" && typeof workoutLog !== "undefined") Array.from(workoutLog.children).forEach((item, index) => {
      const entry = state.log[index];
      const chestText = formatChestReward(chestForCompleted(entry?.dungeonCompleted));
      if (!entry?.dungeonCompleted || !chestText || item.querySelector(".supply-chest-note")) return;
      const note = document.createElement("div");
      note.className = "dungeon-note supply-chest-note";
      note.textContent = `Chest: ${chestText}`;
      item.firstElementChild?.appendChild(note);
    });
  }

  function patchDungeonSystems() {
    if (typeof tierNames !== "undefined") tierNames.rune = "Gold";
    if (typeof keyShopItems !== "undefined") {
      const runeKey = keyShopItems.find((item) => item.id === "rune");
      if (runeKey) runeKey.name = "Gold Key";
    }

    if (typeof progressActiveDungeon === "function" && !progressActiveDungeon.__supplyChestPatch) {
      const baseProgressActiveDungeon = progressActiveDungeon;
      progressActiveDungeon = function (selected, amount) {
        const result = baseProgressActiveDungeon(selected, amount);
        if (result?.completed && !result.completed.supplyChest) {
          // Attach the exact rolled chest to the completion record so history and deletes match.
          const chest = rollSupplyChest(result.completed.tier);
          result.completed.supplyChest = chest;
          applyChestRewards(chest, 1);
        }
        return result;
      };
      progressActiveDungeon.__supplyChestPatch = true;
    }

    if (typeof deleteWorkout === "function" && !deleteWorkout.__supplyChestPatch) {
      const baseDeleteWorkout = deleteWorkout;
      deleteWorkout = function (index) {
        const entry = state.log[index];
        const chest = chestForCompleted(entry?.dungeonCompleted);
        baseDeleteWorkout(index);
        if (entry && !state.log.includes(entry) && chest) {
          applyChestRewards(chest, -1);
          if (typeof saveState === "function") saveState();
          if (typeof render === "function") render();
        }
      };
      deleteWorkout.__supplyChestPatch = true;
    }

    if (typeof render === "function" && !render.__supplyChestPatch) {
      const baseRender = render;
      render = function () {
        baseRender();
        decorateDungeonRewards();
      };
      render.__supplyChestPatch = true;
      render();
    } else {
      decorateDungeonRewards();
    }
  }

  patchDungeonSystems();
  let passes = 0;
  // The Township engine loads asynchronously, so retry patching briefly until its functions exist.
  const timer = window.setInterval(() => {
    patchDungeonSystems();
    passes += 1;
    if (passes >= 12) window.clearInterval(timer);
  }, 500);
})();
