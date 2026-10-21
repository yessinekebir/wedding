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

// Public reCAPTCHA v3 site key. Leave empty to disable until configured.
const RECAPTCHA_SITE_KEY = "6Lf9afotAAAAALKb75CzBS80aYDT9xgF20iJcsyW";

const loadRecaptcha = () =>
  new Promise((resolve, reject) => {
    if (window.grecaptcha) return resolve();
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });

const getRecaptchaToken = () =>
  loadRecaptcha().then(
    () =>
      new Promise((resolve, reject) =>
        window.grecaptcha.ready(() =>
          window.grecaptcha
            .execute(RECAPTCHA_SITE_KEY, { action: "rsvp" })
            .then(resolve, reject),
        ),
      ),
  );

const MIN_FILL_MS = 4000;
const COOLDOWN_MS = 60000;
const COOLDOWN_KEY = "rsvp-last-submit";
const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}' .-]{0,49}$/u;
const LOOKS_SPAMMY = /https?:|www\.|<|>|@|\[url|\d{4,}/i;

const isValidName = (value) => {
  const name = value.trim();
  return NAME_PATTERN.test(name) && !LOOKS_SPAMMY.test(name);
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

  const loadedAt = Date.now();

  // Bots that only see the HTML never run this, so a missing token or
  // timestamp can be rejected by the Apps Script backend as well.
  const addHidden = (name, value) => {
    let input = rsvpForm.querySelector(`input[name="${name}"]`);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      rsvpForm.append(input);
    }
    input.value = value;
  };

  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!rsvpForm.checkValidity()) {
      rsvpForm.reportValidity();
      return;
    }

    const firstName = rsvpForm.querySelector("#first-name");
    const lastName = rsvpForm.querySelector("#last-name");

    if (!isValidName(firstName.value) || !isValidName(lastName.value)) {
      alert(t("rsvp.error"));
      return;
    }

    const honeypot = rsvpForm.querySelector("#website").value;
    const tooFast = Date.now() - loadedAt < MIN_FILL_MS;
    const lastSubmit = Number(localStorage.getItem(COOLDOWN_KEY) || 0);

    // Pretend to succeed for bots so they do not adapt.
    if (honeypot || tooFast) {
      rsvpForm.replaceWith(
        Object.assign(document.createElement("p"), {
          className: "font-body",
          textContent: t("rsvp.success"),
        }),
      );
      return;
    }

    if (Date.now() - lastSubmit < COOLDOWN_MS) {
      alert(t("rsvp.error"));
      return;
    }

    addHidden("elapsed", String(Date.now() - loadedAt));
    addHidden("token", btoa(`${loadedAt}:${Date.now()}`));
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));

    submitButton.textContent = t("rsvp.submitting");
    submitButton.disabled = true;

    const tokenPromise = RECAPTCHA_SITE_KEY
      ? getRecaptchaToken().then((token) => addHidden("g-recaptcha-response", token))
      : Promise.resolve();

    tokenPromise
      .then(() =>
        fetch(rsvpForm.action, {
          method: "POST",
          body: new FormData(rsvpForm),
          mode: "cors",
        }),
      )
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
