/**
 * animations.js
 * Triggers .fade-in-up on elements with .hidden-on-load when they enter the viewport.
 * Unobserves after first reveal so the animation plays only once.
 */

(function () {
    'use strict';

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08 }
    );

    document.querySelectorAll('.hidden-on-load').forEach((el) => {
        observer.observe(el);
    });
})();