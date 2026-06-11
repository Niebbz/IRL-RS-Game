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
})();