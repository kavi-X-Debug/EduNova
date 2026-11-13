import {
  Armchair, Backpack, Battery, Bell, Bird, Book, BookOpen, Bug, Bus, Cable, Cat, Circle, Clock, Cloud, CloudLightning, CloudRain, Coffee, Cog, Droplet, Droplets, Drum, Eraser, Feather,
  FileText, Fish, Flame, Flashlight, Frame, Gem, Glasses, Ear, Hammer, Lamp, Magnet, Layers, Leaf, Lightbulb, Megaphone, MessageCircle, Moon, Mountain, Package, Paperclip, Pencil, Pin, Plane, Rabbit, Rat,
  RectangleHorizontal, Ruler, Shapes, Ship, Shirt, Siren, Snail, Speaker, Sprout, Square, Star, Sun, ToggleLeft, Tractor, TrainFront, TreeDeciduous, TreePalm, Umbrella, Utensils, Volume2,
  Wheat, Wind, Wine, Worm, BrickWall, Beef, type LucideIcon,
} from 'lucide-react';
import type { Pole } from './magnetLab.generator';

/** Small picture for an item id (tray chips, choice buttons). Lucide icons, decorative; the item's name always sits next to it. */
const ICONS: Record<string, LucideIcon> = {
  // magnets
  nail: Pin, paperClip: Paperclip, needle: Pin, nut: Cog, safetyPin: Pin, woodSpoon: Utensils, plasticComb: Ruler, paper: FileText, rubberBand: Circle, leaf: Leaf, glassMarble: Gem,
  eraser: Eraser, stone: Mountain, aluminiumFoil: Layers, copperWire: Cable,
  // light
  sun: Sun, torch: Flashlight, candle: Flame, lamp: Lamp, firefly: Bug, star: Star, moon: Moon, mirror: Frame, book: Book, tree: TreeDeciduous, chair: Armchair,
  woodBoard: RectangleHorizontal, brickWall: BrickWall, metalTray: Layers, cardboard: Package, schoolBag: Backpack, umbrella: Umbrella, clearGlass: Wine, clearWater: Droplet,
  plasticWrap: Layers, spectacleLens: Glasses, air: Wind, windowPane: Square, tracingPaper: FileText, frostedGlass: Square, waxPaper: FileText, thinCloth: Shirt, bathroomGlass: Square, lampshade: Lamp,
  // sound
  drum: Drum, thunder: CloudLightning, busHorn: Bus, siren: Siren, aeroplane: Plane, trainHorn: TrainFront, waterfall: Droplets, loudSpeaker: Speaker, whisper: MessageCircle, clockTick: Clock,
  leafRustle: Leaf, mouse: Rat, catPurr: Cat, pageTurn: BookOpen, breeze: Wind, dripTap: Droplet, birdChirp: Bird, whistle: Megaphone, mosquito: Bug, smallBell: Bell, flute: Feather, kettle: Coffee,
  violin: Feather, lionRoar: Cat, elephantCall: Volume2, bullfrog: Bug, tractor: Tractor, tuba: Volume2, cowMoo: Beef, foghorn: Ship,
  // water stories
  seaWarm: Sun, vapourRise: Wind, cloudForm: Cloud, rainFalls: CloudRain, riverFlows: Droplets, backToSea: Ship, puddleFill: CloudRain, sunShines: Sun, puddleWarm: Droplet, turnsVapour: Wind,
  vapourUp: Cloud, puddleGone: Sun, cloudsGather: Cloud, hillRain: CloudRain, streamForms: Droplets, streamRiver: Droplets, riverLake: Droplet, lakeWarm: Sun,
  // food chains
  grass: Sprout, paddy: Wheat, waterWeed: Leaf, mangoTree: TreeDeciduous, coconutPalm: TreePalm, deer: Rabbit, leopard: Cat, grasshopper: Bug, frog: Bug, snake: Worm, smallFish: Fish,
  eagle: Bird, caterpillar: Worm, myna: Bird, hawk: Bird, snail: Snail, fish: Fish, heron: Bird, elephant: Shapes, cow: Beef,
  // circuits
  ironNail: Hammer, steelSpoon: Utensils, pencilLead: Pencil, plasticRuler: Ruler, rubber: Eraser, woodStick: RectangleHorizontal, glassCup: Wine, cloth: Shirt,
  battery: Battery, bulb: Lightbulb, switch: ToggleLeft, magnet: Magnet, ear: Ear,
};

