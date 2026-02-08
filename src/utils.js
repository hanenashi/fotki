window.Fotki = window.Fotki || {};

window.Fotki.Utils = {
    // Settings Logic
    settings: {
        groupByUser: true,
        sortOrder: 'newest',
        batchSize: 30, // Number of photos to load per "Load More" click
    },

    loadSettings: function() {
        const saved = localStorage.getItem('fotki_settings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch(e) { console.error('Settings error', e); }
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

    // Convert Date object to Okoun URL format (YYYYMMDD-HHMMSS)
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

    // UI Helpers
    showLoader: function() { 
        const el = document.getElementById('fg-loader');
        if(el) el.style.display = 'flex'; 
    },
    
    hideLoader: function() { 
        const el = document.getElementById('fg-loader');
        if(el) el.style.display = 'none'; 
    }
};