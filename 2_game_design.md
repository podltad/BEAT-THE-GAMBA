# 2. Game Design

### Pravidla a herní mechaniky
* **Obranný systém:** Hráč musí strategicky umisťovat věže kolem definované cesty tak, aby zastavil vlny nepřátel dříve, než dorazí na konec.
* **Ekonomika a inflace:** Hra využívá unikátní systém inflace, kdy se základní ceny všech věží zvyšují o 15 % každé 3 vlny. To nutí hráče k efektivnímu hospodaření s kredity v čase.
* **Systém prodeje:** Hráč má možnost kdykoliv prodat postavenou věž, přičemž získá zpět 50 % z ceny, kterou za ni původně zaplatil.
* **Životy a obtížnost:** Hráč začíná s 20 životy. Průchod běžného nepřítele ubírá 1 život, zatímco Boss (Gamba King) ubírá 5 životů. Hra končí vítězstvím po přežití 30. vlny nebo prohrou při poklesu životů na nulu.

### Atributy objektů 

#### Věže (Towers)
Každá věž má specifické vlastnosti určené pro různé herní situace. Ceny se s vlnami zvyšují v závislosti na aktuální inflaci.

| Název věže | Cena (základ) | DMG | Cooldown | Dosah | Speciální vlastnosti / Popis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Matematik** | 130 $ | 35 | 20 | 140 | Rychlopalná věž, efektivní proti slabým a rychlým cílům. |
| **Exekutor** | 200 $ | 100 | 80 | 220 | Těžká artilerie, ideální proti silným cílům. |
| **Kriminálka** | 220 $ | 30 | 90 | 160 | Taktická věž, aplikuje „slow“ efekt (zpomalení o 50 % na 120 snímků). |
| **Bankéř** | 300 $| 0 | 300 | 0 | Pasivní budova, generuje 15$ každých 5 sekund (300 snímků). |

#### Nepřátelé (Enemies)
Nepřátelé reprezentují různé formy hazardu a jejich obtížnost roste s každou vlnou, což simuluje gradaci herní výzvy.

| Typ nepřítele | Výskyt | Základní HP | Škálování HP | Škálování rychlosti |
| :--- | :--- | :--- | :--- | :--- |
| **Běžní (Slot, Roulette, Poker, Dice)** | Každá vlna | Dle typu | +50 HP / vlna | +0.08 / vlna |
| **Gamba King (Boss)** | Každá 5. vlna | 8000 (v 5. vlně) | +800 HP / další boss vlna | Konstantní (0.9) |

**Poznámky k vlnám:**
* **Gradace obtížnosti:** Zvyšování HP a rychlosti zajišťuje, že hráč musí neustále investovat do obrany.
* **Finále:** Na 30. vlně se objevují tři Bossové (Gamba King) krátce po sobě, což tvoří závěrečnou zkoušku hráčovy strategie.

### Prostředí a Lore 
* **Lore:** Hra je zasazena do pustiny (Wasteland), kde se zbytky společnosti snaží pomocí logiky a práva (Matematik, Exekutor, Kriminálka) zastavit chaos zosobněný hazardem.
* **Prostředí:** Mapa obsahuje fixní trasu pro nepřátele a interaktivní pozadí s procedurálně generovanými prvky, jako jsou mrtvé stromy a kopce, podtrhující post-apokalyptickou atmosféru.