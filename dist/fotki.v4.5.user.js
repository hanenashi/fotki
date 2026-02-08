// ==UserScript==
// @name         fotki
// @namespace    http://tampermonkey.net/
// @version      4.5
// @description  Gallery with Lightbox (Mouse-Follow Zoom), Loading States & Settings
// @author       kokochan
// @match        https://www.okoun.cz/boards/*
// @grant        GM_addStyle
// @homepageURL  https://github.com/hanenashi/fotki
// @supportURL   https://github.com/hanenashi/fotki/issues
// @updateURL    https://github.com/hanenashi/fotki/raw/main/fotki.user.js
// @downloadURL  https://github.com/hanenashi/fotki/raw/main/fotki.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 1. Setup Namespace
    window.Fotki = window.Fotki || {};

    // 2. Bundled Modules

    // --- src/styles.js ---


window.Fotki.styles = `
    /* Toggle Button */
    .head .menu a.gallery-toggle {
        color: #d35400 !important; font-weight: bold; cursor: pointer;
        margin-left: 10px; text-decoration: none;
    }
    .head .menu a.gallery-toggle:hover { color: #e67e22 !important; text-decoration: underline; }

    /* Main Overlay */
    #fotki-gallery-root {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(15, 15, 20, 0.98); z-index: 99900;
        display: none; flex-direction: column; font-family: sans-serif;
    }

    /* Header */
    .fg-header {
        flex: 0 0 45px; background: #111; border-bottom: 1px solid #333;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 15px; color: #ccc; font-size: 14px; z-index: 10;
    }
    .fg-header-left { display: flex; align-items: center; gap: 15px; }
    .fg-title { font-weight: bold; color: #eee; }
    .fg-breadcrumbs { color: #777; font-size: 13px; }
    .fg-breadcrumbs span { color: #d35400; }

    /* Buttons */
    .fg-btn {
        background: #333; border: 1px solid #444; color: #ddd;
        padding: 4px 12px; cursor: pointer; border-radius: 3px;
        font-size: 12px; transition: all 0.2s; margin-left: 5px;
    }
    .fg-btn:hover { background: #555; border-color: #777; color: #fff; }
    .fg-btn.close:hover { background: #c0392b; border-color: #e74c3c; }
    .fg-icon-btn { padding: 4px 8px; font-size: 16px; line-height: 1; }

    /* Settings Panel */
    #fg-settings-panel {
        position: absolute; top: 50px; right: 15px; width: 300px;
        background: #222; border: 1px solid #444; border-radius: 4px;
        padding: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        display: none; z-index: 100;
        max-height: 90vh; overflow-y: auto;
    }
    #fg-settings-panel.active { display: block; }
    .fg-setting-row { margin-bottom: 15px; }
    .fg-setting-row label { display: block; color: #aaa; margin-bottom: 5px; font-size: 12px; }
    .fg-setting-row select, .fg-setting-row input[type="number"], .fg-setting-row input[type="date"] {
        background: #111; border: 1px solid #444; color: #eee;
        padding: 5px; width: 100%; border-radius: 3px; box-sizing: border-box;
    }
    .fg-setting-row textarea {
        background: #111; border: 1px solid #444; color: #999;
        padding: 5px; width: 100%; height: 80px; border-radius: 3px;
        box-sizing: border-box; font-family: monospace; font-size: 11px;
        resize: vertical;
    }
    .fg-checkbox-row { display: flex; align-items: center; justify-content: space-between; }
    .fg-checkbox-row input { width: auto; }
    
    .fg-date-group { display: flex; gap: 10px; }
    
    .fg-btn-row { display: flex; gap: 10px; margin-top: 5px; }
    
    .fg-action-btn { 
        flex: 2; padding: 8px; background: #d35400; color: white; border: none; 
        cursor: pointer; border-radius: 3px; font-weight: bold;
    }
    .fg-action-btn:hover { background: #e67e22; }
    
    .fg-reset-btn {
        flex: 1; padding: 8px; background: #c0392b; color: white; border: none;
        cursor: pointer; border-radius: 3px; font-weight: bold;
    }
    .fg-reset-btn:hover { background: #e74c3c; }

    /* Loader */
    #fg-loader {
        position: absolute; top: 45px; left: 0; width: 100%; bottom: 0;
        background: rgba(15, 15, 20, 0.8); z-index: 50;
        display: none; flex-direction: column; align-items: center; justify-content: center;
        color: #ccc; font-size: 14px;
    }
    .fg-spinner {
        width: 40px; height: 40px; margin-bottom: 15px;
        border: 3px solid #333; border-top-color: #d35400; border-radius: 50%;
        animation: fg-spin 1s linear infinite;
    }
    @keyframes fg-spin { to { transform: rotate(360deg); } }

    /* Content Area */
    .fg-scroll-area { flex: 1; overflow-y: scroll; padding: 20px; }
    
    /* Load More Button */
    .fg-load-more-container {
        grid-column: 1 / -1;
        padding: 20px 0;
        text-align: center;
    }
    .fg-load-more-btn {
        background: #222; border: 1px solid #444; color: #ddd;
        padding: 10px 30px; font-size: 14px; cursor: pointer;
        border-radius: 4px; transition: all 0.2s;
        font-family: inherit;
    }
    .fg-load-more-btn:hover { background: #d35400; border-color: #e67e22; color: #fff; }
    .fg-load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Grid - Users */
    .fg-user-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 15px; max-width: 1200px; margin: 0 auto;
    }
    .fg-user-card {
        background: #222; border: 1px solid #333; border-radius: 6px;
        overflow: hidden; cursor: pointer; transition: transform 0.2s;
        display: flex; flex-direction: column;
    }
    .fg-user-card:hover { transform: translateY(-3px); border-color: #d35400; }
    .fg-user-thumb { height: 120px; background: #000; position: relative; }
    .fg-user-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
    .fg-user-count {
        position: absolute; top: 5px; right: 5px;
        background: rgba(211, 84, 0, 0.9); color: white;
        font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 10px;
    }
    .fg-user-info { padding: 8px; text-align: center; border-top: 1px solid #333; }
    .fg-user-name { font-weight: bold; color: #eee; display: block; font-size: 13px; }

    /* Grid - Photos */
    .fg-photo-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 15px; max-width: 1600px; margin: 0 auto;
    }
    .fg-photo-card { background: #000; border: 1px solid #333; display: flex; flex-direction: column; }
    .fg-photo-box {
        height: 220px; display: flex; align-items: center; justify-content: center;
        overflow: hidden; background: #111; position: relative; cursor: zoom-in;
    }
    .fg-photo-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .fg-photo-meta {
        padding: 6px 10px; font-size: 11px; color: #777;
        border-top: 1px solid #222; display: flex; justify-content: space-between;
    }
    .fg-photo-user { color: #d35400; font-weight: bold; margin-right: 5px; }
    .fg-link { color: #666; text-decoration: none; padding: 0 5px;}
    .fg-link:hover { color: #fff; background: #d35400; border-radius: 3px; }

    /* Lightbox */
    #fg-lightbox {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.95); z-index: 99950;
        display: none; flex-direction: column;
    }
    .fg-lb-canvas {
        flex: 1; display: flex; align-items: center; justify-content: center;
        position: relative; overflow: hidden;
    }
    .fg-lb-canvas img {
        max-width: 95%; max-height: 95%; object-fit: contain;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
        cursor: zoom-in;
        transition: transform 0.1s ease-out;
        transform-origin: top left;
    }
    .fg-lb-canvas img.lb-zoomed {
        cursor: zoom-out;
        position: absolute; top: 0; left: 0;
        max-width: none; max-height: none;
        box-shadow: none;
    }
    .fg-lb-controls {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none;
    }
    .fg-lb-btn {
        position: absolute; top: 50%; transform: translateY(-50%);
        background: rgba(50,50,50,0.5); color: white; border: none;
        width: 50px; height: 80px; font-size: 30px; cursor: pointer;
        pointer-events: auto; display: flex; align-items: center; justify-content: center;
        transition: background 0.2s;
    }
    .fg-lb-btn:hover { background: rgba(211, 84, 0, 0.8); }
    .fg-lb-prev { left: 0; border-radius: 0 5px 5px 0; }
    .fg-lb-next { right: 0; border-radius: 5px 0 0 5px; }
    
    .fg-lb-close {
        position: absolute; top: 20px; right: 20px;
        width: 40px; height: 40px; border-radius: 50%;
        background: rgba(50,50,50,0.5); color: white; border: none;
        font-size: 24px; cursor: pointer; pointer-events: auto;
        display: flex; align-items: center; justify-content: center;
    }
    .fg-lb-close:hover { background: #c0392b; }

    .fg-lb-footer {
        height: 50px; background: #000; border-top: 1px solid #222;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 20px; color: #888; font-size: 13px; z-index: 10;
    }
    .fg-lb-link { color: #d35400; text-decoration: none; margin-left: 10px; }
    .fg-lb-link:hover { text-decoration: underline; }
`;

    // --- src/utils.js ---


