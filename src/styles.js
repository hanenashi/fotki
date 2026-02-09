window.Fotki = window.Fotki || {};

window.Fotki.styles = `
    /* --- DESKTOP / BASE STYLES --- */

    .head .menu a.gallery-toggle { cursor: pointer; margin-left: 10px; }
    #fotki-gallery-root { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(15, 15, 20, 0.98); z-index: 99900; display: none; flex-direction: column; font-family: sans-serif; font-size: 14px; }
    
    .fg-header { flex: 0 0 45px; background: #111; border-bottom: 1px solid #333; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; color: #ccc; z-index: 10; }
    .fg-header-left { display: flex; align-items: center; gap: 15px; overflow: hidden; white-space: nowrap; }
    .fg-title { font-weight: bold; color: #eee; }
    .fg-breadcrumbs { color: #777; font-size: 13px; }
    .fg-breadcrumbs span { color: #d35400; }

    .fg-btn { background: #333; border: 1px solid #444; color: #ddd; padding: 4px 12px; cursor: pointer; border-radius: 3px; font-size: 12px; margin-left: 5px; }
    .fg-btn:hover { background: #555; color: #fff; }
    .fg-btn.close:hover { background: #c0392b; border-color: #e74c3c; }
    .fg-icon-btn { padding: 4px 8px; font-size: 16px; line-height: 1; }

    /* Status Bar */
    #fg-status-bar { position: absolute; top: 45px; left: 0; width: 100%; height: 40px; background: rgba(44, 62, 80, 0.95); border-bottom: 1px solid #34495e; display: none; align-items: center; justify-content: space-between; padding: 0 20px; box-sizing: border-box; color: #ecf0f1; font-size: 13px; z-index: 60; }
    #fg-status-bar.active { display: flex; }
    .fg-stop-btn { background: #c0392b; color: white; border: none; padding: 5px 15px; border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 12px; margin-left: 10px; }

    /* Settings */
    #fg-settings-panel { position: absolute; top: 50px; right: 15px; width: 300px; background: #222; border: 1px solid #444; border-radius: 4px; padding: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); display: none; z-index: 100; max-height: 90vh; overflow-y: auto; }
    #fg-settings-panel.active { display: block; }
    .fg-setting-row { margin-bottom: 15px; }
    .fg-setting-row label { display: block; color: #aaa; margin-bottom: 5px; font-size: 12px; }
    .fg-setting-row select, .fg-setting-row input, .fg-setting-row textarea { background: #111; border: 1px solid #444; color: #eee; padding: 5px; width: 100%; border-radius: 3px; box-sizing: border-box; }
    .fg-checkbox-row { display: flex; align-items: center; justify-content: space-between; }
    .fg-checkbox-row input { width: auto; }
    .fg-date-group { display: flex; gap: 10px; }
    .fg-btn-row { display: flex; gap: 10px; margin-top: 5px; }
    .fg-action-btn { flex: 2; padding: 8px; background: #d35400; color: white; border: none; font-weight: bold; }
    .fg-reset-btn { flex: 1; padding: 8px; background: #c0392b; color: white; border: none; font-weight: bold; }

    /* Content */
    #fg-loader { position: absolute; top: 45px; left: 0; width: 100%; bottom: 0; background: rgba(15, 15, 20, 0.8); z-index: 50; display: none; flex-direction: column; align-items: center; justify-content: center; color: #ccc; }
    .fg-spinner { width: 40px; height: 40px; margin-bottom: 15px; border: 3px solid #333; border-top-color: #d35400; border-radius: 50%; animation: fg-spin 1s linear infinite; }
    @keyframes fg-spin { to { transform: rotate(360deg); } }
    
    .fg-scroll-area { flex: 1; overflow-y: scroll; padding: 20px; margin-top: 0; }
    .fg-with-status .fg-scroll-area { margin-top: 40px; }
    .fg-load-more-container { grid-column: 1 / -1; padding: 20px 0; text-align: center; }
    .fg-load-more-btn { background: #222; border: 1px solid #444; color: #ddd; padding: 10px 30px; font-size: 14px; cursor: pointer; }

    /* Grids */
    .fg-user-grid, .fg-photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; max-width: 1600px; margin: 0 auto; }
    
    .fg-user-card, .fg-photo-card { 
        background: #222; border: 1px solid #333; border-radius: 4px; 
        overflow: hidden; display: flex; flex-direction: column; 
        transition: transform 0.2s, border-color 0.2s; /* Smooth hover */
    }
    /* Hover Effect Restored */
    .fg-user-card:hover, .fg-photo-card:hover { 
        transform: translateY(-3px); 
        border-color: #d35400; 
    }

    .fg-user-thumb { height: 120px; position: relative; }
    .fg-user-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
    .fg-user-count { position: absolute; top: 5px; right: 5px; background: #d35400; color: white; padding: 2px 6px; font-size: 10px; border-radius: 10px; }
    .fg-user-info { padding: 8px; text-align: center; border-top: 1px solid #333; }
    
    /* User Color Restored */
    .fg-user-name { font-weight: bold; color: #eee; display: block; font-size: 13px; }
    
    .fg-photo-box { height: 220px; background: #111; display: flex; align-items: center; justify-content: center; cursor: zoom-in; }
    .fg-photo-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .fg-photo-meta { padding: 6px 10px; font-size: 11px; color: #777; border-top: 1px solid #222; display: flex; justify-content: space-between; }
    
    /* Photo User Color Restored */
    .fg-photo-user { color: #d35400; font-weight: bold; margin-right: 5px; }
    
    .fg-link { color: #666; text-decoration: none; padding: 0 5px; }
    .fg-link:hover { color: #fff; background: #d35400; border-radius: 3px; }

    /* Lightbox */
    #fg-lightbox { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 99950; display: none; flex-direction: column; }
    .fg-lb-canvas { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .fg-lb-canvas img { max-width: 95%; max-height: 95%; object-fit: contain; box-shadow: 0 0 20px rgba(0,0,0,0.5); cursor: zoom-in; transition: transform 0.1s; }
    .fg-lb-canvas img.lb-zoomed { cursor: zoom-out; max-width: none; max-height: none; position: absolute; top:0; left:0; }
    .fg-lb-controls { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; }
    .fg-lb-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 50px; height: 80px; background: rgba(50,50,50,0.5); color: #fff; border: none; font-size: 30px; cursor: pointer; pointer-events: auto; }
    .fg-lb-prev { left: 0; } .fg-lb-next { right: 0; }
    .fg-lb-close { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; background: rgba(50,50,50,0.5); color: #fff; border: none; font-size: 24px; cursor: pointer; pointer-events: auto; border-radius: 50%; }
    .fg-lb-close:hover { background: #c0392b; }
    .fg-lb-footer { height: 50px; background: #000; border-top: 1px solid #222; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; color: #888; font-size: 13px; z-index: 10; }
    .fg-lb-link { color: #d35400; text-decoration: none; }

    /* --- MOBILE "GIANT MODE" --- */
    .fg-is-mobile .fg-header { height: 100px; padding: 0 20px; }
    .fg-is-mobile .fg-title { font-size: 32px; }
    .fg-is-mobile .fg-breadcrumbs { display: none; } 
    .fg-is-mobile .fg-btn { padding: 15px 25px; font-size: 26px; border-radius: 8px; margin-left: 10px; }
    .fg-is-mobile .fg-icon-btn { padding: 10px 20px; font-size: 40px; }

    .fg-is-mobile #fg-status-bar { top: 100px; height: auto; padding: 20px; flex-direction: column; gap: 15px; }
    .fg-is-mobile .fg-status-text { font-size: 24px; white-space: normal; text-align: center; }
    .fg-is-mobile .fg-stop-btn { font-size: 24px; padding: 15px 40px; width: 100%; margin: 0; }
    .fg-is-mobile.fg-with-status .fg-scroll-area { margin-top: 200px; }

    .fg-is-mobile #fg-settings-panel { top: 0; left: 0; width: 100%; height: 100%; max-height: 100%; padding: 40px; border: none; }
    .fg-is-mobile .fg-setting-row { margin-bottom: 30px; }
    .fg-is-mobile .fg-setting-row label { font-size: 24px; margin-bottom: 10px; }
    .fg-is-mobile input, .fg-is-mobile select, .fg-is-mobile textarea { font-size: 28px; padding: 15px; height: auto; }
    .fg-is-mobile input[type="checkbox"] { transform: scale(2); margin-right: 20px; }
    .fg-is-mobile .fg-action-btn, .fg-is-mobile .fg-reset-btn { font-size: 24px; padding: 20px; }
    .fg-is-mobile .fg-btn-row { gap: 20px; margin-top: 20px; }

    .fg-is-mobile .fg-user-grid, 
    .fg-is-mobile .fg-photo-grid { grid-template-columns: 1fr 1fr; gap: 15px; padding: 10px; }
    .fg-is-mobile .fg-photo-box { height: 400px; }
    .fg-is-mobile .fg-user-thumb { height: 300px; }
    .fg-is-mobile .fg-photo-meta { font-size: 20px; padding: 15px; }
    .fg-is-mobile .fg-user-info { font-size: 24px; padding: 15px; }
    .fg-is-mobile .fg-user-count { font-size: 18px; padding: 5px 12px; }
    .fg-is-mobile .fg-link { font-size: 30px; padding: 0 15px; }

    .fg-is-mobile .fg-load-more-btn { font-size: 28px; padding: 20px 60px; margin: 30px 0; }
    .fg-is-mobile #fg-loader { top: 100px; font-size: 24px; }
    .fg-is-mobile .fg-spinner { width: 80px; height: 80px; border-width: 6px; }

    .fg-is-mobile .fg-lb-btn { width: 120px; height: 200px; font-size: 80px; background: rgba(0,0,0,0.2); }
    .fg-is-mobile .fg-lb-close { width: 100px; height: 100px; font-size: 60px; top: 20px; right: 20px; }
    .fg-is-mobile .fg-lb-footer { height: auto; padding: 30px; flex-direction: column; gap: 15px; font-size: 24px; text-align: center; }
`;