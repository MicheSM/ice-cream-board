import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { AppData, BoardConfig, Flavor, Placement } from '../model/types';
import { cellKey } from '../model/types';
import { resolveTunables } from '../model/themeDefaults';
import logoUrl from '../assets/logo-cioccolato-argento.png';
import { cssFont, FONTS, type FontSpec } from './fonts';
import {
  BOARD_H,
  BOARD_W,
  HEADER_H,
  cardLayout,
  cardSize,
  cellRect,
  chalkOutline,
  handCutClip,
  innerArea,
  jitterTransform,
  type CardLayout,
  type Rect,
} from './layout';
import { fitBoard, LINE_HEIGHT, type CardFit, type Measure } from './textFit';
import { THEMES, chromeOf, swatch, type CardSwatch, type ThemeVisual } from './themes';
import { FINE_GRAIN } from './textures';
import './board.css';

// Measures text with the real font via an off-screen <canvas>. `font` is a
// CSS font at 100px, e.g. `700 100px "Amatic SC"`. Widths are cached: the
// same text in the same font always has the same width.
const measure: Measure = (() => {
  const ctx = document.createElement('canvas').getContext('2d')!;
  const cache = new Map<string, number>();
  return (text, font) => {
    const key = `${font}|${text}`;
    let w = cache.get(key);
    if (w === undefined) {
      ctx.font = font;
      w = ctx.measureText(text).width;
      cache.set(key, w);
    }
    return w;
  };
})();

/** True once the given fonts are downloaded and usable (measuring before that would give wrong sizes). */
function useFontsReady(fonts: FontSpec[]) {
  const key = fonts.map((f) => cssFont(f, 100)).join('|');
  const [readyKey, setReadyKey] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all(key.split('|').map((f) => document.fonts.load(f))).then(() => {
      if (alive) setReadyKey(key);
    });
    return () => {
      alive = false;
    };
  }, [key]);
  return readyKey === key;
}

interface PlacedCard {
  row: number;
  col: number;
  flavor: Flavor;
  placement: Placement;
}

function placedCards(board: BoardConfig, flavors: Flavor[]): PlacedCard[] {
  const byId = new Map(flavors.map((f) => [f.id, f]));
  const out: PlacedCard[] = [];
  for (let row = 0; row < board.rows; row++)
    for (let col = 0; col < board.cols; col++) {
      const placement = board.cells[cellKey(row, col)];
      const flavor = placement && byId.get(placement.flavorId);
      if (flavor) out.push({ row, col, flavor, placement });
    }
  return out;
}

/** The board at its logical size (1920×1080). `children` are drawn on top, in the same coordinates. */
export function Board({ data, children }: { data: AppData; children?: ReactNode }) {
  const { board, style, flavors } = data;
  const t = resolveTunables(style);
  const theme = THEMES[style.theme];
  const bg = swatch(theme.backgrounds, t.background);
  const cardSwatch = swatch(theme.cards, t.card);
  const majorFont = FONTS[t.majorFont];
  const minorFont = FONTS[t.minorFont];
  const headerFont = FONTS[theme.header.font];
  const fontsReady = useFontsReady([majorFont, minorFont, headerFont]);

  const chrome = chromeOf(style);
  const inner = innerArea(chrome);
  const size = cardSize(board, chrome, t.cardScale);
  const layout = cardLayout(theme.kind, size, t.leafIcon);
  const cards = useMemo(() => placedCards(board, flavors), [board, flavors]);

  // Recomputed only when something that affects text sizes changes.
  // (`layout` derives from the card size, kind and leaf, which are in the list.)
  const fits = useMemo(() => {
    if (!fontsReady) return null;
    const texts = cards.map(({ flavor }) => ({
      major: t.majorUppercase ? flavor.major.toLocaleUpperCase('it') : flavor.major,
      minor: flavor.minor,
    }));
    return fitBoard(texts, {
      majorBox: layout.major,
      minorBox: layout.minor,
      soloBox: layout.solo,
      majorFont: cssFont(majorFont, 100),
      minorFont: cssFont(minorFont, 100),
      measure,
    });
  }, [fontsReady, cards, size.w, size.h, theme.kind, t.leafIcon, t.majorUppercase, majorFont, minorFont]);

  return (
    <div className="board" style={{ width: BOARD_W, height: BOARD_H, backgroundColor: bg.dot }}>
      {theme.chalkText && <ChalkFilter />}
      {t.frame && <Frame theme={theme} />}
      <div
        className="board-surface"
        style={{
          ...bg.css,
          left: inner.x,
          top: inner.y,
          width: inner.w,
          height: inner.h,
          boxShadow: t.frame ? theme.frame.innerShadow(bg) : undefined,
        }}
      />
      {t.header && fontsReady && <Header area={inner} title={style.title} theme={theme} font={headerFont} />}
      {fits &&
        cards.map((c, i) => {
          const cell = cellRect(board, chrome, c.row, c.col);
          return (
            <Card
              key={c.flavor.id}
              theme={theme}
              swatch={cardSwatch}
              flavor={c.flavor}
              fit={fits[i]}
              cell={cell}
              size={size}
              layout={layout}
              transform={jitterTransform(c.placement.jitter, t.natural, cell)}
              majorFont={majorFont}
              minorFont={minorFont}
              leaf={t.leafIcon}
            />
          );
        })}
      {children}
    </div>
  );
}

function Frame({ theme }: { theme: ThemeVisual }) {
  const w = theme.frame.width;
  return (
    <>
      <div className="board-frame" style={theme.frame.css} />
      {theme.frame.sideCss &&
        [0, BOARD_W - w].map((left) => (
          <div
            key={left}
            className="board-frame"
            style={{ ...theme.frame.css, ...theme.frame.sideCss, left, width: w, top: 0, height: BOARD_H }}
          />
        ))}
    </>
  );
}

