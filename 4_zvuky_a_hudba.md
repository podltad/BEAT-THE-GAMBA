# 4. Zvuky a Hudba

## 1. Zvuky (SFX)
Základem pro vytvoření správné atmosféry a hmatatelné zpětné vazby pro hráče jsou zvukové efekty. 

* **Software a nástroje:** Audacity pro úpravu, ořez a normalizaci hlasitosti nahrávek.
* **Koncepce a tvorba:** V prvních fázích se určila pravidla pro to, jaké herní akce vyžadují zvukovou odezvu. Následně se shromáždily hrubé nahrávky, které se postupně doladily do finálních herních assetů.
* **Výstupy (Zvukové assety):**
  * `click.mp3` – Interakce s UI (klikání na tlačítka v menu, výběr a prodej věží).
  * `shoot.mp3` – Střelba obranných věží.
  * `hit.mp3` – Zvuk proniknutí nepřítele do cíle (ztráta životů hráče).
  * `win.mp3` / `lose.mp3` – Zvuky definující konec hry.

## 2. Hudba (BGM)
Hudební podkres udává celkové tempo a podtrhuje ponurou, avšak akční náladu hazardní pustiny.

* **Koncepce a pravidla:** Cílem bylo vybrat žánr a tempo, které odpovídá vizuálnímu stylu hry a nepůsobí po delší době rušivě.
* **Zdroje a Licence:** Původní hudební stopa byla stažena z databáze **Pixabay**, což zajišťuje volné použití díky *Free/Royalty-free licenci*.
* **Zpracování (Software):** Stažená skladba byla následně importována do programu **Audacity**, kde prošla jemnými úpravami. Byla manuálně prodloužena a sestříhána tak, aby po skončení plynule navazovala sama na sebe a tvořila nekonečnou smyčku (*seamless loop*).
* **Výstupy (Hudební assety):**
  * `casino_music.mp3` – Hlavní hudební smyčka hrající na pozadí během hry.

## 3. Technická Implementace (Engine)
Audio systém je ve hře integrován pomocí nativního HTML5 `Audio` API.

* **Správa hlasitosti:** Hráč má možnost nezávisle regulovat hlasitost hudby a zvukových efektů pomocí posuvníků v herním menu.
* **Pravidla přehrávání:** * Hlavní hudba (`bgMusic.loop = true`) se spouští při první interakci hráče s oknem (ošetření restrikcí moderních prohlížečů proti automatickému přehrávání).
  * Zvukový systém obsahuje logiku pro ztlumení nebo pozastavení hudby při události "Game Over", aby vynikl závěrečný zvuk výhry nebo prohry.