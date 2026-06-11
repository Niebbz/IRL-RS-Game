(function () {
  const materialNames = { timber: "Timber", stone: "Stone", iron: "Iron", supplies: "Supplies" };
  const tierNames2 = { bronze: "Bronze", iron: "Iron", rune: "Gold" };
  const keyNames2 = { bronze: "Bronze Key", iron: "Iron Key", rune: "Gold Key" };

  const buffs = [
    ["storehouse", "Storehouse", "Unlocks materials, dungeon material drops, and material purchases."],
    ["palisade", "Palisade", "10% chance to recover a small material bundle when funding a future building."],
    ["trade-post", "Trade Post", "Shop prices are 5% cheaper."],
    ["blacksmith", "Blacksmith", "5% chance to preserve a key when starting a dungeon."],
    ["watchtower", "Watchtower", "Adds scouting notes to dungeon cards."],
    ["barracks", "Barracks", "12% chance for dungeon chests to include extra supplies."],
    ["stables", "Stables", "Agility dungeon chests gain a small route supply bundle."],
    ["marketplace", "Marketplace", "Improves the shop discount to 10%."],
    ["stone-walls", "Stone Walls", "Refunds 5% of the gold and materials spent funding later buildings."],
    ["guild-hall", "Guild Hall", "Unlocks a foundation for advanced questlines without repeatable quests yet."],
    ["cartographers-lodge", "Cartographer's Lodge", "Unlocks map dungeons with gold, material, and key rewards."]
  ];

  const fundingFallback = {
    palisade: { gold: 400, materials: { timber: 12, stone: 6 } },
    "trade-post": { gold: 500, materials: { timber: 10, supplies: 8 } },
    blacksmith: { gold: 750, materials: { timber: 6, stone: 12, iron: 8 } },
    watchtower: { gold: 1000, materials: { timber: 18, stone: 12, supplies: 8 } },
    barracks: { gold: 1250, materials: { timber: 24, stone: 14, iron: 8 } },
    stables: { gold: 1500, materials: { timber: 20, stone: 6, supplies: 16 } },
    marketplace: { gold: 1750, materials: { timber: 24, stone: 10, iron: 6, supplies: 18 } },
    "stone-walls": { gold: 2500, materials: { timber: 16, stone: 40, iron: 18 } },
    "guild-hall": { gold: 3000, materials: { timber: 32, stone: 28, iron: 14, supplies: 18 } },
    "cartographers-lodge": { gold: 3500, materials: { timber: 28, stone: 12, iron: 6, supplies: 24 } },
    "town-hall": { gold: 5000, materials: { timber: 50, stone: 45, iron: 24, supplies: 30 } }
  };

  const keyShop = [
    ["bronze", "Bronze Key", 50],
    ["iron", "Iron Key", 150],
    ["rune", "Gold Key", 350]
  ];

  const materialPacks = [
    ["supplies-crate", 200, { supplies: 5 }],
    ["timber-bundle", 400, { timber: 10 }],
    ["stone-pallet", 500, { stone: 10 }],
    ["iron-cache", 450, { iron: 5 }],
    ["builder-cache", 1400, { timber: 8, stone: 8, iron: 4, supplies: 6 }]
  ];

  const mapDungeons = [
    ["map-coastal-survey", "Coastal Survey Trail", "agility", "bronze", "bronze", 8, 250, { timber: 8, supplies: 10 }, { bronze: 0.08 }, "Chart a safe supply road outside Forgehold."],
    ["map-smuggler-cache", "Smuggler Map Cache", "attack", "iron", "iron", 180, 650, { timber: 10, iron: 4, supplies: 14 }, { bronze: 0.12, iron: 0.04 }, "Clear a hidden route and recover marked supply crates."],
    ["map-quarry-route", "Collapsed Quarry Route", "strength", "iron", "iron", 240, 800, { stone: 22, iron: 8, supplies: 12 }, { bronze: 0.12, iron: 0.05 }, "Open a heavy stone route for long-term building materials."],
    ["map-border-fortress", "Gold Border Fortress", "defense", "rune", "rune", 360, 1800, { timber: 10, stone: 34, iron: 18, supplies: 24 }, { bronze: 0.15, iron: 0.06, rune: 0.015 }, "Survey the old fortress line and secure a high-value stockpile."]
  ].map(([id, name, skillId, tier, keyTier, requirement, gold, materials, keyChances, description]) => ({
    id, name, skillId, tier, keyTier, requirement, gold, materials, keyChances, description
  }));

  const chestBonus = { bronze: [2, 4], iron: [4, 8], rune: [8, 14] };
  let clicksInstalled = false;
  let workoutInstalled = false;

  function upgrades() {
    if (typeof state === "undefined") return null;
    state.townshipUpgrades ||= {};
    state.townshipUpgrades.refunds ||= {};
    state.townshipUpgrades.keySaves ||= [];
    state.townshipUpgrades.mapDungeons ||= {};
    const maps = state.townshipUpgrades.mapDungeons;
    maps.clears ||= {};
    maps.history ||= [];
    if (!("active" in maps)) maps.active = null;
    return state.townshipUpgrades;
  }

  function built(id) {
    return Boolean(state?.township?.completedBuildings?.[id]);
  }

  function fmt(value) {
    return typeof formatNumber === "function" ? formatNumber(value) : Number(value || 0).toLocaleString();
  }

  function fmtAmount(value) {
    return typeof formatAmount === "function" ? formatAmount(value) : Number(value || 0).toLocaleString();
  }

  function skillName(id) {
    try {
      return typeof skillById === "function" ? skillById(id)?.name ?? id : id;
    } catch {
      return id;
    }
  }

  function unit(id) {
    return id === "agility" ? "miles" : "minutes";
  }

  function matsText(mats) {
    const entries = Object.entries(mats || {}).filter(([, amount]) => amount > 0);
    if (!entries.length) return "";
    return entries.map(([id, amount]) => `${fmt(amount)} ${materialNames[id] || id}`).join(", ");
  }

  function addMats(mats) {
    if (!state?.township?.materials) return;
    for (const [id, amount] of Object.entries(mats || {})) {
      state.township.materials[id] = (state.township.materials[id] || 0) + amount;
    }
  }

  function funding(id) {
    try {
      const building = townshipBuildings.find((item) => item.id === id);
      return building?.funding || fundingFallback[id] || { gold: 0, materials: {} };
    } catch {
      return fundingFallback[id] || { gold: 0, materials: {} };
    }
  }

  function addReward(target, id, amount) {
    if (!id || amount <= 0) return;
    target[id] = (target[id] || 0) + amount;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function discountRate() {
    if (built("marketplace")) return 0.1;
    if (built("trade-post")) return 0.05;
    return 0;
  }

  function discounted(cost) {
    return Math.max(1, Math.ceil(cost * (1 - discountRate())));
  }

  function toast(message) {
    document.querySelector(".map-dungeon-toast")?.remove();
    const node = document.createElement("div");
    node.className = "map-dungeon-toast";
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 4200);
  }

  function renderBuffPanel() {
    const buildings = document.querySelector("#townshipBuildings");
    if (!buildings) return;
    let panel = document.querySelector("#townshipUpgradePanel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "townshipUpgradePanel";
      panel.className = "township-panel wide-panel township-upgrade-panel";
      buildings.closest(".township-panel")?.before(panel);
    }
    panel.innerHTML = `
      <div class="panel-heading"><div><p class="eyebrow">Upgrades</p><h2>Township Buffs</h2></div></div>
      <div class="township-upgrade-grid">
        ${buffs.map(([id, name, copy]) => {
          const active = built(id);
          return `<article class="township-upgrade-card ${active ? "active" : ""}">
            <div class="township-upgrade-top"><h3 class="township-upgrade-name">${name}</h3><span class="township-upgrade-status">${active ? "Active" : "Locked"}</span></div>
            <p class="township-upgrade-copy">${copy}</p>
          </article>`;
        }).join("")}
      </div>`;
  }

  function decorateShop() {
    const rate = discountRate();
    const label = `${Math.round(rate * 100)}% Township discount`;
    keyShop.forEach(([id, name, baseCost]) => {
      const button = document.querySelector(`[data-market-buy-key="${id}"]`);
      const card = button?.closest(".market-item-card");
      if (!button || !card) return;
      const cost = discounted(baseCost);
      const heading = card.querySelector("h3");
      const price = card.querySelector(".market-item-meta strong");
      if (heading) heading.textContent = name;
      if (price) price.innerHTML = rate ? `${fmt(cost)} gold <span class="market-upgrade-price">${label} from ${fmt(baseCost)}</span>` : `${fmt(baseCost)} gold`;
      button.disabled = (state.gold || 0) < cost;
    });
    materialPacks.forEach(([id, baseCost]) => {
      const button = document.querySelector(`[data-market-buy-materials="${id}"]`);
      const card = button?.closest(".market-item-card");
      if (!button || !card) return;
      const cost = discounted(baseCost);
      const price = card.querySelector(".market-item-meta strong");
      const status = card.querySelector(".market-item-status");
      const storehouse = built("storehouse");
      if (price) price.innerHTML = rate ? `${fmt(cost)} gold <span class="market-upgrade-price">${label} from ${fmt(baseCost)}</span>` : `${fmt(baseCost)} gold`;
      button.disabled = !storehouse || (state.gold || 0) < cost;
      if (status) status.textContent = !storehouse ? "Build the Storehouse first" : button.disabled ? "Need more gold" : rate ? label : "Ready";
    });
  }

  function buyKey(id) {
    const item = keyShop.find(([itemId]) => itemId === id);
    if (!item) return;
    const cost = discounted(item[2]);
    if ((state.gold || 0) < cost) return;
    state.gold -= cost;
    state.keys[id] = (state.keys[id] || 0) + 1;
    saveState();
    render();
  }

  function buyPack(id) {
    const item = materialPacks.find(([itemId]) => itemId === id);
    if (!item) return;
    if (!built("storehouse")) return window.alert("Build the Storehouse before buying Township materials.");
    const cost = discounted(item[1]);
    if ((state.gold || 0) < cost) return;
    state.gold -= cost;
    addMats(item[2]);
    saveState();
    render();
  }

  function maybeRefund(buildingId, wasFunded) {
    const u = upgrades();
    if (!u || wasFunded || !state?.township?.fundedProjects?.[buildingId] || u.refunds[buildingId]) return;
    const base = funding(buildingId);
    const mats = {};
    let gold = 0;
    let note = "";
    if (built("stone-walls") && buildingId !== "stone-walls") {
      gold = Math.ceil((base.gold || 0) * 0.05);
      for (const [id, amount] of Object.entries(base.materials || {})) addReward(mats, id, Math.ceil(amount * 0.05));
      note = "Stone Walls reduced the project cost.";
    }
    if (built("palisade") && Math.random() < 0.1) {
      for (const [id, amount] of Object.entries(base.materials || {})) addReward(mats, id, Math.max(1, Math.ceil(amount * 0.12)));
      note ||= "Palisade saved materials on the project.";
    }
    if (gold <= 0 && !Object.values(mats).some(Boolean)) return;
    u.refunds[buildingId] = true;
    state.gold += gold;
    addMats(mats);
    saveState();
    render();
    toast(`${note} Refunded ${[gold ? `${fmt(gold)} gold` : "", matsText(mats)].filter(Boolean).join(" and ")}.`);
  }

  function saveKey(tier, started) {
    const u = upgrades();
    if (!started || !built("blacksmith") || Math.random() >= 0.05) return false;
    state.keys[tier] = (state.keys[tier] || 0) + 1;
    u.keySaves.unshift({ tier, at: new Date().toISOString() });
    u.keySaves = u.keySaves.slice(0, 20);
    saveState();
    toast(`Blacksmith preserved your ${keyNames2[tier] || "key"}.`);
    return true;
  }

  function applyChestBuffs(result) {
    const completed = result?.completed;
    if (!completed?.supplyChest) return;
    completed.supplyChest.materials ||= {};
    const extra = {};
    const range = chestBonus[completed.tier] || chestBonus.bronze;
    if (built("barracks") && Math.random() < 0.12) addReward(extra, "supplies", randomInt(range[0], range[1]));
    if (built("stables") && completed.skillId === "agility") {
      addReward(extra, "supplies", Math.max(1, Math.ceil(range[0] / 2)));
      addReward(extra, "timber", completed.tier === "rune" ? 3 : 1);
    }
    for (const [id, amount] of Object.entries(extra)) addReward(completed.supplyChest.materials, id, amount);
    addMats(extra);
  }

  function mapById(id) {
    return mapDungeons.find((dungeon) => dungeon.id === id);
  }

  function activeMap() {
    return upgrades()?.mapDungeons?.active || null;
  }

  function rewardText(dungeon) {
    const keyText = Object.entries(dungeon.keyChances).map(([tier, chance]) => `${keyNames2[tier]} ${Math.round(chance * 1000) / 10}%`).join(", ");
    return `${fmt(dungeon.gold)} gold | ${matsText(dungeon.materials)} | Keys: ${keyText}`;
  }

  function mapStatus(dungeon) {
    if (!built("cartographers-lodge")) return "Cartographer's Lodge locked";
    if (activeMap()) return "Map dungeon already active";
    if (state.activeDungeon) return "Finish current dungeon first";
    if ((state.keys?.[dungeon.keyTier] || 0) <= 0) return `Requires ${keyNames2[dungeon.keyTier]}`;
    return "Ready";
  }

  function renderMaps() {
    const layout = document.querySelector("#dungeonsTab .dungeon-layout");
    const historyPanel = document.querySelector("#dungeonHistoryTitle")?.closest(".dungeon-panel");
    if (!layout || !historyPanel) return;
    const u = upgrades();
    let panel = document.querySelector("#mapDungeonsPanel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "mapDungeonsPanel";
      panel.className = "dungeon-panel wide-panel map-dungeon-panel";
      layout.insertBefore(panel, historyPanel);
    }
    const unlocked = built("cartographers-lodge");
    const active = u.mapDungeons.active;
    const activeDungeon = active ? mapById(active.id) : null;
    const clears = Object.values(u.mapDungeons.clears).reduce((total, count) => total + (count || 0), 0);
    panel.innerHTML = `
      <div class="panel-heading"><div><p class="eyebrow">Cartographer's Lodge</p><h2>Map Dungeons</h2></div></div>
      ${unlocked ? `
        <div class="map-dungeon-summary">
          <div class="map-dungeon-stat"><span>Active Map</span><strong>${activeDungeon ? activeDungeon.name : "None"}</strong></div>
          <div class="map-dungeon-stat"><span>Total Map Clears</span><strong>${fmt(clears)}</strong></div>
        </div>
        ${activeDungeon ? activeCard(active, activeDungeon) : ""}
        <div class="map-dungeon-grid">${mapDungeons.map(mapCard).join("")}</div>
        ${mapHistory()}
      ` : `<div class="empty-state">Build the Cartographer's Lodge in Township to unlock map dungeons.</div>`}`;
  }

  function activeCard(active, dungeon) {
    const progress = Math.min(active.progress || 0, dungeon.requirement);
    const percent = dungeon.requirement ? progress / dungeon.requirement * 100 : 0;
    return `<article class="dungeon-card active-dungeon-card">
      <div class="dungeon-card-top"><div><div class="dungeon-name">${dungeon.name}</div><div class="dungeon-meta">${tierNames2[dungeon.tier]} ${skillName(dungeon.skillId)} Map Dungeon</div></div><button class="danger-button" type="button" id="abandonMapDungeonButton">Abandon</button></div>
      <p class="map-dungeon-progress-text">${dungeon.description}</p>
      <div class="progress-track"><div class="progress-fill" style="width: ${Math.max(0, Math.min(100, percent))}%;"></div></div>
      <div class="skill-footer"><span>${fmtAmount(progress)} / ${fmtAmount(dungeon.requirement)} ${unit(dungeon.skillId)}</span><span>${skillName(dungeon.skillId)} workouts progress this map</span></div>
    </article>`;
  }

  function mapCard(dungeon) {
    const status = mapStatus(dungeon);
    const ready = status === "Ready";
    const clears = upgrades().mapDungeons.clears[dungeon.id] || 0;
    return `<article class="map-dungeon-card ${ready ? "" : "locked"}">
      <div class="map-dungeon-top"><div><h3 class="map-dungeon-name">${dungeon.name}</h3><p class="map-dungeon-copy">${dungeon.description}</p></div><span class="map-dungeon-tier">${tierNames2[dungeon.tier]}</span></div>
      <details class="map-dungeon-reward-details">
        <summary class="secondary-button map-dungeon-reward-toggle">View Rewards</summary>
        <div class="map-dungeon-rewards"><div>${skillName(dungeon.skillId)}: ${fmtAmount(dungeon.requirement)} ${unit(dungeon.skillId)}</div><div>Cost: ${keyNames2[dungeon.keyTier]}</div><div>Rewards: ${rewardText(dungeon)}</div><div>Clears: ${fmt(clears)}</div></div>
      </details>
      <div class="map-dungeon-actions"><button class="secondary-button" type="button" data-start-map-dungeon="${dungeon.id}" ${ready ? "" : "disabled"}>Enter Map</button><span class="map-dungeon-status">${status}</span></div>
    </article>`;
  }

  function mapHistory() {
    const history = upgrades().mapDungeons.history;
    if (!history.length) return "";
    return `<div class="map-dungeon-history"><h3>Map Dungeon Clears</h3><ol class="workout-log dungeon-history">
      ${history.slice(0, 10).map((entry) => `<li><div><div class="log-title">${entry.name} - ${tierNames2[entry.tier]} ${skillName(entry.skillId)} Map</div><div class="log-meta">Completed ${typeof formatLoggedDate === "function" ? formatLoggedDate(entry.at) : entry.at}</div><div class="dungeon-note">Rewards: ${fmt(entry.gold)} gold${entry.mats ? `, ${entry.mats}` : ""}${entry.keys ? `, ${entry.keys}` : ""}</div></div></li>`).join("")}
    </ol></div>`;
  }

  function startMap(id) {
    const dungeon = mapById(id);
    const u = upgrades();
    if (!dungeon || mapStatus(dungeon) !== "Ready") return;
    state.keys[dungeon.keyTier] -= 1;
    u.mapDungeons.active = { id: dungeon.id, progress: 0, at: new Date().toISOString() };
    const saved = saveKey(dungeon.keyTier, true);
    saveState();
    render();
    if (!saved) toast(`${dungeon.name} started.`);
  }

  function abandonMap() {
    const u = upgrades();
    const active = u.mapDungeons.active;
    if (!active) return;
    const dungeon = mapById(active.id);
    if (!window.confirm(`Abandon ${dungeon?.name || "this map dungeon"}? Progress will be lost and the key will not be refunded.`)) return;
    u.mapDungeons.active = null;
    saveState();
    render();
  }

  function rollKeys(chances) {
    const keys = {};
    for (const [tier, chance] of Object.entries(chances || {})) {
      if (Math.random() < chance) addReward(keys, tier, 1);
    }
    return keys;
  }

  function completeMap(dungeon) {
    const u = upgrades();
    const keys = rollKeys(dungeon.keyChances);
    state.gold += dungeon.gold;
    addMats(dungeon.materials);
    for (const [tier, amount] of Object.entries(keys)) state.keys[tier] = (state.keys[tier] || 0) + amount;
    const keyText = Object.entries(keys).filter(([, amount]) => amount > 0).map(([tier, amount]) => `${fmt(amount)} ${keyNames2[tier]}`).join(", ");
    const record = { id: dungeon.id, name: dungeon.name, tier: dungeon.tier, skillId: dungeon.skillId, gold: dungeon.gold, mats: matsText(dungeon.materials), keys: keyText, at: new Date().toISOString() };
    u.mapDungeons.clears[dungeon.id] = (u.mapDungeons.clears[dungeon.id] || 0) + 1;
    u.mapDungeons.history.unshift(record);
    u.mapDungeons.history = u.mapDungeons.history.slice(0, 30);
    u.mapDungeons.active = null;
    return record;
  }

  function progressMap(selected, amount) {
    const u = upgrades();
    const active = u.mapDungeons.active;
    if (!active) return null;
    const dungeon = mapById(active.id);
    if (!dungeon || selected.skillId !== dungeon.skillId || amount <= 0) return null;
    const contribution = Math.min(amount, Math.max(0, dungeon.requirement - (active.progress || 0)));
    if (contribution <= 0) return null;
    active.progress = (active.progress || 0) + contribution;
    const result = { dungeonId: dungeon.id, dungeonName: dungeon.name, skillId: dungeon.skillId, amount: contribution, unit: unit(dungeon.skillId) };
    const log = state.log?.[0];
    if (log) log.mapDungeonContribution = result;
    if (active.progress >= dungeon.requirement) {
      const record = completeMap(dungeon);
      if (log) log.mapDungeonCompleted = record;
      toast(`Map dungeon cleared: ${dungeon.name}.`);
    }
    saveState();
    render();
    return result;
  }

  function reverseMap(entry) {
    if (!entry?.mapDungeonContribution || entry.mapDungeonCompleted) return;
    const active = activeMap();
    if (!active || active.id !== entry.mapDungeonContribution.dungeonId) return;
    active.progress = Math.max(0, (active.progress || 0) - (entry.mapDungeonContribution.amount || 0));
    saveState();
  }

  function patchCore() {
    if (typeof enterDungeon === "function" && !enterDungeon.__townshipUpgrades) {
      const base = enterDungeon;
      enterDungeon = function (id) {
        if (activeMap()) return toast("Finish or abandon the active map dungeon before entering another dungeon.");
        const dungeon = typeof dungeonById === "function" ? dungeonById(id) : null;
        const before = dungeon ? state.keys?.[dungeon.tier] || 0 : 0;
        const hadActive = Boolean(state.activeDungeon);
        base(id);
        const started = dungeon && !hadActive && state.activeDungeon?.dungeonId === id && (state.keys?.[dungeon.tier] || 0) < before;
        if (saveKey(dungeon?.tier, started)) render();
      };
      enterDungeon.__townshipUpgrades = true;
    }

    if (typeof progressActiveDungeon === "function" && !progressActiveDungeon.__townshipUpgrades) {
      const base = progressActiveDungeon;
      progressActiveDungeon = function (selected, amount) {
        const result = base(selected, amount);
        applyChestBuffs(result);
        return result;
      };
      progressActiveDungeon.__townshipUpgrades = true;
    }

    if (typeof deleteWorkout === "function" && !deleteWorkout.__townshipUpgrades) {
      const base = deleteWorkout;
      deleteWorkout = function (index) {
        reverseMap(state.log?.[index]);
        base(index);
      };
      deleteWorkout.__townshipUpgrades = true;
    }

    if (typeof render === "function" && !render.__townshipUpgrades) {
      const base = render;
      render = function () {
        base();
        renderUpgrades();
      };
      render.__townshipUpgrades = true;
    }
  }

  function renderUpgrades() {
    upgrades();
    renderBuffPanel();
    renderMaps();
    decorateShop();
    if (built("watchtower")) {
      document.querySelectorAll("#dungeonSelection .dungeon-card").forEach((card) => {
        if (card.querySelector(".dungeon-upgrade-note")) return;
        const note = document.createElement("div");
        note.className = "dungeon-upgrade-note";
        note.textContent = "Watchtower scouted: review the reward preview before entering.";
        card.appendChild(note);
      });
    }
  }

  function installClicks() {
    if (clicksInstalled) return;
    clicksInstalled = true;
    document.addEventListener("click", (event) => {
      const keyButton = event.target.closest("[data-market-buy-key]");
      if (keyButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return buyKey(keyButton.dataset.marketBuyKey);
      }
      const materialButton = event.target.closest("[data-market-buy-materials]");
      if (materialButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return buyPack(materialButton.dataset.marketBuyMaterials);
      }
      const buildingButton = event.target.closest("[data-start-building]");
      if (buildingButton) {
        const id = buildingButton.dataset.startBuilding;
        const wasFunded = Boolean(state?.township?.fundedProjects?.[id]);
        return setTimeout(() => maybeRefund(id, wasFunded), 0);
      }
      const mapButton = event.target.closest("[data-start-map-dungeon]");
      if (mapButton) return startMap(mapButton.dataset.startMapDungeon);
      if (event.target.closest("#abandonMapDungeonButton")) return abandonMap();
    }, true);
  }

  function installWorkoutProgress() {
    if (workoutInstalled) return;
    const form = document.querySelector("#workoutForm");
    if (!form) return;
    workoutInstalled = true;
    form.addEventListener("submit", () => {
      setTimeout(() => {
        const latest = state?.log?.[0];
        const created = latest ? new Date(latest.createdAt).getTime() : 0;
        if (!latest || !Number.isFinite(created) || Date.now() - created > 5000) return;
        let selected;
        try {
          selected = workoutMap[workoutType.value];
        } catch {
          return;
        }
        if (!selected) return;
        const amount = typeof normalizeAmount === "function" ? normalizeAmount(selected, amountInput.value) : Number(amountInput.value) || 0;
        progressMap(selected, amount);
      }, 0);
    });
  }

  function install() {
    upgrades();
    patchCore();
    installClicks();
    installWorkoutProgress();
    renderUpgrades();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
