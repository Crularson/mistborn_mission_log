let previouslyFocusedElement = null;

export function setupModal(modalElement) {
  const dialog = modalElement.querySelector("[role='dialog']");
  const closeButtons = modalElement.querySelectorAll("[data-close-modal]");

  function openModal() {
    previouslyFocusedElement = document.activeElement;
    modalElement.hidden = false;
    document.body.classList.add("modal-open");
    dialog.focus();
  }

  function closeModal() {
    modalElement.hidden = true;
    document.body.classList.remove("modal-open");
    previouslyFocusedElement?.focus();
  }

  closeButtons.forEach((button) => button.addEventListener("click", closeModal));

  modalElement.addEventListener("click", (event) => {
    if (event.target === modalElement) {
      closeModal();
    }
  });

  modalElement.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = dialog.querySelectorAll(
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  return { openModal, closeModal };
}

export function setupResponsiveMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#primary-menu");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isExpanded));
    toggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
    menu.classList.toggle("is-open", !isExpanded);
  });
}
