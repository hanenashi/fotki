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
    
    // Paging
    nextPageUrl: null,
    isFetching: false,
    dateLimitMin: null, // Limit fetching (From Date)

    init: function() {
        window.Fotki.Utils.loadSettings();
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
                    </select>
                </div>

                <hr style="border:0; border-top:1px solid #444; margin: 15px 0;">
                
                <div class="fg-setting-row">
                    <label>Časové období (Od - Do)</label>
                    <div class="fg-date-group">
                        <input type="date" id="fg-date-from" title="Datum, kde se načítání zastaví">
                        <input type="date" id="fg-date-to" title="Datum, odkud se začne (skočí do historie)">
                    </div>
                    <button id="fg-date-go" class="fg-action-btn">Načíst období</button>
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
        
        // Bind UI Events
        root.querySelector('#fg-close-btn').onclick = () => this.close();
        root.querySelector('#fg-back-btn').onclick = () => this.goBack();
        
        const setBtn = root.querySelector('#fg-settings-btn');
        const setPanel = root.querySelector('#fg-settings-panel');
        
        setBtn.onclick = () => {
            setPanel.classList.toggle('active');
            if (setPanel.classList.contains('active')) {
                root.querySelector('#fg-opt-group').checked = U.settings.groupByUser;
                root.querySelector('#fg-opt-sort').value = U.settings.sortOrder;
                root.querySelector('#fg-opt-batch').value = U.settings.batchSize;
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

        // Date Logic
        root.querySelector('#fg-date-go').onclick = () => {
            const dFrom = root.querySelector('#fg-date-from').value;
            const dTo = root.querySelector('#fg-date-to').value;
            this.startTimeTravel(dFrom, dTo);
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

        lb.querySelector('.fg-lb-canvas').onclick = (e) => {
            if(e.target.id === 'fg-lb-canvas') this.closeLightbox();
        };

        document.body.appendChild(lb);
    },

    bindKeys: function() {
        window.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            
            const isEsc = (e.key === 'Escape' || e.keyCode === 27);
            const isLeft = (e.key === 'ArrowLeft' || e.keyCode === 37);
            const isRight = (e.key === 'ArrowRight' || e.keyCode === 39);

            if (this.isLightboxOpen) {
                if (isEsc) { e.preventDefault(); e.stopPropagation(); this.closeLightbox(); }
                else if (isLeft) this.changeImage(-1);
                else if (isRight) this.changeImage(1);
                return;
            }

            if (isEsc) {
                e.preventDefault(); e.stopPropagation();
                if (document.querySelector('#fg-settings-panel.active')) {
                    document.querySelector('#fg-settings-panel').classList.remove('active');
                    return;
                }
                const U = window.Fotki.Utils;
                if (this.viewState === 'photos' && U.settings.groupByUser) {
                    this.goBack();
                } else {
                    this.close();
                }
            }
        }, true);
    },

    // --- Core Logic ---

    // Deep Pruning: Removes item from data model AND view
    pruneItem: function(badItem) {
        // 1. Remove from allItems
        this.allItems = this.allItems.filter(i => i !== badItem);
        
        // 2. Remove from groupedData
        if (this.groupedData[badItem.user]) {
            this.groupedData[badItem.user] = this.groupedData[badItem.user].filter(i => i !== badItem);
            
            // 3. Check if user folder is now empty
            if (this.groupedData[badItem.user].length === 0) {
                delete this.groupedData[badItem.user];
                
                // 4. Remove User Card from Root View if exists
                if (this.viewState === 'root') {
                    const userCard = document.querySelector(`.fg-user-card[data-user="${badItem.user}"]`);
                    if (userCard) userCard.remove();
                }
            } else if (this.viewState === 'root') {
                // User still has photos, but maybe the cover thumb died?
                // Re-rendering the specific card is hard, but we can verify thumbnail
                // Logic already handled in renderRootUsers by failing over or cross.
            }
        }
    },

    resetData: function() {
        this.groupedData = {};
        this.allItems = [];
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
        
        // 1. Set Stop Condition
        this.dateLimitMin = dateFrom ? new Date(dateFrom).getTime() : null;
        
        // 2. Determine Start URL
        let startUrl = window.location.href.split('?')[0]; // clean base
        if (dateTo) {
            // Set time to end of day to include that day's posts
            const dt = new Date(dateTo);
            dt.setHours(23, 59, 59);
            startUrl += '?f=' + U.dateToOkounParam(dt);
        }

        // 3. Reset & Start
        U.showLoader();
        this.resetData();
        this.nextPageUrl = startUrl; // Override normal pager
        
        // Trigger load cycle (which will fetch the custom URL first)
        this.loadMore(true); 
    },

    extractData: function(doc) {
        const U = window.Fotki.Utils;
        let count = 0;

        doc.querySelectorAll('.listing .item').forEach(post => {
            const userEl = post.querySelector('.meta .user');
            const user = userEl ? userEl.innerText.trim() : 'Anonym';
            const linkEl = post.querySelector('.permalink a.date');
            const link = linkEl ? linkEl.href : '#';
            const dateText = linkEl ? linkEl.innerText.trim() : '';
            const timestamp = U.parseCzechDate(dateText);

            // Date Limit Check (Stop loading if we went too far back)
            if (this.dateLimitMin && timestamp < this.dateLimitMin) {
                // If we hit a post older than our limit, we can conceptually stop
                // But we should finish the page just in case of sorting oddities
            }

            post.querySelectorAll('.content img').forEach(img => {
                if (!img.src.includes('cloudfront.net') && !img.src.includes('okoun.cz/images/')) {
                    if (!img.hasAttribute('width') || img.width > 30) {
                        const item = {
                            src: img.src, 
                            thumb: this.getOpuThumb(img.src),
                            link: link, date: dateText, ts: timestamp, user: user
                        };
                        
                        // Check Date Range again for individual item inclusion
                        if (this.dateLimitMin && timestamp < this.dateLimitMin) {
                            // Too old, skip
                            return; 
                        }

                        this.allItems.push(item);
                        if (!this.groupedData[user]) this.groupedData[user] = [];
                        this.groupedData[user].push(item);
                        count++;
                    }
                }
            });
        });
        
        // Check next page link in the document
        const nextEl = doc.querySelector('.pager .older a');
        let nextLink = nextEl ? nextEl.href : null;

        // Hard Stop if we passed the date limit significantly
        // (Check the last item on page to see if it's older than limit)
        if (this.dateLimitMin && nextLink) {
            // This is a heuristic. If we scraped 0 items because they were all too old, kill next link.
            // Or look at the last timestamp extracted. 
            // Simple approach: if page had items but all were filtered out, likely we are done.
        }

        return { count, nextLink };
    },

    sortData: function() {
        const U = window.Fotki.Utils;
        const sortFn = (a, b) => {
            return U.settings.sortOrder === 'newest' ? b.ts - a.ts : a.ts - b.ts;
        };
        this.allItems.sort(sortFn);
        Object.keys(this.groupedData).forEach(u => {
            this.groupedData[u].sort(sortFn);
        });
    },

    // initialLoad: boolean to distinguish "first load of new filter" vs "user clicked button"
    loadMore: async function(initialLoad = false) {
        if (!this.nextPageUrl || this.isFetching) return;
        
        const U = window.Fotki.Utils;
        this.isFetching = true;
        
        const btn = document.querySelector('.fg-load-more-btn');
        if(btn) {
            btn.textContent = "Načítám...";
            btn.disabled = true;
        }

        const targetCount = U.settings.batchSize;
        const MAX_PAGES_LIMIT = 10; // Safety brake
        
        let loadedPhotos = 0;
        let pagesFetched = 0;
        let stopLoading = false;

        try {
            while (loadedPhotos < targetCount && pagesFetched < MAX_PAGES_LIMIT && this.nextPageUrl && !stopLoading) {
                // Update Button
                if (pagesFetched > 0 && btn) {
                    btn.textContent = `Načítám... (nalezeno ${loadedPhotos})`;
                }

                const response = await fetch(this.nextPageUrl);
                const text = await response.text();
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(text, 'text/html');

                const result = this.extractData(newDoc);
                loadedPhotos += result.count;
                pagesFetched++;
                this.nextPageUrl = result.nextLink;

                // Stop if we hit date limit (found no items on a page because they were filtered out?)
                // Or if extractData logic flagged it.
                if (!this.nextPageUrl) stopLoading = true;
                
                // Heuristic: If we are searching a date range, and we fetched a page but kept 0 items,
                // and we have a date limit set, assume we passed the boundary.
                if (this.dateLimitMin && result.count === 0 && pagesFetched > 1) {
                     stopLoading = true;
                     this.nextPageUrl = null; // Kill "More" button
                }
            }
            
            this.refreshView();
            console.log(`Fotki: Batch finished. ${loadedPhotos} photos.`);

        } catch (e) {
            console.error('Fotki: Error loading more', e);
            if(btn) btn.textContent = "Chyba načítání";
        } finally {
            this.isFetching = false;
            U.hideLoader(); // Ensure global loader is off if this was initial
            
            const freshBtn = document.querySelector('.fg-load-more-btn');
            if (freshBtn) {
                if (this.nextPageUrl) {
                    freshBtn.textContent = 'Načíst starší';
                    freshBtn.disabled = false;
                } else {
                    freshBtn.style.display = 'none';
                }
            }
        }
    },

    forceRefresh: function() {
        window.Fotki.Utils.showLoader();
        setTimeout(() => {
            this.refreshView();
            window.Fotki.Utils.hideLoader();
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
        if (!this.nextPageUrl) return;

        const container = document.createElement('div');
        container.className = 'fg-load-more-container';
        
        const btn = document.createElement('button');
        btn.className = 'fg-load-more-btn';
        btn.textContent = 'Načíst starší';
        btn.onclick = () => this.loadMore();
        
        container.appendChild(btn);
        target.appendChild(container);
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
        if (users.length === 0) {
            target.innerHTML = '<div style="color:#666; padding:20px; text-align:center;">Žádné fotky.</div>';
            this.appendLoadMoreBtn(target); // Even if empty, allow loading more
            return;
        }

        users.forEach(user => {
            const photos = this.groupedData[user];
            if (!photos.length) return;
            
            const card = document.createElement('div');
            card.className = 'fg-user-card';
            card.dataset.user = user; // Identify for pruning
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
            
            // Root Thumbnail Error Handler
            img.onerror = () => {
                if (img.src !== item.src) {
                    img.src = item.src; // Try full res
                } else {
                    // Full res failed. Prune this specific item.
                    this.pruneItem(item);
                    // If user still exists after prune, try to re-render card with new first image
                    // Simple hack: reload current view
                    // To avoid infinite loops, we just show error placeholder for now
                    img.src = 'https://okoun.cz/images/icons/cross.gif';
                    img.style.opacity = 0.3;
                }
            };
            
            target.appendChild(card);
        });

        this.appendLoadMoreBtn(target);
    },

    renderUserPhotos: function(user) {
        window.Fotki.Utils.showLoader();
        setTimeout(() => {
            this.viewState = 'photos';
            this.selectedUser = user;
            
            const target = document.getElementById('fg-content-target');
            document.getElementById('fg-breadcrumbs').innerHTML = ` &rsaquo; <span>${user}</span>`;
            document.getElementById('fg-back-btn').style.display = 'block';
            target.className = 'fg-photo-grid';
            target.innerHTML = '';

            this.currentList = this.groupedData[user];
            // If user was pruned away while navigating?
            if (!this.currentList) {
                this.goBack();
                return;
            }

            this.renderPhotoCards(target, this.currentList, false);
            this.appendLoadMoreBtn(target);

            window.Fotki.Utils.hideLoader();
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
            img.onerror = () => {
                if (img.src !== item.src) {
                    console.warn(`Fotki: Thumb failed, retrying original: ${item.src}`);
                    img.src = item.src; 
                } else {
                    console.warn(`Fotki: Dead image pruned: ${item.src}`);
                    card.remove(); 
                    this.pruneItem(item);
                }
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
        const root = document.getElementById('fotki-gallery-root');
        const U = window.Fotki.Utils;
        root.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        
        if (this.allItems.length === 0) {
            U.showLoader();
            this.resetData();
            setTimeout(() => {
                const res = this.extractData(document); 
                this.nextPageUrl = this.findNextPage(document);
                
                // If current page didn't have enough photos, load more immediately
                if (res.count < U.settings.batchSize && this.nextPageUrl) {
                    this.loadMore();
                } else {
                    if (U.settings.groupByUser) this.renderRootUsers();
                    else this.renderFlatList();
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