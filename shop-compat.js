(function () {
  window.materialNames = {
    timber: "Timber",
    stone: "Stone",
    iron: "Iron",
    supplies: "Supplies"
  };

  window.isStorehouseBuilt = function () {
    return Boolean(state?.township?.completedBuildings?.storehouse);
  };

  window.addMaterials = function (materials) {
    if (!state?.township?.materials) return;

    for (const [materialId, amount] of Object.entries(materials ?? {})) {
      if (!(materialId in state.township.materials)) state.township.materials[materialId] = 0;
      state.township.materials[materialId] += amount;
    }
  };

  if (!document.querySelector('link[href^="township-upgrades.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "township-upgrades.css?v=2";
    document.head.appendChild(link);
  }

  if (!document.querySelector('script[src^="township-upgrades.js"]')) {
    const script = document.createElement("script");
    script.src = "township-upgrades.js?v=2";
    document.body.appendChild(script);
  }
})();
