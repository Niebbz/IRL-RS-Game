(function () {
  if (typeof townshipBuildings !== "undefined") return;

  const mats = ["timber", "stone", "iron", "supplies"];
  const matNames = { timber: "Timber", stone: "Stone", iron: "Iron", supplies: "Supplies" };
  const emptyMats = { timber: 0, stone: 0, iron: 0, supplies: 0 };
  const starterMats = { timber: 10, stone: 5, iron: 2, supplies: 5 };
  const imgBase = "level-forge-building-icons-transparent-fixed/";
  const dungeonMats = {
    attack: { bronze: { timber: 6, supplies: 2 }, iron: { timber: 18, supplies: 6 }, rune: { timber: 36, supplies: 12 } },
    strength: { bronze: { stone: 5, timber: 2 }, iron: { stone: 15, timber: 6 }, rune: { stone: 30, timber: 12 } },
    defense: { bronze: { iron: 3, stone: 3 }, iron: { iron: 9, stone: 9 }, rune: { iron: 18, stone: 18 } },
    agility: { bronze: { supplies: 6, timber: 2 }, iron: { supplies: 18, timber: 6 }, rune: { supplies: 36, timber: 12 } }
  };
  const buildings = [
    ["storehouse", "Storehouse", 1, "Frontier Camp", "Unlocks Storehouse inventory and dungeon material rewards.", 300, {}, { strength: 120, agility: 5 }],
    ["palisade", "Palisade", 1, "Frontier Camp", "Reinforces the first settlement boundary.", 400, { timber: 12, stone: 6 }, { strength: 60, defense: 120 }],
    ["trade-post", "Trade Post", 1, "Frontier Camp", "Secures trade roads and supply routes.", 500, { timber: 10, supplies: 8 }, { attack: 60, agility: 10 }],
    ["blacksmith", "Blacksmith", 1, "Frontier Camp", "Turns raw work into stronger town infrastructure.", 750, { timber: 6, stone: 12, iron: 8 }, { strength: 180, agility: 8, discipline: 5 }],
    ["watchtower", "Watchtower", 2, "Fortified Village", "Improves scouting routes and settlement oversight.", 1000, { timber: 18, stone: 12, supplies: 8 }, { strength: 120, defense: 180, agility: 8 }],
    ["barracks", "Barracks", 2, "Fortified Village", "Builds the town's training core.", 1250, { timber: 24, stone: 14, iron: 8 }, { attack: 240, defense: 180, discipline: 5 }],
    ["stables", "Stables", 2, "Fortified Village", "Supports hauling, route work, and town movement.", 1500, { timber: 20, stone: 6, supplies: 16 }, { strength: 120, agility: 20, discipline: 5 }],
    ["marketplace", "Marketplace", 2, "Fortified Village", "Brings the settlement economy together.", 1750, { timber: 24, stone: 10, iron: 6, supplies: 18 }, { attack: 120, strength: 120, agility: 15, discipline: 6 }],
    ["stone-walls", "Stone Walls", 3, "Forgehold", "Locks in the foundation for a permanent town.", 2500, { timber: 16, stone: 40, iron: 18 }, { strength: 360, defense: 360, discipline: 8 }],
    ["guild-hall", "Guild Hall", 3, "Forgehold", "Coordinates every training path in the settlement.", 3000, { timber: 32, stone: 28, iron: 14, supplies: 18 }, { attack: 180, strength: 180, defense: 180, agility: 15, discipline: 10 }],
    ["cartographers-lodge", "Cartographer's Lodge", 3, "Forgehold", "Maps new routes for supply runs and expansion.", 3500, { timber: 28, stone: 12, iron: 6, supplies: 24 }, { attack: 180, strength: 120, agility: 30, discipline: 10 }],
    ["town-hall", "Town Hall", 3, "Forgehold", "Completes the first full Forgehold buildout.", 5000, { timber: 50, stone: 45, iron: 24, supplies: 30 }, { attack: 240, strength: 240, defense: 240, agility: 25, discipline: 15 }]
  ].map(([id, name, stage, stageName, role, gold, materials, workouts]) => ({
    id,
    name,
    stage,
    stageName,
    role,
    image: `${imgBase}building-${id}.png`,
    funding: { gold, materials },
    workouts
  }));
  const startTown = { materials: { ...emptyMats }, activeProjectId: null, fundedProjects: {}, projectProgress: {}, completedBuildings: {}, storehouseStarterGranted: false, history: [] };
  const q = (selector) => document.querySelector(selector);
  const townshipSummary = q("#townshipSummary");
  const storehouseInventory = q("#storehouseInventory");
  const activeTownshipProject = q("#activeTownshipProject");
  const townshipBuildingsList = q("#townshipBuildings");
  const townshipHistory = q("#townshipHistory");
  const emptyTownshipHistory = q("#emptyTownshipHistory");

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function savedTown() {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem("irl-rs-game-state-v1");
      return saved ? JSON.parse(saved).township : null;
    } catch {
      return null;
    }
  }

  function migrateMaterials(saved) {
    const out = { ...emptyMats };
    for (const [id, value] of Object.entries(saved ?? {})) {
      if (id in out && Number.isFinite(value)) out[id] = value;
    }
    return out;
  }

  function migrateSkills(saved) {
    const out = {};
    for (const [id, value] of Object.entries(saved ?? {})) {
      const skillId = normalizeSkillId(id);
      if (skills.some((skill) => skill.id === skillId) && Number.isFinite(value)) out[skillId] = value;
    }
    return out;
  }

  function migrateFlags(saved) {
    const out = {};
    if (Array.isArray(saved)) {
      for (const id of saved) if (typeof id === "string") out[id] = true;
      return out;
    }
    for (const [id, value] of Object.entries(saved ?? {})) out[id] = value;
    return out;
  }

  function migrateProgress(saved) {
    const out = {};
    for (const [id, value] of Object.entries(saved ?? {})) out[id] = migrateSkills(value);
    return out;
  }

  function migrateTown(saved) {
    if (!saved) return clone(startTown);
    return {
      materials: migrateMaterials(saved.materials),
      activeProjectId: saved.activeProjectId ?? saved.activeProject ?? null,
      fundedProjects: migrateFlags(saved.fundedProjects),
      projectProgress: migrateProgress(saved.projectProgress),
      completedBuildings: migrateFlags(saved.completedBuildings),
      storehouseStarterGranted: Boolean(saved.storehouseStarterGranted),
      history: Array.isArray(saved.history) ? saved.history : []
    };
  }

  state.township = migrateTown(state.township ?? savedTown());

  function building(id) {
    return buildings.find((item) => item.id === id);
  }

  function built(id) {
    return Boolean(state.township.completedBuildings[id]);
  }

  function storehouseBuilt() {
    return built("storehouse");
  }

  function prev(buildingItem) {
    const index = buildings.findIndex((item) => item.id === buildingItem.id);
    return index > 0 ? buildings[index - 1] : null;
  }

  function unlocked(buildingItem) {
    const previous = prev(buildingItem);
    return buildingItem.id === "storehouse" || !previous || built(previous.id);
  }

  function funded(id) {
    return Boolean(state.township.fundedProjects[id]);
  }

  function progress(id) {
    if (!state.township.projectProgress[id]) state.township.projectProgress[id] = {};
    return state.township.projectProgress[id];
  }

  function matEntries(materials) {
    return mats.map((id) => [id, materials?.[id] ?? 0]).filter(([, amount]) => amount > 0);
  }

  function fmtMats(materials, emptyText = "None") {
    const entries = matEntries(materials);
    return entries.length ? entries.map(([id, amount]) => `${formatNumber(amount)} ${matNames[id]}`).join(", ") : emptyText;
  }

  function addMats(materials) {
    for (const [id, amount] of Object.entries(materials ?? {})) {
      if (id in state.township.materials) state.township.materials[id] += amount;
    }
  }

  function subMats(materials) {
    for (const [id, amount] of Object.entries(materials ?? {})) {
      if (id in state.township.materials) state.township.materials[id] = Math.max(0, state.township.materials[id] - amount);
    }
  }

  function canFund(buildingItem) {
    return state.gold >= buildingItem.funding.gold && matEntries(buildingItem.funding.materials).every(([id, amount]) => (state.township.materials[id] ?? 0) >= amount);
  }

  function dungeonReward(dungeon) {
    return storehouseBuilt() ? dungeonMats[dungeon.skillId]?.[dungeon.tier] ?? {} : {};
  }

  function reqText(skillId, amount) {
    const unit = skillId === "discipline" ? "workouts" : unitForSkillPlural(skillId);
    return `${skillById(skillId)?.name ?? skillId}: ${formatAmount(amount)} ${unit}`;
  }

  function completeProject(buildingItem) {
    const completedAt = new Date().toISOString();
    const starter = buildingItem.id === "storehouse" && !state.township.storehouseStarterGranted ? { ...starterMats } : {};
    if (matEntries(starter).length) {
      addMats(starter);
      state.township.storehouseStarterGranted = true;
    }
    state.township.completedBuildings[buildingItem.id] = completedAt;
    state.township.activeProjectId = null;
    const record = { buildingId: buildingItem.id, buildingName: buildingItem.name, stageName: buildingItem.stageName, completedAt, starterMaterials: starter };
    state.township.history.unshift(record);
    state.township.history = state.township.history.slice(0, 50);
    return record;
  }

  function projectDone(buildingItem) {
    const itemProgress = progress(buildingItem.id);
    return Object.entries(buildingItem.workouts).every(([skillId, needed]) => (itemProgress[skillId] ?? 0) >= needed);
  }

  function progressTownship(selected, amount) {
    const id = state.township.activeProjectId;
    const buildingItem = building(id);
    if (!buildingItem || built(id)) return null;
    const itemProgress = progress(id);
    const contributions = {};
    if (buildingItem.workouts[selected.skillId]) {
      const remaining = Math.max(0, buildingItem.workouts[selected.skillId] - (itemProgress[selected.skillId] ?? 0));
      const add = Math.min(amount, remaining);
      if (add > 0) {
        itemProgress[selected.skillId] = (itemProgress[selected.skillId] ?? 0) + add;
        contributions[selected.skillId] = add;
      }
    }
    if (buildingItem.workouts.discipline) {
      const remaining = Math.max(0, buildingItem.workouts.discipline - (itemProgress.discipline ?? 0));
      const add = Math.min(1, remaining);
      if (add > 0) {
        itemProgress.discipline = (itemProgress.discipline ?? 0) + add;
        contributions.discipline = add;
      }
    }
    if (!Object.keys(contributions).length) return null;
    const result = { buildingId: id, buildingName: buildingItem.name, contributions, completedBuilding: null };
    if (projectDone(buildingItem)) result.completedBuilding = completeProject(buildingItem);
    return result;
  }

  function reverseTownship(entry) {
    const contribution = entry.townshipContribution;
    if (!contribution || contribution.completedBuilding || built(contribution.buildingId)) return;
    const itemProgress = progress(contribution.buildingId);
    for (const [skillId, amount] of Object.entries(contribution.contributions ?? {})) {
      itemProgress[skillId] = Math.max(0, (itemProgress[skillId] ?? 0) - amount);
    }
  }

  const baseProgressActiveDungeon = progressActiveDungeon;
  progressActiveDungeon = function (selected, amount) {
    const result = baseProgressActiveDungeon(selected, amount);
    if (result.completed) {
      const materials = dungeonReward(dungeonById(result.completed.dungeonId));
      addMats(materials);
      result.completed.materialRewards = materials;
    }
    return result;
  };

  function renderTownshipSummary() {
    const next = buildings.find((item) => !built(item.id));
    const stage = buildings.reduce((highest, item) => built(item.id) ? Math.max(highest, item.stage) : highest, 1);
    townshipSummary.innerHTML = `<div class="township-summary-grid">
      <div><span>Stage</span><strong>${buildings.find((item) => item.stage === stage)?.stageName ?? "Frontier Camp"}</strong></div>
      <div><span>Buildings</span><strong>${buildings.filter((item) => built(item.id)).length} / ${buildings.length}</strong></div>
      <div><span>Gold</span><strong>${formatNumber(state.gold)}</strong></div>
      <div><span>Inventory</span><strong>${storehouseBuilt() ? "Storehouse online" : "Storehouse needed"}</strong></div>
      <div><span>Next</span><strong>${next?.name ?? "Complete"}</strong></div>
    </div>`;
  }

  function renderStorehouse() {
    storehouseInventory.innerHTML = storehouseBuilt()
      ? `<div class="material-grid">${mats.map((id) => `<div class="material-card"><span>${matNames[id]}</span><strong>${formatNumber(state.township.materials[id] ?? 0)}</strong></div>`).join("")}</div>`
      : `<div class="empty-state">Build the Storehouse to unlock materials.</div>`;
  }

  function renderActiveProject() {
    const item = building(state.township.activeProjectId);
    if (!item || built(item.id)) {
      activeTownshipProject.innerHTML = `<div class="empty-state">No active project.</div>`;
      return;
    }
    const itemProgress = progress(item.id);
    activeTownshipProject.innerHTML = `<article class="township-project-card">
      <div class="building-heading"><img class="building-image" src="${item.image}" alt="${item.name}"><div><div class="building-name">${item.name}</div><div class="building-stage">${item.stageName}</div><div class="building-role">${item.role}</div></div></div>
      <div class="project-progress-list">${Object.entries(item.workouts).map(([skillId, needed]) => {
        const current = Math.min(itemProgress[skillId] ?? 0, needed);
        const pct = needed ? Math.min(100, current / needed * 100) : 100;
        return `<div class="project-progress-row"><div><strong>${skillById(skillId)?.name ?? skillId}</strong><span>${formatAmount(current)} / ${formatAmount(needed)} ${skillId === "discipline" ? "workouts" : unitForSkillPlural(skillId)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${skillById(skillId)?.color ?? "#35d19f"}"></div></div></div>`;
      }).join("")}</div>
      <button class="secondary-button" type="button" id="pauseTownshipProjectButton">Pause</button>
    </article>`;
  }

  function statusText(item) {
    if (built(item.id)) return "Completed";
    if (state.township.activeProjectId === item.id) return "Active";
    if (state.township.activeProjectId) return "Another project is active";
    if (!unlocked(item)) return `Locked until ${prev(item)?.name}`;
    if (funded(item.id)) return "Funded";
    if (!canFund(item)) return "Needs gold or materials";
    return "Ready";
  }

  function renderBuildings() {
    townshipBuildingsList.innerHTML = "";
    for (const stage of [1, 2, 3]) {
      const stageBuildings = buildings.filter((item) => item.stage === stage);
      const group = document.createElement("section");
      group.className = "building-stage-group";
      group.innerHTML = `<div class="dungeon-group-heading"><h3>${stageBuildings[0].stageName}</h3><span>Stage ${stage}</span></div><div class="building-grid"></div>`;
      const grid = group.querySelector(".building-grid");
      for (const item of stageBuildings) {
        const itemProgress = progress(item.id);
        const canStart = !built(item.id) && state.township.activeProjectId !== item.id && !state.township.activeProjectId && unlocked(item) && (funded(item.id) || canFund(item));
        const card = document.createElement("article");
        card.className = `building-card ${built(item.id) ? "completed" : ""} ${unlocked(item) ? "" : "locked"}`;
        card.innerHTML = `<div class="building-heading"><img class="building-image" src="${item.image}" alt="${item.name}"><div><div class="building-name">${item.name}</div><div class="building-stage">${item.stageName}</div></div></div>
          <div class="building-role">${item.role}</div>
          <div class="building-costs"><div><span>Gold</span><strong>${formatNumber(item.funding.gold)}</strong></div><div><span>Materials</span><strong>${fmtMats(item.funding.materials)}</strong></div></div>
          <div class="requirement-list">${Object.entries(item.workouts).map(([skillId, needed]) => `<div><span>${reqText(skillId, needed)}</span><strong>${formatAmount(Math.min(itemProgress[skillId] ?? 0, needed))} / ${formatAmount(needed)}</strong></div>`).join("")}</div>
          <button class="secondary-button" type="button" data-start-building="${item.id}" ${canStart ? "" : "disabled"}>${built(item.id) ? "Completed" : state.township.activeProjectId === item.id ? "Active" : funded(item.id) ? "Resume" : "Fund and Start"}</button>
          <div class="building-status">${statusText(item)}</div>`;
        grid.appendChild(card);
      }
      townshipBuildingsList.appendChild(group);
    }
  }

  function renderTownshipHistory() {
    townshipHistory.innerHTML = "";
    emptyTownshipHistory.hidden = state.township.history.length > 0;
    for (const entry of state.township.history.slice(0, 30)) {
      const item = building(entry.buildingId);
      const stockpile = matEntries(entry.starterMaterials).length ? `<div class="dungeon-note">Storehouse stockpile: ${fmtMats(entry.starterMaterials)}</div>` : "";
      const row = document.createElement("li");
      row.innerHTML = `<div><div class="log-title">${entry.buildingName}</div><div class="log-meta">${entry.stageName}</div><div class="log-date">Completed ${formatLoggedDate(entry.completedAt)}</div>${stockpile}</div><img class="history-building-image" src="${item?.image ?? ""}" alt="${entry.buildingName}">`;
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

  renderLog = function () {
    workoutLog.innerHTML = "";
    emptyLog.hidden = state.log.length > 0;
    for (const [index, entry] of state.log.entries()) {
      const materials = entry.dungeonCompleted?.materialRewards;
      const item = document.createElement("li");
      const dungeonText = entry.dungeonCompleted ? `<div class="dungeon-note">Dungeon Cleared: ${entry.dungeonCompleted.dungeonName}<br>+${formatNumber(entry.dungeonCompleted.bonusXP)} bonus ${entry.dungeonCompleted.skillName} XP${matEntries(materials).length ? `<br>Materials: ${fmtMats(materials)}` : ""}</div>` : "";
      const townText = entry.townshipContribution ? `<div class="township-note">Township: ${Object.entries(entry.townshipContribution.contributions ?? {}).map(([skillId, value]) => reqText(skillId, value)).join(", ")} toward ${entry.townshipContribution.buildingName}${entry.townshipContribution.completedBuilding ? `<br>Building Completed: ${entry.townshipContribution.completedBuilding.buildingName}` : ""}</div>` : "";
      item.innerHTML = `<div>
        <div class="log-title">${entry.title}</div><div class="log-meta">${entry.detail}</div><div class="log-date">${formatLoggedDate(entry.createdAt)}</div>
        ${Number.isFinite(entry.goldEarned) ? `<div class="gold-drop">+${formatNumber(entry.goldEarned)} gold</div>` : ""}
        ${entry.dungeonContribution ? `<div class="dungeon-note">+${formatAmount(entry.dungeonContribution.amount)} ${entry.dungeonContribution.unit} toward ${entry.dungeonContribution.dungeonName}</div>` : ""}
        ${dungeonText}${townText}${entry.petDrops?.length ? `<div class="pet-drop">Pet drop: ${entry.petDrops.join(", ")}</div>` : ""}
      </div><div class="log-actions"><div class="log-xp">+${formatNumber(entry.mainXP)} ${entry.skillName}<br>+${formatNumber(entry.disciplineXP ?? 50)} Discipline</div><button class="delete-workout-button" type="button" data-log-index="${index}">Delete</button></div>`;
      workoutLog.appendChild(item);
    }
  };

  workoutForm.removeEventListener("submit", addWorkout);
  addWorkout = function (event) {
    event.preventDefault();
    const selected = workoutMap[workoutType.value];
    const amount = normalizeAmount(selected, amountInput.value);
    if (amount <= 0) return;
    amountInput.value = amount;
    const skill = skillById(selected.skillId);
    const mainXP = xpForWorkout(selected, amount);
    const disciplineXP = disciplineXPForWorkout();
    const goldEarned = goldForWorkout(selected, amount);
    const dungeonResult = progressActiveDungeon(selected, amount);
    const townshipResult = progressTownship(selected, amount);
    const petDrops = [];
    const mainPet = rollPet(selected.skillId, amount);
    const disciplinePet = rollPet("discipline", amount);
    if (mainPet) petDrops.push(mainPet.petName);
    if (disciplinePet) petDrops.push(disciplinePet.petName);
    state.xp[selected.skillId] += mainXP;
    state.xp.discipline += disciplineXP;
    state.gold += goldEarned;
    state.log.unshift({
      title: selected.label,
      detail: selected.unit === "Miles" ? `${amount.toLocaleString()} miles` : `${amount.toLocaleString()} minutes`,
      skillId: selected.skillId,
      skillName: skill.name,
      mainXP,
      disciplineXP,
      goldEarned,
      mainPetRolls: amount,
      disciplinePetRolls: amount,
      dungeonContribution: dungeonResult.contribution ?? null,
      dungeonCompleted: dungeonResult.completed ?? null,
      townshipContribution: townshipResult,
      petDrops,
      createdAt: new Date().toISOString()
    });
    state.log = state.log.slice(0, 50);
    saveState();
    render();
    if (dungeonResult.completed) {
      const foundMats = fmtMats(dungeonResult.completed.materialRewards, "");
      window.alert(`Dungeon cleared: ${dungeonResult.completed.dungeonName}! +${formatNumber(dungeonResult.completed.bonusXP)} ${dungeonResult.completed.skillName} XP${foundMats ? `\nMaterials: ${foundMats}` : ""}`);
    }
    if (townshipResult?.completedBuilding) {
      const stockpile = fmtMats(townshipResult.completedBuilding.starterMaterials, "");
      window.alert(`Building completed: ${townshipResult.completedBuilding.buildingName}!${stockpile ? `\nStorehouse stockpile: ${stockpile}` : ""}`);
    }
    if (petDrops.length) window.alert(`Pet drop: ${petDrops.join(", ")}!`);
  };
  workoutForm.addEventListener("submit", addWorkout);

  deleteWorkout = function (index) {
    const entry = state.log[index];
    if (!entry || !window.confirm(`Delete ${entry.title} from ${formatLoggedDate(entry.createdAt)}?`)) return;
    const skillId = skillIdForEntry(entry);
    if (skillId) state.xp[skillId] = Math.max(0, (state.xp[skillId] ?? 0) - (entry.mainXP ?? 0));
    state.xp.discipline = Math.max(0, (state.xp.discipline ?? 0) - (entry.disciplineXP ?? 50));
    state.gold = Math.max(0, (state.gold ?? 0) - (entry.goldEarned ?? 0));
    reverseTownship(entry);
    if (!entry.dungeonCompleted && entry.dungeonContribution && state.activeDungeon?.dungeonId === entry.dungeonContribution.dungeonId) {
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
  };

  resetButton.removeEventListener("click", resetProgress);
  resetProgress = function () {
    if (!window.confirm("Reset all XP, pets, gold, keys, dungeons, Township, and workout history?")) return;
    state.xp = { ...startingState.xp };
    state.pets = { ...startingState.pets };
    state.gold = 0;
    state.keys = { ...startingState.keys };
    state.activeDungeon = null;
    state.dungeonClears = {};
    state.dungeonHistory = [];
    state.township = clone(startTown);
    state.log = [];
    saveState();
    render();
  };
  resetButton.addEventListener("click", resetProgress);

  function startProject(id) {
    const item = building(id);
    if (!item || built(item.id)) return;
    if (!unlocked(item)) return window.alert(`${prev(item)?.name ?? "Previous building"} must be completed first.`);
    if (state.township.activeProjectId && state.township.activeProjectId !== item.id) return window.alert("Pause the active project before starting another one.");
    if (!funded(item.id)) {
      if (!canFund(item)) return window.alert("Not enough gold or materials for this building.");
      state.gold -= item.funding.gold;
      subMats(item.funding.materials);
      state.township.fundedProjects[item.id] = true;
      progress(item.id);
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

  const baseRender = render;
  render = function () {
    baseRender();
    renderTownship();
  };

  saveState();
  render();
})();
