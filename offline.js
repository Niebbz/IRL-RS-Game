// Registers the offline cache used by the iPhone home-screen version.
(function () {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js?v=0.1.1")
      .then((registration) => registration.update())
      .catch(() => {});
  });
})();
