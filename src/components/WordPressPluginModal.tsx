import React, { useState } from 'react';
import {
  WordPressPluginConfig,
  DEFAULT_WP_CONFIG,
  createWordPressPluginZip,
  downloadBlob,
  generateMainPhp,
  generateReadme,
  generateUninstallPhp,
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
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface WordPressPluginModalProps {
  onClose: () => void;
}

export const WordPressPluginModal: React.FC<WordPressPluginModalProps> = ({ onClose }) => {
  const [config, setConfig] = useState<WordPressPluginConfig>(DEFAULT_WP_CONFIG);
  const [activeTab, setActiveTab] = useState<'download' | 'instructions' | 'files' | 'preview'>('download');
  const [selectedFile, setSelectedFile] = useState<string>('plugin.php');
  const [copiedShortcode, setCopiedShortcode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate and download ZIP
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

  const copyToClipboard = (text: string, type: 'shortcode' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'shortcode') {
      setCopiedShortcode(true);
      setTimeout(() => setCopiedShortcode(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
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
                  WordPress-plugin & ZIP-asennuspaketti
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-600/40 uppercase">
                  WordPress 5.8 - 6.7+
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Valmis ladattava .zip-lisäosa, joka asennetaan suoraan WordPressin hallintapaneelista.
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
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cinzel border-b-2 transition ${
              activeTab === 'download'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Lataa ZIP-paketti</span>
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cinzel border-b-2 transition ${
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
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cinzel border-b-2 transition ${
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
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cinzel border-b-2 transition ${
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
                    Paketti sisältää täydellisen WordPress-lisäosan: PHP-pääohjaimen, asennustiedostot, lyhytkoodin{' '}
                    <code className="text-amber-300 font-bold bg-slate-950 px-1 py-0.5 rounded">[{config.shortcode}]</code>{' '}
                    sekä täysin itsenäisen 3D WebGL -pelimoottorin, joka toimii kaikilla palvelimilla ilman ulkoisia riippuvuuksia!
                  </p>

                  <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Yhteensopiva: Gutenberg, Elementor, Divi
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      GPLv2-lisenssi
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-2 w-full md:w-auto">
                  <button
                    disabled={isGenerating}
                    onClick={handleDownloadZip}
                    className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm uppercase font-cinzel transition shadow-xl hover:scale-102 cursor-pointer"
                  >
                    {isGenerating ? (
                      <span>Luodaan ZIP-pakettia...</span>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Lataa WordPress-lisäosa (.zip)</span>
                      </>
                    )}
                  </button>

                  {downloadSuccess && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold animate-fade-in">
                      <PackageCheck className="w-4 h-4" />
                      <span>ZIP ladattu onnistuneesti koneellesi!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shortcode quick copy */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-cinzel">
                    Käytä WordPress-sivuilla lyhytkoodilla:
                  </span>
                  <code className="text-base font-bold text-amber-300">
                    [{config.shortcode}]
                  </code>
                </div>

                <button
                  onClick={() => copyToClipboard(`[${config.shortcode}]`, 'shortcode')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  {copiedShortcode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedShortcode ? 'Kopioitu!' : 'Kopioi lyhytkoodi'}</span>
                </button>
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

          {/* TAB 2: STEP-BY-STEP INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <strong>Asennus tapahtuu WordPressin omasta hallinnasta ilman koodaustaitoja!</strong>
                  <p className="mt-1 text-slate-300">
                    Et tarvitse FTP-yhteyttä tai palvelimen komentoriviä. Lisäosa ladataan suoraan WordPressin vakioasennustyökalulla.
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
                      Klikkaa edelliseltä välilehdeltä <strong>"Lataa WordPress-lisäosa (.zip)"</strong> tallentaaksesi{' '}
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

          {/* TAB 3: FILE EXPLORER & CODE VIEW */}
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

          {/* TAB 4: WORDPRESS ADMIN SIMULATOR */}
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>
            Sisältää täydellisen Three.js WebGL -3D-pelimoottorin, taistelut, torjunnat, loitsut ja kaivokset.
          </span>
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase font-cinzel transition shadow cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Lataa .ZIP nyt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
