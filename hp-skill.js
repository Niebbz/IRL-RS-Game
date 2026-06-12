(function () {
  if (typeof skills === "undefined" || typeof workoutMap === "undefined" || typeof state === "undefined") return;

  const hpSkill = {
    id: "hp",
    name: "HP",
    method: "Bodyweight exercises",
    rule: "Push-ups, squats, pull-ups, and planks",
    skillImage: "HP%20Skill%20Icons/hp-skill-symbol.png",
    petImage: "HP%20Skill%20Icons/hp-phoenix-pet.png",
    petName: "Phoenix",
    color: "#d93c2e"
  };
  const hpExerciseIds = ["pushups", "bodyweightSquats", "pullups", "plank"];

  function ensureHPStyles() {
    if (document.querySelector("#hp-skill-styles")) return;

    const style = document.createElement("style");
    style.id = "hp-skill-styles";
    style.textContent = `
      .plank-picker-row {
        display: grid;
        gap: 10px;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 13px;
        background: rgba(16, 20, 27, 0.78);
      }

      .hp-exercise-row {
        display: grid;
        gap: 7px;
      }

      .hp-exercise-row[hidden],
      .plank-picker-row[hidden] {
        display: none;
      }

      .plank-time-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(120px, 1fr));
        gap: 12px;
      }

      .skill-card.hp .skill-icon {
        border-radius: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  ensureHPStyles();

  const existingHpSkill = skills.find((skill) => skill.id === "hp");
  if (existingHpSkill) {
    Object.assign(existingHpSkill, hpSkill);
  } else {
    const disciplineIndex = skills.findIndex((skill) => skill.id === "discipline");
    skills.splice(disciplineIndex >= 0 ? disciplineIndex : skills.length, 0, hpSkill);
  }

  Object.assign(workoutMap, {
    pushups: {
      label: "Push-ups",
      skillId: "hp",
      unit: "Reps",
      unitSingular: "rep",
      xpPerUnit: 2,
      goldPerUnit: 0.2,
      minAmount: 1,
      amountStep: 1,
      defaultAmount: 25
    },
    bodyweightSquats: {
      label: "Bodyweight squats",
      skillId: "hp",
      unit: "Reps",
      unitSingular: "rep",
      xpPerUnit: 2,
      goldPerUnit: 0.2,
      minAmount: 1,
      amountStep: 1,
      defaultAmount: 30
    },
    pullups: {
      label: "Pull-ups",
      skillId: "hp",
      unit: "Reps",
      unitSingular: "rep",
      xpPerUnit: 5,
      goldPerUnit: 0.5,
      minAmount: 1,
      amountStep: 1,
      defaultAmount: 8
    },
    plank: {
      label: "Plank",
      skillId: "hp",
      unit: "Seconds",
      unitSingular: "second",
      xpPerUnit: 1,
      goldPerUnit: 0.1,
      minAmount: 1,
      amountStep: 1,
      defaultAmount: 60,
      inputMode: "duration"
    }
  });

  if (typeof startingState !== "undefined") {
    startingState.xp.hp = 0;
    startingState.pets.hp = false;
  }
  state.xp.hp = Number.isFinite(state.xp.hp) ? state.xp.hp : 0;
  if (!state.pets) state.pets = {};
  if (!("hp" in state.pets)) state.pets.hp = false;
  if (typeof petDropRates !== "undefined") petDropRates.hp = 1 / 30000;

  const hpAmountInput = document.querySelector("#amount");
  const hpWorkoutType = document.querySelector("#workoutType");
  const hpAmountLabel = document.querySelector("#amountLabel");
  const hpMileSliderRow = document.querySelector("#mileSliderRow");
  const hpAmountField = document.querySelector("#amountField") ?? hpAmountInput?.closest("div");

  function ensureHPExercisePicker() {
    let row = document.querySelector("#hpExerciseRow");
    if (row) return row;

    if (!hpWorkoutType) return null;

    row = document.createElement("div");
    row.className = "hp-exercise-row";
    row.id = "hpExerciseRow";
    row.hidden = true;
    row.innerHTML = `
      <label for="hpExercise">HP exercise</label>
      <select id="hpExercise" name="hpExercise">
        <option value="pushups">Push-ups</option>
        <option value="bodyweightSquats">Bodyweight squats</option>
        <option value="pullups">Pull-ups</option>
        <option value="plank">Plank</option>
      </select>
    `;
    hpWorkoutType.insertAdjacentElement("afterend", row);
    return row;
  }

  const hpExerciseRow = ensureHPExercisePicker();
  const hpExerciseSelect = document.querySelector("#hpExercise");

  function ensureWorkoutOptions() {
    if (!hpWorkoutType) return;

    const priorValue = hpWorkoutType.value;
    const exerciseOptions = [
      ["pushups", "Push-ups - HP"],
      ["bodyweightSquats", "Bodyweight squats - HP"],
      ["pullups", "Pull-ups - HP"],
      ["plank", "Plank - HP"]
    ];

    if (hpExerciseIds.includes(priorValue) && hpExerciseSelect) hpExerciseSelect.value = priorValue;

    for (const [value] of exerciseOptions) {
      hpWorkoutType.querySelector(`option[value="${value}"]`)?.remove();
    }

    let hpOption = hpWorkoutType.querySelector('option[value="hp"]');
    if (!hpOption) {
      const option = document.createElement("option");
      option.value = "hp";
      option.textContent = "HP - Bodyweight";
      const runOption = hpWorkoutType.querySelector('option[value="run"]');
      if (runOption) {
        runOption.insertAdjacentElement("afterend", option);
      } else {
        hpWorkoutType.appendChild(option);
      }
      hpOption = option;
    }

    hpOption.textContent = "HP - Bodyweight";
    if (hpExerciseIds.includes(priorValue)) hpWorkoutType.value = "hp";
  }

  function selectedWorkout() {
    if (hpWorkoutType?.value !== "hp") return workoutMap[hpWorkoutType?.value];

    const exercise = workoutMap[hpExerciseSelect?.value] ?? workoutMap.pushups;
    workoutMap.hp = exercise;
    return exercise;
  }

  function ensurePlankPicker() {
    let row = document.querySelector("#plankTimeRow");
    if (row) return row;

    const numberRow = document.querySelector(".number-row");
    if (!numberRow) return null;

    row = document.createElement("div");
    row.className = "plank-picker-row";
    row.id = "plankTimeRow";
    row.hidden = true;
    row.innerHTML = `
      <div class="range-heading">
        <span>Plank time</span>
        <strong id="plankTimeValue">1:00</strong>
      </div>
      <div class="plank-time-grid">
        <div>
          <label for="plankMinutes">Minutes</label>
          <input id="plankMinutes" name="plankMinutes" type="number" min="0" step="1" value="1" inputmode="numeric">
        </div>
        <div>
          <label for="plankSeconds">Seconds</label>
          <input id="plankSeconds" name="plankSeconds" type="number" min="0" max="59" step="1" value="0" inputmode="numeric">
        </div>
      </div>
    `;
    numberRow.insertAdjacentElement("afterend", row);
    return row;
  }

  const hpPlankTimeRow = ensurePlankPicker();
  const hpPlankMinutesInput = document.querySelector("#plankMinutes");
  const hpPlankSecondsInput = document.querySelector("#plankSeconds");
  const hpPlankTimeValue = document.querySelector("#plankTimeValue");

  function isPlankWorkout(selected) {
    return selected?.inputMode === "duration";
  }

  function formatDuration(seconds) {
    const totalSeconds = Math.max(0, Math.round(Number(seconds) || 0));
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  function amountTextForWorkout(selected, amount) {
    if (selected.unit === "Miles") return `${amount.toLocaleString()} miles`;
    if (selected.unit === "Reps") return `${amount.toLocaleString()} reps`;
    if (isPlankWorkout(selected)) return `${formatDuration(amount)} plank`;
    return `${amount.toLocaleString()} minutes`;
  }

  function splitPlankSeconds(amount) {
    const normalized = normalizeAmount(workoutMap.plank, amount);
    return {
      minutes: Math.floor(normalized / 60),
      seconds: normalized % 60
    };
  }

  function amountFromPlankInputs() {
    const minutes = Math.max(0, Math.round(Number(hpPlankMinutesInput?.value) || 0));
    const seconds = Math.max(0, Math.min(59, Math.round(Number(hpPlankSecondsInput?.value) || 0)));
    return normalizeAmount(workoutMap.plank, Math.max(workoutMap.plank.minAmount, minutes * 60 + seconds));
  }

  function syncPlankInputsFromAmount() {
    const selected = selectedWorkout();
    if (!isPlankWorkout(selected) || !hpPlankMinutesInput || !hpPlankSecondsInput || !hpPlankTimeValue) return;

    const amount = normalizeAmount(selected, hpAmountInput.value);
    const { minutes, seconds } = splitPlankSeconds(amount);
    hpPlankMinutesInput.value = minutes;
    hpPlankSecondsInput.value = seconds;
    hpPlankTimeValue.textContent = formatDuration(amount);
  }

  if (typeof renderPets === "function") {
    renderPets = function () {
      petGrid.innerHTML = "";

      for (const skill of skills.filter((item) => item.petName)) {
        const unlocked = state.pets[skill.id];
        const card = document.createElement("article");
        card.className = `pet-card ${unlocked ? "unlocked" : "locked"}`;
        card.dataset.pet = skill.id;
        const petVisual = unlocked
          ? `<img class="asset-icon pet-icon" src="${skill.petImage}" alt="${skill.petName}">`
          : `<div class="pet-placeholder" aria-label="${skill.petName} locked">?</div>`;

        card.innerHTML = `
          ${petVisual}
          <div class="pet-name">${skill.petName}</div>
          <div class="pet-source">${skill.name} pet</div>
          <div class="pet-source">${skill.id === "hp" ? "Drop rate: 1 / 30,000 per rep or plank minute" : dropRateText(skill.id)}</div>
          <div class="pet-source">${skill.id === "discipline" ? "Bonus: +10% Discipline XP" : "Bonus: +10% XP and gold"}</div>
          <div class="pet-status">${unlocked ? "Unlocked" : "Not found yet"}</div>
        `;
        petGrid.appendChild(card);
      }
    };
  }

  if (typeof renderDungeonSelection === "function") {
    const baseRenderDungeonSelection = renderDungeonSelection;
    renderDungeonSelection = function () {
      baseRenderDungeonSelection();
      for (const group of Array.from(document.querySelectorAll(".dungeon-skill-group"))) {
        if (!group.querySelector(".dungeon-card")) group.remove();
      }
    };
  }

  if (typeof updateWorkoutFields === "function" && hpWorkoutType && hpAmountInput) {
    hpWorkoutType.removeEventListener("change", updateWorkoutFields);
    updateWorkoutFields = function () {
      const selected = selectedWorkout();
      if (!selected) return;

      if (hpExerciseRow) hpExerciseRow.hidden = hpWorkoutType.value !== "hp";
      hpAmountLabel.textContent = selected.unit;
      hpAmountInput.min = selected.minAmount;
      if (selected.maxAmount) {
        hpAmountInput.max = selected.maxAmount;
      } else {
        hpAmountInput.removeAttribute("max");
      }
      hpAmountInput.step = selected.amountStep;
      if (hpMileSliderRow) hpMileSliderRow.hidden = selected.skillId !== "agility";
      if (hpPlankTimeRow) hpPlankTimeRow.hidden = !isPlankWorkout(selected);
      if (hpAmountField) hpAmountField.hidden = isPlankWorkout(selected);
      hpAmountInput.value = selected.defaultAmount;
      if (typeof syncRunSlidersFromAmount === "function") syncRunSlidersFromAmount();
      syncPlankInputsFromAmount();
      updatePreviews();
    };
    hpWorkoutType.addEventListener("change", updateWorkoutFields);
  }

  if (typeof updatePreviews === "function" && hpAmountInput) {
    updatePreviews = function () {
      const selected = selectedWorkout();
      if (!selected) return;

      const amount = normalizeAmount(selected, hpAmountInput.value);
      xpPreview.textContent = formatNumber(xpForWorkout(selected, amount));
      goldPreview.textContent = formatNumber(goldForWorkout(selected, amount));
    };
  }

  if (typeof updateAmountFromInput === "function" && hpAmountInput) {
    hpAmountInput.removeEventListener("input", updateAmountFromInput);
    updateAmountFromInput = function () {
      const selected = selectedWorkout();
      const parsed = Number(hpAmountInput.value);
      if (selected.skillId === "agility" && Number.isFinite(parsed) && parsed >= selected.minAmount) {
        const amount = normalizeAmount(selected, parsed);
        hpAmountInput.value = amount;
        if (typeof syncRunSlidersFromAmount === "function") syncRunSlidersFromAmount();
      }
      if (isPlankWorkout(selected) && Number.isFinite(parsed) && parsed >= selected.minAmount) {
        const amount = normalizeAmount(selected, parsed);
        hpAmountInput.value = amount;
        syncPlankInputsFromAmount();
      }
      updatePreviews();
    };
    hpAmountInput.addEventListener("input", updateAmountFromInput);
  }

  function updateAmountFromPlankInputs() {
    hpAmountInput.value = amountFromPlankInputs();
    syncPlankInputsFromAmount();
    updatePreviews();
  }

  hpPlankMinutesInput?.addEventListener("input", updateAmountFromPlankInputs);
  hpPlankSecondsInput?.addEventListener("input", updateAmountFromPlankInputs);
  hpExerciseSelect?.addEventListener("change", () => {
    if (hpWorkoutType?.value === "hp" && typeof updateWorkoutFields === "function") updateWorkoutFields();
  });

  if (typeof addWorkout === "function" && typeof workoutForm !== "undefined") {
    workoutForm.removeEventListener("submit", addWorkout);
    addWorkout = function (event) {
      event.preventDefault();

      const selected = selectedWorkout();
      const amount = normalizeAmount(selected, hpAmountInput.value);
      if (amount <= 0) return;

      hpAmountInput.value = amount;

      const mainXP = xpForWorkout(selected, amount);
      const disciplineXP = disciplineXPForWorkout();
      const goldEarned = goldForWorkout(selected, amount);
      const skill = skills.find((item) => item.id === selected.skillId);
      const mainPetRolls = selected.skillId === "hp" && isPlankWorkout(selected) ? amount / 60 : amount;
      const disciplinePetRolls = isPlankWorkout(selected) ? amount / 60 : amount;
      const petDrops = [];

      state.xp[selected.skillId] += mainXP;
      state.xp.discipline += disciplineXP;
      state.gold += goldEarned;

      const dungeonResult = progressActiveDungeon(selected, amount);
      const townshipResult = typeof progressTownshipProject === "function"
        ? progressTownshipProject(selected, amount)
        : null;

      const mainPet = rollPet(selected.skillId, mainPetRolls);
      if (mainPet?.petName) petDrops.push(mainPet.petName);

      const disciplinePet = rollPet("discipline", disciplinePetRolls);
      if (disciplinePet?.petName) petDrops.push(disciplinePet.petName);

      state.log.unshift({
        title: selected.label,
        detail: amountTextForWorkout(selected, amount),
        skillId: selected.skillId,
        skillName: skill.name,
        mainXP,
        disciplineXP,
        goldEarned,
        mainPetRolls,
        disciplinePetRolls,
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
        window.alert(`Dungeon cleared: ${dungeonResult.completed.dungeonName}! +${formatNumber(dungeonResult.completed.bonusXP)} ${dungeonResult.completed.skillName} XP`);
      }

      if (townshipResult?.completedBuilding) {
        window.alert(`Building completed: ${townshipResult.completedBuilding.buildingName}!`);
      }

      if (petDrops.length > 0) {
        window.alert(`Pet drop: ${petDrops.join(", ")}!`);
      }
    };
    workoutForm.addEventListener("submit", addWorkout);
  }

  ensureWorkoutOptions();
  if (typeof updateWorkoutFields === "function") updateWorkoutFields();
  if (typeof render === "function") render();
})();
