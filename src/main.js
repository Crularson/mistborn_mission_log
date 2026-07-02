import { getAllMissions } from "./data.js";
import { saveMission } from "./storage.js";
import { setupModal, setupResponsiveMenu } from "./modal.js";
import { renderFilterOptions, renderMissionCards, showConfirmationDialog } from "./render.js";
import { missionFromForm, showFormErrors, validateMissionForm } from "./validation.js";

window.__missionAppReady = true;

const state = {
  missions: []
};

const missionList = document.querySelector("#mission-list");
const filtersForm = document.querySelector("#filters-form");
const missionCount = document.querySelector("#mission-count");
const missionForm = document.querySelector("#mission-form");
const modalElement = document.querySelector("#mission-modal");
const modal = setupModal(modalElement);

document.querySelectorAll("[data-open-mission-modal]").forEach((button) => {
  button.addEventListener("click", modal.openModal);
});

setupResponsiveMenu();
initializeArchive();

filtersForm.addEventListener("input", renderFilteredMissions);

missionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const result = validateMissionForm(missionForm);
  showFormErrors(missionForm, result.errors);

  if (!result.isValid) {
    const firstInvalid = missionForm.querySelector("[aria-invalid='true']");
    firstInvalid?.focus();
    return;
  }

  const mission = missionFromForm(result.values);
  saveMission(mission);
  state.missions = [mission, ...state.missions];
  missionForm.reset();
  modal.closeModal();
  renderFilterOptions(state.missions);
  renderFilteredMissions();
  showConfirmationDialog();
});

async function initializeArchive() {
  try {
    state.missions = await getAllMissions();
    renderFilterOptions(state.missions);
    renderFilteredMissions();
  } catch (error) {
    missionList.innerHTML = `
      <article class="empty-state">
        <h3>Mission archive unavailable</h3>
        <p>${error.message}</p>
      </article>
    `;
  }
}

function renderFilteredMissions() {
  const formData = new FormData(filtersForm);
  const search = String(formData.get("search") || "").toLowerCase();
  const threat = formData.get("threat");
  const location = formData.get("location");
  const target = formData.get("target");

  const filteredMissions = state.missions.filter((mission) => {
    const searchableText = [
      mission.location,
      mission.district,
      mission.threatLevel,
      mission.houseTarget,
      mission.status,
      mission.crewReport,
      ...(mission.metalsUsed || [])
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!search || searchableText.includes(search)) &&
      (!threat || mission.threatLevel === threat) &&
      (!location || mission.location === location) &&
      (!target || mission.houseTarget === target)
    );
  });

  missionCount.textContent = `${filteredMissions.length} of ${state.missions.length} missions shown`;
  renderMissionCards(filteredMissions, missionList);
}
