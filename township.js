// Load the original Township engine, then patch small UX gaps without rewriting the whole feature.
(function(){if(typeof currentTownStageName==='function'||document.body.dataset.townshipEngineLoader)return;document.body.dataset.townshipEngineLoader='true';const engineUrl='https://raw.githubusercontent.com/Niebbz/IRL-RS-Game/f03e3201f0b7a11bdd3a1798be24a45bb44ec37a/township.js';function polishTownship(){const storehouse=document.querySelector('#storehouseInventory .empty-state');if(storehouse&&storehouse.textContent.trim()==='Build the Storehouse to unlock materials.')storehouse.textContent='Build the Storehouse to unlock materials. Starter stockpile: 10 Timber, 5 Stone, 2 Iron, 5 Supplies.';const active=document.querySelector('#activeTownshipProject .empty-state');if(active&&active.textContent.trim()==='No active project.')active.textContent='No active project. Choose a building below to fund and start.';document.querySelectorAll('#townshipBuildings .building-card').forEach((card)=>{const button=card.querySelector('[data-start-building]');const status=card.querySelector('.building-status');if(!button||!status)return;if(button.disabled&&/Needs gold or materials/i.test(status.textContent)){button.disabled=false;button.textContent='View Cost';button.dataset.viewCostOnly='true';}});}document.addEventListener('click',(event)=>{const button=event.target.closest('#townshipBuildings [data-view-cost-only]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();const card=button.closest('.building-card');const name=card?.querySelector('.building-name')?.textContent??'this building';const status=card?.querySelector('.building-status')?.textContent??'Need more gold or materials';window.alert(status+' to fund '+name+'.');},true);fetch(engineUrl).then((response)=>{if(!response.ok)throw new Error('Township engine failed to load: '+response.status);return response.text();}).then((source)=>{source=source.replace('if (typeof townshipBuildings !== \"undefined\") return;','if (false) return;');eval(source);const engineRender=render;render=function(){engineRender();polishTownship();};render();}).catch((error)=>{console.error(error);townshipSummary.textContent='Township could not load. Refresh the page and try again.';});})();
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
