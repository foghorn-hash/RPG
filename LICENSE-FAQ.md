# 📜 MIT-lisenssi — Usein Kysytyt Kysymykset (FAQ)
### Pelin julkaiseminen Apple App Storessa, Google Playssä ja kaupallinen käyttö

Tämä dokumentti käsittelee **Realm of Eldoria** -pelin ja sen komponenttien MIT-lisenssiä sekä vastaa keskeisiin juridisiin ja teknisiin kysymyksiin mobiili- ja verkkosovelluskaupoissa julkaisemisesta.

---

## 1. Yleistä MIT-lisenssistä

### Mikä on MIT-lisenssi?
MIT-lisenssi on yksi maailman suosituimmista, sallivimmista (permissive) ja joustavimmista avoimen lähdekoodin lisensseistä. Se antaa kenelle tahansa vapauden käyttää, kopioida, muokata, yhdistää, julkaista, alilisensoida ja jopa myydä ohjelmistoa ilman rojaltimaksuja.

### Mitä MIT-lisenssi vaatii minulta?
Ainoa vaatimus on **säilyttää alkuperäinen tekijänoikeusilmoitus ja MIT-lisenssiteksti** ohjelmiston kopioissa tai merkittävissä osissa (esim. pelin "Tietoja / Tekijät / Lisenssit" -näkymässä).

---

## 2. Pelin julkaiseminen Apple App Storessa (iOS / iPadOS / macOS)

### Voinko julkaista MIT-lisensoidun pelin Apple App Storessa?
**Kyllä, ehdottomasti.**  
Toisin kuin tiukat "copyleft"-lisenssit (kuten GPLv3, joka kieltää DRM-suojaukset ja aiheuttaa ristiriitoja Applen App Store EULA -käyttöehtojen kanssa), **MIT-lisenssi ei aseta mitään rajoitteita DRM-suojaukselle tai kauppapaikan jakelumekanismeille**. Siksi MIT-koodia voidaan julkaista Apple App Storessa täysin ilman lisenssiongelmia.

### Voinko veloittaa pelistä rahaa Apple App Storessa tai käyttää sovelluksen sisäisiä ostoja (In-App Purchases)?
**Kyllä.**
* Voit asettaa pelille kiinteän lataushinnan (esim. 2,99 € tai 4,99 €).
* Voit lisätä peliin sovelluksen sisäisiä ostoja (kuten jalokiviä, kosmeettisia haarniskoja tai lisäkenttiä).
* MIT-lisenssi antaa nimenomaisen oikeuden *"sell copies of the Software"* ilman velvollisuutta jakaa tuottoja alkuperäisille kehittäjille.

### Pitääkö minun avata pelin lähdekoodi julkiseksi, jos julkaisen sen App Storessa?
**Ei tarvitse.**  
MIT-lisenssi sallii ohjelmiston sulkemisen (proprietary software). Voit muokata peliä, lisätä omia ominaisuuksiasi ja julkaista sen suljettuna kaupallisena sovelluksena. Sinun ei tarvitse jakaa lähdekoodiasi kenellekään.

### Mitä Apple vaatii tekijänoikeusilmoituksen osalta?
Applen sääntöjen ja MIT-lisenssin mukaan riittää, että pelissä on jossain kohdassa (esim. pelin valikossa: *Asetukset → Tekijätiedot & Lisenssit* tai App Storen kuvauksessa / tukisivulla) lyhyt teksti:
```text
Includes Realm of Eldoria game engine.
Copyright (c) 2026 Matti Kiviharju & Realm of Eldoria Contributors.
Licensed under the MIT License.
```

### Miten peli paketoidaan iOS-sovellukseksi (.ipa)?
Koska peli on toteutettu moderneilla Web-teknologioilla (HTML5, Three.js, WebGL), sen paketointi natiiviksi iOS-sovellukseksi on suoraviivaista:
1. **Capacitor (Suositeltu)**: `npm install @capacitor/core @capacitor/cli @capacitor/ios` ja `npx cap add ios`.
2. **Apache Cordova**: Perinteinen web-to-app-kehys.
3. **Natiivi Swift WKWebView**: Kevyt Swift-sovellus, joka upottaa pelin paikallisen `WKWebView`-komponentin sisään.

---

## 3. Pelin julkaiseminen Google Play Storessa (Android)

### Voinko julkaista MIT-lisensoidun pelin Google Playssä?
**Kyllä.**  
Google Play hyväksyy MIT-lisensoidut sovellukset ja pelit ilman rajoituksia.

### Voinko käyttää mainoksia (AdMob) tai Google Play Billing -maksuja?
**Kyllä.**  
Voit integroida Google AdMob -mainoksia, Google Play Pass -tilauksen tai Google Play In-App Billing -maksujärjestelmän. MIT-lisenssi ei aseta rajoituksia kaupallistamistavoille.

### Miten peli paketoidaan Android-sovellukseksi (.aab / .apk)?
1. **Capacitor**: `npx cap add android` ja `npx cap run android` (kääntää suoraan Android Studio -projektiksi).
2. **PWA / TWA (Trusted Web Activity)**: Voit paketoida pelin Progressive Web App -muodosta Google Play Storeen käyttämällä Googlen virallista **Bubblewrap**-työkalua.

---

## 4. WordPress-lisäosa ja MIT-lisenssi

### Toimiiko MIT-lisenssi WordPressin kanssa?
**Kyllä, erittäin saumattomasti.**  
WordPress käyttää GNU General Public License (GPL v2+) -lisenssiä. **MIT-lisenssi on virallisesti GPL-yhteensopiva (GPL-compatible)** Free Software Foundationin (FSF) määritelmän mukaan. Voit vapaasti käyttää MIT-lisensoitua peliä osana WordPress-lisäosaa, muokata sitä ja jakaa sitä WordPress.org-lisäosahakemistossa tai omalla verkkosivustollasi.

---

## 5. Takuu, vastuu ja tavaramerkit

### Onko pelille takuuta?
**Ei.**  
Lisenssi toteaa selkeästi: *"THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND"*. Alkuperäiset kehittäjät eivät ole vastuussa mahdollisista laitteisto-, ohjelmisto- tai taloudellisista vahingoista.

### Voinko nimetä pelin uudelleen?
**Kyllä.**  
Voit vaihtaa pelin nimen, logot, 3D-tekstuurit ja tarinan vapaasti vastaamaan omaa brändiäsi.

---

## 6. Yhteenvetotaulukko

| Toimenpide | Sallittu MIT-lisenssillä? | Huomioitavaa |
| :--- | :---: | :--- |
| **Julkaisu Apple App Storessa** |  **Kyllä** | Säilytä lisenssiteksti asetuksissa/tekijöissä |
| **Julkaisu Google Play Storessa** |  **Kyllä** | Sopii maksullisena tai ilmaisena mainoksilla |
| **Kaupallinen myynti** |  **Kyllä** | 100% tuotoista jää julkaisijalle |
| **Koodin pitäminen suljettuna** |  **Kyllä** | Ei lähdekoodin avaamisvelvoitetta |
| **WordPress-lisäosan jakelu** |  **Kyllä** | Täysin GPL-yhteensopiva |
| **Omien hahmojen ja tasojen lisäys** |  **Kyllä** | Täysi muokkausoikeus |
