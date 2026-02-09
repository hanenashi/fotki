# Fotki pro Okoun.cz

Doplněk (userscript), který promění prohlížení fotek na Okoun.cz v moderní galerii s funkcí cestování časem.

## 🚀 Jak nainstalovat

### 1. Nainstaluj si správce skriptů
Potřebuješ rozšíření do prohlížeče:
* **Chrome / Edge:** [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* **Firefox:** [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
* **Safari:** [Tampermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089)

### 2. Nainstaluj skript
Klikni na tento odkaz a potvrď instalaci tlačítkem **Install**:

👉 **[NAINSTALOVAT SKRIPT (fotki.user.js)](https://github.com/hanenashi/fotki/raw/main/fotki.user.js)**

---

## 🎮 Jak to funguje

### 🖼️ Galerie
V horním menu Okouna najdeš nové tlačítko **"Fotki"**.
* Kliknutím otevřeš tmavou galerii přes celou obrazovku.
* Fotky se načítají automaticky (nekonečné scrollování).
* Kliknutím na fotku otevřeš detail (Lightbox).
* **Zoom:** V detailu stačí hýbat myší pro přiblížení.

### ⏳ Cestování časem (Time Travel)
Chceš vidět fotky z roku 2008?
1.  Otevři Galerii a klikni na **ozubené kolo (⚙️)**.
2.  Do políčka **"Od (Nejnovější)"** zadej datum, kam chceš skočit (např. `31.12.2008`).
3.  *(Volitelné)* Do políčka **"Do (Nejstarší)"** zadej, kde se má hledání zastavit (např. `1.1.2008`).
4.  Klikni na **"Načíst období"**. Skript "prolétne" historií a začne zobrazovat fotky z té doby.

### 🛑 Tlačítko STOP
Pokud hledání trvá moc dlouho, klikni nahoře na červené **STOP & ZOBRAZIT**. Skript okamžitě přestane hledat a ukáže vše, co do té chvíle našel.