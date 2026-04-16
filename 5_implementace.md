# 5. Implementace

## 1. Herní Engine a Technologie
Na rozdíl od využití komerčních enginů (jako Unity nebo Godot) je hra implementována pomocí čistých webových technologií, které v tomto případě fungují jako vlastní *Custom Game Engine*:
* **Jádro (Logic):** Vanilla JavaScript (ES6+).
* **Vykreslování (Graphics):** HTML5 `<canvas>` a `CanvasRenderingContext2D`.
* **Rozhraní a Styly (UI):** HTML DOM elementy a CSS3.

## 2. Fáze Prototypování
Před vytvořením finální verze bylo nutné naprogramovat a otestovat dílčí mechaniky na samostatných prototypech. Na těchto prototypech se ověřovala stabilita a funkčnost:

* **Prototyp UI a Menu:** Testování responzivity horní lišty, bočního panelu s věžemi, dynamických tooltipů a překryvného (overlay) menu pro nastavení hlasitosti a přepínání jazyků (CZ/EN).
* **Prototyp pohybu postavy (Nepřátel):** Implementace logiky sledování trasy (waypoints). Nepřátelé (Slot, Roulette, Poker atd.) se plynule přesouvají mezi body pole `path` s ohledem na jejich individuální rychlost a případné zpomalení.
* **Prototyp střelby a kolizí:** Vytvoření matematického modelu pro výpočet vzdáleností (`Math.hypot`). Věže neustále prohledávají svůj dosah (range), zjišťují úhel k cíli (`Math.atan2`) a generují projektily na základě cooldownu.
* **Prototyp ekonomiky:** Testování inflace (zvyšování cen věží po vlnách) a odměn za zabití, aby byla hra vyvážená.

## 3. Integrace a Herní Smyčka
Samotná implementace stojí na hlavní herní smyčce (Game Loop), kterou pohání metoda `requestAnimationFrame(loop)`. V každém snímku (frame) se děje následující:
1. **Vyčištění a překreslení:** Aplikace statického pozadí z off-screen canvasu.
2. **Update logiky:** Přepočítání pozic nepřátel, stavu projektilů a cooldownů věží.
3. **Zpracování událostí (Events):** Ověření, zda nepřítel neprošel do cíle (ztráta životů), nebo zda nebyl zničen (přičtení peněz a spuštění příslušného SFX).
4. **Vykreslení (Render):** Zobrazení aktualizovaného stavu na obrazovce.

