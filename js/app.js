import { initEnvelope } from './envelope.js';
import { initAnimations } from './animations.js';
import { initRSVP } from './rsvp.js';

document.addEventListener('DOMContentLoaded', () => {
    initEnvelope();
    initAnimations();
    initRSVP();
    initMobileMenu();
    initNavbarScroll();
    initCountdown();
    initFAQ();
});

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }
}

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function initCountdown() {
    const countdownDate = new Date("June 26, 2027 16:30:00").getTime();
    const countdownEl = document.getElementById('countdown');

    if (!countdownEl) return;

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownEl.innerHTML = `
            <div class="countdown-item"><span>${days}</span> giorni</div>
            <div class="countdown-item"><span>${hours}</span> ore</div>
            <div class="countdown-item"><span>${minutes}</span> minuti</div>
            <div class="countdown-item"><span>${seconds}</span> secondi</div>
        `;

        if (distance < 0) {
            clearInterval(timer);
            countdownEl.innerHTML = "Oggi è il grande giorno!";
        }
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();
}

function initFAQ() {
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.parentElement;
            item.classList.toggle('active');
            const span = trigger.querySelector('span');
            if (span) {
                span.textContent = item.classList.contains('active') ? '-' : '+';
            }
        });
    });
}
