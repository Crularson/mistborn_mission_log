(function () {
  window.addEventListener("DOMContentLoaded", function () {
    window.setTimeout(function () {
      if (window.__missionAppReady) return;
      startFallbackApp();
    }, 120);
  });

  var storageKey = "kelsiersCrewMissions";
  var starterMissions = [
    {
      id: "mission001",
      date: "1024-04-12",
      location: "Luthadel",
      district: "Venture District",
      threatLevel: "High",
      duration: "02:15:00",
      metalsUsed: ["Steel", "Tin", "Pewter"],
      houseTarget: "House Venture",
      status: "Completed",
      crewReport:
        "Observed noble activity near Venture Manor. Burned tin and steel during surveillance. No suspicions raised."
    },
    {
      id: "mission002",
      date: "1024-04-18",
      location: "Luthadel",
      district: "Canal District",
      threatLevel: "Moderate",
      duration: "01:05:30",
      metalsUsed: ["Copper", "Bronze"],
      houseTarget: "House Tekiel",
      status: "Completed",
      crewReport:
        "Met with canal workers to confirm guard rotations and supply routes. Coppercloud held steady while bronze checked nearby pulses."
    },
    {
      id: "mission003",
      date: "1024-05-02",
      location: "Fadrex Outskirts",
      district: "Western Road",
      threatLevel: "Low",
      duration: "00:47:20",
      metalsUsed: ["Tin"],
      houseTarget: "",
      status: "Completed",
      crewReport:
        "Scouted an abandoned storehouse suitable for temporary shelter. No noble patrols encountered."
    },
    {
      id: "mission004",
      date: "1024-05-16",
      location: "Luthadel",
      district: "Keep Hasting",
      threatLevel: "Critical",
      duration: "03:10:45",
      metalsUsed: ["Steel", "Iron", "Pewter", "Zinc"],
      houseTarget: "House Hasting",
      status: "In Review",
      crewReport:
        "Diversion drew guards from the east gate while crew members mapped servant passages. Zinc was used sparingly to avoid pattern recognition."
    }
  ];

  function startFallbackApp() {
    setupResponsiveMenu();

    if (document.querySelector("#mission-list")) {
      startArchivePage();
    }

    if (document.querySelector("#mission-detail")) {
      startDetailPage();
    }
  }

  function startArchivePage() {
    var missions = getAllMissions();
    var list = document.querySelector("#mission-list");
    var filtersForm = document.querySelector("#filters-form");
    var count = document.querySelector("#mission-count");
    var missionForm = document.querySelector("#mission-form");
    var modal = document.querySelector("#mission-modal");

    setupModal(modal);
    document.querySelectorAll("[data-open-mission-modal]").forEach(function (button) {
      button.addEventListener("click", function () {
        openModal(modal);
      });
    });

    renderFilterOptions(missions);
    renderFiltered();
    filtersForm.addEventListener("input", renderFiltered);

    missionForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var result = validateForm(missionForm);
      showErrors(missionForm, result.errors);

      if (!result.isValid) {
        var firstInvalid = missionForm.querySelector("[aria-invalid='true']");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var mission = missionFromForm(result.values);
      saveMission(mission);
      missions.unshift(mission);
      missionForm.reset();
      closeModal(modal);
      renderFilterOptions(missions);
      renderFiltered();
      showConfirmationDialog();
    });

    function renderFiltered() {
      var data = new FormData(filtersForm);
      var search = String(data.get("search") || "").toLowerCase();
      var threat = data.get("threat");
      var location = data.get("location");
      var target = data.get("target");
      var filtered = missions.filter(function (mission) {
        var searchable = [
          mission.location,
          mission.district,
          mission.threatLevel,
          mission.houseTarget,
          mission.status,
          mission.crewReport
        ]
          .concat(mission.metalsUsed || [])
          .join(" ")
          .toLowerCase();

        return (
          (!search || searchable.indexOf(search) !== -1) &&
          (!threat || mission.threatLevel === threat) &&
          (!location || mission.location === location) &&
          (!target || mission.houseTarget === target)
        );
      });

      count.textContent = filtered.length + " of " + missions.length + " missions shown";
      renderCards(filtered, list);
    }
  }

  function startDetailPage() {
    var missions = getAllMissions();
    var id = new URLSearchParams(window.location.search).get("id");
    var mission = missions.find(function (item) {
      return item.id === id;
    });
    var container = document.querySelector("#mission-detail");

    renderDetail(mission, container, isStoredMission(id));

    var priority = document.querySelector("[data-favorite]");
    if (priority) {
      priority.addEventListener("click", function () {
        priority.textContent = "Priority Marked";
        priority.disabled = true;
        showToast("Mission marked as priority for crew review.");
      });
    }

    var deleteButton = document.querySelector("[data-delete-mission]");
    if (deleteButton) {
      deleteButton.addEventListener("click", function () {
        deleteStoredMission(mission.id);
        showToast("Saved mission removed from this browser.");
        window.setTimeout(function () {
          window.location.href = "./index.html";
        }, 900);
      });
    }
  }

  function getAllMissions() {
    var stored = getStoredMissions();
    var starterIds = starterMissions.map(function (mission) {
      return mission.id;
    });
    var uniqueStored = stored.filter(function (mission) {
      return starterIds.indexOf(mission.id) === -1;
    });

    return starterMissions
      .concat(uniqueStored)
      .sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
  }

  function getStoredMissions() {
    try {
      var missions = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(missions) ? missions : [];
    } catch (error) {
      return [];
    }
  }

  function saveMission(mission) {
    var missions = getStoredMissions();
    localStorage.setItem(storageKey, JSON.stringify(missions.concat(mission)));
  }

  function deleteStoredMission(id) {
    var missions = getStoredMissions().filter(function (mission) {
      return mission.id !== id;
    });
    localStorage.setItem(storageKey, JSON.stringify(missions));
  }

  function isStoredMission(id) {
    return getStoredMissions().some(function (mission) {
      return mission.id === id;
    });
  }

  function setupResponsiveMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector("#primary-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isExpanded));
      toggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
      menu.classList.toggle("is-open", !isExpanded);
    });
  }

  function setupModal(modal) {
    if (!modal) return;
    modal.querySelectorAll("[data-close-modal]").forEach(function (button) {
      button.addEventListener("click", function () {
        closeModal(modal);
      });
    });

    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal(modal);
    });

    modal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeModal(modal);
    });
  }

  function openModal(modal) {
    modal.hidden = false;
    document.body.classList.add("modal-open");
    var dialog = modal.querySelector("[role='dialog']");
    if (dialog) dialog.focus();
  }

  function closeModal(modal) {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function renderCards(missions, container) {
    if (!missions.length) {
      container.innerHTML =
        '<article class="empty-state"><h3>No missions found</h3><p>Adjust the filters or log a new field report.</p></article>';
      return;
    }

    container.innerHTML = missions
      .map(function (mission) {
        return (
          '<article class="mission-card">' +
          '<div class="card-topline"><span class="threat-badge ' +
          mission.threatLevel.toLowerCase() +
          '">' +
          escapeHtml(mission.threatLevel) +
          "</span><span>" +
          formatDate(mission.date) +
          "</span></div>" +
          "<h3>" +
          escapeHtml(mission.location) +
          " Operation</h3><p>" +
          escapeHtml(mission.district || "Undisclosed district") +
          '</p><dl class="card-stats"><div><dt>Duration</dt><dd>' +
          escapeHtml(mission.duration) +
          "</dd></div><div><dt>Status</dt><dd>" +
          escapeHtml(mission.status) +
          '</dd></div></dl><a class="card-link" href="./mission.html?id=' +
          encodeURIComponent(mission.id) +
          '">View report</a></article>'
        );
      })
      .join("");
  }

  function renderFilterOptions(missions) {
    fillSelect("threat-filter", unique(missions.map(getThreat)));
    fillSelect("location-filter", unique(missions.map(getLocation)));
    fillSelect("target-filter", unique(missions.map(getTarget).filter(Boolean)));
  }

  function fillSelect(id, values) {
    var select = document.querySelector("#" + id);
    if (!select) return;
    var first = select.querySelector("option").outerHTML;
    select.innerHTML =
      first +
      values
        .map(function (value) {
          return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + "</option>";
        })
        .join("");
  }

  function renderDetail(mission, container, canDelete) {
    if (!mission) {
      container.innerHTML =
        '<article class="detail-card"><p class="eyebrow">Report Missing</p><h1>Mission not found</h1><p>The requested report is not in the starter archive or this browser saved records.</p></article>';
      return;
    }

    var target = mission.houseTarget || "No noble house target recorded";
    var metals = mission.metalsUsed && mission.metalsUsed.length ? mission.metalsUsed : ["No metals recorded"];
    container.innerHTML =
      '<article class="detail-card"><div class="detail-header"><div><p class="eyebrow">' +
      escapeHtml(mission.status) +
      "</p><h1>" +
      escapeHtml(mission.location) +
      " Mission Report</h1><p>" +
      escapeHtml(mission.district || "Undisclosed district") +
      '</p></div><span class="threat-badge ' +
      mission.threatLevel.toLowerCase() +
      '">' +
      escapeHtml(mission.threatLevel) +
      '</span></div><dl class="report-grid"><div><dt>Date</dt><dd>' +
      formatDate(mission.date) +
      "</dd></div><div><dt>Duration</dt><dd>" +
      escapeHtml(mission.duration) +
      "</dd></div><div><dt>Location</dt><dd>" +
      escapeHtml(mission.location) +
      "</dd></div><div><dt>Noble House</dt><dd>" +
      escapeHtml(target) +
      '</dd></div></dl><section class="report-block" aria-labelledby="metals-title"><h2 id="metals-title">Metals Used</h2><div class="metal-list">' +
      metals
        .map(function (metal) {
          return "<span>" + escapeHtml(metal) + "</span>";
        })
        .join("") +
      '</div></section><section class="report-block" aria-labelledby="crew-notes-title"><h2 id="crew-notes-title">Crew Notes</h2><p>' +
      escapeHtml(mission.crewReport) +
      '</p></section><div class="detail-actions"><button class="secondary-button" type="button" data-favorite>Mark Priority</button>' +
      (canDelete
        ? '<button class="danger-button" type="button" data-delete-mission="' +
          escapeHtml(mission.id) +
          '">Delete Saved Mission</button>'
        : "") +
      "</div></article>";
  }

  function validateForm(form) {
    var data = new FormData(form);
    var values = {};
    data.forEach(function (value, key) {
      values[key] = value;
    });
    var errors = {};

    if (!values.date) errors.date = "Choose the mission date.";
    if (!String(values.location || "").trim()) errors.location = "Enter the mission location.";
    if (!values.threatLevel) errors.threatLevel = "Select a threat level.";
    if (!/^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/.test(values.duration || "")) {
      errors.duration = "Enter duration in HH:MM:SS format.";
    }
    if (!String(values.crewReport || "").trim() || String(values.crewReport).trim().length < 20) {
      errors.crewReport = "Enter a crew report of at least 20 characters.";
    }

    return { isValid: Object.keys(errors).length === 0, errors: errors, values: values };
  }

  function showErrors(form, errors) {
    form.querySelectorAll(".error-text").forEach(function (element) {
      element.textContent = "";
    });
    form.querySelectorAll("[aria-invalid='true']").forEach(function (element) {
      element.removeAttribute("aria-invalid");
    });
    Object.keys(errors).forEach(function (field) {
      var input = form.elements[field];
      var error = form.querySelector("#" + field + "-error");
      if (input) input.setAttribute("aria-invalid", "true");
      if (error) error.textContent = errors[field];
    });
  }

  function missionFromForm(values) {
    return {
      id: "mission-" + Date.now(),
      date: values.date,
      location: String(values.location).trim(),
      district: String(values.district || "").trim(),
      threatLevel: values.threatLevel,
      duration: values.duration,
      metalsUsed: values.metalsUsed
        ? values.metalsUsed
            .split(",")
            .map(function (metal) {
              return metal.trim();
            })
            .filter(Boolean)
        : [],
      houseTarget: String(values.houseTarget || "").trim(),
      status: values.status || "Completed",
      crewReport: String(values.crewReport).trim()
    };
  }

  function showConfirmationDialog() {
    var backdrop = document.querySelector("#confirmation-dialog");
    if (!backdrop) return;
    var button = backdrop.querySelector("[data-close-confirmation]");
    backdrop.hidden = false;
    document.body.classList.add("modal-open");
    backdrop.querySelector("[role='alertdialog']").focus();
    button.addEventListener(
      "click",
      function () {
        backdrop.hidden = true;
        document.body.classList.remove("modal-open");
      },
      { once: true }
    );
  }

  function showToast(message) {
    var toast = document.querySelector("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add("is-visible");
    window.setTimeout(function () {
      toast.classList.remove("is-visible");
      toast.hidden = true;
    }, 3000);
  }

  function unique(values) {
    return values
      .filter(Boolean)
      .filter(function (value, index, array) {
        return array.indexOf(value) === index;
      })
      .sort();
  }

  function getThreat(mission) {
    return mission.threatLevel;
  }

  function getLocation(mission) {
    return mission.location;
  }

  function getTarget(mission) {
    return mission.houseTarget;
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(date + "T00:00:00"));
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character];
    });
  }
})();
