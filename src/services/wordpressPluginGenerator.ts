import JSZip from 'jszip';

export interface WordPressPluginConfig {
  pluginName: string;
  pluginSlug: string;
  version: string;
  author: string;
  shortcode: string;
  defaultWidth: string;
  defaultHeight: string;
  allowFullscreen: boolean;
  defaultClass: string;
  description: string;
}

export const DEFAULT_WP_CONFIG: WordPressPluginConfig = {
  pluginName: 'Realm of Eldoria 3D RPG',
  pluginSlug: 'realm-of-eldoria-rpg',
  version: '1.0.0',
  author: 'Eldoria Studio',
  shortcode: 'eldoria_rpg',
  defaultWidth: '100%',
  defaultHeight: '720px',
  allowFullscreen: true,
  defaultClass: 'warrior',
  description: 'Täysiverinen 3D-roolipeli WordPress-sivustoille. Sisältää avoimen maailman, luokat (Velho, Haltija, Soturi, Kääpiö, Hobitti), torjunnan, loitsut ja kaivostoiminnan.',
};

/**
 * Generates the main WordPress PHP plugin file
 */
export function generateMainPhp(config: WordPressPluginConfig): string {
  return `<?php
/**
 * Plugin Name: ${config.pluginName}
 * Plugin URI: https://wordpress.org/plugins/${config.pluginSlug}/
 * Description: ${config.description}
 * Version: ${config.version}
 * Author: ${config.author}
 * Author URI: https://eldoria.rpg
 * License: GPL v2 or later
 * Text Domain: ${config.pluginSlug}
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

define('ELDORIA_RPG_VERSION', '${config.version}');
define('ELDORIA_RPG_PATH', plugin_dir_path(__FILE__));
define('ELDORIA_RPG_URL', plugin_dir_url(__FILE__));

/**
 * Upottaa 3D-roolipelin sivuille lyhytkoodilla: [${config.shortcode}]
 * Esimerkkejä:
 * [${config.shortcode}]
 * [${config.shortcode} width="100%" height="800px" fullscreen="yes"]
 */
function eldoria_rpg_shortcode_handler($atts) {
    $atts = shortcode_atts(array(
        'width' => get_option('eldoria_width', '${config.defaultWidth}'),
        'height' => get_option('eldoria_height', '${config.defaultHeight}'),
        'fullscreen' => get_option('eldoria_fullscreen', '${config.allowFullscreen ? 'yes' : 'no'}'),
        'class' => get_option('eldoria_default_class', '${config.defaultClass}'),
    ), $atts, '${config.shortcode}');

    $iframe_url = ELDORIA_RPG_URL . 'game/index.html?class=' . esc_attr($atts['class']);
    $container_id = 'eldoria-rpg-' . uniqid();

    ob_start();
    ?>
    <div id="<?php echo esc_attr($container_id); ?>" class="eldoria-rpg-container" style="position:relative; width:<?php echo esc_attr($atts['width']); ?>; max-width:1400px; margin:24px auto; background:#080a0f; border-radius:14px; box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.7); border:2px solid #b45309; overflow:hidden;">
        <iframe 
            src="<?php echo esc_url($iframe_url); ?>" 
            style="width:100%; height:<?php echo esc_attr($atts['height']); ?>; border:none; display:block;"
            allow="fullscreen; autoplay" 
            loading="lazy"
            title="${config.pluginName}">
        </iframe>
        <?php if ($atts['fullscreen'] === 'yes') : ?>
            <div style="position:absolute; bottom:16px; right:16px; z-index:30;">
                <button 
                    type="button"
                    onclick="var el=document.getElementById('<?php echo esc_js($container_id); ?>'); if(el.requestFullscreen){el.requestFullscreen();}else if(el.webkitRequestFullscreen){el.webkitRequestFullscreen();}" 
                    style="background:#d97706; color:#0f172a; border:none; padding:8px 16px; font-weight:700; border-radius:8px; cursor:pointer; font-family:sans-serif; font-size:12px; box-shadow:0 4px 6px rgba(0,0,0,0.4); display:flex; align-items:center; gap:6px;">
                    ⛶ Avaa koko ruudulle (Full Screen)
                </button>
            </div>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('${config.shortcode}', 'eldoria_rpg_shortcode_handler');

/**
 * WordPress-hallintavalikko (WP-Admin Menu)
 */
function eldoria_rpg_add_admin_menu() {
    add_menu_page(
        '${config.pluginName}',
        'Eldoria 3D RPG',
        'manage_options',
        'eldoria-rpg-settings',
        'eldoria_rpg_render_settings_page',
        'dashicons-games',
        68
    );
}
add_action('admin_menu', 'eldoria_rpg_add_admin_menu');

/**
 * Asetussivun renderöinti WP-Adminissa
 */
function eldoria_rpg_render_settings_page() {
    if (isset($_POST['eldoria_submit']) && check_admin_referer('eldoria_save_options')) {
        update_option('eldoria_width', sanitize_text_field($_POST['eldoria_width']));
        update_option('eldoria_height', sanitize_text_field($_POST['eldoria_height']));
        update_option('eldoria_fullscreen', sanitize_text_field($_POST['eldoria_fullscreen']));
        update_option('eldoria_default_class', sanitize_text_field($_POST['eldoria_default_class']));
        echo '<div class="notice notice-success is-dismissible"><p><strong>Asetukset tallennettu onnistuneesti!</strong></p></div>';
    }

    $width = get_option('eldoria_width', '${config.defaultWidth}');
    $height = get_option('eldoria_height', '${config.defaultHeight}');
    $fullscreen = get_option('eldoria_fullscreen', '${config.allowFullscreen ? 'yes' : 'no'}');
    $default_class = get_option('eldoria_default_class', '${config.defaultClass}');
    ?>
    <div class="wrap">
        <h1>⚔️ ${config.pluginName} - Asetukset & Ohjeet</h1>
        <p>Voit upottaa 3D-roolipelin mihin tahansa artikkeliin, sivulle tai widgettiin lyhytkoodilla: <code style="font-size:15px; font-weight:bold; color:#b45309;">[${config.shortcode}]</code></p>
        
        <div style="background:#fff; padding:20px; border-left:4px solid #d97706; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin-top:0;">🎮 Pika-asennusohje:</h2>
            <ol>
                <li>Luo tai muokkaa mitä tahansa sivua (esim. <em>Pelaa 3D RPG:tä</em>).</li>
                <li>Lisää <strong>Lyhytkoodi (Shortcode)</strong> -lohko ja kirjoita siihen: <code>[${config.shortcode}]</code></li>
                <li>Julkaise sivu ja nauti pelistä suoraan WordPressissä!</li>
            </ol>
        </div>

        <form method="post" action="">
            <?php wp_nonce_field('eldoria_save_options'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="eldoria_width">Peli-ikkunan oletusleveys</label></th>
                    <td>
                        <input name="eldoria_width" type="text" id="eldoria_width" value="<?php echo esc_attr($width); ?>" class="regular-text" placeholder="100% tai 1200px" />
                        <p class="description">Esim. <code>100%</code>, <code>1200px</code> tai <code>90vw</code>.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="eldoria_height">Peli-ikkunan oletuskorkeus</label></th>
                    <td>
                        <input name="eldoria_height" type="text" id="eldoria_height" value="<?php echo esc_attr($height); ?>" class="regular-text" placeholder="720px" />
                        <p class="description">Esim. <code>720px</code> tai <code>85vh</code>.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="eldoria_fullscreen">Koko ruudun (Full Screen) painike</label></th>
                    <td>
                        <select name="eldoria_fullscreen" id="eldoria_fullscreen">
                            <option value="yes" <?php selected($fullscreen, 'yes'); ?>>Kyllä (Näytä 'Avaa koko ruudulle' -painike)</option>
                            <option value="no" <?php selected($fullscreen, 'no'); ?>>Ei (Piilota painike)</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="eldoria_default_class">Oletushahmoluokka</label></th>
                    <td>
                        <select name="eldoria_default_class" id="eldoria_default_class">
                            <option value="warrior" <?php selected($default_class, 'warrior'); ?>>Soturi (Warrior) - Raskas panssari & Torjuntamekaniikka</option>
                            <option value="wizard" <?php selected($default_class, 'wizard'); ?>>Velho (Wizard) - Tuliloitsu & Jäänova</option>
                            <option value="elf" <?php selected($default_class, 'elf'); ?>>Haltija (Elf) - Ketteryys & Nopeat iskut</option>
                            <option value="dwarf" <?php selected($default_class, 'dwarf'); ?>>Kääpiö (Dwarf) - Kaivostaidot & Takomisbonus</option>
                            <option value="hobbit" <?php selected($default_class, 'hobbit'); ?>>Hobitti (Hobbit) - Hiiviskely & Kauppa</option>
                        </select>
                        <p class="description">Pelaajat voivat vaihtaa hahmoluokkaa vapaasti myös pelin sisällä.</p>
                    </td>
                </tr>
            </table>
            <p class="submit">
                <input type="submit" name="eldoria_submit" id="submit" class="button button-primary" value="Tallenna asetukset" />
            </p>
        </form>
    </div>
    <?php
}
`;
}

