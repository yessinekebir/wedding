export const initEnvelope = () => {
    const overlay = document.getElementById('intro-overlay');
    const envelope = document.getElementById('envelope');
    const waxSeal = document.getElementById('wax-seal');
    const skipBtn = document.getElementById('skip-intro');
    const mainContent = document.getElementById('main-content');
    const introMusic = document.getElementById('bg-music');

    if (!overlay || !envelope || !mainContent) return;

    // Check if intro was already shown
    if (sessionStorage.getItem('introShown')) {
        overlay.style.display = 'none';
        mainContent.style.opacity = '1';
        mainContent.style.visibility = 'visible';
        // Ensure entrance animations still play if needed
        setTimeout(() => window.dispatchEvent(new CustomEvent('site-entered')), 100);
        return;
    }

    // GSAP Sequence
    const tl = gsap.timeline();

    tl.to('.intro-labels', { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' })
      .to('.envelope-wrapper', { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, '-=0.5')
      .to('.skip-intro', { opacity: 1, duration: 1 }, '-=0.5');

    createParticles();

    // Handle Click to Open & Enter
    const openAndEnter = () => {
        if (envelope.classList.contains('is-open')) return;

        envelope.classList.add('is-open');

        if (introMusic) {
            introMusic.play().catch(e => console.log('Autoplay blocked', e));
        }

        // Realistic transition: Open then fade overlay
        const openTl = gsap.timeline();
        openTl.to('.envelope-wrapper', {
            scale: 1.2,
            opacity: 0,
            duration: 1.5,
            delay: 1,
            ease: 'power2.inOut'
        })
        .to(overlay, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                overlay.style.display = 'none';
                sessionStorage.setItem('introShown', 'true');
                gsap.to(mainContent, {
                    opacity: 1,
                    visibility: 'visible',
                    duration: 1,
                    onComplete: () => {
                         window.dispatchEvent(new CustomEvent('site-entered'));
                    }
                });
            }
        }, '-=0.5');
    };

    envelope.addEventListener('click', openAndEnter);
    if (waxSeal) {
        waxSeal.addEventListener('click', (e) => {
            e.stopPropagation();
            openAndEnter();
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
            sessionStorage.setItem('introShown', 'true');
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';
            window.dispatchEvent(new CustomEvent('site-entered'));
        });
    }
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