window.Fotki.Utils = {
    // Default "No Fly" List
    defaultDeadHosts: [
        'tinypic.com', 'fbcdn.net', 'sklad.obrazku.cz', 'media.novinky.cz', 
        'img.ihned.cz', 'fail.cz', 
        'images.paraorkut.com', 'imgup.eu', 'like.cz', 'rajce.idnes.cz',
        'ukazto.com', 'q3.cz', 'downloadsedge.com', 'guzer.com',
        'imagesocket.com', 'tides.ws', 'kartinki.cz', 'mine.nu',
        'ultrahost.pl', 'artatlarge.com', 'ic.cz', 'over.cz',
        'cosmoboy.cz', 'nepracuje.cz', 'nevk.us', 'mfuhrer.net',
        'img.galeria.ultrahost.pl', 's3.tinypic.com', 'img1.rajce.idnes.cz',
        'img2.rajce.idnes.cz', 'img5.rajce.idnes.cz'
    ],

    settings: {
        groupByUser: true,
        sortOrder: 'newest',
        batchSize: 30,
        deadHosts: [] 
    },

    loadSettings: function() {
        const saved = localStorage.getItem('fotki_settings');
        
        // 1. Start with fresh defaults
        this.settings.deadHosts = [...this.defaultDeadHosts];
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // 2. Merge saved settings
                this.settings = { ...this.settings, ...parsed };
            } catch(e) { console.error('Settings error', e); }
        }

        // 3. CRITICAL FIX: Repair corrupted/missing blacklist
        if (!Array.isArray(this.settings.deadHosts) || this.settings.deadHosts.length === 0) {
            console.warn('Fotki: Repaired broken blacklist settings.');
            this.settings.deadHosts = [...this.defaultDeadHosts];
        }

        return this.settings;
    },

    saveSettings: function(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('fotki_settings', JSON.stringify(this.settings));
    },

    // Date Logic
    parseCzechDate: function(dateStr) {
        const regex = /(\d+)\.\s*([a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+)\s+(\d{4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?/;
        const match = dateStr.match(regex);
        if (!match) return 0;

        const day = parseInt(match[1], 10);
        const monthStr = match[2].toLowerCase(); 
        const year = parseInt(match[3], 10);
        const timeStr = match[4] || "00:00:00";

        const months = {'ledna':0,'února':1,'března':2,'dubna':3,'května':4,'června':5,'července':6,'srpna':7,'září':8,'října':9,'listopadu':10,'prosince':11};
        const mon = months[monthStr];
        
        if (mon === undefined) return 0;
        const [h, m, s] = timeStr.split(':').map(x => parseInt(x, 10));
        return new Date(year, mon, day, h||0, m||0, s||0).getTime();
    },

    dateToOkounParam: function(dateObj) {
        const pad = (n) => n.toString().padStart(2, '0');
        const y = dateObj.getFullYear();
        const m = pad(dateObj.getMonth() + 1);
        const d = pad(dateObj.getDate());
        const h = pad(dateObj.getHours());
        const min = pad(dateObj.getMinutes());
        const s = pad(dateObj.getSeconds());
        return `${y}${m}${d}-${h}${min}${s}`;
    },

    showLoader: function() { 
        const el = document.getElementById('fg-loader');
        if(el) el.style.display = 'flex'; 
    },
    
    hideLoader: function() { 
        const el = document.getElementById('fg-loader');
        if(el) el.style.display = 'none'; 
    }
};

    // --- src/lightbox.js ---


window.Fotki.Lightbox = {
    isZoomed: false,

    init: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        // Global mouse movement for panning
        window.addEventListener("mousemove", (e) => {
            if (window.Fotki.App.isLightboxOpen && this.isZoomed) {
                e.preventDefault();
                this.updatePan(e.clientX, e.clientY);
            }
        });
    },

    resetZoom: function() {
        this.isZoomed = false;
        const img = document.getElementById('fg-lb-img');
        if (img) {
            img.classList.remove('lb-zoomed');
            img.style.width = '';
            img.style.height = '';
            img.style.transform = '';
        }
    },

    toggleZoom: function(e) {
        const img = document.getElementById('fg-lb-img');
        
        // Prevent zoom if image is smaller than viewport
        if (img.naturalWidth <= window.innerWidth && img.naturalHeight <= window.innerHeight) return;

        this.isZoomed = !this.isZoomed;
        
        if (this.isZoomed) {
            img.classList.add('lb-zoomed');
            img.style.width = img.naturalWidth + 'px';
            img.style.height = img.naturalHeight + 'px';
            this.updatePan(e.clientX, e.clientY);
        } else {
            this.resetZoom();
        }
    },

    updatePan: function(x, y) {
        if (!this.isZoomed) return;
        const img = document.getElementById('fg-lb-img');
        
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;

        let transX = 0;
        if (imgW > winW) {
            const ratioX = x / winW; 
            const rangeX = imgW - winW; 
            transX = -(rangeX * ratioX);
        } else {
            transX = (winW - imgW) / 2;
        }

        let transY = 0;
        if (imgH > winH) {
            const ratioY = y / winH;
            const rangeY = imgH - winH;
            transY = -(rangeY * ratioY);
        } else {
            transY = (winH - imgH) / 2;
        }

        img.style.transform = `translate(${transX}px, ${transY}px)`;
    }
};

    // --- src/app.js ---


window.Fotki.App = {
    isOpen: false,
    viewState: 'root', 
    selectedUser: null,
    isLightboxOpen: false,

    // Data
    allItems: [],
    groupedData: {},
    currentList: [],
    currentIndex: 0,
    seenUrls: new Set(), 
    
    // Paging
    nextPageUrl: null,
    isFetching: false,
    dateLimitMin: null, 

    // Trusted for retry
    trustedHosts: [
        'peklo.biz',
        'opu.peklo.biz',
        'pic.peklo.biz',
        'flickr.com',
        'static.flickr.com'
    ],

    init: function() {
        const U = window.Fotki.Utils;
        U.loadSettings();
        window.Fotki.Lightbox.init();
        this.injectButton();
        this.buildOverlay();
        this.buildLightbox();
        this.bindKeys();
    },

    injectButton: function() {
        const menu = document.querySelector('.head .nav .menu');
        if (!menu) return;
        const btn = document.createElement('a');
        btn.className = 'gallery-toggle';
        btn.innerHTML = '[ FOTKY ]';
        btn.onclick = (e) => { e.preventDefault(); this.toggle(); };
        menu.appendChild(document.createTextNode(' '));
        menu.appendChild(btn);
    },

    buildOverlay: function() {
        const U = window.Fotki.Utils;
        const version = (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.version : 'Dev';
        const root = document.createElement('div');
        root.id = 'fotki-gallery-root';
        root.innerHTML = `
            <div class="fg-header">
                <div class="fg-header-left">
                    <span class="fg-title">Galerie</span>
                    <span id="fg-breadcrumbs" class="fg-breadcrumbs"></span>
                </div>
                <div style="display:flex; align-items:center">
                    <button id="fg-settings-btn" class="fg-btn fg-icon-btn" title="Nastavení">⚙</button>
                    <button id="fg-back-btn" class="fg-btn" style="display:none">← Zpět</button>
                    <button id="fg-close-btn" class="fg-btn close">Zavřít (Esc)</button>
                </div>
            </div>
            
            <div id="fg-settings-panel">
                <div class="fg-setting-row fg-checkbox-row">
                    <label for="fg-opt-group">Sdružovat podle uživatelů</label>
                    <input type="checkbox" id="fg-opt-group">
                </div>
                <div class="fg-setting-row">
                    <label>Fotek na stránku (dávka)</label>
                    <input type="number" id="fg-opt-batch" min="10" max="200" step="10">
                </div>
                <div class="fg-setting-row">
                    <label>Řazení</label>
                    <select id="fg-opt-sort">
                        <option value="newest">Od nejnovějších</option>
                        <option value="oldest">Od nejstarších</option>
                        <option value="name_asc">Jméno autora (A-Z)</option>
                        <option value="name_desc">Jméno autora (Z-A)</option>
                    </select>
                </div>
                
                <hr style="border:0; border-top:1px solid #444; margin: 15px 0;">
                
                <div class="fg-setting-row">
                    <label>Blacklist domén (jedna na řádek)</label>
                    <textarea id="fg-opt-blacklist" spellcheck="false"></textarea>
                </div>

                <hr style="border:0; border-top:1px solid #444; margin: 15px 0;">
                
                <div class="fg-setting-row">
                    <label>Časové období (Od - Do)</label>
                    <div class="fg-date-group">
                        <input type="date" id="fg-date-from" title="Datum, kde se načítání zastaví">
                        <input type="date" id="fg-date-to" title="Datum, odkud se začne (skočí do historie)">
                    </div>
                    <div class="fg-btn-row">
                        <button id="fg-date-go" class="fg-action-btn">Načíst období</button>
                        <button id="fg-date-reset" class="fg-reset-btn" title="Zpět do současnosti">Reset</button>
                    </div>
                </div>
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #333; text-align: right; color: #555; font-size: 10px;">
                    Fotki v${version}
                </div>
            </div>

            <div id="fg-loader">
                <div class="fg-spinner"></div>
                <div>Načítám...</div>
            </div>

            <div class="fg-scroll-area">
                <div id="fg-content-target"></div>
            </div>
        `;
        
        root.querySelector('#fg-close-btn').onclick = () => this.close();
        root.querySelector('#fg-back-btn').onclick = () => this.goBack();
        
        const setBtn = root.querySelector('#fg-settings-btn');
        const setPanel = root.querySelector('#fg-settings-panel');
        
        setBtn.onclick = () => {
            setPanel.classList.toggle('active');
            if (setPanel.classList.contains('active')) {
                const currentSettings = U.loadSettings();
                root.querySelector('#fg-opt-group').checked = currentSettings.groupByUser;
                root.querySelector('#fg-opt-sort').value = currentSettings.sortOrder;
                root.querySelector('#fg-opt-batch').value = currentSettings.batchSize;
                
                if (Array.isArray(currentSettings.deadHosts)) {
                    root.querySelector('#fg-opt-blacklist').value = currentSettings.deadHosts.join('\n');
                } else {
                    root.querySelector('#fg-opt-blacklist').value = '';
                }
            }
        };

        root.querySelector('#fg-opt-group').onchange = (e) => {
            U.saveSettings({ groupByUser: e.target.checked });
            this.forceRefresh();
        };
        root.querySelector('#fg-opt-sort').onchange = (e) => {
            U.saveSettings({ sortOrder: e.target.value });
            this.forceRefresh();
        };
        root.querySelector('#fg-opt-batch').onchange = (e) => {
            let val = parseInt(e.target.value, 10);
            if (val < 10) val = 10;
            U.saveSettings({ batchSize: val });
        };
        root.querySelector('#fg-opt-blacklist').onchange = (e) => {
            const raw = e.target.value;
            const list = raw.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            U.saveSettings({ deadHosts: list });
        };

        root.querySelector('#fg-date-go').onclick = () => {
            const dFrom = root.querySelector('#fg-date-from').value;
            const dTo = root.querySelector('#fg-date-to').value;
            this.startTimeTravel(dFrom, dTo);
            setPanel.classList.remove('active');
        };
        
        root.querySelector('#fg-date-reset').onclick = () => {
            this.resetTimeTravel();
            setPanel.classList.remove('active');
        };

        document.body.appendChild(root);
    },

    buildLightbox: function() {
        const lb = document.createElement('div');
        lb.id = 'fg-lightbox';
        lb.innerHTML = `
            <div class="fg-lb-canvas" id="fg-lb-canvas">
                <img id="fg-lb-img" src="">
                <div class="fg-lb-controls">
                    <button class="fg-lb-btn fg-lb-prev">‹</button>
                    <button class="fg-lb-btn fg-lb-next">›</button>
                    <button class="fg-lb-close">×</button>
                </div>
            </div>
            <div class="fg-lb-footer">
                <div id="fg-lb-meta-text"></div>
                <div><a id="fg-lb-post-link" href="#" target="_blank" class="fg-lb-link">Přejít k příspěvku ➜</a></div>
            </div>
        `;
        
        const imgEl = lb.querySelector('#fg-lb-img');
        lb.querySelector('.fg-lb-close').onclick = () => this.closeLightbox();
        lb.querySelector('.fg-lb-prev').onclick = (e) => { e.stopPropagation(); this.changeImage(-1); };
        lb.querySelector('.fg-lb-next').onclick = (e) => { e.stopPropagation(); this.changeImage(1); };
        imgEl.onclick = (e) => { e.stopPropagation(); window.Fotki.Lightbox.toggleZoom(e); };
        lb.querySelector('.fg-lb-canvas').onclick = (e) => { if(e.target.id === 'fg-lb-canvas') this.closeLightbox(); };
        document.body.appendChild(lb);
    },

    bindKeys: function() {
        const self = this;
        window.addEventListener('keydown', (e) => {
            if (!self.isOpen) return;
            const isEsc = (e.key === 'Escape' || e.keyCode === 27);
            const isLeft = (e.key === 'ArrowLeft' || e.keyCode === 37);
            const isRight = (e.key === 'ArrowRight' || e.keyCode === 39);

            if (self.isLightboxOpen) {
                if (isEsc) { e.preventDefault(); e.stopPropagation(); self.closeLightbox(); }
                else if (isLeft) self.changeImage(-1);
                else if (isRight) self.changeImage(1);
                return;
            }

            if (isEsc) {
                e.preventDefault(); e.stopPropagation();
                if (document.querySelector('#fg-settings-panel.active')) {
                    document.querySelector('#fg-settings-panel').classList.remove('active');
                    return;
                }
                const U = window.Fotki.Utils;
                if (self.viewState === 'photos' && U.settings.groupByUser) {
                    self.goBack();
                } else {
                    self.close();
                }
            }
        }, true);
    },

    // --- Core Logic ---

    isSafeUrl: function(url) {
        const U = window.Fotki.Utils;
        if (!U.settings || !Array.isArray(U.settings.deadHosts)) return true; 

        for (const host of U.settings.deadHosts) {
            if (url.includes(host)) return false;
        }
        if (url.includes('cloudfront.net') || url.includes('okoun.cz/images/')) return false;
        return true;
    },

    isTrustedHost: function(url) {
        for (const host of this.trustedHosts) {
            if (url.includes(host)) return true;
        }
        return false;
    },

    upgradeUrl: function(url) {
        if (url.startsWith('http://')) {
            return url.replace('http://', 'https://');
        }
        return url;
    },

    pruneItem: function(badItem) {
        this.allItems = this.allItems.filter(i => i !== badItem);
        if (this.groupedData[badItem.user]) {
            this.groupedData[badItem.user] = this.groupedData[badItem.user].filter(i => i !== badItem);
            
            if (this.groupedData[badItem.user].length === 0) {
                delete this.groupedData[badItem.user];
                if (this.viewState === 'root') {
                    const cards = Array.from(document.querySelectorAll('.fg-user-card'));
                    const userCard = cards.find(el => el.dataset.user === badItem.user);
                    if (userCard) userCard.remove();
                }
            }
        }
    },

    recoverUserCard: function(user) {
        if (this.viewState !== 'root') return;
        const photos = this.groupedData[user];
        const card = Array.from(document.querySelectorAll('.fg-user-card')).find(el => el.dataset.user === user);
        
        if (!card) return;

        if (!photos || photos.length === 0) {
            card.remove(); 
        } else {
            const img = card.querySelector('img');
            if (img) img.src = photos[0].thumb; 
            const countEl = card.querySelector('.fg-user-count');
            if (countEl) countEl.innerText = photos.length;
        }
    },

    resetData: function() {
        this.groupedData = {};
        this.allItems = [];
        this.seenUrls.clear(); 
        this.nextPageUrl = null;
        this.dateLimitMin = null;
    },
    
    getOpuThumb: function(url) {
        if (url.includes('opu.peklo.biz/p/') && !url.includes('/thumbs/')) {
            const parts = url.split('/');
            const filename = parts.pop();
            return parts.join('/') + '/thumbs/' + filename;
        }
        return url;
    },

    startTimeTravel: function(dateFrom, dateTo) {
        const U = window.Fotki.Utils;
        this.dateLimitMin = dateFrom ? new Date(dateFrom).getTime() : null;
        let startUrl = window.location.href.split('?')[0]; 
        if (dateTo) {
            const dt = new Date(dateTo);
            dt.setHours(23, 59, 59);
            startUrl += '?f=' + U.dateToOkounParam(dt);
        }
        U.showLoader();
        this.resetData();
        this.nextPageUrl = startUrl; 
        this.loadMore(true); 
    },

    resetTimeTravel: function() {
        const U = window.Fotki.Utils;
        this.dateLimitMin = null;
        document.getElementById('fg-date-from').value = '';
        document.getElementById('fg-date-to').value = '';
        
        const startUrl = window.location.href.split('?')[0];
        
        U.showLoader();
        this.resetData();
        this.nextPageUrl = startUrl;
        this.loadMore(true);
    },

    findNextPage: function(doc) {
        let el = doc.querySelector('.pager .older a');
        if (el) return el.href;
        const pagerLinks = doc.querySelectorAll('.pager a');
        for (let i = 0; i < pagerLinks.length; i++) {
            if (pagerLinks[i].innerText.includes('Starší')) {
                return pagerLinks[i].href;
            }
        }
        return null;
    },

    extractData: function(doc) {
        const U = window.Fotki.Utils;
        let count = 0;
        let stopSignal = false; 

        doc.querySelectorAll('.listing .item').forEach(post => {
            const userEl = post.querySelector('.meta .user');
            const user = userEl ? userEl.innerText.trim() : 'Anonym';
            const linkEl = post.querySelector('.permalink a.date');
            const link = linkEl ? linkEl.href : '#';
            const dateText = linkEl ? linkEl.innerText.trim() : '';
            const timestamp = U.parseCzechDate(dateText);

            if (this.dateLimitMin && timestamp > 0 && timestamp < this.dateLimitMin) {
                stopSignal = true;
                return; 
            }

            post.querySelectorAll('.content img').forEach(img => {
                if (this.isSafeUrl(img.src)) {
                    if (!img.hasAttribute('width') || img.width > 30) {
                        const safeSrc = this.upgradeUrl(img.src);
                        if (this.seenUrls.has(safeSrc)) return; 

                        const item = {
                            src: safeSrc, 
                            thumb: this.getOpuThumb(safeSrc),
                            link: link, date: dateText, ts: timestamp, user: user
                        };
                        
                        this.seenUrls.add(safeSrc); 
                        this.allItems.push(item);
                        if (!this.groupedData[user]) this.groupedData[user] = [];
                        this.groupedData[user].push(item);
                        count++;
                    }
                }
            });
        });
        
        return { count, nextLink: this.findNextPage(doc), stopSignal };
    },

    sortData: function() {
        const U = window.Fotki.Utils;
        const s = U.settings.sortOrder;
        
        let sortFn;
        if (s === 'newest') sortFn = (a, b) => b.ts - a.ts;
        else if (s === 'oldest') sortFn = (a, b) => a.ts - b.ts;
        else if (s === 'name_asc') sortFn = (a, b) => a.user.localeCompare(b.user) || b.ts - a.ts;
        else if (s === 'name_desc') sortFn = (a, b) => b.user.localeCompare(a.user) || b.ts - a.ts;

        if (sortFn) this.allItems.sort(sortFn);
        
        // Always sort folder contents by Date (Newest), regardless of global sort
        // because sorting a user's photos by their own name is meaningless.
        const userContentSort = (a, b) => b.ts - a.ts;
        Object.keys(this.groupedData).forEach(u => {
            this.groupedData[u].sort(userContentSort);
        });
    },

    loadMore: async function(initialLoad = false) {
        if (!this.nextPageUrl || this.isFetching) return;
        
        const self = this;
        const U = window.Fotki.Utils;
        self.isFetching = true;
        
        const btn = document.querySelector('.fg-load-more-btn');
        if(btn) {
            btn.textContent = "Načítám...";
            btn.disabled = true;
        }

        const targetCount = U.settings.batchSize;
        const MAX_PAGES_LIMIT = 50; 
        
        let loadedPhotos = 0;
        let pagesFetched = 0;
        let stopLoading = false;

        try {
            while (loadedPhotos < targetCount && pagesFetched < MAX_PAGES_LIMIT && self.nextPageUrl && !stopLoading) {
                if (pagesFetched > 0) {
                    if(btn) btn.textContent = `Hledám fotky... (${pagesFetched} stran)`;
                    await new Promise(r => setTimeout(r, 800));
                }

                if(btn) btn.textContent = `Hledám... (nalezeno ${loadedPhotos})`;

                const response = await fetch(self.nextPageUrl);
                if (!response.ok) throw new Error('Server status: ' + response.status);

                const text = await response.text();
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(text, 'text/html');

                if (!newDoc.querySelector('.listing') && !newDoc.querySelector('.pager')) {
                    throw new Error('Neplatná stránka');
                }

                const result = self.extractData(newDoc);
                
                if (result.stopSignal) {
                    stopLoading = true;
                    self.nextPageUrl = null; 
                } else {
                    loadedPhotos += result.count;
                    pagesFetched++;
                    
                    let foundNext = result.nextLink;
                    if (!foundNext) {
                        const fallbackEl = newDoc.querySelector('.pager .older a');
                        if (fallbackEl) foundNext = fallbackEl.href;
                    }
                    self.nextPageUrl = foundNext;

                    if (!self.nextPageUrl) stopLoading = true;
                }
            }
            self.refreshView();

        } catch (e) {
            console.error('Fotki: Error loading more', e);
            if(btn) {
                btn.textContent = "Chyba (zkusit znovu)";
                btn.disabled = false;
                self.isFetching = false;
                return;
            }
        } finally {
            self.isFetching = false;
            U.hideLoader();
            
            const freshBtn = document.querySelector('.fg-load-more-btn');
            if (freshBtn) {
                if (self.nextPageUrl) {
                    freshBtn.textContent = 'Načíst starší';
                    freshBtn.disabled = false;
                } else {
                    if (document.querySelector('.listing .item')) {
                         freshBtn.textContent = 'Zkusit najít další (konec?)';
                         freshBtn.disabled = false;
                         freshBtn.style.display = 'inline-block';
                         freshBtn.onclick = () => { 
                             if (!self.nextPageUrl) console.log("Really no URL found.");
                             else self.loadMore(); 
                         };
                    } else {
                        freshBtn.style.display = 'none';
                    }
                }
            }
        }
    },

    forceRefresh: function() {
        const U = window.Fotki.Utils;
        U.showLoader();
        setTimeout(() => {
            this.refreshView();
            U.hideLoader();
        }, 10);
    },

    refreshView: function() {
        this.sortData();
        const U = window.Fotki.Utils;
        if (U.settings.groupByUser) {
            if (this.viewState === 'photos' && this.selectedUser) {
                this.renderUserPhotos(this.selectedUser);
            } else {
                this.renderRootUsers();
            }
        } else {
            this.renderFlatList();
        }
    },

    // --- Renderers ---

    appendLoadMoreBtn: function(target) {
        let container = target.querySelector('.fg-load-more-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'fg-load-more-container';
            target.appendChild(container);
        } else {
            target.appendChild(container); 
        }
        
        container.innerHTML = ''; 

        if (this.nextPageUrl) {
            const btn = document.createElement('button');
            btn.className = 'fg-load-more-btn';
            btn.textContent = 'Načíst starší';
            btn.onclick = () => this.loadMore();
            container.appendChild(btn);
        } else if (this.allItems.length > 0) {
            const msg = document.createElement('div');
            msg.style.color = '#555';
            msg.innerText = 'Konec historie';
            container.appendChild(msg);
        }
    },

    renderRootUsers: function() {
        this.viewState = 'root';
        this.selectedUser = null;
        const target = document.getElementById('fg-content-target');
        document.getElementById('fg-breadcrumbs').innerHTML = '';
        document.getElementById('fg-back-btn').style.display = 'none';
        target.className = 'fg-user-grid';
        target.innerHTML = '';

        const users = Object.keys(this.groupedData);
        
        // SORT USERS FOR ROOT VIEW
        const s = window.Fotki.Utils.settings.sortOrder;
        if (s === 'name_asc') users.sort((a, b) => a.localeCompare(b));
        else if (s === 'name_desc') users.sort((a, b) => b.localeCompare(a));
        // Default (Date modes) relies on array order from extract (newest active)

        if (users.length === 0) {
            target.innerHTML = '<div style="color:#666; padding:20px; text-align:center;">Žádné fotky.</div>';
            this.appendLoadMoreBtn(target); 
            return;
        }

        users.forEach(user => {
            const photos = this.groupedData[user];
            if (!photos.length) return;
            
            const card = document.createElement('div');
            card.className = 'fg-user-card';
            card.dataset.user = user; 
            card.onclick = () => this.renderUserPhotos(user);
            
            card.innerHTML = `
                <div class="fg-user-thumb">
                    <img src="${photos[0].thumb}" data-orig="${photos[0].src}">
                    <div class="fg-user-count">${photos.length}</div>
                </div>
                <div class="fg-user-info"><span class="fg-user-name">${user}</span></div>
            `;
            
            const img = card.querySelector('img');
            const item = photos[0];
            
            let attempt = 0;
            const tryNext = () => {
                attempt++;
                if (attempt < photos.length && attempt < 5) {
                    img.src = photos[attempt].thumb;
                } else {
                    card.remove(); 
                }
            };

            img.onerror = () => {
                if (this.isTrustedHost(item.src) && img.src !== item.src) {
                    console.log(`Fotki: Thumb failed for ${user}, trying original.`);
                    img.src = item.src;
                } else {
                    tryNext();
                }
            };

            img.onload = () => {
                if (img.naturalWidth > 0 && img.naturalWidth < 50) tryNext();
            };
            
            target.appendChild(card);
        });

        this.appendLoadMoreBtn(target);
    },

    renderUserPhotos: function(user) {
        const U = window.Fotki.Utils;
        U.showLoader();
        setTimeout(() => {
            this.viewState = 'photos';
            this.selectedUser = user;
            
            const target = document.getElementById('fg-content-target');
            document.getElementById('fg-breadcrumbs').innerHTML = ` &rsaquo; <span>${user}</span>`;
            document.getElementById('fg-back-btn').style.display = 'block';
            target.className = 'fg-photo-grid';
            target.innerHTML = '';

            this.currentList = this.groupedData[user];
            if (!this.currentList) {
                this.goBack();
                return;
            }

            this.renderPhotoCards(target, this.currentList, false);
            this.appendLoadMoreBtn(target);

            U.hideLoader();
        }, 50);
    },

    renderFlatList: function() {
        this.viewState = 'root';
        this.selectedUser = null;
        const target = document.getElementById('fg-content-target');
        document.getElementById('fg-breadcrumbs').innerHTML = ` &rsaquo; <span>Vše</span>`;
        document.getElementById('fg-back-btn').style.display = 'none';
        target.className = 'fg-photo-grid';
        target.innerHTML = '';
        
        this.currentList = this.allItems;
        this.renderPhotoCards(target, this.allItems, true);
        this.appendLoadMoreBtn(target);
    },

    renderPhotoCards: function(container, photos, showUserLabel) {
        photos.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'fg-photo-card';
            const userHtml = showUserLabel ? `<span class="fg-photo-user">${item.user}</span>` : '';

            card.innerHTML = `
                <div class="fg-photo-box">
                    <img src="${item.thumb}" loading="lazy" data-orig="${item.src}">
                </div>
                <div class="fg-photo-meta">
                    <div>${userHtml}<span style="color:#aaa">${item.date}</span></div>
                    <a href="${item.link}" target="_blank" class="fg-link" title="Otevřít příspěvek v novém okně">➜</a>
                </div>
            `;
            
            const img = card.querySelector('img');
            const handleFail = () => {
                card.remove(); 
                this.pruneItem(item);
            };

            const stuckTimer = setTimeout(() => {
                if (!img.complete || img.naturalWidth === 0) handleFail();
            }, 15000);

            img.onerror = () => {
                clearTimeout(stuckTimer);
                if (this.isTrustedHost(item.src) && img.src !== item.src) {
                    console.log(`Fotki: Grid Thumb failed, trying original: ${item.src}`);
                    img.src = item.src;
                } else {
                    handleFail();
                }
            };

            img.onload = () => {
                clearTimeout(stuckTimer);
                if (img.naturalWidth > 0 && img.naturalWidth < 50) handleFail();
            };

            card.querySelector('.fg-photo-box').onclick = () => { this.openLightbox(index); };
            container.appendChild(card);
        });
    },

    // --- Lightbox Control ---

    openLightbox: function(index) {
        if (!this.currentList || this.currentList.length === 0) return;
        this.currentIndex = index;
        this.isLightboxOpen = true;
        this.updateLightboxContent();
        document.getElementById('fg-lightbox').style.display = 'flex';
    },

    closeLightbox: function() {
        document.getElementById('fg-lightbox').style.display = 'none';
        this.isLightboxOpen = false;
        window.Fotki.Lightbox.resetZoom();
    },

    changeImage: function(direction) {
        let newIndex = this.currentIndex + direction;
        if (newIndex < 0) newIndex = this.currentList.length - 1; 
        if (newIndex >= this.currentList.length) newIndex = 0; 
        this.currentIndex = newIndex;
        this.updateLightboxContent();
    },

    updateLightboxContent: function() {
        const item = this.currentList[this.currentIndex];
        const imgEl = document.getElementById('fg-lb-img');
        const metaEl = document.getElementById('fg-lb-meta-text');
        const linkEl = document.getElementById('fg-lb-post-link');

        window.Fotki.Lightbox.resetZoom();

        imgEl.src = item.src;
        metaEl.innerHTML = `<span style="color:#d35400; font-weight:bold">${item.user}</span> &bull; ${item.date} (${this.currentIndex + 1} / ${this.currentList.length})`;
        linkEl.href = item.link;
    },

    goBack: function() { this.renderRootUsers(); },
    toggle: function() { this.isOpen ? this.close() : this.open(); },

    open: function() {
        const self = this;
        const root = document.getElementById('fotki-gallery-root');
        const U = window.Fotki.Utils;
        root.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        self.isOpen = true;
        
        if (self.allItems.length === 0) {
            U.showLoader();
            self.resetData();
            setTimeout(() => {
                const res = self.extractData(document); 
                self.nextPageUrl = res.nextLink; 
                
                if (res.count < U.settings.batchSize && self.nextPageUrl) {
                    self.loadMore();
                } else {
                    if (U.settings.groupByUser) self.renderRootUsers();
                    else self.renderFlatList();
                    U.hideLoader();
                }
            }, 50);
        } else {
            document.getElementById('fotki-gallery-root').style.display = 'flex';
        }
    },

    close: function() {
        document.getElementById('fotki-gallery-root').style.display = 'none';
        document.querySelector('#fg-settings-panel').classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
    }
};


    // 3. Initialize App (Now guaranteed to exist)
    if (window.Fotki.App) {
        window.Fotki.App.init();
        console.log('Fotki: Bundled version v4.5 loaded.');
    } else {
        console.error('Fotki: App module missing.');
    }
})();
