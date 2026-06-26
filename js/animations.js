export function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Entry Animations
    const heroTl = gsap.timeline({ delay: 0.2 });

    heroTl.from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out"
    })
    .from('.hero-title', {
        y: 50,
        opacity: 0,
        duration: 1.8,
        ease: "power4.out"
    }, "-=1.2")
    .from('.hero-date', {
        opacity: 0,
        duration: 2,
        ease: "power2.out"
    }, "-=1.0")
    .from('.countdown-item', {
        y: 20,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power2.out"
    }, "-=1.5")
    .from('.scroll-indicator', {
        opacity: 0,
        y: -20,
        duration: 1,
        ease: "power2.out"
    }, "-=0.5");

    // Reveal on scroll elements
    const reveals = document.querySelectorAll('.reveal-up');
    reveals.forEach((el) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none none"
            },
            y: 80,
            opacity: 0,
            duration: 1.5,
            ease: "power3.out"
        });
    });

    // Timeline staggered animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        const isEven = index % 2 !== 0;
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%"
            },
            x: window.innerWidth > 768 ? (isEven ? 80 : -80) : -40,
            opacity: 0,
            duration: 1.5,
            ease: "power2.out"
        });
    });

    // Gallery staggered entry
    gsap.from('.gallery-item', {
        scrollTrigger: {
            trigger: '.gallery-grid',
            start: "top 85%"
        },
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "power3.out"
    });

    // Parallax effect for Hero background
    gsap.to('.hero-bg', {
        scrollTrigger: {
            trigger: '.hero',
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        y: 150,
        scale: 1.3,
        ease: "none"
    });

    // FAQ Accordion logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // Navigation Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: {
                        y: targetElement,
                        offsetY: 80
                    },
                    ease: "power4.inOut"
                });
            }
        });
    });

    // Masonry-like reveal for story images
    const storyImgs = document.querySelectorAll('.story-img img');
    storyImgs.forEach(img => {
        gsap.to(img, {
            scrollTrigger: {
                trigger: img,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            },
            y: 30,
            scale: 1.15
        });
    });

    // Mobile Menu Toggle Animation
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const spans = toggle.querySelectorAll('span');
            if (toggle.classList.contains('open')) {
                gsap.to(spans[0], { y: 0, rotation: 0, duration: 0.3 });
                gsap.to(spans[1], { rotation: 0, duration: 0.3 });
            } else {
                gsap.to(spans[0], { y: 8, rotation: 45, duration: 0.3 });
                gsap.to(spans[1], { rotation: -45, duration: 0.3 });
            }
        });
    }

    // Micro-interactions for buttons
    const buttons = document.querySelectorAll('button:not(.mobile-menu-toggle), .btn-text');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, { scale: 1.05, duration: 0.3, ease: "power2.out" });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { scale: 1, duration: 0.3, ease: "power2.out" });
        });
    });
}
