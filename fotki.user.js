// ==UserScript==
// @name         fotki
// @namespace    http://tampermonkey.net/
// @version      6.5
// @description  Gallery with Lightbox (Mouse-Follow Zoom), Loading States & Settings
// @author       kokochan
// @match        https://www.okoun.cz/boards/*
// @grant        GM_addStyle
// @homepageURL  https://github.com/hanenashi/fotki
// @supportURL   https://github.com/hanenashi/fotki/issues
// @updateURL    https://github.com/hanenashi/fotki/raw/main/fotki.user.js
// @downloadURL  https://github.com/hanenashi/fotki/raw/main/fotki.user.js
// @require      https://github.com/hanenashi/fotki/raw/main/src/styles.js?v=6.5
// @require      https://github.com/hanenashi/fotki/raw/main/src/utils.js?v=6.5
// @require      https://github.com/hanenashi/fotki/raw/main/src/lightbox.js?v=6.5
// @require      https://github.com/hanenashi/fotki/raw/main/src/app.js?v=6.5
// ==/UserScript==

(function() {
    'use strict';

    // 1. Inject Styles
    if (window.Fotki && window.Fotki.styles) {
        if (typeof GM_addStyle !== 'undefined') {
            GM_addStyle(window.Fotki.styles);
        } else {
            const style = document.createElement('style');
            style.textContent = window.Fotki.styles;
            document.head.appendChild(style);
        }
    }

    // 2. Initialize App
    if (window.Fotki && window.Fotki.App) {
        window.Fotki.App.init();
        console.log('Fotki: Modules loaded successfully.');
    } else {
        console.error('Fotki: Failed to load modules. Check your internet connection or GitHub status.');
    }
})();