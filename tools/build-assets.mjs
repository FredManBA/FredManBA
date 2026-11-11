// Genera las píldoras SVG del README (tecnologías y enlaces) con la paleta del banner.
// Uso: node tools/build-assets.mjs   (sin dependencias; Node 18 o posterior)
//
// Para añadir una tecnología: añade una línea a STACK y, si hace falta, su icono
// en tools/icons/ (simple-icons, CC0: https://simpleicons.org) o un icono propio en CUSTOM.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'tools', 'icons');

const C = {
  orange: '#FE6E01',
  charcoal: '#232323',
  cream: '#FDF0E5',
};

// [archivo de salida, texto, icono]
const STACK = [
  ['typescript', 'TypeScript', 'typescript'],
  ['javascript', 'JavaScript', 'javascript'],
  ['html', 'HTML', 'html5'],
  ['css', 'CSS', 'css'],
  ['python', 'Python', 'python'],
  ['rust', 'Rust', 'rust'],
  ['luau', 'Luau', 'lua'],
  ['gdscript', 'GDScript', 'godotengine'],
  ['csharp', 'C#', 'dv-csharp-plain'],
  ['php', 'PHP', 'php'],

  ['react', 'React', 'react'],
  ['astro', 'Astro', 'astro'],
  ['vite', 'Vite', 'vite'],
  ['tailwind', 'Tailwind CSS', 'tailwindcss'],
  ['framer-motion', 'Framer Motion', 'framer'],
  ['nestjs', 'NestJS', 'nestjs'],

  ['canvas', 'Canvas 2D', 'custom:canvas'],
  ['threejs', 'Three.js', 'threedotjs'],
  ['phaser', 'Phaser', 'custom:gamepad'],
  ['godot', 'Godot', 'godotengine'],
  ['roblox-studio', 'Roblox Studio', 'robloxstudio'],
  ['blender', 'Blender', 'blender'],

  ['cloudflare-pages', 'Cloudflare Pages', 'cloudflarepages'],
  ['cloudflare-workers', 'Cloudflare Workers', 'cloudflareworkers'],
  ['d1-durable-objects', 'D1 & Durable Objects', 'cloudflare'],
  ['vercel', 'Vercel', 'vercel'],
  ['tauri', 'Tauri', 'tauri'],

  ['vitest', 'Vitest', 'vitest'],
  ['playwright', 'Playwright', 'dv-playwright-plain'],
  ['git', 'Git', 'git'],
  ['github', 'GitHub', 'github'],
  ['vscode', 'VS Code', 'dv-vscode-plain'],
  ['claude-code', 'Claude Code', 'claude'],
];

const LINKS = [
  ['website', 'Needy Friends', 'custom:globe'],
  ['itchio', 'itch.io', 'itchdotio'],
  ['tiktok', 'TikTok', 'tiktok'],
  ['email', 'Email', 'custom:mail'],
];

// Iconos propios en trazo (viewBox 24) para lo que no tiene logo monocromo libre.
const CUSTOM = {
  canvas: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 14l3.5-4 3 3 2-2.5L18 14"/><path d="M9 21h6M12 18v3"/>',
  gamepad: '<path d="M6.5 8h11a4 4 0 0 1 3.9 4.9l-1 4.3a2.4 2.4 0 0 1-4.1 1.1L14.4 16H9.6l-1.9 2.3a2.4 2.4 0 0 1-4.1-1.1l-1-4.3A4 4 0 0 1 6.5 8z"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="15.5" cy="12" r=".6"/><circle cx="17.3" cy="13.8" r=".6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/>',
};

// Anchos de Arial (milésimas de em). Sirven para calcular el ancho del texto;
// textLength fija ese ancho para que la píldora se vea igual con cualquier fuente.
const W = {
  ' ': 278, '!': 278, '#': 556, '&': 667, '.': 278, '·': 278, '-': 333, '0': 556, '1': 556, '2': 556,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833,
  N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833,
  n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
};
const textWidth = (s, size, weightFactor) =>
  [...s].reduce((sum, ch) => sum + (W[ch] ?? 600), 0) / 1000 * size * weightFactor;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function loadIcon(name) {
  if (name.startsWith('custom:')) {
    return { viewBox: '0 0 24 24', body: CUSTOM[name.slice(7)], stroke: true };
  }
  const svg = readFileSync(join(iconsDir, `${name}.svg`), 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  const body = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/\s(fill|style|class)="[^"]*"/g, '');
  return { viewBox, body, stroke: false };
}

function pill({ label, icon, height, fontSize, fill, stroke, text, iconColor, weight }) {
  const pad = Math.round(height * 0.36);
  const iconSize = Math.round(height * 0.5);
  const gap = Math.round(height * 0.24);
  const tw = Math.ceil(textWidth(label, fontSize, weight === 700 ? 1.1 : 1.06));
  const width = pad + iconSize + gap + tw + pad + 2;
  const r = height / 2;
  const ic = loadIcon(icon);
  const iconAttrs = ic.stroke
    ? `fill="none" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`
    : `fill="${iconColor}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">
  <title>${esc(label)}</title>
  <rect x="0.75" y="0.75" width="${width - 1.5}" height="${height - 1.5}" rx="${r - 0.75}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  <svg x="${pad}" y="${(height - iconSize) / 2}" width="${iconSize}" height="${iconSize}" viewBox="${ic.viewBox}"><g ${iconAttrs}>${ic.body}</g></svg>
  <text x="${pad + iconSize + gap}" y="${height / 2}" dominant-baseline="central" textLength="${tw}" lengthAdjust="spacingAndGlyphs" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${text}">${esc(label)}</text>
</svg>
`;
}

function write(dir, file, svg) {
  writeFileSync(join(root, 'assets', dir, `${file}.svg`), svg);
}

for (const dir of ['stack', 'links']) {
  rmSync(join(root, 'assets', dir), { recursive: true, force: true });
  mkdirSync(join(root, 'assets', dir), { recursive: true });
}

for (const [file, label, icon] of STACK) {
  write('stack', file, pill({
    label, icon, height: 32, fontSize: 13, weight: 600,
    fill: C.charcoal, stroke: 'rgba(254,110,1,0.8)', text: C.cream, iconColor: C.orange,
  }));
}

for (const [file, label, icon] of LINKS) {
  write('links', file, pill({
    label, icon, height: 40, fontSize: 15, weight: 700,
    fill: C.orange, stroke: C.orange, text: C.charcoal, iconColor: C.charcoal,
  }));
}

// Separador: las franjas diagonales naranjas de las esquinas del banner.
const stripes = [0, 1, 2].map((i) =>
  `<path d="M${18 + i * 22} 22 L${34 + i * 22} 2 H${42 + i * 22} L${26 + i * 22} 22 Z" fill="${C.orange}" opacity="${1 - i * 0.3}"/>`,
).join('');
writeFileSync(join(root, 'assets', 'divider.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="104" height="24" viewBox="0 0 104 24" aria-hidden="true">${stripes}</svg>\n`);

console.log(`OK: ${STACK.length} tecnologías, ${LINKS.length} enlaces y el separador en assets/`);
