window.Fotki = window.Fotki || {};

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