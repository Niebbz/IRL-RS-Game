(function () {
  const skillOrder = ["Attack", "Strength", "Defense", "Agility"];

  function dungeonSelectionRoot() {
    return document.querySelector("#dungeonSelection");
  }

  function statusForGroup(grid) {
    const cards = Array.from(grid.querySelectorAll(".dungeon-card"));
    const statuses = cards.map((card) => card.querySelector(".dungeon-status")?.textContent.trim() ?? "");
    const readyCount = statuses.filter((status) => status === "Ready").length;
    const hasActiveDungeon = statuses.some((status) => status === "Dungeon already active");

    if (readyCount > 0) return { text: `${readyCount} ready`, open: true };
    if (hasActiveDungeon) return { text: "Active", open: true };
    return { text: `${cards.length} dungeons`, open: false };
  }

  function makeSummary(title, hint, status) {
    const summary = document.createElement("summary");
    const copy = document.createElement("span");
    const heading = document.createElement("h3");
    const hintText = document.createElement("span");
    const statusText = document.createElement("span");

    summary.className = "dungeon-group-heading";
    copy.className = "dungeon-heading-copy";
    hintText.className = "dungeon-summary-hint";
    statusText.className = "dungeon-summary-status";

    heading.textContent = title;
    hintText.textContent = hint;
    statusText.textContent = status.text;

    copy.append(heading, hintText);
    summary.append(copy, statusText);
    return summary;
  }

  function convertGroup(group) {
    if (group.tagName === "DETAILS") return group;

    const heading = group.querySelector(":scope > .dungeon-group-heading");
    const grid = group.querySelector(":scope > .dungeon-tier-grid");
    if (!heading || !grid) return group;

    const title = heading.querySelector("h3")?.textContent.trim() ?? "Dungeon";
    const hint = heading.querySelector("span")?.textContent.trim() ?? "";
    const status = statusForGroup(grid);
    const details = document.createElement("details");

    details.className = group.className;
    details.open = status.open;
    details.append(makeSummary(title, hint, status), grid);
    group.replaceWith(details);
    return details;
  }

  function sortGroups(root) {
    const sortedGroups = Array.from(root.querySelectorAll(":scope > .dungeon-skill-group"))
      .sort((left, right) => {
        const leftTitle = left.querySelector("h3")?.textContent.trim() ?? "";
        const rightTitle = right.querySelector("h3")?.textContent.trim() ?? "";
        return skillOrder.indexOf(leftTitle) - skillOrder.indexOf(rightTitle);
      });

    sortedGroups.forEach((group, index) => {
      if (root.children[index] !== group) root.insertBefore(group, root.children[index] ?? null);
    });
  }

  function enhanceDungeonDropdowns() {
    const root = dungeonSelectionRoot();
    if (!root) return;

    Array.from(root.querySelectorAll(":scope > .dungeon-skill-group")).forEach(convertGroup);
    sortGroups(root);
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;

    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      enhanceDungeonDropdowns();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceDungeonDropdowns);
  } else {
    enhanceDungeonDropdowns();
  }
})();