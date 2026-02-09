# Fotki pro Okoun.cz

Jednoduchý doplněk (userscript), který promění prohlížení fotek na diskuzním serveru Okoun.cz v moderní galerii.

## 🚀 Jak nainstalovat

### 1. Nainstaluj si správce skriptů do prohlížeče
Aby to fungovalo, potřebuješ jedno z těchto rozšíření:

* **Chrome / Edge / Brave:** [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* **Firefox:** [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) nebo [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
* **Safari:** [Tampermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089)

### 2. Nainstaluj skript
Po instalaci rozšíření klikni na tento odkaz a potvrď instalaci tlačítkem **Install**:

👉 **[NAINSTALOVAT SKRIPT (fotki.user.js)](https://github.com/hanenashi/fotki/raw/main/fotki.user.js)**

---

## 🎮 Jak to funguje

### 🖼️ Galerie
Po instalaci uvidíš v horním menu Okouna nové tlačítko **"Fotki"**.
* Kliknutím se otevře tmavá galerie přes celou obrazovku.
* Fotky se načítají automaticky (nekonečné scrollování).
* Kliknutím na fotku otevřeš detail (Lightbox).
* **Zoom:** V detailu stačí hýbat myší po obrázku pro detailní přiblížení.

### ⏳ Cestování časem (Time Travel)
Chceš vidět fotky z roku 2008? Nemusíš klikat 1000x na "Starší".
1.  Otevři Galerii a klikni na **ozubené kolo (⚙️)** vpravo nahoře.
2.  Do políčka **"Do (Nejstarší)"** zadej datum (např. `1.1.2008`).
3.  Klikni na **"Načíst období"**.
4.  Skript automaticky "prolétne" historií dozadu a začne ti servírovat fotky z té doby.

### 🛑 Tlačítko STOP
Pokud načítání trvá moc dlouho nebo jsi našel, co jsi hledal, klikni na červené tlačítko **STOP** nahoře. Načítání se okamžitě zastaví a zobrazí se vše, co se stihlo najít.