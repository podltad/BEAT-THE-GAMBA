# 3. Grafika

Tato část dokumentace se zaměřuje na vizuální identitu a technické zpracování grafických prvků ve hře **BEAT THE GAMBA**. Cílem je definovat estetiku post-apokalyptické pustiny kombinované s hazardními motivy.

## Vizuální Styl a Pravidla
Hra využívá specifický vizuální jazyk, který kombinuje brutalismus s neonovými prvky hazardu:
* **Styl:** Mix 2D pixelartu a procedurálně generovaného prostředí.
* **Barevnost:** Dominantní tmavé tóny (`#050505`), doplněné o kontrastní "hazardní" barvy – zlatou (`#ccaa00`), červenou (`#cc3333`) a zelenou (`#3aa55a`).
* **Atmosféra:** Ponurá, post-apo pustina (Wasteland).

## Grafické Assety (Výstupy)
Grafika hry se dělí na tři hlavní kategorie, které jsou implementovány přímo v HTML5 Canvas:

### A. Prostředí a Objekty
* **Pozadí:** Dynamicky generované kopce a "mrtvé stromy" (funkce `drawHills` a `drawDeadTree`).
* **Cesta:** Špinavá, vyjetá cesta pro nepřátele s variabilním stínováním.

### B. Jednotky (Sprites)
Všechny jednotky jsou vykreslovány pomocí geometrických tvarů a pixelových instrukcí:

| Typ assetu | Vizuální popis |
| :--- | :--- |
| **Matematik** | Modrý kanón, symbol logiky a výpočtu. |
| **Exekutor** | Masivní červená artilerie. |
| **Slot Machine** | Nepřítel ve tvaru výherního automatu s pákou. |
| **Roulette** | Rychlý nepřítel rotující jako kolo rulety. |

### C. UI a Efekty
* **UI Prvky:** Stylizované lišty s texturou kovu a neonovým podsvícením.

## Technická implementace
Většina grafiky je v kódu řešena metodou **Imperative Drawing** přes `CanvasRenderingContext2D`. 
* **Příklad:** Nepřítel typu *Poker* je složen z obdélníkového základu (karta), Beziérových křivek (symbol piky) a textových polí.
* **Optimalizace:** Pozadí se vykresluje do separátního "off-screen" canvasu (`bgCanvas`), aby se ušetřil výkon při překreslování každého snímku.

