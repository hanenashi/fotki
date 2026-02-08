# 📸 Fotki pro Okoun.cz
# ignorujte hop hej tón, píše mi to gemini
# Stroj času (Historie) je taková zdá se zabugovaná, používejte na vlastní nebezpečí

Userscript, který promění libovolný diskusní klub na [Okoun.cz](https://www.okoun.cz) v moderní, přehlednou galerii. Nyní funguje na celém serveru!

---

## 📥 Jak to nainstalovat

Aby skript fungoval, musíte mít v prohlížeči nainstalovaný tzv. **správce skriptů**. Je to bezpečný doplněk, který umožňuje upravovat vzhled stránek.

### 1. Krok: Nainstalujte si doplněk (pokud nemáte)
Vyberte si podle svého prohlížeče:
* **Chrome, Edge, Brave:** 🐵 **[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)** nebo **[Violentmonkey](https://violentmonkey.github.io/)**
* **Firefox:** 🦊 **[Tampermonkey](https://addons.mozilla.org/cs/firefox/addon/tampermonkey/)**
* **Safari:** 🧭 **[Userscripts](https://github.com/quoid/userscripts)** (zdarma, open-source)

### 2. Krok: Nainstalujte Fotki
Jakmile máte doplněk, klikněte na tento odkaz. Prohlížeč se vás zeptá, zda chcete skript nainstalovat – potvrďte to.

👉 **[NAINSTALOVAT SKRIPT (v4.5)](https://github.com/hanenashi/fotki/raw/main/fotki.user.js)**

---

## ✨ Funkce

### 🌍 Funguje všude
Tlačítko **`[ FOTKY ]`** se nyní zobrazuje v záhlaví každého klubu (Politika, Vztahy, Kočky...). Galerie se automaticky přizpůsobí aktuálnímu klubu.

### 📂 Chytré sdružování
Místo procházení stovek příspěvků skript automaticky seskupí fotky do **"složek" podle autorů**. Hned vidíte, kdo nahrál kolik fotek.

### 🖼️ Lightbox Galerie
Kliknutím na fotku otevřete **celoobrazovkový prohlížeč** (lightbox):
* **Zoom myší:** Najeďte na fotku pro okamžité zvětšení detailů.
* **Navigace:** Listujte pomocí šipek na klávesnici (`←` / `→`).
* **Rychlé zavření:** Klávesa `Esc` zavře náhled.

### ⏳ Stroj času (Historie)
Umí prohledat hlubokou historii klubu (testováno až do roku 2007).
* **Filtr data:** V nastavení zadejte "Od - Do" a skript najde fotky z té doby.
* **Neúnavné načítání:** Skript automaticky přeskakuje stránky bez fotek ("kecací" období), dokud nenajde obrázky.
* **Reset:** Červené tlačítko Reset vás okamžitě vrátí do současnosti.

### 🛡️ Stabilita a Čištění
* **Mrtvé linky:** Automaticky skrývá obrázky z mrtvých serverů (Tinypic, starý FB), takže galerie je čistá.
* **Duplicity:** Inteligentně odstraňuje duplicitní fotky, které vznikají překryvem stránek na Okounovi.
* **Ochrana:** "Jemné" načítání historie s pauzami, aby vás server neodpojil.

---

## ⚙️ Pokročilé Nastavení
V horní liště galerie najdete ikonu ozubeného kola `⚙`:
* **Editor Blacklistu:** Můžete sami přidávat nebo mazat domény, které nechcete vidět.
* **Dávkování:** Nastavte si, kolik fotek se má načíst na jedno kliknutí.
* **Sdružování:** Přepínač pro zobrazení podle uživatelů nebo plochý seznam.

---

## 🚀 Jak to použít
1.  Jděte na jakýkoliv klub na [Okoun.cz](https://www.okoun.cz).
2.  V horním menu (vedle "Hledat") klikněte na nové tlačítko **`[ FOTKY ]`**.
3.  Užívejte si galerii!