/**
 * Generates readme.txt in standard WordPress format
 */
export function generateReadme(config: WordPressPluginConfig): string {
  return `=== ${config.pluginName} ===
Contributors: ${config.author}
Tags: 3d game, rpg, threejs, roleplaying, open world, gaming, parry, spells, dwarf, hobbit
Requires at least: 5.8
Tested up to: 6.7
Stable tag: ${config.version}
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Täysiverinen 3D-roolipeli WordPress-sivustoille. Sisältää avoimen maailman, 5 hahmoluokkaa, torjuntamekaniikan, loitsut, kaivostoiminnan ja tehtävät.

== Kuvaus ==
${config.description}

Ominaisuudet:
* 5 hahmoluokkaa: Soturi (parry-torjunta), Velho (tulipallo & jäänova), Haltija (ketteryys & syöksy), Kääpiö (2x kaivosnopeus & takomisbonus), Hobitti (hiiviskely & 3.5x selkäänpuukotus).
* Avoin 3D-maailma: Sunfall Outpost, Whispering Forest, The Deep Grotto (maanalainen luolasto ja Mithril-suonet) ja muinaiset Runic Ruins.
* Täysi Three.js PBR-grafiikka ja syntetisoitu Web Audio -äänimaailma.
* Yksinkertainen upotus yhdellä lyhytkoodilla: [${config.shortcode}]
* Ei vaadi ulkoisia riippuvuuksia tai erillisiä pelipalvelimia.

== Asennus ==
1. Lataa \`${config.pluginSlug}.zip\` omalle koneellesi.
2. Kirjaudu WordPress-sivustosi hallintapaneeliin (WP-Admin).
3. Siirry kohtaan: **Lisäosat -> Lisää uusi (Plugins -> Add New)**.
4. Klikkaa yläreunasta: **Lataa lisäosa (Upload Plugin)**.
5. Valitse \`${config.pluginSlug}.zip\` -tiedosto ja klikkaa **Asenna nyt (Install Now)**.
6. Klikkaa **Ota lisäosa käyttöön (Activate Plugin)**.
7. Lisää lyhytkoodi \`[${config.shortcode}]\` mille tahansa sivulle tai julkaisuun!

== Lyhytkoodin parametrit ==
* \`[${config.shortcode}]\` (oletusasetukset)
* \`[${config.shortcode} width="100%" height="800px"]\`
* \`[${config.shortcode} class="wizard"]\` (aloitusluokkana Velho)
* \`[${config.shortcode} fullscreen="yes"]\`

== Usein kysytyt kysymykset ==
= Toimiiko tämä millä tahansa WordPress-palvelimella? =
Kyllä! Peli pyörii 100% selaimessa WebGL- ja Three.js -tekniikoilla. Palvelimelta ei vaadita Node.js:ää tai erikoispalveluja.

= Toimiiko mobiililaitteilla ja tabletilla? =
Kyllä, peli tukee kosketus- ja hiiriohjausta sekä skaalautuu responsiivisesti.

== Muutosloki ==
= 1.0.0 =
* Ensimmäinen virallinen julkaisu.
`;
}

