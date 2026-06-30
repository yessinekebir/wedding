export const initAnimations = () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initial check: if site is already entered, trigger entrance
    if (sessionStorage.getItem('introShown')) {
        triggerSiteEntrance();
    }

    // Listen for custom event from envelope.js
    window.addEventListener('site-entered', () => {
        triggerSiteEntrance();
    });

    // Reveal animations on scroll with stagger for cards
    const revealContainers = ['.story-grid', '.details-grid', '.gallery-grid', '.timeline-wrapper', '.faq-accordion'];

    revealContainers.forEach(container => {
        const elements = document.querySelectorAll(`${container} .reveal-up`);
        if (elements.length > 0) {
            gsap.to(elements, {
                scrollTrigger: {
                    trigger: container,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 1.2,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }
    });

    // Parallax effect for story images
    const storyImages = document.querySelectorAll('.story-img img');
    storyImages.forEach((img) => {
        gsap.to(img, {
            scrollTrigger: {
                trigger: img.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            },
            y: -60,
            scale: 1.1,
            ease: 'none'
        });
    });

    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: { y: target, offsetY: 70 },
                    ease: 'power4.inOut'
                });

                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                const toggle = document.querySelector('.mobile-menu-toggle');
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    toggle.classList.remove('active');
                }
            }
        });
    });
};

function triggerSiteEntrance() {
    const tl = gsap.timeline();

    tl.to('#navbar', { y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 1 }, '-=0.5')
      .to('.hero-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out' }, '-=0.8')
      .to('.hero-date', { opacity: 1, y: 0, duration: 1 }, '-=0.8')
      .to('.countdown', { opacity: 1, y: 0, duration: 1 }, '-=0.8')
      .to('.scroll-indicator', { opacity: 1, duration: 1, y: 0 }, '-=0.5');
}
