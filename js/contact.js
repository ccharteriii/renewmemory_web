/**
 * contact.js
 * Dynamic sub-category dropdown based on primary "How can we help?" selection.
 *
 *  Inquiry  → General, Partnership, Feature Request
 *  Issue    → Bug, Account, Other
 */

(function () {
    'use strict';

    const typeSelect    = document.getElementById('contact-type');
    const subtypeSelect = document.getElementById('contact-subtype');

    if (!typeSelect || !subtypeSelect) return;

    const subcategories = {
        inquiry: [
            { value: 'general',     label: 'General'          },
            { value: 'partnership', label: 'Partnership'       },
            { value: 'feature',     label: 'Feature Request'   },
        ],
        issue: [
            { value: 'bug',     label: 'Bug'     },
            { value: 'account', label: 'Account' },
            { value: 'other',   label: 'Other'   },
        ],
    };

    function populateSubtype() {
        const options = subcategories[typeSelect.value] || [];
        subtypeSelect.innerHTML = options
            .map(o => `<option value="${o.value}">${o.label}</option>`)
            .join('');
    }

    typeSelect.addEventListener('change', populateSubtype);
    populateSubtype(); // initialise on load

    /* ------------------------------------------------------------------
     * Basic form submit handler (extend to wire up a real endpoint)
     * ------------------------------------------------------------------ */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // TODO: replace with your API call / Formspree / etc.
            const btn = contactForm.querySelector('.btn-3d-top');
            const original = btn.textContent;
            btn.textContent = 'Sent!';
            setTimeout(() => { btn.textContent = original; }, 2500);
        });
    }
})();