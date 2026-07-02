const durationPattern = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/;

const messages = {
  date: "Choose the mission date.",
  location: "Enter the mission location.",
  threatLevel: "Select a threat level.",
  duration: "Enter duration in HH:MM:SS format.",
  crewReport: "Enter a crew report of at least 20 characters."
};

export function validateMissionForm(form) {
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  const errors = {};

  if (!values.date) errors.date = messages.date;
  if (!values.location?.trim()) errors.location = messages.location;
  if (!values.threatLevel) errors.threatLevel = messages.threatLevel;
  if (!durationPattern.test(values.duration || "")) errors.duration = messages.duration;
  if (!values.crewReport?.trim() || values.crewReport.trim().length < 20) {
    errors.crewReport = messages.crewReport;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values
  };
}

export function showFormErrors(form, errors) {
  form.querySelectorAll(".error-text").forEach((element) => {
    element.textContent = "";
  });

  form.querySelectorAll("[aria-invalid='true']").forEach((element) => {
    element.removeAttribute("aria-invalid");
  });

  Object.entries(errors).forEach(([field, message]) => {
    const input = form.elements[field];
    const errorElement = form.querySelector(`#${field}-error`);

    if (input) {
      input.setAttribute("aria-invalid", "true");
    }

    if (errorElement) {
      errorElement.textContent = message;
    }
  });
}

export function missionFromForm(values) {
  return {
    id: `mission-${Date.now()}`,
    date: values.date,
    location: values.location.trim(),
    district: values.district.trim(),
    threatLevel: values.threatLevel,
    duration: values.duration,
    metalsUsed: values.metalsUsed
      ? values.metalsUsed.split(",").map((metal) => metal.trim()).filter(Boolean)
      : [],
    houseTarget: values.houseTarget.trim(),
    status: values.status || "Completed",
    crewReport: values.crewReport.trim()
  };
}
