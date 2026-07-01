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
    initLanguageToggle();
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

function initLanguageToggle() {
    const langBtns = document.querySelectorAll('.lang-btn');
    const elements = {
        subtitle: document.querySelector('[data-content="subtitle"]'),
        title: document.querySelector('[data-content="title"]'),
        description: document.querySelector('[data-content="description"]'),
        airTitle: document.querySelector('[data-content="air-title"]'),
        airText: document.querySelector('[data-content="air-text"]'),
        trainTitle: document.querySelector('[data-content="train-title"]'),
        trainText: document.querySelector('[data-content="train-text"]')
    };

    const content = {
        it: {
            subtitle: 'ARRIVARE LÌ',
            title: 'Come trovarci',
            description: 'Gela si affaccia sul Golfo di Gela, incastonata tra la costa mediterranea e le fertili pianure della Sicilia meridionale. Ci sono tre modi semplici per arrivare.',
            airTitle: 'In aereo',
            airText: 'Aeroporto di Catania-Fontanarossa (CTA), a circa 100 km di distanza, o Aeroporto di Comiso (CIY), a circa 45 km. Da lì, un trasferimento privato o un\'auto lungo la SS115 o la SS417 vi condurrà direttamente a Gela e al B Cool Beach.',
            trainTitle: 'In treno',
            trainText: 'Treni regionali per la stazione di Gela da Catania, Siracusa o Palermo. Dalla stazione, il B Cool Beach è facilmente raggiungibile in taxi o con un breve tragitto in auto lungo la costa — circa 10 minuti per arrivare a destinazione.'
        },
        en: {
            subtitle: 'GETTING THERE',
            title: 'How to find us',
            description: 'Gela overlooks the Gulf of Gela, nestled between the Mediterranean coast and the fertile plains of southern Sicily. There are three gentle ways in.',
            airTitle: 'By air',
            airText: 'Catania-Fontanarossa Airport (CTA), about 100 km away, or Comiso Airport (CIY), about 45 km. From there, a private transfer or car along the SS115 or SS417 winding road will lead you to Gela and B Cool Beach.',
            trainTitle: 'By train',
            trainText: 'Regional trains to Gela station from Catania, Syracuse, or Palermo. From the station, B Cool Beach is a quick taxi ride or car trip along the coast — around 10 minutes to reach your destination.'
        }
    };

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');

            // Update active state
            langBtns.forEach(b => b.classList.remove('active'));
            langBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            // Update content
            Object.keys(elements).forEach(key => {
                if (elements[key]) {
                    elements[key].textContent = content[lang][key];
                }
            });
        });
    });
}

// Update the DOMContentLoaded listener to include initLanguageToggle
