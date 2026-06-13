const CACHE_NAME = "level-forge-v0.1.0";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=17",
  "./distance-picker.css",
  "./workout-history-groups.css?v=6",
  "./dungeon-rewards-panel.css?v=1",
  "./dungeon-dropdowns.css?v=1",
  "./shop.css?v=5",
  "./quests.css?v=5",
  "./township-upgrades.css?v=5",
  "./game-data.js?v=1",
  "./app.js?v=17",
  "./hp-skill.js?v=8",
  "./township.js?v=5",
  "./distance-picker.js?v=6",
  "./workout-history-groups.js?v=6",
  "./dungeon-rewards-panel.js?v=1",
  "./dungeon-dropdowns.js?v=1",
  "./township-upgrades.js?v=6",
  "./shop.js?v=7",
  "./quest-data.js?v=1",
  "./quests.js?v=11",
  "./save-tools.js?v=1",
  "./app-version.js?v=1",
  "./offline.js?v=1",
  "./assets/level-forge-title-logo-web.png",
  "./Image%20Upload%20Clean%20V2/pet-armadillo.png",
  "./Image%20Upload%20Clean%20V2/pet-cyclops.png",
  "./Image%20Upload%20Clean%20V2/pet-deer.png",
  "./Image%20Upload%20Clean%20V2/pet-eagle.png",
  "./Image%20Upload%20Clean%20V2/pet-ram.png",
  "./Image%20Upload%20Clean%20V2/skill-agility.png",
  "./Image%20Upload%20Clean%20V2/skill-attack.png",
  "./Image%20Upload%20Clean%20V2/skill-defense.png",
  "./Image%20Upload%20Clean%20V2/skill-discipline.png",
  "./Image%20Upload%20Clean%20V2/skill-strength.png",
  "./HP%20Skill%20Icons/hp-phoenix-pet.png",
  "./HP%20Skill%20Icons/hp-skill-symbol.png",
  "./cosmetic-backgrounds/background-dungeon-stone.webp",
  "./cosmetic-backgrounds/background-forest-trail.webp",
  "./cosmetic-backgrounds/background-golden-city.webp",
  "./cosmetic-backgrounds/background-infernal-forge.webp",
  "./cosmetic-backgrounds/background-night-sky.webp",
  "./level-forge-building-icons-transparent-fixed/building-barracks.png",
  "./level-forge-building-icons-transparent-fixed/building-blacksmith.png",
  "./level-forge-building-icons-transparent-fixed/building-cartographers-lodge.png",
  "./level-forge-building-icons-transparent-fixed/building-guild-hall.png",
  "./level-forge-building-icons-transparent-fixed/building-marketplace.png",
  "./level-forge-building-icons-transparent-fixed/building-palisade.png",
  "./level-forge-building-icons-transparent-fixed/building-stables.png",
  "./level-forge-building-icons-transparent-fixed/building-stone-walls.png",
  "./level-forge-building-icons-transparent-fixed/building-storehouse.png",
  "./level-forge-building-icons-transparent-fixed/building-town-hall.png",
  "./level-forge-building-icons-transparent-fixed/building-trade-post.png",
  "./level-forge-building-icons-transparent-fixed/building-watchtower.png"
];

async function cacheCoreAssets() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(CORE_ASSETS.map((asset) => new Request(asset, { cache: "reload" })));
}

async function clearOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((cacheName) => cacheName.startsWith("level-forge-") && cacheName !== CACHE_NAME)
      .map((cacheName) => caches.delete(cacheName))
  );
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response?.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") return cache.match("./index.html");
    return Response.error();
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheCoreAssets().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clearOldCaches().then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(networkFirst(event.request));
});
