(function () {
  if (typeof townshipBuildingsList === "undefined" || !townshipBuildingsList) return;

  function missingTownshipFundingText(building) {
    const missing = [];
    const goldNeeded = Math.max(0, (building.funding.gold ?? 0) - (state.gold ?? 0));
    if (goldNeeded > 0) missing.push(`${formatNumber(goldNeeded)} more gold`);

    for (const [materialId, amount] of materialEntries(building.funding.materials)) {
      const current = state.township.materials[materialId] ?? 0;
      const needed = Math.max(0, amount - current);
      if (needed > 0) missing.push(`${formatNumber(needed)} ${materialNames[materialId] ?? materialId}`);
    }

    return missing.length ? `Need ${missing.join(", ")}` : "Ready";
  }

  buildingStatusText = function (building) {
    if (isBuildingCompleted(building.id)) return "Completed";
    if (state.township.activeProjectId === building.id) return "Active";
    if (state.township.activeProjectId) return "Another project is active";
    if (!isBuildingUnlocked(building)) return `Locked until ${previousBuilding(building)?.name}`;
    if (isProjectFunded(building.id)) return "Funded";
    if (!canAffordTownshipFunding(building)) return missingTownshipFundingText(building);
    return "Ready";
  };

  buildingButtonText = function (building) {
    if (isBuildingCompleted(building.id)) return "Completed";
    if (state.township.activeProjectId === building.id) return "Active";
    if (isProjectFunded(building.id)) return "Resume";
    if (!canAffordTownshipFunding(building)) return "View Cost";
    return "Fund and Start";
  };

  renderStorehouseInventory = function () {
    if (!isStorehouseBuilt()) {
      storehouseInventory.innerHTML = `<div class="empty-state">Build the Storehouse to unlock materials. Starter stockpile: ${formatMaterials(storehouseStarterMaterials)}.</div>`;
      return;
    }

    storehouseInventory.innerHTML = `
      <div class="material-grid">
        ${materialOrder.map((materialId) => `
          <div class="material-card">
            <span>${materialNames[materialId]}</span>
            <strong>${formatNumber(state.township.materials[materialId] ?? 0)}</strong>
          </div>
        `).join("")}
      </div>
    `;
  };

  renderActiveTownshipProject = function () {
    const building = buildingById(state.township.activeProjectId);
    if (!building || isBuildingCompleted(building.id)) {
      activeTownshipProject.innerHTML = `<div class="empty-state">No active project. Choose a building below to fund and start.</div>`;
      return;
    }

    activeTownshipProject.innerHTML = `
      <article class="township-project-card">
        <div class="building-heading">
          <img class="building-image" src="${building.image}" alt="${building.name}">
          <div>
            <div class="building-name">${building.name}</div>
            <div class="building-stage">${building.stageName}</div>
            <div class="building-role">${building.role}</div>
          </div>
        </div>
        <div class="project-progress-list">
          ${Object.entries(building.workouts).map(([skillId, required]) => {
            const progress = ensureProjectProgress(building.id);
            const current = Math.min(progress[skillId] ?? 0, required);
            const percent = projectProgressPercent(building, skillId) * 100;
            return `
              <div class="project-progress-row">
                <div>
                  <strong>${skillById(skillId)?.name ?? skillId}</strong>
                  <span>${formatAmount(current)} / ${formatAmount(required)} ${skillId === "discipline" ? "workouts" : unitForSkillPlural(skillId)}</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="width: ${percent}%; background: ${skillById(skillId)?.color ?? "#35d19f"}"></div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
        <button class="secondary-button" type="button" id="pauseTownshipProjectButton">Pause</button>
      </article>
    `;
  };

  renderTownshipBuildings = function () {
    townshipBuildingsList.innerHTML = "";

    for (const stage of [1, 2, 3]) {
      const stageBuildings = townshipBuildings.filter((building) => building.stage === stage);
      const group = document.createElement("section");
      group.className = "building-stage-group";
      group.innerHTML = `
        <div class="dungeon-group-heading">
          <h3>${stageBuildings[0].stageName}</h3>
          <span>Stage ${stage}</span>
        </div>
        <div class="building-grid"></div>
      `;

      const grid = group.querySelector(".building-grid");
      for (const building of stageBuildings) {
        const completed = isBuildingCompleted(building.id);
        const active = state.township.activeProjectId === building.id;
        const unlocked = isBuildingUnlocked(building);
        const canClick = !completed && !active && !state.township.activeProjectId && unlocked;
        const progress = ensureProjectProgress(building.id);
        const card = document.createElement("article");
        card.className = `building-card ${completed ? "completed" : ""} ${unlocked ? "" : "locked"}`;
        card.innerHTML = `
          <div class="building-heading">
            <img class="building-image" src="${building.image}" alt="${building.name}">
            <div>
              <div class="building-name">${building.name}</div>
              <div class="building-stage">${building.stageName}</div>
            </div>
          </div>
          <div class="building-role">${building.role}</div>
          <div class="building-costs">
            <div><span>Gold</span><strong>${formatNumber(building.funding.gold)}</strong></div>
            <div><span>Materials</span><strong>${formatMaterials(building.funding.materials)}</strong></div>
          </div>
          <div class="requirement-list">
            ${Object.entries(building.workouts).map(([skillId, required]) => `
              <div>
                <span>${workoutRequirementText(skillId, required)}</span>
                <strong>${formatAmount(Math.min(progress[skillId] ?? 0, required))} / ${formatAmount(required)}</strong>
              </div>
            `).join("")}
          </div>
          <button class="secondary-button" type="button" data-start-building="${building.id}" ${canClick ? "" : "disabled"}>${buildingButtonText(building)}</button>
          <div class="building-status">${buildingStatusText(building)}</div>
        `;
        grid.appendChild(card);
      }

      townshipBuildingsList.appendChild(group);
    }
  };

  startTownshipProject = function (buildingId) {
    const building = buildingById(buildingId);
    if (!building || isBuildingCompleted(building.id)) return;

    if (!isBuildingUnlocked(building)) {
      window.alert(`${previousBuilding(building)?.name ?? "Previous building"} must be completed first.`);
      return;
    }

    if (state.township.activeProjectId && state.township.activeProjectId !== building.id) {
      window.alert("Pause the active project before starting another one.");
      return;
    }

    if (!isProjectFunded(building.id)) {
      if (!canAffordTownshipFunding(building)) {
        window.alert(`${missingTownshipFundingText(building)} to fund ${building.name}.`);
        return;
      }

      state.gold -= building.funding.gold;
      subtractMaterials(building.funding.materials);
      state.township.fundedProjects[building.id] = true;
      ensureProjectProgress(building.id);
    }

    state.township.activeProjectId = building.id;
    saveState();
    render();
  };

  townshipBuildingsList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-start-building]");
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    startTownshipProject(button.dataset.startBuilding);
  }, true);

  render();
})();