export function Glyph({ id, className = 'h-6 w-6' }: { id: string; className?: string }) {
  const Icon = ICONS[id] ?? Shapes;
  return <Icon aria-hidden className={`${className} shrink-0`} />;
}

/** Chip / button content: picture + name. */
export function Named({ id, text }: { id: string; text: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <Glyph id={id} />
      <span className="min-w-0 break-words">{text}</span>
    </span>
  );
}

const POLE_FILL: Record<Pole, string> = { N: 'fill-danger-700', S: 'fill-brand-600' };

/** Two bar magnets face to face. `a` = the pole at the right end of the left magnet, `b` = the pole at the left end of the right magnet. Letters carry the meaning (not colour). */
export function MagnetPair({ a, b, label }: { a: Pole; b: Pole; label: string }) {
  const other = (p: Pole): Pole => (p === 'N' ? 'S' : 'N');
  const halves: Array<{ x: number; pole: Pole }> = [
    { x: 12, pole: other(a) },
    { x: 92, pole: a },
    { x: 188, pole: b },
    { x: 268, pole: other(b) },
  ];
  return (
    <svg role="img" aria-label={label} viewBox="0 0 360 110" className="h-auto w-full max-w-md">
      {halves.map((h) => (
        <g key={h.x}>
          <rect x={h.x} y={25} width={80} height={60} rx={4} className={POLE_FILL[h.pole]} />
          <text x={h.x + 40} y={66} textAnchor="middle" fontSize={32} fontWeight={700} className="fill-surface">
            {h.pole}
          </text>
        </g>
      ))}
      <rect x={12} y={25} width={160} height={60} rx={4} className="fill-none stroke-ink" strokeWidth={3} />
      <rect x={188} y={25} width={160} height={60} rx={4} className="fill-none stroke-ink" strokeWidth={3} />
    </svg>
  );
}

export interface CircuitProps {
  /** Which parts are in the loop. */
  battery: boolean;
  bulb: boolean;
  /** 'none' = no switch at all, i.e. a plain wire there. */
  sw: 'closed' | 'open' | 'none';
  wireBroken: boolean;
  /** Show a "?" in every gap (level 1). */
  hint: boolean;
  /** Draw the bulb lit (only after the answer is in). */
  lit: boolean;
  label: string;
}