/** Band at the top: logo and title between two thin rules. */
function Header({ area, title, theme, font }: { area: Rect; title: string; theme: ThemeVisual; font: FontSpec }) {
  const logo = HEADER_H * 0.78;
  // The title shrinks if it's too long for the band.
  const maxW = area.w * 0.55;
  const size = Math.min(HEADER_H * 0.62, (maxW / Math.max(1, measure(title, cssFont(font, 100)))) * 100);
  return (
    <div className="board-header" style={{ left: area.x, top: area.y + 14, width: area.w, height: HEADER_H }}>
      <span className="header-rule" style={{ background: theme.header.rule }} />
      <img src={logoUrl} alt="" style={{ height: logo, width: logo }} className="header-logo" />
      <span
        className={`header-title ${theme.chalkText ? 'chalky' : ''}`}
        style={{ font: cssFont(font, size), color: theme.header.color }}
      >
        {title}
      </span>
      <span className="header-rule" style={{ background: theme.header.rule }} />
    </div>
  );
}

interface CardProps {
  theme: ThemeVisual;
  swatch: CardSwatch;
  flavor: Flavor;
  fit: CardFit;
  cell: Rect;
  size: { w: number; h: number };
  layout: CardLayout;
  transform: { dx: number; dy: number; rot: number };
  majorFont: FontSpec;
  minorFont: FontSpec;
  leaf: boolean;
}

const rectStyle = (r: Rect): CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h });

function Card({ theme, swatch, flavor, fit, cell, size, layout, transform, majorFont, minorFont, leaf }: CardProps) {
  const ink = swatch.ink;
  const majorColor = flavor.vegan ? ink.vegan : ink.regular;
  const minorColor = flavor.vegan ? (ink.minorVegan ?? ink.vegan) : (ink.minorRegular ?? ink.regular);
  const kind = theme.kind;
  const textClass = `card-slot ${theme.chalkText ? 'chalky' : ''}`;

  const wrapStyle: CSSProperties = {
    left: cell.x + (cell.w - size.w) / 2,
    top: cell.y + (cell.h - size.h) / 2,
    width: size.w,
    height: size.h,
    transform: `translate(${transform.dx}px, ${transform.dy}px) rotate(${transform.rot}deg)`,
  };

  let face: CSSProperties = {};
  if (kind === 'cardboard') face = { clipPath: handCutClip(flavor.id), background: swatch.surface };
  if (kind === 'polaroid') face = { backgroundImage: FINE_GRAIN, backgroundColor: '#fbfaf6' };
  if (kind === 'rounded') face = { background: swatch.surface };

  return (
    <div className={`card-wrap kind-${kind}`} style={wrapStyle}>
      <div className={`card kind-${kind} ${flavor.soldOut ? 'sold-out' : ''}`} style={face}>
        {layout.window && <div className="polaroid-window" style={{ ...rectStyle(layout.window), background: swatch.surface }} />}
        {kind === 'chalk' && swatch.outline && (
          <svg className="chalk-outline" width={size.w} height={size.h}>
            <path d={chalkOutline(flavor.id, size.w, size.h)} stroke={ink.regular} />
          </svg>
        )}
        <div className={textClass} style={{ ...rectStyle(fit.minor ? layout.major : layout.solo), color: majorColor }}>
          <div style={{ font: cssFont(majorFont, fit.major.size), lineHeight: LINE_HEIGHT }}>
            {fit.major.lines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
        {fit.minor && (
          <div className={textClass} style={{ ...rectStyle(layout.minor), color: minorColor }}>
            <div style={{ font: cssFont(minorFont, fit.minor.size), lineHeight: LINE_HEIGHT }}>
              {fit.minor.lines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        )}
        {leaf && flavor.vegan && <Leaf rect={layout.leaf} color={ink.leaf} />}
      </div>
      {flavor.soldOut && (
        <div className="sold-out-band" style={{ fontFamily: '"Patrick Hand"', fontSize: size.h * 0.15 }}>
          Esaurito · Sold out
        </div>
      )}
    </div>
  );
}

function Leaf({ rect, color }: { rect: Rect; color: string }) {
  return (
    <svg className="leaf" viewBox="0 0 24 24" style={{ ...rectStyle(rect), color }} aria-label="vegano">
      <path d="M4 20C4 11 9 5 21 3c-1 11-7 17-17 17z" fill="currentColor" />
      <path d="M4.5 19.5C8 15 11 11.5 16 8" stroke="rgba(0,0,0,.45)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Chalk effect, as an SVG filter applied to the text: a fine noise pattern
 * punches tiny holes in the letters (chalk doesn't cover the board fully)
 * and a coarser one wobbles the edges a little.
 */
function ChalkFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="chalk-text" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="3" result="noise" />
        <feColorMatrix in="noise" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 2.2" result="mask" />
        <feComposite in="SourceGraphic" in2="mask" operator="in" result="eroded" />
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="8" result="wobble" />
        <feDisplacementMap in="eroded" in2="wobble" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

/** The board scaled to fill its container (keeping 16:9), centred. */
export function ScaledBoard({ data, children }: { data: AppData; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  // ResizeObserver tells us whenever the container changes size (window
  // resized, panel collapsed...), so the board always fits exactly.
  useLayoutEffect(() => {
    const el = ref.current!;
    const update = () => setScale(Math.min(el.clientWidth / BOARD_W, el.clientHeight / BOARD_H));
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="scaled-board">
      <div style={{ width: BOARD_W * scale, height: BOARD_H * scale, flex: 'none' }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
          <Board data={data}>{children}</Board>
        </div>
      </div>
    </div>
  );
}
