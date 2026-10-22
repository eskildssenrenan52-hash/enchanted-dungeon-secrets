import treesSheet from '@/assets/art/trees-sheet.png';
import frontierA from '@/assets/art/frontier-a.png';
import frontierB from '@/assets/art/frontier-b.png';
import propsSheet from '@/assets/art/props-sheet.png';
import { FRONTIER, type FrontierBiome } from './frontier';
import { T, TS, hash } from './world';
import type { Game } from './engine';

// Arte detalhada em pixel art (folhas de 8 sprites, células de 128px alinhadas pela base).
const CELL = 128;
/** Sprite único por bioma da fronteira: [folha, índice]. 0 = frontier-a, 1 = frontier-b, 2 = props. */
const FRONTIER_SPRITE: Record<FrontierBiome, [number, number, number]> = {
  sakura: [0, 0, 54], moonwood: [0, 1, 56], prism: [0, 2, 46], coral: [0, 3, 42], bamboo: [0, 4, 52], thunder: [0, 5, 50],
  obsidian: [0, 6, 48], sunflower: [0, 7, 40], lavender: [1, 0, 36], mangrove: [1, 1, 56], aurora: [1, 2, 54], amber: [1, 3, 46],
  spores: [1, 4, 50], lotus: [1, 5, 38], marble: [1, 6, 46], crimson: [1, 7, 54], oasis: [2, 6, 48],
};
/** Objetos dos biomas originais desenhados por cima do chão: tile -> [índice em props, tamanho]. */
const PROP: Partial<Record<number, [number, number]>> = {
  [T.ROCK]: [0, 28], [T.CACTUS]: [1, 32], [T.BUSH]: [2, 26], [T.CRYSTAL]: [3, 34], [T.MUSHROOM]: [4, 34], [T.PILLAR]: [5, 30],
};
const SANDY = new Set(['desert', 'oasis', 'amber', 'coast']);
const SNOWY = new Set(['mountain', 'aurora']);
export const hasProp = (t: number) => PROP[t] !== undefined;
export const TREE_TILES = new Set<number>([T.TREE, T.DTREE, T.AUTUMN_TREE, T.PALM, T.PINE]);

function load(src: string) { const i = new Image(); i.src = src; return i; }
const ready = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0;

