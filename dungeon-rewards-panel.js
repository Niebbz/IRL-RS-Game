(function () {
  function rewardLinesForSelectionCard(card) {
    return Array.from(card.children).filter((child) => {
      if (!child.classList?.contains("dungeon-detail") || child.closest(".dungeon-reward-panel")) return false;

      const text = child.textContent.trim();
      return text.startsWith("Reward:") || text.startsWith("Materials:") || text.startsWith("Chest:");
    });
  }

  function rewardLinesForActiveCard(card) {
    const footerReward = card.querySelector(".skill-footer span:nth-child(2)");
    const detailRewards = Array.from(card.children).filter((child) => {
      if (!child.classList?.contains("dungeon-detail") || child.closest(".dungeon-reward-panel")) return false;

      const text = child.textContent.trim();
      return text.startsWith("Materials") || text.startsWith("Chest:");
    });

    return [footerReward, ...detailRewards].filter(Boolean);
  }

  function ensureRewardPanel(card, anchor = null) {
    let panel = card.querySelector(".dungeon-reward-panel");
    let button = card.querySelector(".dungeon-rewards-button");

    if (!panel) {
      panel = document.createElement("div");
      panel.className = "dungeon-reward-panel";
      panel.hidden = true;
    }

    if (!button) {
      button = document.createElement("button");
      button.className = "secondary-button dungeon-rewards-button";
      button.type = "button";
      button.textContent = "View Rewards";
      button.setAttribute("aria-expanded", "false");
    }

    if (!button.isConnected) card.insertBefore(button, anchor);
    if (!panel.isConnected) button.after(panel);

    return { button, panel };
  }

  function moveRewardsIntoPanel(card, lines, anchor) {
    if (lines.length === 0) return;

    const { panel } = ensureRewardPanel(card, anchor);

    for (const line of lines) {
      line.classList.add("dungeon-reward-row");
      panel.appendChild(line);
    }
  }

  function compactSelectionCard(card) {
    const enterButton = card.querySelector("[data-enter-dungeon]");
    if (!enterButton) return;

    moveRewardsIntoPanel(card, rewardLinesForSelectionCard(card), enterButton);
  }

  function compactActiveCard(card) {
    const footer = card.querySelector(".skill-footer");
    if (!footer) return;

    moveRewardsIntoPanel(card, rewardLinesForActiveCard(card), footer.nextSibling);
  }

  function compactDungeonRewards() {
    document.querySelectorAll("#dungeonSelection .dungeon-card").forEach(compactSelectionCard);
    document.querySelectorAll("#activeDungeon .active-dungeon-card").forEach(compactActiveCard);
  }

  function installRenderPatch() {
    if (typeof render === "function" && !render.__dungeonRewardPanel) {
      const baseRender = render;
      render = function renderWithDungeonRewardsPanel() {
        baseRender();
        requestAnimationFrame(compactDungeonRewards);
      };
      render.__dungeonRewardPanel = true;
    }

    compactDungeonRewards();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".dungeon-rewards-button");
    if (!button) return;

    const panel = button.nextElementSibling;
    if (!panel?.classList.contains("dungeon-reward-panel")) return;

    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    button.textContent = isOpen ? "View Rewards" : "Hide Rewards";
    button.setAttribute("aria-expanded", String(!isOpen));
  });

  let compactQueued = false;
  const observer = new MutationObserver(() => {
    if (compactQueued) return;

    compactQueued = true;
    requestAnimationFrame(() => {
      compactQueued = false;
      compactDungeonRewards();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installRenderPatch);
  } else {
    installRenderPatch();
  }
})();
