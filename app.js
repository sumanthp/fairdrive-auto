const viewButtons = document.querySelectorAll("[data-view]");
const targetButtons = document.querySelectorAll("[data-view-target]");
const panels = document.querySelectorAll("[data-view-panel]");
const quoteUpload = document.querySelector("#quoteUpload");
const quoteExplanation = document.querySelector("#quoteExplanation");
const estimatorForm = document.querySelector("#estimatorForm");
const vehicleSelect = document.querySelector("#vehicleSelect");
const garageVehicleSelect = document.querySelector("#garageVehicleSelect");
const selectedVehicleName = document.querySelector("#selectedVehicleName");
const vehicleDesignLabel = document.querySelector("#vehicleDesignLabel");
const historySelect = document.querySelector("#historySelect");
const estimateResult = document.querySelector("#estimateResult");
const popover = document.querySelector("#coveragePopover");
const hotspots = document.querySelectorAll(".hotspot");

let currentVehicle = "accord";

const vehicleModels = {
  accord: { label: "2023 Honda Accord", design: "Mid-size sedan" },
  camry: { label: "2023 Toyota Camry", design: "Angular sedan" },
  bmw: { label: "2023 BMW 330i", design: "Sport luxury sedan" },
  tesla: { label: "2023 Tesla Model 3", design: "Minimal EV fastback" },
  crv: { label: "2023 Honda CR-V", design: "Compact SUV" },
};

const estimates = {
  accord: { none: [310, 430], short: [250, 350], long: [190, 280] },
  camry: { none: [290, 410], short: [235, 330], long: [180, 265] },
  bmw: { none: [430, 590], short: [360, 500], long: [275, 405] },
  tesla: { none: [390, 540], short: [320, 455], long: [245, 370] },
  crv: { none: [275, 390], short: [225, 315], long: [175, 255] },
};

const coverageCopy = {
  Collision: "Protects your car after an accident with another vehicle or object.",
  Comprehensive: "Protects against theft, hail, glass damage, flood, fire, and other non-collision events.",
  Medical: "Helps cover medical costs for you or passengers after a covered accident.",
};

function setView(view) {
  viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === view);
  });
}

function setVehicle(vehicle) {
  currentVehicle = vehicle;
  const model = vehicleModels[vehicle];
  selectedVehicleName.textContent = model.label;
  vehicleDesignLabel.textContent = model.design;
  garageVehicleSelect.value = vehicle;
  vehicleSelect.value = vehicle;
  window.FairDriveCarViewer?.setVehicleModel(vehicle);
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

targetButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.viewTarget));
});

garageVehicleSelect?.addEventListener("change", () => {
  setVehicle(garageVehicleSelect.value);
});

vehicleSelect?.addEventListener("change", () => {
  setVehicle(vehicleSelect.value);
});

quoteUpload?.addEventListener("change", () => {
  const file = quoteUpload.files?.[0];
  if (!file) return;

  quoteExplanation.innerHTML = `
    <p class="eyebrow">Simulated extraction</p>
    <p>
      ${file.name} is ready for analysis. In the MVP, this will extract premium,
      deductibles, liability limits, discounts, and likely price drivers.
    </p>
  `;
});

estimatorForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const vehicle = vehicleSelect.value;
  const history = historySelect.value;
  const [low, high] = estimates[vehicle][history];

  estimateResult.innerHTML = `
    <span>${vehicleModels[vehicle].label}</span>
    <strong>$${low} - $${high}/mo</strong>
    <p>This range is a planning estimate. Real quotes depend on garaging address, coverage, carrier appetite, driving record, and state rules.</p>
  `;
});

hotspots.forEach((hotspot) => {
  hotspot.addEventListener("mouseenter", () => {
    const label = hotspot.dataset.coverage;
    popover.innerHTML = `
      <p class="eyebrow">Coverage</p>
      <strong>${label}</strong>
      <span>${coverageCopy[label]}</span>
    `;
  });
});

setVehicle(currentVehicle);
