// ==UserScript==
// @name         fotki
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Gallery with Lightbox, Loading States, Settings & Robust Sorting
// @author       kokochan
// @match        https://www.okoun.cz/boards/fotky*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
        /* Toggle Button */
        .head .menu a.gallery-toggle {
            color: #d35400 !important; font-weight: bold; cursor: pointer;
            margin-left: 10px; text-decoration: none;
        }
        .head .menu a.gallery-toggle:hover { color: #e67e22 !important; text-decoration: underline; }

        /* --- Main Overlay --- */
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
            position: absolute; top: 50px; right: 15px; width: 250px;
            background: #222; border: 1px solid #444; border-radius: 4px;
            padding: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
            display: none; z-index: 100;
        }
        #fg-settings-panel.active { display: block; }
        .fg-setting-row { margin-bottom: 15px; }
        .fg-setting-row label { display: block; color: #aaa; margin-bottom: 5px; font-size: 12px; }
        .fg-setting-row select, .fg-setting-row input {
            background: #111; border: 1px solid #444; color: #eee;
            padding: 5px; width: 100%; border-radius: 3px;
        }
        .fg-checkbox-row { display: flex; align-items: center; justify-content: space-between; }
        .fg-checkbox-row input { width: auto; }

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

        /* --- Lightbox --- */
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
        }
        .fg-lb-controls {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; /* Let clicks pass through to image/bg */
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
            padding: 0 20px; color: #888; font-size: 13px;
        }
        .fg-lb-link { color: #d35400; text-decoration: none; margin-left: 10px; }
        .fg-lb-link:hover { text-decoration: underline; }
    `);

    const Fotki = {
        isOpen: false,
        viewState: 'root', // root | photos
        selectedUser: null,
        
        // Lightbox State
        isLightboxOpen: false,
        currentList: [], 
        currentIndex: 0,

        // Data
        allItems: [],
        groupedData: {},

        // Settings
        settings: {
            groupByUser: true,
            sortOrder: 'newest', // newest | oldest
        },

        init() {
            this.loadSettings();
            this.injectButton();
            this.buildOverlay();
            this.buildLightbox();
            this.bindKeys();
        },

        loadSettings() {
            const saved = localStorage.getItem('fotki_settings');
            if (saved) {
                try {
                    this.settings = { ...this.settings, ...JSON.parse(saved) };
                } catch(e) { console.error('Settings error', e); }
            }
        },

        saveSettings() {
            localStorage.setItem('fotki_settings', JSON.stringify(this.settings));
            this.showLoader();
            setTimeout(() => {
                this.refreshView();
                this.hideLoader();
            }, 10);
        },

        injectButton() {
            const menu = document.querySelector('.head .nav .menu');
            if (!menu) return;
            const btn = document.createElement('a');
            btn.className = 'gallery-toggle';
            btn.innerHTML = '[ FOTKY ]';
            btn.onclick = (e) => { e.preventDefault(); this.toggle(); };
            menu.appendChild(document.createTextNode(' '));
            menu.appendChild(btn);
        },

        buildOverlay() {
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
                        <label>Řazení</label>
                        <select id="fg-opt-sort">
                            <option value="newest">Od nejnovějších</option>
                            <option value="oldest">Od nejstarších</option>
                        </select>
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
            
            // Events
            root.querySelector('#fg-close-btn').onclick = () => this.close();
            root.querySelector('#fg-back-btn').onclick = () => this.goBack();
            
            const settingsBtn = root.querySelector('#fg-settings-btn');
            const settingsPanel = root.querySelector('#fg-settings-panel');
            
            settingsBtn.onclick = () => {
                settingsPanel.classList.toggle('active');
                if (settingsPanel.classList.contains('active')) {
                    root.querySelector('#fg-opt-group').checked = this.settings.groupByUser;
                    root.querySelector('#fg-opt-sort').value = this.settings.sortOrder;
                }
            };

            root.querySelector('#fg-opt-group').onchange = (e) => {
                this.settings.groupByUser = e.target.checked;
                this.saveSettings();
            };
            root.querySelector('#fg-opt-sort').onchange = (e) => {
                this.settings.sortOrder = e.target.value;
                this.saveSettings();
            };

            document.body.appendChild(root);
        },

        buildLightbox() {
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
            
            lb.querySelector('.fg-lb-close').onclick = () => this.closeLightbox();
            lb.querySelector('.fg-lb-prev').onclick = (e) => { e.stopPropagation(); this.changeImage(-1); };
            lb.querySelector('.fg-lb-next').onclick = (e) => { e.stopPropagation(); this.changeImage(1); };
            lb.querySelector('.fg-lb-canvas').onclick = (e) => {
                if(e.target.id === 'fg-lb-canvas') this.closeLightbox();
            };

            document.body.appendChild(lb);
        },

        bindKeys() {
            window.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;
                
                const isEsc = (e.key === 'Escape' || e.keyCode === 27);
                const isLeft = (e.key === 'ArrowLeft' || e.keyCode === 37);
                const isRight = (e.key === 'ArrowRight' || e.keyCode === 39);

                // --- Lightbox Keys ---
                if (this.isLightboxOpen) {
                    if (isEsc) {
                        e.preventDefault(); e.stopPropagation();
                        this.closeLightbox();
                    } else if (isLeft) {
                        this.changeImage(-1);
                    } else if (isRight) {
                        this.changeImage(1);
                    }
                    return;
                }

                // --- Gallery Keys ---
                if (isEsc) {
                    e.preventDefault(); e.stopPropagation();
                    
                    if (document.querySelector('#fg-settings-panel.active')) {
                        document.querySelector('#fg-settings-panel').classList.remove('active');
                        return;
                    }

                    if (this.viewState === 'photos' && this.settings.groupByUser) {
                        this.goBack();
                    } else {
                        this.close();
                    }
                }
            }, true);
        },

        // --- Logic ---

        showLoader() { document.getElementById('fg-loader').style.display = 'flex'; },
        hideLoader() { document.getElementById('fg-loader').style.display = 'none'; },

        parseCzechDate(dateStr) {
            // Robust regex to handle "8.února" (joined) vs "8. února" (spaced)
            // Matches: [1]=Day, [2]=Month, [3]=Year, [4]=Time(optional)
            const regex = /(\d+)\.\s*([a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+)\s+(\d{4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?/;
            
            const match = dateStr.match(regex);
            if (!match) return 0;

            const day = parseInt(match[1], 10);
            const monthStr = match[2].toLowerCase(); // normalize
            const year = parseInt(match[3], 10);
            const timeStr = match[4] || "00:00:00";

            const months = {
                'ledna':0, 'února':1, 'března':2, 'dubna':3, 'května':4, 'června':5,
                'července':6, 'srpna':7, 'září':8, 'října':9, 'listopadu':10, 'prosince':11
            };

            const mon = months[monthStr];
            if (mon === undefined) return 0;

            const [h, m, s] = timeStr.split(':').map(x => parseInt(x, 10));
            return new Date(year, mon, day, h||0, m||0, s||0).getTime();
        },

        scrape() {
            this.groupedData = {};
            this.allItems = [];

            document.querySelectorAll('.listing .item').forEach(post => {
                const userEl = post.querySelector('.meta .user');
                const user = userEl ? userEl.innerText.trim() : 'Anonym';
                
                const linkEl = post.querySelector('.permalink a.date');
                const link = linkEl ? linkEl.href : '#';
                const dateText = linkEl ? linkEl.innerText.trim() : '';
                const timestamp = this.parseCzechDate(dateText);

                post.querySelectorAll('.content img').forEach(img => {
                    if (img.width > 30 || img.naturalWidth > 30 || !img.hasAttribute('width')) {
                        if (!img.src.includes('cloudfront.net') && !img.src.includes('/img/')) {
                            
                            const item = {
                                src: img.src,
                                link: link,
                                date: dateText,
                                ts: timestamp,
                                user: user
                            };

                            this.allItems.push(item);

                            if (!this.groupedData[user]) this.groupedData[user] = [];
                            this.groupedData[user].push(item);
                        }
                    }
                });
            });
            this.sortData();
        },

        sortData() {
            const sortFn = (a, b) => {
                return this.settings.sortOrder === 'newest' ? b.ts - a.ts : a.ts - b.ts;
            };
            this.allItems.sort(sortFn);
            Object.keys(this.groupedData).forEach(u => {
                this.groupedData[u].sort(sortFn);
            });
        },

        refreshView() {
            this.sortData();
            if (this.settings.groupByUser) {
                if (this.viewState === 'photos' && this.selectedUser) {
                    this.renderUserPhotos(this.selectedUser);
                } else {
                    this.renderRootUsers();
                }
            } else {
                this.renderFlatList();
            }
        },

        // --- Rendering ---

        renderRootUsers() {
            this.viewState = 'root';
            this.selectedUser = null;
            
            const target = document.getElementById('fg-content-target');
            document.getElementById('fg-breadcrumbs').innerHTML = '';
            document.getElementById('fg-back-btn').style.display = 'none';
            target.className = 'fg-user-grid';
            target.innerHTML = '';

            const users = Object.keys(this.groupedData);
            if (users.length === 0) {
                target.innerHTML = '<div style="color:#666; padding:20px; text-align:center;">Žádné fotky.</div>';
                return;
            }

            users.forEach(user => {
                const photos = this.groupedData[user];
                if (!photos.length) return;
                
                const card = document.createElement('div');
                card.className = 'fg-user-card';
                card.onclick = () => this.renderUserPhotos(user);
                
                card.innerHTML = `
                    <div class="fg-user-thumb">
                        <img src="${photos[0].src}">
                        <div class="fg-user-count">${photos.length}</div>
                    </div>
                    <div class="fg-user-info">
                        <span class="fg-user-name">${user}</span>
                    </div>
                `;
                target.appendChild(card);
            });
        },

        renderUserPhotos(user) {
            this.showLoader();
            setTimeout(() => {
                this.viewState = 'photos';
                this.selectedUser = user;
                
                const target = document.getElementById('fg-content-target');
                document.getElementById('fg-breadcrumbs').innerHTML = ` &rsaquo; <span>${user}</span>`;
                document.getElementById('fg-back-btn').style.display = 'block';
                target.className = 'fg-photo-grid';
                target.innerHTML = '';

                this.currentList = this.groupedData[user];
                this.renderPhotoCards(target, this.currentList, false);
                this.hideLoader();
            }, 50);
        },

        renderFlatList() {
            this.viewState = 'root';
            this.selectedUser = null;

            const target = document.getElementById('fg-content-target');
            document.getElementById('fg-breadcrumbs').innerHTML = ` &rsaquo; <span>Vše</span>`;
            document.getElementById('fg-back-btn').style.display = 'none';
            target.className = 'fg-photo-grid';
            target.innerHTML = '';

            this.currentList = this.allItems;
            this.renderPhotoCards(target, this.allItems, true);
        },

        renderPhotoCards(container, photos, showUserLabel) {
            photos.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'fg-photo-card';
                
                const userHtml = showUserLabel 
                    ? `<span class="fg-photo-user">${item.user}</span>` 
                    : '';

                card.innerHTML = `
                    <div class="fg-photo-box">
                        <img src="${item.src}" loading="lazy">
                    </div>
                    <div class="fg-photo-meta">
                        <div>${userHtml}<span style="color:#aaa">${item.date}</span></div>
                        <a href="${item.link}" target="_blank" class="fg-link" title="Otevřít příspěvek v novém okně">➜</a>
                    </div>
                `;
                
                card.querySelector('.fg-photo-box').onclick = () => {
                    this.openLightbox(index);
                };

                container.appendChild(card);
            });
        },

        // --- Lightbox Functions ---

        openLightbox(index) {
            if (!this.currentList || this.currentList.length === 0) return;
            
            this.currentIndex = index;
            this.isLightboxOpen = true;
            this.updateLightboxContent();
            
            document.getElementById('fg-lightbox').style.display = 'flex';
        },

        closeLightbox() {
            document.getElementById('fg-lightbox').style.display = 'none';
            this.isLightboxOpen = false;
        },

        changeImage(direction) {
            let newIndex = this.currentIndex + direction;
            if (newIndex < 0) newIndex = this.currentList.length - 1; 
            if (newIndex >= this.currentList.length) newIndex = 0; 
            
            this.currentIndex = newIndex;
            this.updateLightboxContent();
        },

        updateLightboxContent() {
            const item = this.currentList[this.currentIndex];
            const imgEl = document.getElementById('fg-lb-img');
            const metaEl = document.getElementById('fg-lb-meta-text');
            const linkEl = document.getElementById('fg-lb-post-link');

            imgEl.src = item.src;
            metaEl.innerHTML = `<span style="color:#d35400; font-weight:bold">${item.user}</span> &bull; ${item.date} (${this.currentIndex + 1} / ${this.currentList.length})`;
            linkEl.href = item.link;
        },

        goBack() { this.renderRootUsers(); },
        toggle() { this.isOpen ? this.close() : this.open(); },

        open() {
            const root = document.getElementById('fotki-gallery-root');
            root.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.isOpen = true;

            this.showLoader();
            setTimeout(() => {
                this.scrape(); 
                if (this.settings.groupByUser) {
                    this.renderRootUsers();
                } else {
                    this.renderFlatList();
                }
                this.hideLoader();
            }, 50);
        },

        close() {
            document.getElementById('fotki-gallery-root').style.display = 'none';
            document.querySelector('#fg-settings-panel').classList.remove('active');
            document.body.style.overflow = '';
            this.isOpen = false;
        }
    };

    Fotki.init();
})();