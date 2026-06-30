export function initEnvelope(onComplete) {
    const overlay = document.getElementById('intro-overlay');
    const envelope = document.getElementById('envelope');
    const flap = document.querySelector('.envelope-flap');
    const waxSeal = document.getElementById('wax-seal');
    const enterBtn = document.getElementById('enter-btn');
    const skipBtn = document.getElementById('skip-intro');
    const particlesContainer = document.getElementById('particles');
    const invitation = document.querySelector('.invitation-card');
    const labelTop = document.querySelector('.intro-label-top');
    const labelNames = document.querySelector('.intro-label-names');

    // Create elegant floating particles (sea dust/light)
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 5 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        p.style.opacity = Math.random() * 0.4 + 0.1;
        particlesContainer.appendChild(p);

        gsap.to(p, {
            y: \`random(-150, 150)\`,
            x: \`random(-100, 100)\`,
            duration: \`random(5, 10)\`,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    // Initial state
    gsap.set(overlay, { opacity: 0 });
    gsap.set(envelope, { scale: 0.7, opacity: 0, y: 150, rotationX: 15 });
    gsap.set(flap, { rotationX: 0 });
    gsap.set(invitation, { opacity: 0, y: 40 });
    gsap.set([labelTop, labelNames], { opacity: 0, y: 20 });

    // Animation Sequence: The Arrival
    const tl = gsap.timeline({ delay: 0.8 });

    tl.to(overlay, {
        opacity: 1,
        duration: 2,
        ease: "power2.inOut"
    })
    .to([labelTop, labelNames], {
        opacity: 1,
        y: 0,
        duration: 1.5,
        stagger: 0.3,
        ease: "power3.out"
    }, "-=1")
    .to(envelope, {
        opacity: 1,
        scale: 1,
        y: 0,
        rotationX: 0,
        duration: 2.5,
        ease: "power4.out"
    }, "-=0.8")
    .to(envelope, {
        y: -20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // Interaction logic
    waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope();
    });

    envelope.addEventListener('click', () => {
        if (!envelope.classList.contains('opened')) {
            openEnvelope();
        }
    });

    function openEnvelope() {
        if (envelope.classList.contains('opened')) return;
        envelope.classList.add('opened');

        // Stop the floating animation of the envelope
        gsap.killTweensOf(envelope);

        const openTl = gsap.timeline();

        openTl.to([labelTop, labelNames], {
            opacity: 0,
            y: -20,
            duration: 1,
            ease: "power3.in"
        })
        .to(waxSeal, {
            scale: 1.5,
            opacity: 0,
            duration: 0.8,
            ease: "power3.in"
        }, "-=0.5")
        .to(flap, {
            rotationX: 180,
            duration: 2,
            ease: "power2.inOut"
        }, "-=0.4")
        .to('.envelope-paper', {
            y: -320,
            zIndex: 20,
            duration: 2.2,
            ease: "power3.out"
        }, "-=1.2")
        .to(invitation, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power2.out"
        }, "-=1.5")
        .to(envelope, {
            y: 180,
            scale: 0.9,
            duration: 2.5,
            ease: "power3.inOut"
        }, "-=2");
    }

    enterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onComplete();
    });

    skipBtn.addEventListener('click', onComplete);
}
