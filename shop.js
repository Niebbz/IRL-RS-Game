(function () {
  const marketKeyItems = [
    {
      id: "bronze",
      name: "Bronze Key",
      cost: 50,
      description: "Starts bronze dungeons."
    },
    {
      id: "iron",
      name: "Iron Key",
      cost: 150,
      description: "Starts iron dungeons after bronze clears."
    },
    {
      id: "rune",
      name: "Rune Key",
      cost: 350,
      description: "Starts the highest dungeon tier."
    }
  ];

  const marketMaterialItems = [
    {
      id: "supplies-crate",
      name: "Supply Crate",
      cost: 200,
      materials: { supplies: 5 },
      description: "General supplies for Township projects."
    },
    {
      id: "timber-bundle",
      name: "Timber Bundle",
      cost: 400,
      materials: { timber: 10 },
      description: "Common building material for early and mid-game projects."
    },
    {
      id: "stone-pallet",
      name: "Stone Pallet",
      cost: 500,
      materials: { stone: 10 },
      description: "Core material for defensive and late-game buildings."
    },
    {
      id: "iron-cache",
      name: "Iron Cache",
      cost: 450,
      materials: { iron: 5 },
      description: "High-value metal for fortified Township projects."
    },
    {
      id: "builder-cache",
      name: "Builder's Cache",
      cost: 1400,
      materials: { timber: 8, stone: 8, iron: 4, supplies: 6 },
      description: "A balanced material pack for larger projects."
    }
  ];

  function materialName(materialId) {
    return materialNames?.[materialId] ?? materialId;
  }

  function materialText(materials) {
    return Object.entries(materials)
      .map(([materialId, amount]) => `${formatNumber(amount)} ${materialName(materialId)}`)
      .join(", ");
  }

  function materialCount() {
    if (!state?.township?.materials) return 0;
    return Object.values(state.township.materials).reduce((total, amount) => total + (amount ?? 0), 0);
  }

  function storehouseUnlocked() {
    if (typeof isStorehouseBuilt === "function") return isStorehouseBuilt();
    return Boolean(state?.township?.completedBuildings?.storehouse);
  }

  function canAfford(cost) {
    return (state?.gold ?? 0) >= cost;
  }

  function renderMarketSummary() {
    const gold = document.querySelector("#marketGoldBalance");
    const keys = document.querySelector("#marketKeySummary");
    const materials = document.querySelector("#marketMaterialSummary");
    if (!gold || !keys || !materials) return;

    const keyCount = Object.values(state.keys ?? {}).reduce((total, amount) => total + (amount ?? 0), 0);

    gold.textContent = formatNumber(state.gold ?? 0);
    keys.textContent = `${formatNumber(keyCount)} owned`;
    materials.textContent = storehouseUnlocked() ? `${formatNumber(materialCount())} stored` : "Storehouse locked";
  }

  function keyCard(item) {
    const card = document.createElement("article");
    const owned = state.keys?.[item.id] ?? 0;
    const affordable = canAfford(item.cost);

    card.className = "market-item-card";
    card.innerHTML = `
      <div class="market-item-top">
        <div>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
        <span class="market-item-owned">${formatNumber(owned)} owned</span>
      </div>
      <div class="market-item-meta">
        <span>Cost</span>
        <strong>${formatNumber(item.cost)} gold</strong>
      </div>
      <button class="secondary-button" type="button" data-market-buy-key="${item.id}" ${affordable ? "" : "disabled"}>Buy Key</button>
    `;

    return card;
  }

  function materialCard(item) {
    const card = document.createElement("article");
    const unlocked = storehouseUnlocked();
    const affordable = canAfford(item.cost);
    const disabled = !unlocked || !affordable;
    const status = !unlocked
      ? "Build the Storehouse first"
      : affordable
        ? "Ready"
        : "Need more gold";

    card.className = `market-item-card ${unlocked ? "" : "locked"}`;
    card.innerHTML = `
      <div class="market-item-top">
        <div>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
        <span class="market-item-owned">${materialText(item.materials)}</span>
      </div>
      <div class="market-item-meta">
        <span>Cost</span>
        <strong>${formatNumber(item.cost)} gold</strong>
      </div>
      <button class="secondary-button" type="button" data-market-buy-materials="${item.id}" ${disabled ? "disabled" : ""}>Buy Pack</button>
      <div class="market-item-status">${status}</div>
    `;

    return card;
  }

  function renderMarketKeys() {
    const root = document.querySelector("#marketKeyShop");
    if (!root) return;

    root.innerHTML = "";
    marketKeyItems.forEach((item) => root.appendChild(keyCard(item)));
  }

  function renderMarketMaterials() {
    const root = document.querySelector("#marketMaterialShop");
    if (!root) return;

    root.innerHTML = "";
    marketMaterialItems.forEach((item) => root.appendChild(materialCard(item)));
  }

  function renderMarket() {
    renderMarketSummary();
    renderMarketKeys();
    renderMarketMaterials();
  }

  function buyMarketKey(tier) {
    const item = marketKeyItems.find((candidate) => candidate.id === tier);
    if (!item || !canAfford(item.cost)) return;

    state.gold -= item.cost;
    state.keys[tier] = (state.keys[tier] ?? 0) + 1;
    saveState();
    render();
  }

  function buyMaterialPack(packId) {
    const item = marketMaterialItems.find((candidate) => candidate.id === packId);
    if (!item) return;

    if (!storehouseUnlocked()) {
      window.alert("Build the Storehouse before buying Township materials.");
      return;
    }

    if (!canAfford(item.cost)) return;

    state.gold -= item.cost;
    addMaterials(item.materials);
    saveState();
    render();
  }

  function installRenderPatch() {
    if (typeof render === "function" && !render.__marketShopPatch) {
      const baseRender = render;
      render = function renderWithMarketShop() {
        baseRender();
        renderMarket();
      };
      render.__marketShopPatch = true;
    }

    renderMarket();
  }

  document.addEventListener("click", (event) => {
    const keyButton = event.target.closest("[data-market-buy-key]");
    if (keyButton) {
      buyMarketKey(keyButton.dataset.marketBuyKey);
      return;
    }

    const materialButton = event.target.closest("[data-market-buy-materials]");
    if (materialButton) buyMaterialPack(materialButton.dataset.marketBuyMaterials);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installRenderPatch);
  } else {
    installRenderPatch();
  }
})();