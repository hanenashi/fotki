window.Fotki = window.Fotki || {};

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
    
    // Time Travel State
    dateLimitMin: null, dateLimitMax: null,
    isSeeking: false,
    stopRequested: false,

    trustedHosts: [
        'peklo.biz', 'opu.peklo.biz', 'pic.peklo.biz', 'flickr.com', 'static.flickr.com'
    ],

    OPU_THUMB_LIMIT: new Date(2024, 10, 27).getTime(), 

    init: function() {
        const U = window.Fotki.Utils;
        
        if (window.Fotki.styles) {
            if (typeof GM_addStyle !== 'undefined') {
                GM_addStyle(window.Fotki.styles);
            } else {
                const style = document.createElement('style');
                style.textContent = window.Fotki.styles;
                document.head.append(style);
            }
        }

        U.loadSettings();
        window.Fotki.Lightbox.init();
        this.injectButton();
        this.buildOverlay();
        this.buildLightbox();
        this.bindKeys();
    },

    detectMobile: function() {
        return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    },

    injectButton: function() {
        const menu = document.querySelector('.head .nav .menu');
        if (!menu) return;
        const btn = document.createElement('a');
        btn.className = 'gallery-toggle';
        btn.textContent = 'Fotki'; 
        btn.onclick = (e) => { e.preventDefault(); this.toggle(); };
        menu.appendChild(document.createTextNode(' '));
        menu.appendChild(btn);
    },

    buildOverlay: function() {
        const U = window.Fotki.Utils;
        const version = (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.version : 'Dev';
        const root = document.createElement('div');
        root.id = 'fotki-gallery-root';
        
        if (this.detectMobile()) {
            root.classList.add('fg-is-mobile');
        }

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
            
            <div id="fg-status-bar">
                <div class="fg-status-text" id="fg-status-msg">Připraveno.</div>
                <button id="fg-stop-btn" class="fg-stop-btn">⏹ STOP & ZOBRAZIT</button>
            </div>
            
            <div id="fg-settings-panel">
                <div class="fg-settings-close-bar">
                    <button id="fg-settings-close-mobile" class="fg-settings-close-btn">← Zavřít nastavení</button>
                </div>

                <div class="fg-setting-row fg-checkbox-row">
                    <label for="fg-opt-group">Sdružovat podle uživatelů</label>
                    <input type="checkbox" id="fg-opt-group">
                </div>
                
                <div class="fg-setting-row">
                    <label>Animace (GIF/WebP/AVIF)</label>
                    <select id="fg-opt-anim">
                        <option value="off">Vypnuto (Šetří data)</option>
                        <option value="hover">Přehrát při najetí myší</option>
                        <option value="full">Vždy načíst (Pomalé)</option>
                    </select>
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
                    <label>Časové období</label>
                    <div style="font-size:11px; color:#777; margin-bottom:5px;">Hledat fotky mezi těmito daty:</div>
                    <div class="fg-date-group">
                        <div style="flex:1">
                            <label style="font-size:10px">Od (Nejnovější)</label>
                            <input type="date" id="fg-date-to">
                        </div>
                        <div style="flex:1">
                            <label style="font-size:10px">Do (Nejstarší)</label>
                            <input type="date" id="fg-date-from">
                        </div>
                    </div>
                    <div class="fg-btn-row">
                        <button id="fg-date-go" class="fg-action-btn">Načíst období</button>
                        <button id="fg-date-reset" class="fg-reset-btn" title="Zrušit filtr">Reset</button>
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
        root.querySelector('#fg-stop-btn').onclick = () => { this.stopRequested = true; };
        
        const setBtn = root.querySelector('#fg-settings-btn');
        const setPanel = root.querySelector('#fg-settings-panel');
        
        setBtn.onclick = () => {
            setPanel.classList.toggle('active');
            if (setPanel.classList.contains('active')) {
                const currentSettings = U.loadSettings();
                root.querySelector('#fg-opt-group').checked = currentSettings.groupByUser;
                root.querySelector('#fg-opt-sort').value = currentSettings.sortOrder;
                root.querySelector('#fg-opt-batch').value = currentSettings.batchSize;
                root.querySelector('#fg-opt-anim').value = currentSettings.animMode || 'off';
                
                if (Array.isArray(currentSettings.deadHosts)) {
                    root.querySelector('#fg-opt-blacklist').value = currentSettings.deadHosts.join('\n');
                } else {
                    root.querySelector('#fg-opt-blacklist').value = '';
                }
            }
        };

        root.querySelector('#fg-settings-close-mobile').onclick = () => {
            setPanel.classList.remove('active');
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
        root.querySelector('#fg-opt-anim').onchange = (e) => {
            U.saveSettings({ animMode: e.target.value });
            this.forceRefresh();
        };
        root.querySelector('#fg-opt-blacklist').onchange = (e) => { 
            const raw = e.target.value; 
            const list = raw.split('\n').map(s => s.trim()).filter(s => s.length > 0); 
            U.saveSettings({ deadHosts: list }); 
        };

        root.querySelector('#fg-date-go').onclick = () => {
            const dStop = root.querySelector('#fg-date-from').value; 
            const dStart = root.querySelector('#fg-date-to').value; 
            this.startTimeTravel(dStop, dStart);
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
        
        if (this.detectMobile()) lb.classList.add('fg-is-mobile');

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
                if (self.viewState === 'photos' && window.Fotki.Utils.settings.groupByUser) { 
                    self.goBack(); 
                } else { 
                    self.close(); 
                } 
            } 
        }, true); 
    },

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

    isGif: function(url) {
        return url.match(/\.gif$/i) !== null;
    },

    getOpuThumb: function(url, postTs) {
        if (this.isGif(url)) return url; // GIFs never have thumbs

        if (url.includes('opu.peklo.biz/p/') && !url.includes('/thumbs/')) {
            if (postTs && postTs < this.OPU_THUMB_LIMIT) {
                return url;
            }
            const parts = url.split('/');
            const filename = parts.pop();
            return parts.join('/') + '/thumbs/' + filename;
        }
        return url;
    },

    // ... (resetData, updateStatus, etc. - no changes) ...
    resetData: function() {
        this.groupedData = {};
        this.allItems = [];
        this.seenUrls.clear(); 
        this.nextPageUrl = null;
        this.dateLimitMin = null;
        this.dateLimitMax = null;
        this.isSeeking = false;
        this.stopRequested = false;
        document.getElementById('fg-status-msg').innerText = "Připraveno.";
    },
    
    updateStatus: function(text) {
        document.getElementById('fg-status-msg').innerText = text;
    },

    toggleStatusBar: function(show) {
        const bar = document.getElementById('fg-status-bar');
        const root = document.getElementById('fotki-gallery-root');
        if (show) {
            bar.classList.add('active');
            root.classList.add('fg-with-status');
        } else {
            bar.classList.remove('active');
            root.classList.remove('fg-with-status');
        }
    },

    startTimeTravel: function(dateStop, dateStart) {
        const U = window.Fotki.Utils;
        
        let tsStart = dateStart ? new Date(dateStart).getTime() : null;
        let tsStop = dateStop ? new Date(dateStop).getTime() : null;

        if (tsStart && tsStop && tsStart < tsStop) {
            const temp = tsStart;
            tsStart = tsStop;
            tsStop = temp;
        }

        this.dateLimitMax = tsStart;
        this.dateLimitMin = tsStop;
        
        let startUrl = window.location.href.split('?')[0]; 
        
        U.showLoader();
        this.resetData(); 
        
        this.dateLimitMax = tsStart;
        this.dateLimitMin = tsStop;
        
        if (this.dateLimitMax) {
            this.isSeeking = true;
            this.toggleStatusBar(true);
            this.updateStatus(`⏳ Cestuji v čase do ${new Date(this.dateLimitMax).toLocaleDateString()}...`);
            const stopBtn = document.getElementById('fg-stop-btn');
            if (stopBtn) stopBtn.style.display = 'block';
        } else {
            this.isSeeking = false;
            this.toggleStatusBar(false);
        }
        
        this.nextPageUrl = startUrl; 
        this.loadMore(true); 
    },

    resetTimeTravel: function() {
        const U = window.Fotki.Utils;
        document.getElementById('fg-date-from').value = '';
        document.getElementById('fg-date-to').value = '';
        
        U.showLoader();
        this.resetData();
        this.toggleStatusBar(false);
        
        this.nextPageUrl = window.location.href.split('?')[0];
        this.loadMore(true);
    },

    parseUrlDate: function(url) {
        const match = url.match(/[?&]f=(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
        if (match) {
            return new Date(match[1], match[2]-1, match[3], match[4], match[5], match[6]).getTime();
        }
        return null;
    },

    findNextPage: function(doc) {
        const self = this;
        
        if (self.isSeeking && self.dateLimitMax) {
            let bestLink = null;
            let bestLinkTs = 0;
            const pagerLinks = doc.querySelectorAll('.pager a');
            
            pagerLinks.forEach(link => {
                const linkTs = self.parseUrlDate(link.href);
                if (linkTs) {
                    if (linkTs >= self.dateLimitMax) {
                        if (bestLink === null || linkTs < bestLinkTs) {
                            bestLink = link.href;
                            bestLinkTs = linkTs;
                        }
                    }
                }
            });
            
            let olderBtn = doc.querySelector('.pager .older a');
            if (!olderBtn) {
                for(let l of pagerLinks) {
                    if (l.innerText.includes('Starší') || l.innerText.trim() === '>' || l.innerText.trim() === '›') olderBtn = l;
                }
            }
            
            let olderBtnTs = olderBtn ? self.parseUrlDate(olderBtn.href) : 0;

            if (bestLink && olderBtnTs && bestLinkTs < olderBtnTs) {
                return bestLink;
            }
        }

        let el = doc.querySelector('.pager .older a');
        if (el) return el.href;
        
        const pagerLinks = doc.querySelectorAll('.pager a');
        for (let i = 0; i < pagerLinks.length; i++) {
            const t = pagerLinks[i].innerText.trim();
            if (t.includes('Starší') || t === '>' || t === '›') {
                return pagerLinks[i].href;
            }
        }
        return null;
    },

    extractData: function(doc) {
        const U = window.Fotki.Utils;
        let count = 0;
        let stopSignal = false; 
        let newestOnPage = 0;
        let oldestOnPage = 0;

        const posts = doc.querySelectorAll('.listing .item');

        posts.forEach(post => {
            const dateEl = post.querySelector('.permalink a.date');
            const dateText = dateEl ? dateEl.innerText.trim() : '';
            const timestamp = U.parseCzechDate(dateText);
            if (timestamp > 0) {
                if (newestOnPage === 0 || timestamp > newestOnPage) newestOnPage = timestamp;
                if (oldestOnPage === 0 || timestamp < oldestOnPage) oldestOnPage = timestamp;
            }
        });

        if (this.isSeeking && this.dateLimitMax) {
            if (oldestOnPage > 0 && oldestOnPage <= this.dateLimitMax) {
                this.isSeeking = false;
                this.updateStatus(`🎯 Nalezeno! Skenuji od ${new Date(this.dateLimitMax).toLocaleDateString()}...`);
            }
        }

        posts.forEach(post => {
            const dateEl = post.querySelector('.permalink a.date');
            const dateText = dateEl ? dateEl.innerText.trim() : '';
            const timestamp = U.parseCzechDate(dateText);

            if (this.isSeeking) return;

            if (this.dateLimitMin && timestamp > 0 && timestamp < this.dateLimitMin) {
                stopSignal = true;
                return;
            }

            if (this.dateLimitMax && timestamp > 0 && timestamp > (this.dateLimitMax + 86400000)) {
                return; 
            }

            const userEl = post.querySelector('.meta .user');
            const user = userEl ? userEl.innerText.trim() : 'Anonym';
            const link = dateEl ? dateEl.href : '#';

            post.querySelectorAll('.content img').forEach(img => {
                if (this.isSafeUrl(img.src)) {
                    if (!img.hasAttribute('width') || img.width > 30) {
                        const safeSrc = this.upgradeUrl(img.src);
                        if (this.seenUrls.has(safeSrc)) return; 

                        const item = {
                            src: safeSrc, 
                            thumb: this.getOpuThumb(safeSrc, timestamp), 
                            link: link, date: dateText, ts: timestamp, user: user,
                            isGif: this.isGif(safeSrc)
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
        
        return { count, nextLink: this.findNextPage(doc), stopSignal, oldestOnPage };
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

        self.toggleStatusBar(true);
        const stopBtn = document.getElementById('fg-stop-btn');
        if(stopBtn) stopBtn.style.display = 'block';
        self.stopRequested = false;

        const targetCount = U.settings.batchSize;
        const MAX_PAGES = (self.dateLimitMin || self.isSeeking) ? 1000 : 50; 
        
        let loadedPhotos = 0;
        let pagesFetched = 0;
        let stopLoading = false;

        try {
            while (loadedPhotos < targetCount && pagesFetched < MAX_PAGES && self.nextPageUrl && !stopLoading) {
                
                if (self.stopRequested) {
                    console.log("🛑 Stop requested by user.");
                    stopLoading = true;
                    self.nextPageUrl = null;
                    break;
                }

                if (self.isSeeking) {
                    if(btn) btn.textContent = `⏳ Cestuji v čase...`;
                } else {
                    if (pagesFetched > 0) await new Promise(r => setTimeout(r, 500));
                    self.updateStatus(`📷 Skenuji... nalezeno: ${self.allItems.length} fotek`);
                    if(btn) btn.textContent = `Hledám... (${self.allItems.length})`;
                }

                const response = await fetch(self.nextPageUrl);
                if (!response.ok) throw new Error('Server status: ' + response.status);

                const text = await response.text();
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(text, 'text/html');

                if (!newDoc.querySelector('.listing') && !newDoc.querySelector('.pager')) {
                    throw new Error('Neplatná stránka');
                }

                const result = self.extractData(newDoc);
                
                if (!result.nextLink && self.isSeeking && result.oldestOnPage > 0) {
                    self.isSeeking = false;
                    self.extractData(newDoc);
                }

                if (result.stopSignal) {
                    stopLoading = true;
                    self.nextPageUrl = null; 
                } else {
                    loadedPhotos += result.count;
                    pagesFetched++;
                    self.nextPageUrl = result.nextLink;

                    if (!self.nextPageUrl) stopLoading = true;
                }
            }
            self.refreshView();

        } catch (e) {
            console.error('Fotki: Error', e);
            if(btn) { 
                btn.textContent = "Chyba (zkusit znovu)"; 
                btn.disabled = false; 
            }
        } finally {
            self.isFetching = false;
            U.hideLoader();
            
            const stopBtn = document.getElementById('fg-stop-btn');
            
            if (self.stopRequested) {
                self.updateStatus(`🛑 Zastaveno. Nalezeno ${self.allItems.length} fotek.`);
                if(stopBtn) stopBtn.style.display = 'none';
            } else if (!self.nextPageUrl) {
                self.updateStatus(`✅ Hotovo. Celkem ${self.allItems.length} fotek.`);
                if(stopBtn) stopBtn.style.display = 'none';
            } else if (!self.isSeeking) {
                if(stopBtn) stopBtn.style.display = 'none';
            }

            const freshBtn = document.querySelector('.fg-load-more-btn');
            if (freshBtn) {
                if (self.nextPageUrl && !self.stopRequested) {
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
        const s = window.Fotki.Utils.settings.sortOrder; 
        
        if (s === 'name_asc') users.sort((a, b) => a.localeCompare(b)); 
        else if (s === 'name_desc') users.sort((a, b) => b.localeCompare(a)); 
        
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
            
            card.innerHTML = `<div class="fg-user-thumb"><img src="${photos[0].thumb}" data-orig="${photos[0].src}"><div class="fg-user-count">${photos.length}</div></div><div class="fg-user-info"><span class="fg-user-name">${user}</span></div>`; 
            
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
        const U = window.Fotki.Utils;
        const animMode = U.settings.animMode || 'off'; // 'off', 'hover', 'full'

        // Helpers
        const createPlaceholder = (item) => {
            const wrap = document.createElement('div');
            wrap.className = 'fg-gif-placeholder';
            wrap.innerHTML = `
                <div class="fg-gif-label">ANIM</div>
                <div class="fg-gif-hint">${animMode === 'hover' ? '▶ Přejet myší' : 'Kliknout'}</div>
            `;
            
            if (animMode === 'hover') {
                wrap.onmouseenter = (e) => {
                    const parent = e.target.closest('.fg-photo-box');
                    if (parent && !parent.querySelector('img')) {
                        const img = document.createElement('img');
                        img.src = item.src;
                        img.className = 'fg-hover-anim'; // Add class for pointer-events: none
                        img.style.position = 'absolute';
                        img.style.top = '0'; img.style.left = '0';
                        img.style.width = '100%'; img.style.height = '100%';
                        img.style.objectFit = 'contain';
                        img.style.background = '#111';
                        parent.appendChild(img);
                    }
                };
                wrap.onmouseleave = (e) => {
                    const parent = e.target.closest('.fg-photo-box');
                    if (parent) {
                        const img = parent.querySelector('img');
                        if (img) img.remove();
                    }
                };
            }
            return wrap;
        };

        const createFullImage = (src) => {
            const img = document.createElement('img');
            img.loading = 'lazy';
            img.dataset.orig = src;
            img.src = src;
            return img;
        };

        photos.forEach((item, index) => { 
            const card = document.createElement('div'); 
            card.className = 'fg-photo-card'; 
            const userHtml = showUserLabel ? `<span class="fg-photo-user">${item.user}</span>` : ''; 
            
            // Build Structure
            card.innerHTML = `<div class="fg-photo-box"></div><div class="fg-photo-meta"><div>${userHtml}<span style="color:#aaa">${item.date}</span></div><a href="${item.link}" target="_blank" class="fg-link" title="Otevřít příspěvek v novém okně">➜</a></div>`; 
            
            const box = card.querySelector('.fg-photo-box');

            // --- V6.7: Silent Fallback Logic ---
            let usePlaceholder = false;
            let initialImg = null;

            if (item.isGif) {
                // GIFs: If 'Full' -> Load Source. Else -> Placeholder.
                if (animMode === 'full') {
                    initialImg = createFullImage(item.src); // Skip thumb for GIFs always
                } else {
                    usePlaceholder = true;
                }
            } else {
                // WebP/AVIF/Static: Try Thumb first (unless Full mode for suspected anim?)
                // If animMode is 'full', we prefer full quality/anim over broken thumbs.
                // But for standard images, thumb is better.
                // Compromise: Try thumb. If it fails -> Fallback.
                
                initialImg = createFullImage(item.thumb);
            }

            if (usePlaceholder) {
                box.appendChild(createPlaceholder(item));
            } else if (initialImg) {
                // Attach error/load handlers BEFORE appending
                
                // 1. Silent Error (404) -> Fallback to Placeholder/Full
                initialImg.onerror = () => {
                    // console.log("Thumb failed (404), swapping to placeholder.");
                    box.innerHTML = ''; // Remove broken img
                    if (animMode === 'full') {
                        box.appendChild(createFullImage(item.src)); // Just load full
                    } else {
                        box.appendChild(createPlaceholder(item));
                    }
                };

                // 2. Load Check (Dead Fish Detector)
                initialImg.onload = function() {
                    // Check for Dead Fish (218x218)
                    if (this.naturalWidth === 218 && this.naturalHeight === 218) {
                        // It is a fish!
                        if (this.src !== item.src) {
                            // Thumb failed. Swap.
                            box.innerHTML = '';
                            if (animMode === 'full') {
                                box.appendChild(createFullImage(item.src));
                            } else {
                                box.appendChild(createPlaceholder(item));
                            }
                            return;
                        }
                    }
                    
                    // If we are here, image is good. Fade it in.
                    this.classList.add('loaded');
                };

                box.appendChild(initialImg);
            }
            
            box.onclick = () => { 
                this.openLightbox(index); 
            }; 
            
            container.appendChild(card); 
        }); 
    },

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

    goBack: function() { 
        this.renderRootUsers(); 
    },

    toggle: function() { 
        this.isOpen ? this.close() : this.open(); 
    },

    open: function() { 
        const self = this; 
        const root = document.getElementById('fotki-gallery-root'); 
        const U = window.Fotki.Utils; 
        
        root.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
        self.isOpen = true; 
        
        // Reset stop flag on open
        self.stopRequested = false;
        
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