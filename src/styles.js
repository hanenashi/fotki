window.Fotki = window.Fotki || {};

window.Fotki.styles = `
    /* Toggle Button */
    .head .menu a.gallery-toggle { color: #d35400 !important; font-weight: bold; cursor: pointer; margin-left: 10px; text-decoration: none; }
    .head .menu a.gallery-toggle:hover { color: #e67e22 !important; text-decoration: underline; }

    /* Main Overlay */
    #fotki-gallery-root { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(15, 15, 20, 0.98); z-index: 99900; display: none; flex-direction: column; font-family: sans-serif; }

    /* Header */
    .fg-header { flex: 0 0 45px; background: #111; border-bottom: 1px solid #333; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; color: #ccc; font-size: 14px; z-index: 10; }
    .fg-header-left { display: flex; align-items: center; gap: 15px; }
    .fg-title { font-weight: bold; color: #eee; }
    .fg-breadcrumbs { color: #777; font-size: 13px; }
    .fg-breadcrumbs span { color: #d35400; }

    /* Buttons */
    .fg-btn { background: #333; border: 1px solid #444; color: #ddd; padding: 4px 12px; cursor: pointer; border-radius: 3px; font-size: 12px; transition: all 0.2s; margin-left: 5px; }
    .fg-btn:hover { background: #555; border-color: #777; color: #fff; }
    .fg-btn.close:hover { background: #c0392b; border-color: #e74c3c; }
    .fg-icon-btn { padding: 4px 8px; font-size: 16px; line-height: 1; }

    /* Status Bar (New in v5.0) */
    #fg-status-bar {
        position: absolute; top: 50px; left: 0; width: 100%; height: 40px;
        background: rgba(44, 62, 80, 0.95); border-bottom: 1px solid #34495e;
        display: none; align-items: center; justify-content: space-between;
        padding: 0 20px; box-sizing: border-box; color: #ecf0f1; font-size: 13px;
        z-index: 60;
    }
    #fg-status-bar.active { display: flex; }
    .fg-status-text { font-family: monospace; }
    .fg-stop-btn {
        background: #c0392b; color: white; border: none; padding: 5px 15px;
        border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 12px;
    }
    .fg-stop-btn:hover { background: #e74c3c; }

    /* Settings Panel */
    #fg-settings-panel { position: absolute; top: 50px; right: 15px; width: 300px; background: #222; border: 1px solid #444; border-radius: 4px; padding: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); display: none; z-index: 100; max-height: 90vh; overflow-y: auto; }
    #fg-settings-panel.active { display: block; }
    .fg-setting-row { margin-bottom: 15px; }
    .fg-setting-row label { display: block; color: #aaa; margin-bottom: 5px; font-size: 12px; }
    .fg-setting-row select, .fg-setting-row input[type="number"], .fg-setting-row input[type="date"] { background: #111; border: 1px solid #444; color: #eee; padding: 5px; width: 100%; border-radius: 3px; box-sizing: border-box; }
    .fg-setting-row textarea { background: #111; border: 1px solid #444; color: #999; padding: 5px; width: 100%; height: 80px; border-radius: 3px; box-sizing: border-box; font-family: monospace; font-size: 11px; resize: vertical; }
    .fg-checkbox-row { display: flex; align-items: center; justify-content: space-between; }
    .fg-checkbox-row input { width: auto; }
    
    .fg-date-group { display: flex; gap: 10px; }
    .fg-btn-row { display: flex; gap: 10px; margin-top: 5px; }
    .fg-action-btn { flex: 2; padding: 8px; background: #d35400; color: white; border: none; cursor: pointer; border-radius: 3px; font-weight: bold; }
    .fg-action-btn:hover { background: #e67e22; }
    .fg-reset-btn { flex: 1; padding: 8px; background: #c0392b; color: white; border: none; cursor: pointer; border-radius: 3px; font-weight: bold; text-align: center; }
    .fg-reset-btn:hover { background: #e74c3c; }

    /* Loader */
    #fg-loader { position: absolute; top: 45px; left: 0; width: 100%; bottom: 0; background: rgba(15, 15, 20, 0.8); z-index: 50; display: none; flex-direction: column; align-items: center; justify-content: center; color: #ccc; font-size: 14px; }
    .fg-spinner { width: 40px; height: 40px; margin-bottom: 15px; border: 3px solid #333; border-top-color: #d35400; border-radius: 50%; animation: fg-spin 1s linear infinite; }
    @keyframes fg-spin { to { transform: rotate(360deg); } }

    /* Content Area */
    .fg-scroll-area { flex: 1; overflow-y: scroll; padding: 20px; margin-top: 0; }
    /* Push content down if status bar is active - handled by JS class toggling */
    .fg-with-status .fg-scroll-area { margin-top: 40px; }

    /* Load More Button */
    .fg-load-more-container { grid-column: 1 / -1; padding: 20px 0; text-align: center; }
    .fg-load-more-btn { background: #222; border: 1px solid #444; color: #ddd; padding: 10px 30px; font-size: 14px; cursor: pointer; border-radius: 4px; transition: all 0.2s; font-family: inherit; }
    .fg-load-more-btn:hover { background: #d35400; border-color: #e67e22; color: #fff; }
    .fg-load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Grids */
    .fg-user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; max-width: 1200px; margin: 0 auto; }
    .fg-user-card { background: #222; border: 1px solid #333; border-radius: 6px; overflow: hidden; cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column; }
    .fg-user-card:hover { transform: translateY(-3px); border-color: #d35400; }
    .fg-user-thumb { height: 120px; background: #000; position: relative; }
    .fg-user-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
    .fg-user-count { position: absolute; top: 5px; right: 5px; background: rgba(211, 84, 0, 0.9); color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 10px; }
    .fg-user-info { padding: 8px; text-align: center; border-top: 1px solid #333; }
    .fg-user-name { font-weight: bold; color: #eee; display: block; font-size: 13px; }

    .fg-photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px; max-width: 1600px; margin: 0 auto; }
    .fg-photo-card { background: #000; border: 1px solid #333; display: flex; flex-direction: column; }
    .fg-photo-box { height: 220px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #111; position: relative; cursor: zoom-in; }
    .fg-photo-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .fg-photo-meta { padding: 6px 10px; font-size: 11px; color: #777; border-top: 1px solid #222; display: flex; justify-content: space-between; }
    .fg-photo-user { color: #d35400; font-weight: bold; margin-right: 5px; }
    .fg-link { color: #666; text-decoration: none; padding: 0 5px; }
    .fg-link:hover { color: #fff; background: #d35400; border-radius: 3px; }

    /* Lightbox */
    #fg-lightbox { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 99950; display: none; flex-direction: column; }
    .fg-lb-canvas { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .fg-lb-canvas img { max-width: 95%; max-height: 95%; object-fit: contain; box-shadow: 0 0 20px rgba(0,0,0,0.5); cursor: zoom-in; transition: transform 0.1s ease-out; transform-origin: top left; }
    .fg-lb-canvas img.lb-zoomed { cursor: zoom-out; position: absolute; top: 0; left: 0; max-width: none; max-height: none; box-shadow: none; }
    .fg-lb-controls { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
    .fg-lb-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(50,50,50,0.5); color: white; border: none; width: 50px; height: 80px; font-size: 30px; cursor: pointer; pointer-events: auto; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .fg-lb-btn:hover { background: rgba(211, 84, 0, 0.8); }
    .fg-lb-prev { left: 0; border-radius: 0 5px 5px 0; }
    .fg-lb-next { right: 0; border-radius: 5px 0 0 5px; }
    .fg-lb-close { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-radius: 50%; background: rgba(50,50,50,0.5); color: white; border: none; font-size: 24px; cursor: pointer; pointer-events: auto; display: flex; align-items: center; justify-content: center; }
    .fg-lb-close:hover { background: #c0392b; }
    .fg-lb-footer { height: 50px; background: #000; border-top: 1px solid #222; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; color: #888; font-size: 13px; z-index: 10; }
    .fg-lb-link { color: #d35400; text-decoration: none; margin-left: 10px; }
    .fg-lb-link:hover { text-decoration: underline; }
`;