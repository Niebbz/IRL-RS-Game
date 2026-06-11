(function () {
  const engineUrl =
    "https://raw.githubusercontent.com/Niebbz/IRL-RS-Game/f03e3201f0b7a11bdd3a1798be24a45bb44ec37a/township.js";

  function townshipReady() {
    return Boolean(state?.township?.materials && document.querySelector("#townshipBuildings .building-card"));
  }

  function runEngine(source) {
    if (window.__levelForgeTownshipRecoveryLoaded || townshipReady()) return;
    window.__levelForgeTownshipRecoveryLoaded = true;

    const patchedSource = source.replace('if (typeof townshipBuildings !== "undefined") return;', "if (false) return;");
    const blob = new Blob([patchedSource], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const script = document.createElement("script");

    script.onload = () => {
      URL.revokeObjectURL(url);
      if (typeof render === "function") render();
    };
    script.onerror = () => {
      URL.revokeObjectURL(url);
      const summary = document.querySelector("#townshipSummary");
      if (summary) summary.textContent = "Township could not load. Refresh the page and try again.";
    };
    script.src = url;
    document.body.appendChild(script);
  }

  function recoverTownship() {
    if (typeof state === "undefined" || townshipReady()) return;

    fetch(engineUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Township engine failed to load: " + response.status);
        return response.text();
      })
      .then(runEngine)
      .catch((error) => {
        console.error(error);
        const summary = document.querySelector("#townshipSummary");
        if (summary) summary.textContent = "Township could not load. Refresh the page and try again.";
      });
  }

  window.setTimeout(recoverTownship, 900);
  window.setTimeout(recoverTownship, 2200);
})();