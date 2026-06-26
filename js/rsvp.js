export function initRSVP() {
    const form = document.getElementById('rsvp-form');
    const statusMsg = document.getElementById('rsvp-message');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Disable button during submission
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Processing...";

        statusMsg.textContent = "Sending your response...";
        statusMsg.className = "form-status";
        statusMsg.style.color = "var(--color-text-light)";

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Simulate API call with a bit of a delay for realism
        setTimeout(() => {
            // Simple mock success
            statusMsg.textContent = "Thank you! Your response has been received.";
            statusMsg.className = "form-status success";
            statusMsg.style.color = "var(--color-success)";

            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;

            form.reset();

            // In a real scenario, you'd send 'data' to a backend here.
            // data contains: first-name, last-name, email, attendance, guests, meal, allergies, message

            // Hide success message after 5 seconds
            setTimeout(() => {
                statusMsg.textContent = "";
            }, 5000);

        }, 1800);
    });

    // Handle form input focus effects
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });
}
