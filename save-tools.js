// Account backup tools live outside the main runtime so save handling stays easy to audit.
(function () {
  const exportButton = document.querySelector("#exportSaveButton");
  const importInput = document.querySelector("#importSaveInput");
  const status = document.querySelector("#saveBackupStatus");

  if (!exportButton || !importInput || !status) return;

  const knownSaveKeys = [
    typeof storageKey === "string" ? storageKey : "irl-rs-game-state-v2",
    "irl-rs-game-state-v1",
    typeof questStorageKey === "string" ? questStorageKey : "level-forge-quests-v2"
  ];

  function setStatus(message) {
    status.textContent = message;
  }

  function saveKeys() {
    const keys = new Set(knownSaveKeys);

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key) continue;
      if (key.startsWith("irl-rs-game-") || key.startsWith("level-forge-")) keys.add(key);
    }

    return [...keys];
  }

  function collectSaveData() {
    return Object.fromEntries(
      saveKeys()
        .map((key) => [key, localStorage.getItem(key)])
        .filter(([, value]) => value !== null)
    );
  }

  function backupFileName() {
    const stamp = new Date().toISOString().slice(0, 10);
    return `level-forge-save-${stamp}.json`;
  }

  function downloadTextFile(fileName, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function exportSave() {
    const backup = {
      app: "Level Forge",
      backupVersion: 1,
      exportedAt: new Date().toISOString(),
      storage: collectSaveData()
    };

    downloadTextFile(backupFileName(), JSON.stringify(backup, null, 2));
    setStatus("Save exported.");
  }

  function parseBackup(text) {
    const parsed = JSON.parse(text);

    if (!parsed || parsed.app !== "Level Forge" || !parsed.storage || typeof parsed.storage !== "object") {
      throw new Error("Invalid Level Forge backup file.");
    }

    return parsed;
  }

  function restoreSave(backup) {
    for (const key of new Set([...saveKeys(), ...Object.keys(backup.storage)])) {
      localStorage.removeItem(key);
    }

    for (const [key, value] of Object.entries(backup.storage)) {
      if (typeof value === "string") localStorage.setItem(key, value);
    }
  }

  async function importSave(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const backup = parseBackup(await file.text());
      const confirmed = window.confirm("Import this Level Forge save? This will replace current progress.");
      if (!confirmed) return;

      restoreSave(backup);
      setStatus("Save imported. Reloading...");
      window.setTimeout(() => window.location.reload(), 250);
    } catch (error) {
      setStatus(error.message || "Save import failed.");
    } finally {
      importInput.value = "";
    }
  }

  exportButton.addEventListener("click", exportSave);
  importInput.addEventListener("change", importSave);
})();
