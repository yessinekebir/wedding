import { t } from "./i18n.js";

const MEAL_VALUES = ["fish", "meat", "vegetarian"];
const MIN_ADULTS = 1;
const MAX_ADULTS = 10;

const clampAdults = (value) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) return MIN_ADULTS;

  return Math.min(Math.max(parsed, MIN_ADULTS), MAX_ADULTS);
};

const createMealField = (index, selectedValue) => {
  const id = `meal-${index}`;

  const group = document.createElement("div");
  group.className = "form-group";

  const label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = t("rsvp.adultNumber").replace("{n}", index);

  const select = document.createElement("select");
  select.id = id;
  select.name = id;
  select.required = true;

  const placeholder = new Option(t("rsvp.mealPlaceholder"), "");
  placeholder.disabled = true;
  select.append(placeholder);

  MEAL_VALUES.forEach((value) => {
    select.append(new Option(t(`rsvp.${value}`), value));
  });

  select.value = MEAL_VALUES.includes(selectedValue) ? selectedValue : "";

  group.append(label, select);

  return group;
};

export const initRSVP = () => {
  const rsvpForm = document.getElementById("rsvp-form");

  if (!rsvpForm) return;

  const submitButton = rsvpForm.querySelector('button[type="submit"]');
  const attendanceSelect = rsvpForm.querySelector("#attendance");
  const guestsFieldset = rsvpForm.querySelector("#guests-fieldset");
  const adultsInput = rsvpForm.querySelector("#adults");
  const mealList = rsvpForm.querySelector("#meal-list");

  // One menu selector per adult, keeping the choices already made when the
  // count changes or the language is switched.
  const renderMealFields = () => {
    const previous = Array.from(
      mealList.querySelectorAll("select"),
      (select) => select.value,
    );

    mealList.replaceChildren(
      ...Array.from({ length: clampAdults(adultsInput.value) }, (_, index) =>
        createMealField(index + 1, previous[index]),
      ),
    );
  };

  // A disabled fieldset is neither validated nor submitted, so guests details
  // are only sent along when the invitee is actually coming.
  const syncAttendance = () => {
    const isAttending = attendanceSelect.value === "SI";
    guestsFieldset.hidden = !isAttending;
    guestsFieldset.disabled = !isAttending;
  };

  adultsInput.addEventListener("input", renderMealFields);
  attendanceSelect.addEventListener("change", syncAttendance);

  document.addEventListener("languagechange", () => {
    renderMealFields();

    if (submitButton.disabled) {
      submitButton.textContent = t("rsvp.submitting");
    }
  });

  renderMealFields();
  syncAttendance();

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
