export const initAnimations = () => {
    gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

    // Entrance logic
    if (sessionStorage.getItem('introShown')) {
        setTimeout(triggerSiteEntrance, 100);
    }

    window.addEventListener('site-entered', () => {
        triggerSiteEntrance();
    });

    // Reveal animations
    const revealContainers = ['#story', '.story-grid', '.details-grid', '.gallery-grid', '.timeline-wrapper', '#timeline', '.faq-accordion'];

    revealContainers.forEach(container => {
        const elements = document.querySelectorAll(`${container} .reveal-up`);
        if (elements.length > 0) {
            gsap.to(elements, {
                scrollTrigger: {
                    trigger: container,
                    start: 'top 85%',
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

    // Parallax
    const storyImages = document.querySelectorAll('.story-img img');
    storyImages.forEach((img) => {
        if (img.parentElement) {
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
        }
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: { y: target, offsetY: 70 },
                    ease: 'power4.inOut'
                });

                const navLinks = document.querySelector('.nav-links');
                const toggle = document.querySelector('.mobile-menu-toggle');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
                if (toggle && toggle.classList.contains('active')) {
                    toggle.classList.remove('active');
                }
            }
        });
    });
};

export function triggerSiteEntrance() {
    const tl = gsap.timeline();

    const nav = document.getElementById('navbar');
    if (nav) tl.to(nav, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });

    const heroSub = document.querySelector('.hero-subtitle');
    if (heroSub) tl.to(heroSub, { opacity: 1, y: 0, duration: 1 }, '-=0.5');

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) tl.to(heroTitle, { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out' }, '-=0.8');

    const heroDate = document.querySelector('.hero-date');
    if (heroDate) tl.to(heroDate, { opacity: 1, y: 0, duration: 1 }, '-=0.8');

    const countdown = document.getElementById('countdown');
    if (countdown) tl.to(countdown, { opacity: 1, y: 0, duration: 1 }, '-=0.8');

    const scrollInd = document.querySelector('.scroll-indicator');
    if (scrollInd) tl.to(scrollInd, { opacity: 1, duration: 1, y: 0 }, '-=0.5');
}
