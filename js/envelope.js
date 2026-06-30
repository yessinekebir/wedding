export const initEnvelope = () => {
    const overlay = document.getElementById('intro-overlay');
    const envelope = document.getElementById('envelope');
    const waxSeal = document.getElementById('wax-seal');
    const enterBtn = document.getElementById('enter-btn');
    const skipBtn = document.getElementById('skip-intro');
    const mainContent = document.getElementById('main-content');
    const introMusic = document.getElementById('intro-music');

    // Check if intro was already shown
    if (sessionStorage.getItem('introShown')) {
        overlay.style.display = 'none';
        mainContent.style.opacity = '1';
        mainContent.style.visibility = 'visible';
        return;
    }

    // GSAP Sequence
    const tl = gsap.timeline();

    // 1. Initial fade in
    tl.to('.intro-labels', { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' })
      .to('.envelope-wrapper', { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.7)' }, '-=0.5')
      .to('.skip-intro', { opacity: 1, duration: 1 }, '-=0.5');

    // Floating particles
    createParticles();

    // Handle Click to Open
    const openEnvelope = () => {
        if (envelope.classList.contains('is-open')) return;

        envelope.classList.add('is-open');

        // Play music on first interaction
        if (introMusic) {
            introMusic.play().catch(e => console.log('Autoplay blocked', e));
        }

        const openTl = gsap.timeline();
        openTl.to('.envelope-paper', {
            y: -150,
            duration: 1.5,
            delay: 0.8,
            ease: 'power2.inOut'
        })
        .to('.enter-btn', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
        });
    };

    envelope.addEventListener('click', openEnvelope);
    waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope();
    });

    // Handle Enter Website
    const enterWebsite = () => {
        sessionStorage.setItem('introShown', 'true');

        gsap.to(overlay, {
            opacity: 0,
            duration: 1.5,
            ease: 'power2.inOut',
            onComplete: () => {
                overlay.style.display = 'none';
                gsap.to(mainContent, {
                    opacity: 1,
                    visibility: 'visible',
                    duration: 1,
                    onComplete: () => {
                         // Trigger main site animations
                         window.dispatchEvent(new CustomEvent('site-entered'));
                    }
                });
            }
        });
    };

    enterBtn.addEventListener('click', enterWebsite);
    skipBtn.addEventListener('click', enterWebsite);
};

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 1;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        container.appendChild(p);

        gsap.to(p, {
            y: `-${Math.random() * 100 + 50}`,
            x: `+=${Math.random() * 40 - 20}`,
            opacity: 0,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            ease: 'none',
            delay: Math.random() * 5
        });
    }
}
