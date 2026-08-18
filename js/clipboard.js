import { t } from "./i18n.js";

export const initClipboard = () => {
  document.addEventListener("click", (event) => {
    const copyButton = event.target.closest(
      "[data-copy-target], .btn-copy-iban",
    );
    if (!copyButton) return;

    const selector = copyButton.dataset.copyTarget || ".iban strong";
    const target = document.querySelector(selector);
    const text = target?.textContent.trim().replace(/\s+/g, " ");

    if (!text) return;

    let copyOperation;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable");
      }

      copyOperation = navigator.clipboard.writeText(text);
    } catch {
      alert(t("contribution.copyError"));
      return;
    }

    Promise.resolve(copyOperation)
      .then(() => {
        copyButton.textContent = t("contribution.copied");
        setTimeout(() => {
          copyButton.textContent = t("contribution.copy");
        }, 2000);
      })
      .catch(() => {
        alert(t("contribution.copyError"));
      });
  });
};
