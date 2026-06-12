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

  const materialQuantities = [1, 5, 10, 25, 100];
  const marketMaterialItems = [
    {
      id: "supplies",
      name: "Supplies",
      unitCost: 40,
      description: "General supplies for Township projects."
    },
    {
      id: "timber",
      name: "Timber",
      unitCost: 40,
      description: "Common building material for early and mid-game projects."
    },
    {
      id: "stone",
      name: "Stone",
      unitCost: 50,
      description: "Core material for defensive and late-game buildings."
    },
    {
      id: "iron",
      name: "Iron",
      unitCost: 90,
      description: "High-value metal for fortified Township projects."
    }
  ];

  let materialMode = "buy";

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

  function built(buildingId) {
    return Boolean(state?.township?.completedBuildings?.[buildingId]);
  }

  function discountRate() {
    if (built("marketplace")) return 0.1;
    if (built("trade-post")) return 0.05;
    return 0;
  }

  function materialSellRate() {
    if (built("marketplace")) return 0.35;
    if (built("trade-post")) return 0.3;
    return 0.25;
  }

  function discountLabel() {
    const rate = discountRate();
    if (!rate) return "No purchase discount";
    return `${Math.round(rate * 100)}% Township discount`;
  }

  function sellbackLabel() {
    const rate = Math.round(materialSellRate() * 100);
    if (built("marketplace")) return `${rate}% sellback with Marketplace`;
    if (built("trade-post")) return `${rate}% sellback with Trade Post`;
    return `${rate}% base sellback`;
  }

  function discounted(cost) {
    return Math.max(1, Math.ceil(cost * (1 - discountRate())));
  }

  function buyUnitCost(item) {
    return discounted(item.unitCost);
  }

  function sellUnitValue(item) {
    return Math.max(1, Math.floor(item.unitCost * materialSellRate()));
  }

  function materialAmount(materialId) {
    return state?.township?.materials?.[materialId] ?? 0;
  }

  function parseQuantity(value) {
    const quantity = Number(value);
    return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
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

  function materialModeToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "market-material-toolbar";
    toolbar.innerHTML = `
      <div>
        <span>Mode</span>
        <div class="market-mode-toggle" role="group" aria-label="Material shop mode">
          <button class="${materialMode === "buy" ? "active" : ""}" type="button" data-market-material-mode="buy" aria-pressed="${materialMode === "buy"}">Buy</button>
          <button class="${materialMode === "sell" ? "active" : ""}" type="button" data-market-material-mode="sell" aria-pressed="${materialMode === "sell"}">Sell</button>
        </div>
      </div>
      <div>
        <span>Township Rates</span>
        <strong>${discountLabel()} | ${sellbackLabel()}</strong>
      </div>
    `;

    return toolbar;
  }

  function materialCard(item) {
    const card = document.createElement("article");
    const unlocked = storehouseUnlocked();
    const owned = materialAmount(item.id);
    const buyEach = buyUnitCost(item);
    const sellEach = sellUnitValue(item);
    const status = !unlocked
      ? "Build the Storehouse first"
      : materialMode === "buy"
        ? `${discountLabel()} active`
        : owned > 0
          ? sellbackLabel()
          : "None owned to sell";

    card.className = `market-item-card ${unlocked ? "" : "locked"}`;
    card.innerHTML = `
      <div class="market-item-top">
        <div>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
        <span class="market-item-owned">${formatNumber(owned)} owned</span>
      </div>
      <div class="market-price-list">
        <div>
          <span>Buy each</span>
          <strong>${formatNumber(buyEach)} gold</strong>
        </div>
        <div>
          <span>Sell each</span>
          <strong>${formatNumber(sellEach)} gold</strong>
        </div>
      </div>
      <div class="market-quantity-grid">
        ${materialQuantities.map((quantity) => {
          const total = materialMode === "buy" ? buyEach * quantity : sellEach * quantity;
          const disabled = !unlocked || (materialMode === "buy" ? !canAfford(total) : owned < quantity);
          const action = materialMode === "buy" ? "buy" : "sell";
          const label = materialMode === "buy" ? `Buy ${quantity}` : `Sell ${quantity}`;
          return `
            <button class="secondary-button" type="button" data-market-${action}-material="${item.id}" data-market-quantity="${quantity}" ${disabled ? "disabled" : ""}>
              <span>${label}</span>
              <small>${formatNumber(total)} gold</small>
            </button>
          `;
        }).join("")}
      </div>
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
    root.appendChild(materialModeToolbar());
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

  function buyMaterial(materialId, quantity) {
    const item = marketMaterialItems.find((candidate) => candidate.id === materialId);
    if (!item) return;

    if (!storehouseUnlocked()) {
      window.alert("Build the Storehouse before buying Township materials.");
      return;
    }

    const cost = buyUnitCost(item) * quantity;
    if (!canAfford(cost)) return;

    state.gold -= cost;
    addMaterials({ [materialId]: quantity });
    saveState();
    render();
  }

  function sellMaterial(materialId, quantity) {
    const item = marketMaterialItems.find((candidate) => candidate.id === materialId);
    if (!item || !storehouseUnlocked()) return;

    const owned = materialAmount(materialId);
    if (owned < quantity) return;

    state.township.materials[materialId] = owned - quantity;
    state.gold += sellUnitValue(item) * quantity;
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

    const modeButton = event.target.closest("[data-market-material-mode]");
    if (modeButton) {
      materialMode = modeButton.dataset.marketMaterialMode === "sell" ? "sell" : "buy";
      renderMarket();
      return;
    }

    const buyButton = event.target.closest("[data-market-buy-material]");
    if (buyButton) {
      buyMaterial(buyButton.dataset.marketBuyMaterial, parseQuantity(buyButton.dataset.marketQuantity));
      return;
    }

    const sellButton = event.target.closest("[data-market-sell-material]");
    if (sellButton) sellMaterial(sellButton.dataset.marketSellMaterial, parseQuantity(sellButton.dataset.marketQuantity));
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installRenderPatch);
  } else {
    installRenderPatch();
  }
})();
