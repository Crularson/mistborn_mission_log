import { getAllMissions } from "./data.js";
import { deleteStoredMission, isStoredMission } from "./storage.js";
import { setupResponsiveMenu } from "./modal.js";
import { renderMissionDetail, showToast } from "./render.js";

window.__missionAppReady = true;

const detailContainer = document.querySelector("#mission-detail");
const params = new URLSearchParams(window.location.search);
const missionId = params.get("id");

setupResponsiveMenu();
initializeDetail();

async function initializeDetail() {
  try {
    const missions = await getAllMissions();
    const mission = missions.find((item) => item.id === missionId);
    renderMissionDetail(mission, detailContainer, isStoredMission(missionId));
    setupDetailActions(mission);
  } catch (error) {
    detailContainer.innerHTML = `
      <article class="detail-card">
        <p class="eyebrow">Archive Error</p>
        <h1>Mission report unavailable</h1>
        <p>${error.message}</p>
      </article>
    `;
  }
}

function setupDetailActions(mission) {
  if (!mission) return;

  const priorityButton = document.querySelector("[data-favorite]");
  priorityButton?.addEventListener("click", () => {
    priorityButton.textContent = "Priority Marked";
    priorityButton.disabled = true;
    showToast("Mission marked as priority for crew review.");
  });

  const deleteButton = document.querySelector("[data-delete-mission]");
  deleteButton?.addEventListener("click", () => {
    deleteStoredMission(mission.id);
    showToast("Saved mission removed from this browser.");
    window.setTimeout(() => {
      window.location.href = "./index.html";
    }, 900);
  });
}
