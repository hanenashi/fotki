window.Fotki = window.Fotki || {};

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