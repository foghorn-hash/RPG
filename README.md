# ⚔️ Realm of Eldoria — 3D Open World Action RPG & WordPress Plugin

[![Three.js](https://img.shields.io/badge/Three.js-r128%2B-black?style=flat&logo=three.js)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![WordPress](https://img.shields.io/badge/WordPress-5.8--6.7%2B-21759B?style=flat&logo=wordpress)](https://wordpress.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Realm of Eldoria** on selainpohjainen 3D-avoinroolipeli (Action RPG), joka sisältää reaaliaikaisen taistelun ja torjuntamekaniikan (parry), loitsut, kaivostoiminnan, esineiden takomisen ja dynaamisen hahmonkehityksen. 

Pelistä on luotu valmis, suoraan WordPress-hallinnasta asennettava **WordPress-lisäosa (ZIP-paketti)**, jolla pelin voi upottaa mille tahansa WordPress-sivustolle yhdellä lyhytkoodilla: `[eldoria_rpg]`.

---

## 🎮 Tärkeimmät peliominaisuudet

### 1. Viisi erilaista hahmoluokkaa ja arkkityyppiä
* **Soturi (Warrior / Fighter)**:
  * **Ajoitettu torjunta (Timed Parry)**: Paina hiiren oikeaa painiketta tai `Q`-näppäintä vihollisen hyökkäysvaroituksen aikana. Täydellinen torjunta torjuu 100% vahingosta, horjuttaa vihollisen 2,5 sekunniksi ja avaa 250% kriittisen vastaiskun (riposte).
  * **Brutaali isku (Titan Cleave)**: Laaja miekan pyyhkäisy, joka heittää vihollislaumat taaksepäin.
  * **Raskas panssari**: Korkein fyysinen kestävyys ja suurin terveyspistevarasto.
* **Velho (Wizard)**:
  * **Tulipallo (Fireball, [1])**: Räjähtävä tuliammus, joka tekee aluevahinkoa ja jättää hehkuvia kekäleitä.
  * **Jäänova (Glacial Frost Nova, [2])**: Jäädyttää ja horjuttaa kaikki ympärillä olevat viholliset.
  * **Aether Blink ([3])**: Välitön siirtymisloitsu (teleportti) eteenpäin vaaran väistämiseksi.
* **Haltija (Elf)**:
  * **Zephyr Dash ([1])**: Salamannopea syöksy eteenpäin täydellä haavoittumattomuudella ilman staminakulua.
  * **Tempest Flurry ([2])**: Nopea kolmoisviilto korkealla panssarinläpäisyllä.
  * **Kotkansilmä (Eagle Eye)**: Luontainen +25% kriittisen osuman mahdollisuus ja nopeampi juoksuvauhti.
* **Kääpiö (Dwarf)**:
  * **Kaivosmestari (Master Prospector)**: Louhii malmisuonia 2x nopeammin ja löytää 3x todennäköisemmin harvinaisia safiireja ja rubiineja.
  * **Sepän lahja (Forge Master)**: 50% alennus sepän pajalla ja +25% bonusstatistiikat taotuille aseille.
  * **Maanjäristysisku (Mountain Slam, [1])**: Hakun isku maahan, joka aiheuttaa tyrmäävän shokkiaallon.
* **Hobitti (Hobbit)**:
  * **Varjoviitta (Shadowcloak Stealth, [C])**: Kyykisty hiiviskelyyn; vihollisten havaintoetäisyys putoaa 18 metristä 4,5 metriin.
  * **Selkäänpuukotus (Sneak Attack)**: Takaapäin hiiviskelystä tehty isku tekee **3.5x kriittistä vahinkoa**!
  * **Kauppamiehen hopeakieli**: 50% alennus Barnabyn kauppapuodissa ja tuplahinta myytävistä esineistä.

---

### 2. Laaja 3D-maailma & Alueet
1. **Sunfall Outpost (Aloituskylä)**:
   * **Master Torvinin paja**: Malmien sulatus ja aseiden parantaminen (+1 ... +5).
   * **Elder Cedric & Ranger Lyra**: Tehtävänantajat ja torjuntaharjoitukset.
   * **Barnaby Swiftfoot**: Hobittikauppias ja tarvikkeet.
2. **Whispering Forest (Kuiskaava metsä)**:
   * Vaeltavat goblin-partiot, sudet, virtaava joki ja kivisilta.
3. **The Deep Grotto (Maanalainen luolasto)**:
   * Pohjoisvuoren uumenissa oleva hehkuvien kristallien luola.
   * Sisältää arvokkaat **Mithril-**, **Sun-Gold-** ja **Adamantiitti-malmisuonet** sekä luolagolemeita.
4. **Runic Sunken Ruins (Muinaiset rauniot)**:
   * Riimupylväiden kehä ja **Hollow Colossus** -jättiläispääpomon taisteluareena.

---

### 3. Äänimaailma (Procedural Web Audio)
Peli sisältää täysin koodissa syntetisoidun Web Audio API -äänimoottorin (nolla 404-virheriskiä tai ulkoisia mp3-latauksia):
* Metallinen parry-kellahdus ja säihkähdys
* Miekkojen ja nuolten viillot
* Tulipallon jyrähdys ja jäänovan jäätyminen
* Hakun iskut kiveen ja jalokivien kalke
* Tasonnousun fanfaarit ja tehtävän suoritusäänet

---

## 📦 WordPress-lisäosa (.zip) & Asennus

Peli sisältää valmiin asennuspaketin: `realm-of-eldoria-rpg.zip`.

### Asennusohje (WP-Admin):
1. **Lataa ZIP-paketti**:
   - Avaa peli ja klikkaa yläpalkista **📦 WordPress-plugin (.zip)** (tai paina **`P`**).
   - Klikkaa **"Lataa valmis .ZIP suoraan"** (tai lataa suoraan URL-osoitteesta: `/realm-of-eldoria-rpg.zip`).
2. **Siirry WordPressiin**:
   - Avaa WordPress-hallintapaneeli: **Lisäosat → Lisää uusi (Plugins → Add New Plugin)**.
   - Klikkaa ylhäältä **Lataa lisäosa (Upload Plugin)**.
3. **Asenna ja ota käyttöön**:
   - Valitse ladattu `realm-of-eldoria-rpg.zip` ja klikkaa **Asenna nyt (Install Now)**.
   - Klikkaa **Ota lisäosa käyttöön (Activate Plugin)**.
4. **Upota peli sivuillesi**:
   - Lisää sivulle, artikkeliin tai lohkoon lyhytkoodi:
     ```text
     [eldoria_rpg]
     ```

### Lyhytkoodin valinnaiset parametrit:
```text
[eldoria_rpg width="100%" height="750px" fullscreen="yes" class="warrior"]
```
* `width`: Peli-ikkunan leveys (esim. `100%`, `1200px` tai `90vw`).
* `height`: Peli-ikkunan korkeus (esim. `720px` tai `85vh`).
* `fullscreen`: Näytä koko ruudun painike (`yes` / `no`).
* `class`: Aloitushahmoluokka (`warrior`, `wizard`, `elf`, `dwarf`, `hobbit`).

### Lisäosan asetusvalikko WordPressissä:
Asennuksen jälkeen WordPressin vasempaan päävalikkoon ilmestyy **Eldoria 3D RPG** -valikko, josta voit säätää oletusmittoja ja -luokkaa ilman koodia.

---

## 🚀 Lokaali kehitys & Komentosarjat

Projekti vaatii Node.js (v18+) -ympäristön.

```bash
# 1. Asenna riippuvuudet
npm install

# 2. Käynnistä paikallinen kehityspalvelin
npm run dev

# 3. Käännä tuotantoversio ja luo uusi WordPress ZIP-paketti
npm run build

# 4. Tarkista koodin tyypitys ja virheet
npm run lint
```

---

## 🐙 Lähdekoodin ja ZIP-paketin vieminen GitHubiin

Jos haluat julkaista tämän projektin omaan GitHubiisi ja luoda GitHub Release -latauspaketin:

### 1. Julkaise koodi GitHubiin:
```bash
git init
git add .
git commit -m "Initial commit: Realm of Eldoria 3D RPG WordPress Plugin"
git branch -M main
git remote add origin https://github.com/<omakäyttäjänimi>/realm-of-eldoria-rpg.git
git push -u origin main
```

### 2. Luo GitHub Release (.zip -asennuspaketti):
1. Avaa luomasi repositorio GitHubissa ja klikkaa oikeasta reunasta: **Releases → Create a new release**.
2. Aseta Tag-versioksi: `v1.0.0`.
3. Raahaa ladattu `realm-of-eldoria-rpg.zip` kenttään: *Attach binaries by dropping them here*.
4. Klikkaa **Publish release**.
5. Nyt sinulla on julkinen latausosoite:
   `https://github.com/<käyttäjänimi>/realm-of-eldoria-rpg/releases/download/v1.0.0/realm-of-eldoria-rpg.zip`

---

## 📁 Tiedostorakenne

```text
├── public/
│   ├── realm-of-eldoria-rpg.zip     # Valmis ladattava WordPress ZIP-paketti
│   └── downloads/                   # Vaihtoehtoinen lataushakemisto
├── scripts/
│   └── build-plugin-zip.ts          # Automaattinen ZIP-rakennusskripti
├── src/
│   ├── audio/
│   │   └── soundEngine.ts           # Web Audio API äänet (parry, loitsut, kaivos)
│   ├── components/
│   │   ├── HUD.tsx                  # Pelaajan HUD, elämäpalkki, alatelakka
│   │   ├── QuestModal.tsx           # Tehtäväkirja & seuranta
│   │   ├── CharacterModal.tsx       # Hahmotaulukko & attribuuttien jako
│   │   ├── SkillTreeModal.tsx       # Luokkakohtaiset taitopuut
│   │   ├── InventoryModal.tsx       # Varustelaatikko & paperinukke
│   │   ├── CraftingModal.tsx        # Sepän paja & varusteiden parannus
│   │   ├── ClassSelectModal.tsx     # Luokan vaihto (Soturi, Velho, Haltija, Kääpiö, Hobitti)
│   │   ├── WorldMapModal.tsx        # Maailmankartta & sijainti
│   │   ├── DialogueModal.tsx        # NPC-keskustelut
│   │   └── WordPressPluginModal.tsx # WP-lisäosan lataus & asennusohje
│   ├── game/
│   │   ├── three/
│   │   │   ├── GameEngine.ts        # Three.js 3D-pelimoottori, kamera, taistelulogiikka
│   │   │   ├── characterModels.ts   # 3D-hahmomallit (3-12 osaiset PBR-mallit)
│   │   │   ├── worldBuilder.ts      # Maasto, luolasto, paja, puut ja riimut
│   │   │   └── vfx.ts               # Kipinät, tulipallot, jää ja kelluvat vahinkoluvut
│   │   ├── itemsData.ts             # Aseet, haarniskat, malmit, jalokivet ja reseptit
│   │   └── progressionData.ts       # Tehtävät ja taitopuut
│   ├── services/
│   │   └── wordpressPluginGenerator.ts # WP-lisäosan PHP- ja tiedostogeneraattori
│   ├── App.tsx                      # Pääsovellus ja tilanhallinta
│   ├── index.css                    # Tailwind CSS -tyylit
│   └── main.tsx                     # Sovelluksen sisääntulopiste
├── package.json
├── LICENSE                          # Virallinen MIT-lisenssi
├── LICENSE-FAQ.md                   # Kattava FAQ (Apple App Store, Google Play, kaupallistaminen)
└── README.md
```

---

## 📜 Lisenssi & Kaupallinen käyttö

Tämä projekti on lisensoitu sallivalla **[MIT-lisenssillä](LICENSE)**.

### Apple App Store & Google Play -julkaiseminen:
MIT-lisenssi sallii pelin vapaan kaupallisen julkaisemisen mobiilisovelluskaupoissa:
* **Apple App Store (iOS)**: Täysin sallittu ja yhteensopiva Applen EULA-ehtojen ja DRM-suojauksen kanssa.
* **Google Play (Android)**: Täysin sallittu (voit käyttää Capacitor- tai PWA/TWA-paketointia).
* **Kaupallinen myynti & In-App Purchases**: Voit veloittaa pelistä maksun tai myydä pelinsisäisiä ostoksia ilman rojaltimaksuja.
* **WordPress-yhteensopivuus**: MIT on 100% yhteensopiva WordPressin GPLv2+-lisenssin kanssa.

Katso yksityiskohtaiset vastaukset, paketointiohjeet ja säännöt tiedostosta:  
👉 **[LICENSE-FAQ.md](LICENSE-FAQ.md)**

