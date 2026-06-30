export const initRSVP = () => {
    const rsvpForm = document.getElementById('rsvp-form');

    if (!rsvpForm) return;

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation and feedback
        const formData = new FormData(rsvpForm);
        const name = formData.get('first-name');

        // Show loading state
        const submitBtn = rsvpForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Invio in corso...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            alert(`Grazie ${name}! La tua risposta è stata inviata con successo. Non vediamo l'ora di vederti!`);

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            rsvpForm.reset();
        }, 1500);
    });
};