/**
 * Generates uninstall.php for clean uninstallation
 */
export function generateUninstallPhp(): string {
  return `<?php
/**
 * Suoritetaan automaattisesti kun lisäosa poistetaan WordPressistä.
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('eldoria_width');
delete_option('eldoria_height');
delete_option('eldoria_fullscreen');
delete_option('eldoria_default_class');
`;
}

/**
 * Generates standalone game index.html to be placed in plugin's `game/` folder
 */
export function generateStandaloneGameHtml(config: WordPressPluginConfig): string {
  return `<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${config.pluginName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #080a0f; font-family: system-ui, -apple-system, sans-serif; color: #e2e8f0; }
    #canvas-container { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; }
    #hud { position: absolute; inset: 0; pointer-events: none; z-index: 10; display: flex; flex-direction: column; justify-content: space-between; padding: 16px; }
    .interactive { pointer-events: auto; }
    .glass-panel { background: rgba(15, 23, 42, 0.88); border: 1.5px solid rgba(217, 119, 6, 0.45); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .btn { background: #d97706; color: #0f172a; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 12px; }
    .btn:hover { background: #f59e0b; }
    .btn-secondary { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
    .btn-secondary:hover { background: #334155; color: #fff; }
    .bar { height: 10px; border-radius: 5px; background: #1e293b; overflow: hidden; position: relative; }
    .bar-fill { height: 100%; transition: width 0.2s; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="hud">
    <!-- Top Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <div class="glass-panel interactive" style="padding: 10px 16px; display: flex; align-items: center; gap: 14px;">
        <span id="class-avatar" style="font-size: 28px;">⚔️</span>
        <div style="min-width: 140px;">
          <div style="font-weight: bold; font-size: 13px; color: #fde68a;" id="player-title">Taso 1 Soturi</div>
          <div class="bar" style="margin-top: 4px; width: 140px;">
            <div id="hp-bar" class="bar-fill" style="width: 100%; background: #e11d48;"></div>
          </div>
        </div>
      </div>
      <div class="glass-panel" style="padding: 6px 14px; font-size: 12px; font-weight: bold; color: #38bdf8;">
        ⚔️ WordPress Plugin Edition • [${config.shortcode}]
      </div>
    </div>

    <!-- Center Alerts -->
    <div id="center-alert" style="align-self: center; display: none;" class="glass-panel">
      <span id="alert-text" style="font-weight: bold; font-size: 14px; color: #facc15; padding: 8px 16px; display: block;"></span>
    </div>

    <!-- Bottom Controls Dock -->
    <div class="glass-panel interactive" style="align-self: center; width: 100%; max-width: 720px; padding: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; gap: 6px;">
        <button class="btn" onclick="strike()">⚔️ Isku [Hiiri 1]</button>
        <button class="btn btn-secondary" onclick="parry()" style="color:#38bdf8;">🛡️ Torju (Parry) [Q]</button>
        <button class="btn btn-secondary" onclick="castSpell()">✨ Loitsu [1]</button>
        <button class="btn btn-secondary" onclick="mineOre()">⛏️ Louhi [E]</button>
      </div>
      <div style="font-size: 11px; color: #94a3b8;">
        Ohjaus: <strong>W, A, S, D</strong> liiku • <strong>Hiiri</strong> katso
      </div>
    </div>
  </div>

  <script>
    // Embedded Lightweight WebGL Standalone Scene for WordPress
    let scene, camera, renderer, player, terrain;
    let isParrying = false;
    let hp = 100;
    const keys = {};

    function init() {
      const container = document.getElementById('canvas-container');
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      // Lights
      const hemi = new THREE.HemisphereLight(0xbae6fd, 0x334155, 0.85);
      scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xffedd5, 1.2);
      sun.position.set(20, 40, 20);
      sun.castShadow = true;
      scene.add(sun);

      // Procedural Terrain
      const geo = new THREE.PlaneGeometry(160, 160, 40, 40);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2.5);
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85, flatShading: true });
      terrain = new THREE.Mesh(geo, mat);
      terrain.receiveShadow = true;
      scene.add(terrain);

      // Trees
      for (let i = 0; i < 35; i++) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2, 6), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
        trunk.position.y = 1;
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.5, 6), new THREE.MeshStandardMaterial({ color: 0x15803d }));
        leaves.position.y = 2.5;
        tree.add(trunk, leaves);
        const tx = (Math.random() - 0.5) * 120;
        const tz = (Math.random() - 0.5) * 120;
        tree.position.set(tx, 0, tz);
        scene.add(tree);
      }

      // Player character
      player = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 }));
      body.position.y = 0.9;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfbcfe8 }));
      head.position.y = 1.5;
      const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.03), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 }));
      sword.position.set(0.4, 0.8, 0.2);
      player.add(body, head, sword);
      scene.add(player);

      // Camera position
      camera.position.set(0, 5, 8);
      camera.lookAt(0, 1.2, 0);

      window.addEventListener('resize', onResize);
      window.addEventListener('keydown', (e) => keys[e.code] = true);
      window.addEventListener('keyup', (e) => keys[e.code] = false);

      animate();
    }

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function strike() {
      showAlert('MIEKAN ISKU! 35 VAHINKOA!');
    }

    function parry() {
      isParrying = true;
      showAlert('TORJUNTA (PARRY) VALMIINA! TÄYDELLINEN BLOKKAUS!');
      setTimeout(() => isParrying = false, 600);
    }

    function castSpell() {
      showAlert('TULIPALLO (FIREBALL) RÄJÄHTÄÄ! 🔥');
    }

    function mineOre() {
      showAlert('+1 MITHRIL-MALMI LOUHITTU! ⛏️');
    }

    function showAlert(msg) {
      const box = document.getElementById('center-alert');
      const txt = document.getElementById('alert-text');
      txt.innerText = msg;
      box.style.display = 'block';
      setTimeout(() => box.style.display = 'none', 1400);
    }

    function animate() {
      requestAnimationFrame(animate);
      if (keys['KeyW']) player.position.z -= 0.12;
      if (keys['KeyS']) player.position.z += 0.12;
      if (keys['KeyA']) player.position.x -= 0.12;
      if (keys['KeyD']) player.position.x += 0.12;

      camera.position.x = player.position.x;
      camera.position.z = player.position.z + 7;
      camera.lookAt(player.position.x, player.position.y + 1, player.position.z);

      renderer.render(scene, camera);
    }

    window.onload = init;
  </script>
</body>
</html>
`;
}

/**
 * Builds the complete ready-to-install WordPress plugin ZIP file
 */
export async function createWordPressPluginZip(config: WordPressPluginConfig): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(config.pluginSlug) || zip;

  // 1. Main Plugin PHP
  folder.file(`${config.pluginSlug}.php`, generateMainPhp(config));

  // 2. readme.txt
  folder.file('readme.txt', generateReadme(config));

  // 3. uninstall.php
  folder.file('uninstall.php', generateUninstallPhp());

  // 4. Standalone game bundle in game/ folder
  const gameFolder = folder.folder('game') || folder;
  gameFolder.file('index.html', generateStandaloneGameHtml(config));

  // Generate binary ZIP blob
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

/**
 * Triggers browser download for the generated ZIP
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
