import { t } from "./i18n.js";

export const initRSVP = () => {
  const rsvpForm = document.getElementById("rsvp-form");

  if (!rsvpForm) return;

  const submitButton = rsvpForm.querySelector('button[type="submit"]');

  document.addEventListener("languagechange", () => {
    if (submitButton.disabled) {
      submitButton.textContent = t("rsvp.submitting");
    }
  });

  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!rsvpForm.checkValidity()) {
      rsvpForm.reportValidity();
      return;
    }

    submitButton.textContent = t("rsvp.submitting");
    submitButton.disabled = true;

    fetch(rsvpForm.action, {
      method: "POST",
      body: new FormData(rsvpForm),
      mode: "cors",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.text();
      })
      .then(() => {
        const successMessage = document.createElement("p");
        successMessage.className = "font-body";
        successMessage.style.fontSize = "1.1rem";
        successMessage.setAttribute("role", "status");
        successMessage.setAttribute("aria-live", "polite");
        successMessage.setAttribute("aria-atomic", "true");
        successMessage.setAttribute("tabindex", "-1");
        successMessage.dataset.i18n = "rsvp.success";
        rsvpForm.replaceWith(successMessage);
        successMessage.textContent = t("rsvp.success");
        successMessage.focus();
        successMessage.removeAttribute("tabindex");
      })
      .catch((error) => {
        console.error(error);
        alert(t("rsvp.error"));
        submitButton.disabled = false;
        submitButton.textContent = t("rsvp.submit");
      });
  });
};
