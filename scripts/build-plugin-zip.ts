import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import {
  DEFAULT_WP_CONFIG,
  generateMainPhp,
  generateReadme,
  generateUninstallPhp,
  generateMitLicense,
  generateStandaloneGameHtml,
} from '../src/services/wordpressPluginGenerator.ts';

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');
  const downloadsDir = path.resolve(publicDir, 'downloads');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const zip = new JSZip();
  const folder = zip.folder(DEFAULT_WP_CONFIG.pluginSlug) || zip;

  folder.file(`${DEFAULT_WP_CONFIG.pluginSlug}.php`, generateMainPhp(DEFAULT_WP_CONFIG));
  folder.file('readme.txt', generateReadme(DEFAULT_WP_CONFIG));
  folder.file('uninstall.php', generateUninstallPhp());
  folder.file('LICENSE', generateMitLicense());

  const gameFolder = folder.folder('game') || folder;
  gameFolder.file('index.html', generateStandaloneGameHtml(DEFAULT_WP_CONFIG));

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const zipPath1 = path.join(publicDir, `${DEFAULT_WP_CONFIG.pluginSlug}.zip`);
  const zipPath2 = path.join(downloadsDir, `${DEFAULT_WP_CONFIG.pluginSlug}.zip`);
  const zipPath3 = path.join(publicDir, 'realm-of-eldoria-rpg-v1.0.0.zip');

  fs.writeFileSync(zipPath1, content);
  fs.writeFileSync(zipPath2, content);
  fs.writeFileSync(zipPath3, content);

  console.log(`Successfully generated WordPress plugin zip files:`);
  console.log(`- ${zipPath1} (${content.length} bytes)`);
  console.log(`- ${zipPath2}`);
  console.log(`- ${zipPath3}`);
}

main().catch(console.error);
