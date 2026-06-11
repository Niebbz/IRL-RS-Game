(function () {
  const amountInput = document.querySelector("#amount");
  const workoutType = document.querySelector("#workoutType");
  const row = document.querySelector("#mileSliderRow");
  const wholeInput = document.querySelector("#wholeMileSlider");
  const tenthInput = document.querySelector("#tenthMileSlider");
  const totalValue = document.querySelector("#mileSliderValue");
  const wholeValue = document.querySelector("#wholeMileValue");
  const tenthValue = document.querySelector("#tenthMileValue");
  const wheels = Array.from(document.querySelectorAll("[data-distance-control]"));

  if (!amountInput || !workoutType || !row || !wholeInput || !tenthInput || wheels.length === 0) return;
  // The main app still owns XP math; this helper only removes the old UI cap for runs.
  if (typeof workoutMap !== "undefined" && workoutMap.run) delete workoutMap.run.maxAmount;

  function numberFrom(value, fallback) {
    if (value === "" || value === null || value === undefined) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalizeAmount(value) {
    const min = numberFrom(amountInput.min, 0.1);
    const max = numberFrom(amountInput.max, Number.POSITIVE_INFINITY);
    const clamped = Math.min(max, Math.max(min, numberFrom(value, min)));
    return Math.round(clamped * 10) / 10;
  }

  function splitMiles(amount) {
    const normalized = normalizeAmount(amount);
    const whole = Math.floor(normalized);
    const tenths = Math.round((normalized - whole) * 10);
    return { whole, tenths };
  }

  function setHiddenInputs(amount) {
    const { whole, tenths } = splitMiles(amount);
    wholeInput.value = String(whole);
    tenthInput.value = String(tenths);
  }

  function renderPicker() {
    const amount = normalizeAmount(amountInput.value);
    const { whole, tenths } = splitMiles(amount);
    totalValue.textContent = `${amount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mi`;
    wholeValue.textContent = String(whole);
    tenthValue.textContent = `.${tenths}`;

    const wholeWheel = document.querySelector('[data-distance-control="whole"]');
    const tenthWheel = document.querySelector('[data-distance-control="tenth"]');
    if (wholeWheel) wholeWheel.setAttribute("aria-valuenow", String(whole));
    if (tenthWheel) tenthWheel.setAttribute("aria-valuenow", String(tenths));
  }

  function commitAmount(amount) {
    const normalized = normalizeAmount(amount);
    amountInput.value = String(normalized);
    setHiddenInputs(normalized);
    // The main app listens to the hidden inputs, so dispatch once to reuse its preview logic.
    wholeInput.dispatchEvent(new Event("input", { bubbles: true }));
    requestAnimationFrame(renderPicker);
  }

  function adjustDistance(control, step) {
    const { whole, tenths } = splitMiles(amountInput.value);
    const current = whole + tenths / 10;
    const delta = control === "whole" ? step : step / 10;
    commitAmount(current + delta);
  }

  function handleClick(event) {
    const button = event.target.closest("[data-mile-adjust]");
    if (!button) return;

    adjustDistance(button.dataset.mileAdjust, numberFrom(button.dataset.step, 0));
  }

  function handleWheel(event) {
    const wheel = event.target.closest("[data-distance-control]");
    if (!wheel || row.hidden) return;

    event.preventDefault();
    adjustDistance(wheel.dataset.distanceControl, event.deltaY < 0 ? 1 : -1);
  }

  function handleKeydown(event) {
    const wheel = event.target.closest("[data-distance-control]");
    if (!wheel || row.hidden) return;

    const keySteps = {
      ArrowUp: 1,
      ArrowRight: 1,
      ArrowDown: -1,
      ArrowLeft: -1,
      PageUp: 5,
      PageDown: -5
    };
    if (!(event.key in keySteps)) return;

    event.preventDefault();
    adjustDistance(wheel.dataset.distanceControl, keySteps[event.key]);
  }

  let dragState = null;

  function handlePointerDown(event) {
    const wheel = event.target.closest("[data-distance-control]");
    if (!wheel || event.target.closest("button") || row.hidden) return;

    dragState = {
      control: wheel.dataset.distanceControl,
      pointerId: event.pointerId,
      y: event.clientY
    };
    if (wheel.setPointerCapture) wheel.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const delta = dragState.y - event.clientY;
    // Require a little movement per step so touch/drag input feels deliberate.
    const steps = Math.trunc(delta / 28);
    if (steps === 0) return;

    event.preventDefault();
    adjustDistance(dragState.control, steps);
    dragState.y -= steps * 28;
  }

  function handlePointerEnd(event) {
    if (dragState?.pointerId === event.pointerId) dragState = null;
  }

  function loadWorkoutHistoryGroups() {
    if (!document.querySelector('link[href*="workout-history-groups.css?v=3"]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "workout-history-groups.css?v=3";
      document.head.appendChild(stylesheet);
    }

    if (!document.querySelector('script[src*="workout-history-groups.js?v=3"]')) {
      const script = document.createElement("script");
      script.src = "workout-history-groups.js?v=3";
      document.body.appendChild(script);
    }
  }

  for (const wheel of wheels) {
    wheel.addEventListener("click", handleClick);
    wheel.addEventListener("wheel", handleWheel, { passive: false });
    wheel.addEventListener("keydown", handleKeydown);
    wheel.addEventListener("pointerdown", handlePointerDown);
    wheel.addEventListener("pointermove", handlePointerMove);
    wheel.addEventListener("pointerup", handlePointerEnd);
    wheel.addEventListener("pointercancel", handlePointerEnd);
  }

  amountInput.addEventListener("input", () => requestAnimationFrame(renderPicker));
  wholeInput.addEventListener("input", () => requestAnimationFrame(renderPicker));
  tenthInput.addEventListener("input", () => requestAnimationFrame(renderPicker));
  workoutType.addEventListener("change", () => requestAnimationFrame(renderPicker));

  loadWorkoutHistoryGroups();
  requestAnimationFrame(renderPicker);
})();
