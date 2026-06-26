import { initEnvelope } from './envelope.js';
import { initAnimations } from './animations.js';
import { initRSVP } from './rsvp.js';

document.addEventListener('DOMContentLoaded', () => {
    const introSeen = sessionStorage.getItem('wedding_intro_seen');
    const mainContent = document.getElementById('main-content');
    const introOverlay = document.getElementById('intro-overlay');

    if (introSeen) {
        if (introOverlay) introOverlay.style.display = 'none';
        gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
        initSiteFeatures();
    } else {
        initEnvelope(onIntroComplete);
    }

    function onIntroComplete() {
        sessionStorage.setItem('wedding_intro_seen', 'true');

        const masterTl = gsap.timeline();

        masterTl.to(introOverlay, {
            opacity: 0,
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => {
                introOverlay.style.display = 'none';
            }
        })
        .to(mainContent, {
            opacity: 1,
            visibility: 'visible',
            duration: 1.2,
            ease: "power2.inOut",
            onStart: () => {
                initSiteFeatures();
            }
        }, "-=0.6");
    }

    function initSiteFeatures() {
        initAnimations();
        initRSVP();
        initNavbar();
        initCountdown();
        initMobileMenu();
        initGallery();
    }

    function initNavbar() {
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    function initMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (!toggle) return;

        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('open');
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                toggle.classList.remove('open');
            });
        });
    }

    function initGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const body = document.body;

        // Create lightbox element
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = '<img src="" alt="Lightbox Image">';
        body.appendChild(lightbox);

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imgSrc = item.querySelector('img').src;
                lightbox.querySelector('img').src = imgSrc;
                lightbox.classList.add('active');
                gsap.from(lightbox.querySelector('img'), {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.5
                });
            });
        });

        lightbox.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
    }

    function initCountdown() {
        const weddingDate = new Date('June 26, 2027 16:30:00').getTime();
        const countdownEl = document.getElementById('countdown');

        if (!countdownEl) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = weddingDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownEl.innerHTML = `
                <div class="countdown-item"><span>${days}</span><label>Days</label></div>
                <div class="countdown-item"><span>${hours}</span><label>Hours</label></div>
                <div class="countdown-item"><span>${minutes}</span><label>Min</label></div>
                <div class="countdown-item"><span>${seconds}</span><label>Sec</label></div>
            `;
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
});
