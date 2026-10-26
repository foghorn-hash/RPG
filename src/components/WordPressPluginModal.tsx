import React, { useState } from 'react';
import {
  WordPressPluginConfig,
  DEFAULT_WP_CONFIG,
  createWordPressPluginZip,
  downloadBlob,
  generateMainPhp,
  generateReadme,
  generateUninstallPhp,
  generateMitLicense,
  generateStandaloneGameHtml,
} from '../services/wordpressPluginGenerator';
import {
  X,
  Download,
  FileArchive,
  CheckCircle2,
  Copy,
  Code2,
  Settings2,
  HelpCircle,
  ExternalLink,
  Laptop,
  Check,
  PackageCheck,
  Github,
  Link2,
  Terminal,
  AlertTriangle,
  ShieldCheck,
  Smartphone,
  Store,
  DollarSign,
  Scale,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface WordPressPluginModalProps {
  onClose: () => void;
}

export const WordPressPluginModal: React.FC<WordPressPluginModalProps> = ({ onClose }) => {
  const [config, setConfig] = useState<WordPressPluginConfig>(DEFAULT_WP_CONFIG);
  const [activeTab, setActiveTab] = useState<'download' | 'github' | 'license' | 'instructions' | 'files' | 'preview'>('download');
  const [selectedFile, setSelectedFile] = useState<string>('plugin.php');
  const [copiedShortcode, setCopiedShortcode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const directZipUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/realm-of-eldoria-rpg.zip`
    : '/realm-of-eldoria-rpg.zip';

  // Generate and download ZIP dynamically
  const handleDownloadZip = async () => {
    try {
      setIsGenerating(true);
      soundEngine.playLevelUp();
      const zipBlob = await createWordPressPluginZip(config);
      downloadBlob(zipBlob, `${config.pluginSlug}.zip`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'shortcode' | 'code' | 'url' | 'git') => {
    navigator.clipboard.writeText(text);
    if (type === 'shortcode') {
      setCopiedShortcode(true);
      setTimeout(() => setCopiedShortcode(false), 2000);
    } else if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else if (type === 'git') {
      setCopiedGit(true);
      setTimeout(() => setCopiedGit(false), 2000);
    }
  };

  const getFileContent = () => {
    switch (selectedFile) {
      case 'plugin.php':
        return generateMainPhp(config);
      case 'readme.txt':
        return generateReadme(config);
      case 'uninstall.php':
        return generateUninstallPhp();
      case 'LICENSE':
        return generateMitLicense();
      case 'game/index.html':
        return generateStandaloneGameHtml(config);
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-2xl shadow-inner">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-cinzel text-amber-200">
                  WordPress-plugin, ZIP & MIT-lisenssi
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-600/40 uppercase">
                  WordPress 5.8 - 6.7+
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40 uppercase">
                  MIT License
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Valmis ladattava .zip-lisäosa ja kaupallinen MIT-lisenssi (App Store & Google Play).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-amber-400 p-1.5 rounded-lg bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cinzel border-b-2 whitespace-nowrap transition ${
              activeTab === 'download'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Lataa ZIP-paketti</span>
          </button>

          <button
            onClick={() => setActiveTab('license')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cinzel border-b-2 whitespace-nowrap transition ${
              activeTab === 'license'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>MIT-lisenssi & Kauppa FAQ</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cinzel border-b-2 whitespace-nowrap transition ${
              activeTab === 'github'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4 text-purple-400" />
            <span>GitHub & Release</span>
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cinzel border-b-2 whitespace-nowrap transition ${
              activeTab === 'instructions'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Asennusohje (WP-Admin)</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cinzel border-b-2 whitespace-nowrap transition ${
              activeTab === 'files'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Paketin tiedostot & PHP</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cinzel border-b-2 whitespace-nowrap transition ${
              activeTab === 'preview'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>WordPress-simulaattori</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: DOWNLOAD & QUICK CONFIG */}
          {activeTab === 'download' && (
            <div className="space-y-6">
              {/* Info notice about GitHub vs direct download */}
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-start gap-3 text-xs">
                <Github className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-200 block mb-0.5">
                    Miksi paketti ei löydy julkisesta GitHubista?
                  </strong>
                  <span className="text-slate-300">
                    Tämä peli on rakennettu suoraan Google AI Studio -pilviympäristössä, eikä sitä ole oletuksena yhdistetty henkilökohtaiseen GitHub-tiliisi.{' '}
                    <strong>Voit ladata valmiin `.zip`-asennuspaketin suoraan alta ilman GitHubia</strong>, tai viedä sen omaan GitHubiisi "GitHub & Release" -välilehden ohjeilla.
                  </span>
                </div>
              </div>

              {/* Main Download Callout */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <FileArchive className="w-4 h-4" />
                    <span>Valmis asennuspaketti (.ZIP)</span>
                  </div>
                  <h3 className="text-2xl font-bold font-cinzel text-slate-100">
                    Lataa {config.pluginSlug}.zip
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Paketti sisältää täydellisen WordPress-lisäosan: PHP-pääohjaimen, asennustiedostot, virallisen MIT-lisenssin, lyhytkoodin{' '}
                    <code className="text-amber-300 font-bold bg-slate-950 px-1 py-0.5 rounded">[{config.shortcode}]</code>{' '}
                    sekä täysin itsenäisen 3D WebGL -pelimoottorin, joka toimii kaikilla palvelimilla ilman ulkoisia riippuvuuksia!
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Yhteensopiva: Gutenberg, Elementor, Divi
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-emerald-400" />
                      Lisenssi: MIT (100% vapaa kaupallinen käyttö)
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-2 w-full md:w-auto">
                  {/* Direct Static File Download Button */}
                  <a
                    href="/realm-of-eldoria-rpg.zip"
                    download="realm-of-eldoria-rpg.zip"
                    className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm uppercase font-cinzel transition shadow-xl hover:scale-102 text-center"
                    onClick={() => soundEngine.playLevelUp()}
                  >
                    <Download className="w-5 h-5" />
                    <span>Lataa valmis .ZIP suoraan</span>
                  </a>

                  {/* Dynamic Generator Button (Custom settings) */}
                  <button
                    disabled={isGenerating}
                    onClick={handleDownloadZip}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
                  >
                    {isGenerating ? 'Luodaan ZIP-pakettia...' : 'Generoi uusi räätälöity ZIP'}
                  </button>

                  {downloadSuccess && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold animate-fade-in">
                      <PackageCheck className="w-4 h-4" />
                      <span>ZIP ladattu onnistuneesti koneellesi!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Link & Shortcode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Direct Download URL */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-cinzel">
                      Suora lataus-URL (Direct Download Link):
                    </span>
                    <input
                      type="text"
                      readOnly
                      value={directZipUrl}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-amber-300 font-mono mt-1 select-all"
                    />
                  </div>
                  <button
                    onClick={() => copyToClipboard(directZipUrl, 'url')}
                    className="self-end flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Kopioitu!' : 'Kopioi suora linkki'}</span>
                  </button>
                </div>

                {/* Shortcode */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-cinzel">
                      Lyhytkoodi WordPress-sivuille:
                    </span>
                    <code className="text-base font-bold text-amber-300 block mt-1">
                      [{config.shortcode}]
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`[${config.shortcode}]`, 'shortcode')}
                    className="self-end flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                  >
                    {copiedShortcode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShortcode ? 'Kopioitu!' : 'Kopioi lyhytkoodi'}</span>
                  </button>
                </div>
              </div>

              {/* Plugin Settings Configuration */}
              <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Settings2 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold font-cinzel text-amber-200">
                    Muokkaa lisäosan tietoja ennen latausta (Valinnainen)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Lisäosan nimi (Plugin Name)</label>
                    <input
                      type="text"
                      value={config.pluginName}
                      onChange={(e) => setConfig({ ...config, pluginName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Kansio / Slug</label>
                    <input
                      type="text"
                      value={config.pluginSlug}
                      onChange={(e) => setConfig({ ...config, pluginSlug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Lyhytkoodi (Shortcode)</label>
                    <input
                      type="text"
                      value={config.shortcode}
                      onChange={(e) => setConfig({ ...config, shortcode: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Oletuskorkeus (Height)</label>
                    <input
                      type="text"
                      value={config.defaultHeight}
                      onChange={(e) => setConfig({ ...config, defaultHeight: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                      placeholder="720px tai 80vh"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MIT LICENSE & STORE FAQ */}
          {activeTab === 'license' && (
            <div className="space-y-6">
              {/* License Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500/50 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-lg font-bold font-cinzel text-emerald-200">
                      MIT-lisenssi — 100% Vapaa kaupallinen käyttö
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    Open Source & Commercial
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Peli ja sen lähdekoodi on lisensoitu virallisella <strong>MIT-lisenssillä</strong> (Copyright © 2026 Matti Kiviharju). 
                  MIT-lisenssi antaa täyden vapauden hyödyntää peliä kaupallisesti, muokata sitä, sulkea koodi (proprietary) ja julkaista se mobiilikaupoissa ilman rojaltimaksuja.
                </p>
              </div>

              {/* Store Publishing Q&A */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold font-cinzel text-amber-300 flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Usein kysytyt kysymykset: Apple App Store & Google Play</span>
                </h4>

                {/* Q1: Apple App Store */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    <span>Saako MIT-lisensoidun pelin julkaista Apple App Storessa (iOS / macOS)?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400">Kyllä, ehdottomasti.</strong> Toisin kuin tiukka GPL (joka kieltää DRM-suojaukset ja aiheuttaa ristiriitoja Applen EULA-ehtojen kanssa), 
                    <strong> MIT-lisenssissä ei ole DRM- tai jakelurajoituksia</strong>. Apple hyväksyy MIT-koodin suoraan App Storeen.
                  </p>
                  <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <strong>Ainoa vaatimus:</strong> Sisällytä lyhyt tekijänoikeus- ja lisenssimaininta sovellukseesi (esim. pelin <em>Asetukset → Tietoja / Lisenssit</em> -kohdassa tai App Store -kuvauksessa):<br />
                    <code className="text-amber-300">Copyright (c) 2026 Matti Kiviharju & Realm of Eldoria. Licensed under MIT.</code>
                  </div>
                </div>

                {/* Q2: Google Play Store */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Saako pelin julkaista Google Play Storessa (Android)?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400">Kyllä.</strong> Google Play hyväksyy MIT-lisensoidut pelit ilman rajoituksia sekä ilmaisina että maksullisina sovelluksina.
                  </p>
                </div>

                {/* Q3: Monetization & IAP */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span>Voinko ottaa maksun pelistä, myydä In-App Purchases -ostoksia tai näyttää mainoksia?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400">Kyllä, 100% vapaasti.</strong> MIT-lisenssi sallii kaupallisen myynnin (<em>"to sell copies of the Software"</em>). 
                    Kaikki sovelluskaupan tuotot (lataushinta, timantit/kolikot pelinsisäisillä ostoilla tai AdMob-mainostulot) jäävät kokonaisuudessaan sinulle.
                  </p>
                </div>

                {/* Q4: Closed source / Proprietary */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                    <Scale className="w-4 h-4 text-purple-400" />
                    <span>Täytyykö minun jakaa pelini lähdekoodi julkiseksi, jos julkaisen sen App Storessa?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-100">Ei tarvitse.</strong> MIT-lisenssi sallii koodin pitämisen suljettuna (proprietary). Voit vapaasti muokata grafiikkaa, mekaniikkaa ja hahmoja julkaisematta muokattua koodia kenellekään.
                  </p>
                </div>

                {/* Q5: Packaging for mobile */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                    <Laptop className="w-4 h-4 text-amber-400" />
                    <span>Miten peli paketoidaan iOS (.ipa) tai Android (.aab / .apk) -muotoon?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Peli pyörii modernilla HTML5 WebGL / Three.js -tekniikalla, joten sen paketointi natiiviksi mobiilisovellukseksi on suoraviivaista:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    <li><strong>Capacitor (Suositeltu)</strong>: Luo hetkessä natiivit Xcode (iOS) ja Android Studio -projektit (<code>npx cap add ios</code> / <code>android</code>).</li>
                    <li><strong>Google Bubblewrap (TWA)</strong>: Paketoi pelin suoraan Google Playhin Progressive Web App -muodossa.</li>
                    <li><strong>WKWebView (iOS)</strong>: Voit käyttää Applen natiivia WebView-näkymää Swift-projektissa.</li>
                  </ul>
                </div>
              </div>

              {/* Raw MIT License text preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 block font-cinzel">
                  Virallinen lisenssiteksti (LICENSE):
                </span>
                <pre className="text-[11px] font-mono text-slate-300 bg-black/60 p-3 rounded-lg overflow-x-auto leading-relaxed">
{generateMitLicense()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB & RELEASES GUIDE */}
          {activeTab === 'github' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs text-purple-200 flex items-start gap-3">
                <Github className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-purple-100 font-cinzel">
                    Miksi asennuspaketti ei ole valmiiksi GitHubissa?
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Tämä peli ja WordPress-lisäosa on luotu <strong>Google AI Studio Build</strong> -alustalla. 
                    AI Studio ei tallenna sovelluksia automaattisesti käyttäjien henkilökohtaisiin GitHub-tileihin tai julkisiin GitHub-repoihin tietosuojasyistä.
                  </p>
                  <p className="text-amber-300 font-semibold pt-1">
                    👉 Sinun ei tarvitse käyttää GitHubia lisäosan asentamiseen! Voit ladata valmiin ZIP-paketin suoraan tämän sovelluksen "Lataa ZIP-paketti" -välilehdeltä.
                  </p>
                </div>
              </div>

              {/* How to publish to GitHub Releases */}
              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-amber-200 font-cinzel flex items-center gap-2">
                  <span>🚀</span>
                  <span>Näin julkaiset lisäosan omalle GitHub-tilillesi (GitHub Releases):</span>
                </h4>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-slate-100">Lataa ZIP-paketti:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Lataa koneellesi <code className="text-amber-300">realm-of-eldoria-rpg.zip</code> "Lataa ZIP" -painikkeella.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-slate-100">Luo uusi repositorio GitHubissa:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Kirjaudu osoitteeseen <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">github.com/new <ExternalLink className="w-3 h-3" /></a> ja luo uusi julkinen repositorio esim. nimellä <code>realm-of-eldoria-wordpress-plugin</code>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-slate-100">Luo uusi Release GitHubissa:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Mene repositoriosi sivulla oikeaan laitaan kohtaan <strong>Releases → Draft a new release</strong> (tai <em>Create a new release</em>).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">4</span>
                    <div>
                      <strong className="text-slate-100">Liitä .zip tiedosto ja julkaise:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Kirjoita tagiksi esim. <code>v1.0.0</code> ja raahaa lataamasi <code className="text-amber-300">realm-of-eldoria-rpg.zip</code> kohtaan <em>"Attach binaries by dropping them here or selecting them"</em>. Klikkaa <strong>Publish release</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">✓</span>
                    <div>
                      <strong className="text-emerald-300">Valmis! Virallinen GitHub-latauslinkki:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Nyt sinulla on pysyvä julkinen GitHub-latauslinkki muille jaettavaksi:
                        <br />
                        <code className="text-[11px] text-amber-300 bg-slate-900 px-2 py-1 rounded inline-block mt-1">
                          https://github.com/&lt;kayttaja&gt;/&lt;repo&gt;/releases/download/v1.0.0/realm-of-eldoria-rpg.zip
                        </code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Git CLI commands */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Lähdekoodin vienti GitHubiin Git-komentona (Valinnainen):</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "Initial commit: Realm of Eldoria 3D RPG WordPress Plugin"\ngit branch -M main\ngit remote add origin https://github.com/<sinun-kayttaja>/<repo>.git\ngit push -u origin main`, 'git')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
                  >
                    {copiedGit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGit ? 'Kopioitu!' : 'Kopioi komennot'}</span>
                  </button>
                </div>

                <pre className="text-[11px] font-mono text-emerald-300/90 bg-black/60 p-3 rounded-lg overflow-x-auto leading-relaxed">
{`git init
git add .
git commit -m "Initial commit: Realm of Eldoria 3D RPG WordPress Plugin"
git branch -M main
git remote add origin https://github.com/<sinun-kayttajanimi>/<repositorion-nimi>.git
git push -u origin main`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: STEP-BY-STEP INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <strong>Asennus tapahtuu suoraan WordPressin hallinnasta ilman koodaustaitoja!</strong>
                  <p className="mt-1 text-slate-300">
                    Et tarvitse FTP-yhteyttä, GitHub-tiliä tai komentoriviä. Lisäosa ladataan suoraan WordPressin omalla asennustyökalulla.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 font-cinzel">Lataa ZIP-paketti</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Klikkaa tämän ikkunan ensimmäiseltä välilehdeltä <strong>"Lataa valmis .ZIP suoraan"</strong> tallentaaksesi{' '}
                      <code className="text-amber-300">{config.pluginSlug}.zip</code> omalle tietokoneellesi.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 font-cinzel">Avaa WordPress-hallinta</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Kirjaudu WordPress-sivustollesi ja siirry vasemmasta valikosta kohtaan:
                      <br />
                      <strong className="text-slate-200">Lisäosat → Lisää uusi</strong> (englanniksi <em>Plugins → Add New Plugin</em>).
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 font-cinzel">Lataa .zip-tiedosto</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Klikkaa sivun ylälaidasta painiketta <strong className="text-slate-200">"Lataa lisäosa" (Upload Plugin)</strong>.
                      Valitse koneeltasi ladattu <code className="text-amber-300">{config.pluginSlug}.zip</code> ja paina{' '}
                      <strong className="text-slate-200">"Asenna nyt" (Install Now)</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 font-cinzel">Ota lisäosa käyttöön</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Asennuksen valmistuttua paina <strong className="text-emerald-400">"Ota lisäosa käyttöön" (Activate Plugin)</strong>.
                      WordPress luo nyt uuden <strong>"Eldoria 3D RPG"</strong> -asetusvalikon hallintapaneeliisi.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 font-cinzel">Liitä lyhytkoodi sivulle</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Luo uusi sivu (esim. <em>Pelaa 3D RPG:tä</em>) ja lisää tekstikenttään tai lyhytkoodilohkoon:
                      <br />
                      <code className="text-sm font-bold text-amber-300 bg-slate-900 px-2 py-1 rounded inline-block mt-1">
                        [{config.shortcode}]
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FILE EXPLORER & CODE VIEW */}
          {activeTab === 'files' && (
            <div className="flex flex-col md:flex-row gap-4 h-[420px]">
              {/* File tree */}
              <div className="w-full md:w-56 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-2 pb-1 font-cinzel">
                  ZIP-arkiston rakenne
                </span>

                {[
                  { id: 'plugin.php', name: `${config.pluginSlug}.php`, icon: '🐘' },
                  { id: 'readme.txt', name: 'readme.txt', icon: '📄' },
                  { id: 'uninstall.php', name: 'uninstall.php', icon: '🗑️' },
                  { id: 'LICENSE', name: 'LICENSE (MIT)', icon: '⚖️' },
                  { id: 'game/index.html', name: 'game/index.html', icon: '🎮' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFile(f.id)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition text-left ${
                      selectedFile === f.id
                        ? 'bg-amber-950/50 text-amber-300 border border-amber-600/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span>{f.icon}</span>
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}

                <div className="mt-auto pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                  Kaikki tiedostot pakataan automaattisesti ladattavaan .zip-tiedostoon.
                </div>
              </div>

              {/* Code viewer */}
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {selectedFile === 'plugin.php' ? `${config.pluginSlug}.php` : selectedFile}
                  </span>
                  <button
                    onClick={() => copyToClipboard(getFileContent(), 'code')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Kopioitu!' : 'Kopioi koodi'}</span>
                  </button>
                </div>

                <pre className="flex-1 overflow-auto text-[11px] font-mono text-slate-300 leading-relaxed bg-black/40 p-3 rounded-lg">
                  {getFileContent()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: WORDPRESS ADMIN SIMULATOR */}
          {activeTab === 'preview' && (
            <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-100 text-slate-800 text-xs shadow-xl">
              {/* Fake WP-Admin top bar */}
              <div className="bg-[#1d2327] text-slate-200 px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold">WordPress Sivusto</span>
                  <span className="text-slate-400 text-[11px]">⚔️ 3D RPG Aktiivinen</span>
                </div>
                <div className="text-[11px] text-slate-400">Kirjautunut: yllapito (Admin)</div>
              </div>

              <div className="flex min-h-[350px]">
                {/* Fake WP-Admin sidebar */}
                <div className="w-48 bg-[#1d2327] text-slate-300 p-2 space-y-1 shrink-0 text-xs font-sans">
                  <div className="p-2 hover:bg-slate-800 rounded cursor-pointer">Ohjausnäkymä</div>
                  <div className="p-2 hover:bg-slate-800 rounded cursor-pointer">Artikkelit</div>
                  <div className="p-2 hover:bg-slate-800 rounded cursor-pointer">Sivut</div>
                  <div className="p-2 hover:bg-slate-800 rounded cursor-pointer">Lisäosat</div>
                  <div className="p-2 bg-[#2271b1] text-white font-bold rounded cursor-pointer flex items-center gap-2">
                    <span>🎮</span>
                    <span>Eldoria 3D RPG</span>
                  </div>
                  <div className="p-2 hover:bg-slate-800 rounded cursor-pointer">Asetukset</div>
                </div>

                {/* Fake WP-Admin settings view */}
                <div className="flex-1 p-6 bg-white overflow-y-auto">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-3">
                    ⚔️ {config.pluginName} - Asetukset
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Upota 3D-peli mille tahansa sivulle lyhytkoodilla: <code className="bg-slate-100 p-1 rounded font-bold text-amber-700">[{config.shortcode}]</code>
                  </p>

                  <div className="space-y-3 max-w-md">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Peli-ikkunan leveys</label>
                      <input
                        type="text"
                        readOnly
                        value={config.defaultWidth}
                        className="w-full border rounded p-1.5 bg-slate-50 text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Peli-ikkunan korkeus</label>
                      <input
                        type="text"
                        readOnly
                        value={config.defaultHeight}
                        className="w-full border rounded p-1.5 bg-slate-50 text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Oletushahmoluokka</label>
                      <select disabled className="w-full border rounded p-1.5 bg-slate-50 text-slate-700">
                        <option>Soturi (Warrior) - Torjunta & Raskas panssari</option>
                      </select>
                    </div>
                    <button className="bg-[#2271b1] text-white px-4 py-2 rounded font-bold text-xs mt-2 cursor-default">
                      Tallenna asetukset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>
            Sisältää täydellisen Three.js WebGL -3D-pelimoottorin, taistelut, torjunnat, loitsut ja kaivokset.
          </span>
          <div className="flex items-center gap-2">
            <a
              href="/realm-of-eldoria-rpg.zip"
              download="realm-of-eldoria-rpg.zip"
              onClick={() => soundEngine.playLevelUp()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase font-cinzel transition shadow cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Lataa .ZIP nyt</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