/** A simple loop: battery (left), switch (top), bulb (right), wire (bottom). Parts that are missing leave a dashed gap. Safe: a small battery and torch bulb only. */
export function CircuitSvg({ battery, bulb, sw, wireBroken, hint, lit, label }: CircuitProps) {
  const wire = 'stroke-ink-soft';
  const gap = (x: number, y: number, w: number, h: number) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} className="fill-surface-muted stroke-ink-soft" strokeWidth={2} strokeDasharray="6 5" />
      {hint && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle" fontSize={24} fontWeight={700} className="fill-ink-soft">
          ?
        </text>
      )}
    </g>
  );
  return (
    <svg role="img" aria-label={label} viewBox="0 0 320 200" className="h-auto w-full max-w-md">
      <g className={wire} strokeWidth={5} strokeLinecap="round" fill="none">
        {/* top: switch */}
        <path d="M50 50 H120" />
        <path d="M200 50 H270" />
        {/* right: bulb */}
        <path d="M270 50 V78" />
        <path d="M270 122 V150" />
        {/* bottom */}
        {wireBroken ? (
          <>
            <path d="M270 150 H180" />
            <path d="M140 150 H50" />
          </>
        ) : (
          <path d="M270 150 H50" />
        )}
        {/* left: battery */}
        <path d="M50 150 V120" />
        <path d="M50 80 V50" />
      </g>
      {/* switch */}
      {sw === 'none' && gap(122, 30, 76, 40)}
      {sw !== 'none' && (
        <g>
          <circle cx={120} cy={50} r={6} className="fill-ink" />
          <circle cx={200} cy={50} r={6} className="fill-ink" />
          <path d={sw === 'closed' ? 'M120 50 H200' : 'M120 50 L186 20'} className="stroke-ink" strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
      {/* battery: long plate = +, short plate = - */}
      {battery ? (
        <g>
          <path d="M30 100 H70" className="stroke-ink" strokeWidth={6} strokeLinecap="round" />
          <path d="M38 118 H62 M38 82 H62" className="stroke-ink" strokeWidth={6} strokeLinecap="round" />
          <text x={78} y={90} fontSize={18} fontWeight={700} className="fill-ink">+</text>
        </g>
      ) : (
        gap(26, 80, 48, 40)
      )}
      {/* bulb */}
      {bulb ? (
        <g>
          <circle cx={270} cy={100} r={22} className={lit ? 'fill-badge-sun-200 stroke-badge-sun-600' : 'fill-surface stroke-ink'} strokeWidth={4} />
          <path d="M258 112 L270 92 L282 112" className="fill-none stroke-ink" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          {lit &&
            [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line key={deg} x1={270 + 30 * Math.cos((deg * Math.PI) / 180)} y1={100 + 30 * Math.sin((deg * Math.PI) / 180)} x2={270 + 40 * Math.cos((deg * Math.PI) / 180)} y2={100 + 40 * Math.sin((deg * Math.PI) / 180)} className="stroke-badge-sun-600" strokeWidth={4} strokeLinecap="round" />
            ))}
        </g>
      ) : (
        gap(246, 78, 48, 44)
      )}
      {wireBroken && (
        <g>
          <path d="M140 150 L128 138 M180 150 L192 138" className="stroke-ink" strokeWidth={3} strokeLinecap="round" />
          {hint && gap(142, 134, 36, 32)}
        </g>
      )}
    </svg>
  );
}

/** Decorative scene for Light and Shadows: a torch, a ball and its shadow on a wall. */
export function ShadowScene() {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 320 110" className="h-auto w-full max-w-md">
      <rect width="320" height="110" rx="12" className="fill-badge-sky-200" />
      <rect x="240" y="0" width="80" height="110" className="fill-surface" />
      <ellipse cx="270" cy="62" rx="16" ry="22" className="fill-ink-soft" opacity="0.7" />
      <path d="M62 58 L150 44 V76 Z" className="fill-badge-sun-200" opacity="0.8" />
      <circle cx="150" cy="60" r="16" className="fill-badge-bloom-600" />
      <rect x="22" y="48" width="40" height="22" rx="5" className="fill-ink-soft" />
      <rect x="56" y="44" width="10" height="30" rx="3" className="fill-badge-sun-400" />
    </svg>
  );
}

/** Decorative scene for the water story: sun, cloud, hills and a river to the sea. */
export function WaterScene() {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 320 110" className="h-auto w-full max-w-md">
      <rect width="320" height="110" rx="12" className="fill-badge-sky-200" />
      <circle cx="40" cy="30" r="16" className="fill-badge-sun-400" />
      <ellipse cx="190" cy="28" rx="42" ry="14" className="fill-surface" />
      <ellipse cx="164" cy="34" rx="24" ry="11" className="fill-surface" />
      <path d="M0 90 L70 52 L130 90 Z" className="fill-badge-leaf-600" />
      <path d="M90 90 L170 44 L240 90 Z" className="fill-badge-leaf-400" />
      <rect x="0" y="86" width="320" height="24" className="fill-badge-sky-400" />
      <path d="M190 52 v10 M200 56 v10 M180 56 v10" className="stroke-badge-sky-600" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}
