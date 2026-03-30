/**
 * nav.js
 * - Hides navbar on scroll-down, shows on scroll-up.
 * - Adds .scrolled class for subtle border after leaving top.
 * - Hamburger open/close with X animation.
 * - Closes menu on link click or outside tap.
 */

(function () {
    'use strict';

    const navWrapper = document.getElementById('nav-wrapper');
    const hamburger  = document.getElementById('hamburger');
    const navLinks   = document.getElementById('nav-links');

    if (!navWrapper || !hamburger || !navLinks) return;

    /* ------------------------------------------------------------------
     * Scroll hide / show
     * ------------------------------------------------------------------ */
    let lastScrollY  = 0;
    let ticking      = false;

    function handleScroll() {
        const current = window.scrollY;

        // Scrolled indicator (subtle border)
        navWrapper.classList.toggle('scrolled', current > 8);

        // Hide when scrolling down past 80px; show when scrolling up
        if (current > lastScrollY && current > 80) {
            navWrapper.classList.add('nav-hidden');
            closeMenu(); // close menu if open while scrolling down
        } else {
            navWrapper.classList.remove('nav-hidden');
        }

        lastScrollY = current <= 0 ? 0 : current; // prevent negative on iOS bounce
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    /* ------------------------------------------------------------------
     * Hamburger toggle
     * ------------------------------------------------------------------ */
    function openMenu() {
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('active');
    }

    function closeMenu() {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
    }

    function toggleMenu() {
        if (navLinks.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    hamburger.addEventListener('click', toggleMenu);

    // Close on any nav link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on outside click / tap
    document.addEventListener('click', (e) => {
        if (!navWrapper.contains(e.target)) {
            closeMenu();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
})();