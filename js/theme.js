/**
 * theme.js
 * Dark/light mode driven by time of day.
 *
 * Strategy (in priority order):
 *  1. Geolocation API → calculates real local sunrise/sunset via solar angle.
 *  2. Fallback → simple 6am–6pm heuristic.
 *
 * Re-evaluated every 10 minutes to stay current across long sessions.
 */

(function () {
    'use strict';

    const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

    /* ------------------------------------------------------------------
     * Solar angle helpers — approximate sunrise/sunset for a given
     * latitude/longitude and current date.
     * ------------------------------------------------------------------ */
    function toRad(deg) { return deg * Math.PI / 180; }

    /**
     * Returns { sunrise, sunset } as decimal hours (local time, 0–24).
     * Uses the simplified NOAA algorithm (accurate to ~1–2 min for mid-lats).
     */
    function getSolarTimes(lat, lng) {
        const now    = new Date();
        const JD     = now / 86400000 + 2440587.5;           // Julian day
        const JC     = (JD - 2451545) / 36525;               // Julian century

        // Geometric mean longitude / anomaly of sun
        const L0 = (280.46646 + JC * (36000.76983 + JC * 0.0003032)) % 360;
        const M  = toRad((357.52911 + JC * (35999.05029 - 0.0001537 * JC)) % 360);

        // Equation of centre
        const C = (1.914602 - JC * (0.004817 + 0.000014 * JC)) * Math.sin(M)
                + (0.019993 - 0.000101 * JC) * Math.sin(2 * M)
                + 0.000289 * Math.sin(3 * M);

        const sunLon = toRad(L0 + C);

        // Obliquity of ecliptic
        const e = toRad(23.439291111 - JC * (0.013004167 + JC * (0.0000001638 - 0.0000005036 * JC)));

        // Sun declination
        const dec = Math.asin(Math.sin(e) * Math.sin(sunLon));

        // Equation of time (minutes)
        const y  = Math.tan(e / 2) ** 2;
        const L0r = toRad(L0);
        const Mr  = M;
        const ecc = 0.016708634 - JC * (0.000042037 + 0.0000001267 * JC);
        const EqT = 4 * (180 / Math.PI) * (
            y * Math.sin(2 * L0r)
            - 2 * ecc * Math.sin(Mr)
            + 4 * ecc * y * Math.sin(Mr) * Math.cos(2 * L0r)
            - 0.5 * y * y * Math.sin(4 * L0r)
            - 1.25 * ecc * ecc * Math.sin(2 * Mr)
        );

        // Hour angle at sunrise/sunset (zenith = 90.833° incl. atmospheric refraction)
        const latR = toRad(lat);
        const cosHA = (Math.cos(toRad(90.833)) / (Math.cos(latR) * Math.cos(dec)))
                    - Math.tan(latR) * Math.tan(dec);

        // No sunrise/sunset at extreme latitudes — fall back
        if (Math.abs(cosHA) > 1) return null;

        const HA = (180 / Math.PI) * Math.acos(cosHA); // degrees

        // Solar noon (local solar time, minutes)
        const noon = 720 - 4 * lng - EqT;

        // UTC offset in minutes
        const tzOffset = -now.getTimezoneOffset();

        const sunriseMin = noon - 4 * HA + tzOffset;
        const sunsetMin  = noon + 4 * HA + tzOffset;

        return {
            sunrise: sunriseMin / 60,   // decimal hours, local
            sunset:  sunsetMin  / 60,
        };
    }

    /* ------------------------------------------------------------------
     * Apply theme
     * ------------------------------------------------------------------ */
    function applyTheme(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
    }

    /* ------------------------------------------------------------------
     * Determine theme from known solar times
     * ------------------------------------------------------------------ */
    function updateFromSolar(lat, lng) {
        const times = getSolarTimes(lat, lng);
        if (!times) {
            updateFallback();
            return;
        }
        const hour = new Date().getHours() + new Date().getMinutes() / 60;
        applyTheme(hour < times.sunrise || hour >= times.sunset);
    }

    /* ------------------------------------------------------------------
     * Simple fallback: dark outside 6am–6pm
     * ------------------------------------------------------------------ */
    function updateFallback() {
        const h = new Date().getHours();
        applyTheme(h >= 18 || h < 6);
    }

    /* ------------------------------------------------------------------
     * Boot
     * ------------------------------------------------------------------ */
    let cachedCoords = null;

    function tick() {
        if (cachedCoords) {
            updateFromSolar(cachedCoords.lat, cachedCoords.lng);
            return;
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    cachedCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    updateFromSolar(cachedCoords.lat, cachedCoords.lng);
                },
                () => updateFallback(),    // permission denied / error
                { timeout: 5000, maximumAge: 3600000 }
            );
        } else {
            updateFallback();
        }
    }

    // Run immediately, then on interval
    tick();
    setInterval(tick, INTERVAL_MS);
})();