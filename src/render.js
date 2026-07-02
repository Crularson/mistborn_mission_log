export function renderMissionCards(missions, container) {
  if (!missions.length) {
    container.innerHTML = `
      <article class="empty-state">
        <h3>No missions found</h3>
        <p>Adjust the filters or log a new field report.</p>
      </article>
    `;
    return;
  }

  container.innerHTML = missions.map(renderMissionCard).join("");
}

export function renderFilterOptions(missions) {
  fillSelect("threat-filter", uniqueValues(missions.map((mission) => mission.threatLevel)));
  fillSelect("location-filter", uniqueValues(missions.map((mission) => mission.location)));
  fillSelect("target-filter", uniqueValues(missions.map((mission) => mission.houseTarget).filter(Boolean)));
}

export function renderMissionDetail(mission, container, canDelete = false) {
  if (!mission) {
    container.innerHTML = `
      <article class="detail-card">
        <p class="eyebrow">Report Missing</p>
        <h1>Mission not found</h1>
        <p>The requested report is not in the starter archive or this browser's saved records.</p>
      </article>
    `;
    return;
  }

  const target = mission.houseTarget || "No noble house target recorded";
  const metals = mission.metalsUsed?.length ? mission.metalsUsed : ["No metals recorded"];

  container.innerHTML = `
    <article class="detail-card">
      <div class="detail-header">
        <div>
          <p class="eyebrow">${mission.status}</p>
          <h1>${escapeHtml(mission.location)} Mission Report</h1>
          <p>${escapeHtml(mission.district || "Undisclosed district")}</p>
        </div>
        <span class="threat-badge ${mission.threatLevel.toLowerCase()}">${mission.threatLevel}</span>
      </div>

      <dl class="report-grid">
        <div><dt>Date</dt><dd>${formatDate(mission.date)}</dd></div>
        <div><dt>Duration</dt><dd>${escapeHtml(mission.duration)}</dd></div>
        <div><dt>Location</dt><dd>${escapeHtml(mission.location)}</dd></div>
        <div><dt>Noble House</dt><dd>${escapeHtml(target)}</dd></div>
      </dl>

      <section class="report-block" aria-labelledby="metals-title">
        <h2 id="metals-title">Metals Used</h2>
        <div class="metal-list">
          ${metals.map((metal) => `<span>${escapeHtml(metal)}</span>`).join("")}
        </div>
      </section>

      <section class="report-block" aria-labelledby="crew-notes-title">
        <h2 id="crew-notes-title">Crew Notes</h2>
        <p>${escapeHtml(mission.crewReport)}</p>
      </section>

      <div class="detail-actions">
        <button class="secondary-button" type="button" data-favorite>Mark Priority</button>
        ${
          canDelete
            ? `<button class="danger-button" type="button" data-delete-mission="${mission.id}">Delete Saved Mission</button>`
            : ""
        }
      </div>
    </article>
  `;
}

export function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;
  toast.classList.remove("is-visible");
  window.setTimeout(() => toast.classList.add("is-visible"), 10);
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => {
      toast.hidden = true;
    }, 250);
  }, 3200);
}

export function showConfirmationDialog() {
  const backdrop = document.querySelector("#confirmation-dialog");
  const dialog = backdrop?.querySelector("[role='alertdialog']");
  const closeButton = backdrop?.querySelector("[data-close-confirmation]");

  if (!backdrop || !dialog || !closeButton) return;

  const closeDialog = () => {
    backdrop.hidden = true;
    document.body.classList.remove("modal-open");
  };

  backdrop.hidden = false;
  document.body.classList.add("modal-open");
  dialog.focus();
  closeButton.addEventListener("click", closeDialog, { once: true });

  backdrop.addEventListener(
    "click",
    (event) => {
      if (event.target === backdrop) closeDialog();
    },
    { once: true }
  );

  backdrop.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") closeDialog();
    },
    { once: true }
  );
}

function renderMissionCard(mission) {
  return `
    <article class="mission-card">
      <div class="card-topline">
        <span class="threat-badge ${mission.threatLevel.toLowerCase()}">${mission.threatLevel}</span>
        <span>${formatDate(mission.date)}</span>
      </div>
      <h3>${escapeHtml(mission.location)} Operation</h3>
      <p>${escapeHtml(mission.district || "Undisclosed district")}</p>
      <dl class="card-stats">
        <div><dt>Duration</dt><dd>${escapeHtml(mission.duration)}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(mission.status)}</dd></div>
      </dl>
      <a class="card-link" href="./mission.html?id=${encodeURIComponent(mission.id)}">
        View report
      </a>
    </article>
  `;
}

function fillSelect(id, values) {
  const select = document.querySelector(`#${id}`);
  if (!select) return;

  const firstOption = select.querySelector("option")?.outerHTML || "";
  select.innerHTML = `${firstOption}${values
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join("")}`;
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}