export class WorldArt {
  trees: HTMLImageElement; sheets: HTMLImageElement[];
  /** Compatibilidade com o motor: indicam se a arte já carregou. */
  get canopy() { return this.trees; }
  get frontier() { return this.sheets[0]!; }
  constructor() {
    this.trees = load(treesSheet);
    this.sheets = [load(frontierA), load(frontierB), load(propsSheet)];
  }
  private blit(c: CanvasRenderingContext2D, img: HTMLImageElement, i: number, x: number, y: number, size: number) {
    if (!ready(img)) return;
    c.drawImage(img, i * CELL, 0, CELL, CELL, Math.round(x - size / 2), Math.round(y - size), size, size);
  }
  private shadow(c: CanvasRenderingContext2D, x: number, y: number, rx: number) {
    c.save(); c.globalAlpha = .25; c.fillStyle = '#10241c'; c.beginPath(); c.ellipse(x + 2, y - 1, rx, rx * .35, 0, 0, Math.PI * 2); c.fill(); c.restore();
  }
  frontierObject(c: CanvasRenderingContext2D, biome: FrontierBiome, tx: number, ty: number, clock: number) {
    const [sheet, i, size0] = FRONTIER_SPRITE[biome] ?? [0, 0, 48];
    const size = size0 + Math.floor(hash(tx, ty, 61) * 6) - 2;
    const x = tx * TS + 8 + Math.sin(clock + tx) * .4, y = ty * TS + 17;
    this.shadow(c, x, y, size * .32);
    this.blit(c, this.sheets[sheet]!, i, x, y, size);
  }
  /** Rochas, cactos, arbustos, cristais, cogumelos e pilares. Retorna false se o tile não tem sprite. */
  prop(c: CanvasRenderingContext2D, t: number, biome: string, tx: number, ty: number) {
    const p = PROP[t]; if (!p) return false;
    let [i, size] = p;
    if (t === T.ROCK && SNOWY.has(biome)) i = 7;
    size += Math.floor(hash(tx, ty, 17) * 5) - 2;
    const x = tx * TS + 8, y = ty * TS + 16;
    this.shadow(c, x, y, size * .3);
    this.blit(c, this.sheets[2]!, i, x, y, size);
    return true;
  }
  /** Chão que aparece por baixo de um objeto desenhado como sprite. */
  groundUnder(t: number, biome: string): number {
    if (TREE_TILES.has(t)) return SNOWY.has(biome) ? T.SNOW : SANDY.has(biome) ? T.SAND : biome === 'swamp' ? T.MOSS : biome === 'autumn' ? T.AUTUMN : T.GRASS;
    if (!PROP[t]) return t;
    if (t === T.CACTUS || SANDY.has(biome)) return T.SAND;
    if (SNOWY.has(biome)) return T.SNOW;
    if (t === T.CRYSTAL || biome === 'cave') return T.CAVE;
    if (biome === 'volcanic') return T.ASH;
    if (t === T.MUSHROOM || biome === 'mushroom' || biome === 'swamp') return T.MOSS;
    if (biome === 'ruins') return T.RUINS;
    return T.GRASS;
  }
  tree(c: CanvasRenderingContext2D, t: number, tx: number, ty: number, clock: number) {
    if (!ready(this.trees)) return;
    const x = tx * TS + 8 + Math.sin(clock * 1.5 + tx * .2) * .5, y = ty * TS + 17;
    const r = hash(tx, ty, 84);
    const i = t === T.PALM ? 4 : t === T.DTREE ? 5 : t === T.AUTUMN_TREE ? 6 : t === T.PINE ? 7 : Math.floor(r * 4);
    const size = (t === T.PALM ? 46 : t === T.PINE ? 50 : 54) + Math.floor(r * 8) - 4;
    this.shadow(c, x, y, size * .34);
    this.blit(c, this.trees, i, x, y, size);
  }
  village(c: CanvasRenderingContext2D, clock: number) {
    if (!ready(this.trees)) return;
    for (const [tx, ty] of [[106, 116], [138, 116], [105, 128], [138, 138], [116, 140], [129, 110]]) this.tree(c, T.TREE, tx!, ty!, clock);
    // A grande árvore de Potos, com vaga-lumes de mana.
    const x = 122 * TS + 8, y = 111 * TS + 4;
    this.shadow(c, x, y, 50);
    c.drawImage(this.trees, 2 * CELL, 0, CELL, CELL, x - 80, y - 160, 160, 160);
    c.save(); c.fillStyle = '#c2efb6';
    for (let i = 0; i < 18; i++) { const ph = clock * .8 + i; c.globalAlpha = .3 + Math.sin(ph) * .25; c.fillRect(x + Math.sin(ph) * 50, y - 40 - Math.cos(ph * .7) * 60, 2, 2); }
    c.restore();
  }
  ambient(g: Game, c: CanvasRenderingContext2D) {
    if (g.interior) return;
    const palette = g.biome === 'autumn' || g.biome === 'crimson' ? ['#ecbe79', '#cc8b6c'] : g.biome === 'volcanic' || g.biome === 'obsidian' ? ['#f1c080', '#e79975']
      : g.biome === 'sakura' ? ['#f6c3d6', '#fbe1ea'] : SNOWY.has(g.biome) ? ['#ffffff', '#dbeaff'] : ['#d3e9b8', '#bdd7ca'];
    for (let i = 0; i < 28; i++) {
      const x = (hash(i, 3, 7) * g.canvas.width + g.clock * (g.biome === 'autumn' || g.biome === 'sakura' ? 9 : 2)) % g.canvas.width;
      const y = (hash(i, 8, 9) * g.canvas.height + Math.sin(g.clock * .6 + i) * 12 + (SNOWY.has(g.biome) ? g.clock * 14 : 0)) % g.canvas.height;
      c.globalAlpha = .18 + Math.sin(g.clock * 1.4 + i) * .12; c.fillStyle = palette[i % 2]!; c.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }
    c.globalAlpha = 1;
  }
}
