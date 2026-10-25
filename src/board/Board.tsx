import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { AppData, BoardConfig, Flavor, Placement } from '../model/types';
import { cellKey, type IngredientId } from '../model/types';
import { ingredientOf } from '../model/ingredients';
import { resolveTunables } from '../model/themeDefaults';
import logoUrl from '../assets/logo-cioccolato-argento.png';
import { cssFont, FONTS, fontStyle, tracking, type FontSpec } from './fonts';
import {
  BOARD_H,
  BOARD_W,
  HEADER_H,
  INLINE_GAP,
  bevelOf,
  cardLayout,
  cardSize,
  cellRect,
  chalkOutline,
  gridArea,
  handCutClip,
  innerArea,
  jitterTransform,
  type CardKind,
  type CardLayout,
  type Chrome,
  type Rect,
} from './layout';
import { fitBoard, LINE_HEIGHT, type CardFit, type Measure } from './textFit';
import { THEMES, chromeOf, swatch, type CardSwatch, type ThemeVisual } from './themes';
import { FINE_GRAIN } from './textures';
import { BoardBoundary } from './BoardBoundary';
import { IngredientIcon } from './ingredientIcons';
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
  // A framed card without its border is just text, so it's laid out like the menu.
  const kind = theme.kind === 'framed' && !cardSwatch.border ? 'menu' : theme.kind;
  const layout = cardLayout(kind, size, { leaf: t.leafIcon, icon: t.ingredientIcon });
  const majorTracking = tracking(majorFont, t.majorUppercase);
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
      majorTracking,
      measure,
    });
  }, [fontsReady, cards, size.w, size.h, kind, t.leafIcon, t.ingredientIcon, t.majorUppercase, majorFont, minorFont, majorTracking]);

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
      {cardSwatch.dividers && <Dividers board={board} chrome={chrome} {...cardSwatch.dividers} />}
      {theme.fillEmpty && <EmptySquares board={board} chrome={chrome} size={size} swatch={cardSwatch} kind={theme.kind} />}
      {fits &&
        cards.map((c, i) => {
          const cell = cellRect(board, chrome, c.row, c.col);
          return (
            <Card
              key={c.flavor.id}
              theme={theme}
              kind={kind}
              swatch={cardSwatch}
              flavor={c.flavor}
              fit={fits[i]}
              cell={cell}
              size={size}
              layout={layout}
              transform={jitterTransform(c.placement.jitter, t.natural, cell)}
              majorFont={majorFont}
              minorFont={minorFont}
              majorTracking={majorTracking}
              leaf={t.leafIcon}
              ingredient={t.ingredientIcon ? ingredientOf(c.flavor) : null}
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
  const { color, rule, ruleHeight = 3, uppercase = false, band } = theme.header;
  const text = uppercase ? title.toLocaleUpperCase('it') : title;
  const spacing = tracking(font, uppercase);
  const logo = HEADER_H * 0.78;
  // The title shrinks if it's too long for the band.
  const maxW = area.w * 0.55;
  const width100 = measure(text, cssFont(font, 100)) + spacing * 100 * [...text].length;
  const size = Math.min(HEADER_H * (uppercase ? 0.5 : 0.62), (maxW / Math.max(1, width100)) * 100);
  const top = area.y + 14;
  const ruleStyle = { background: rule, height: ruleHeight };
  return (
    <>
      {band && <div className="header-band" style={{ ...band, top: top + 8, height: HEADER_H - 16 }} />}
      <div className="board-header" style={{ left: area.x, top, width: area.w, height: HEADER_H }}>
        <span className="header-rule" style={ruleStyle} />
        <img src={logoUrl} alt="" style={{ height: logo, width: logo }} className="header-logo" />
        <span
          className={`header-title ${theme.chalkText ? 'chalky' : ''}`}
          style={{ ...fontStyle(font, size), color, letterSpacing: `${spacing}em`, marginRight: `-${spacing}em` }}
        >
          {text}
        </span>
        <span className="header-rule" style={ruleStyle} />
      </div>
    </>
  );
}

/**
 * Menu style: hairlines instead of cards. `rows` puts a short line between
 * two flavours that are one above the other; `columns` a long line between
 * the columns.
 */
function Dividers({ board, chrome, color, rows, columns }: { board: BoardConfig; chrome: Chrome; color: string; rows?: boolean; columns?: boolean }) {
  const area = gridArea(chrome);
  const cellW = area.w / board.cols;
  const cellH = area.h / board.rows;
  const lines: CSSProperties[] = [];
  if (columns)
    for (let c = 1; c < board.cols; c++)
      lines.push({ left: area.x + c * cellW - 0.75, top: area.y + cellH * 0.12, width: 1.5, height: area.h - cellH * 0.24 });
  if (rows)
    for (let r = 0; r < board.rows - 1; r++)
      for (let c = 0; c < board.cols; c++)
        if (board.cells[cellKey(r, c)] && board.cells[cellKey(r + 1, c)]) {
          const w = Math.min(90, cellW * 0.16);
          lines.push({ left: area.x + c * cellW + (cellW - w) / 2, top: area.y + (r + 1) * cellH - 0.75, width: w, height: 1.5 });
        }
  return lines.map((l, i) => <div key={i} className="divider" style={{ ...l, background: color }} />);
}

/** Tablet style: the squares of the bar where there is no flavour. */
function EmptySquares({ board, chrome, size, swatch, kind }: { board: BoardConfig; chrome: Chrome; size: { w: number; h: number }; swatch: CardSwatch; kind: CardKind }) {
  const out: ReactNode[] = [];
  for (let row = 0; row < board.rows; row++)
    for (let col = 0; col < board.cols; col++) {
      if (board.cells[cellKey(row, col)]) continue;
      const cell = cellRect(board, chrome, row, col);
      out.push(
        <div
          key={cellKey(row, col)}
          className={`card-wrap kind-${kind}`}
          style={{ left: cell.x + (cell.w - size.w) / 2, top: cell.y + (cell.h - size.h) / 2, width: size.w, height: size.h }}
        >
          <div className={`card kind-${kind}`} style={{ background: swatch.surface }}>
            <div className="card-bevel" style={{ borderWidth: bevelOf(size) }} />
          </div>
        </div>,
      );
    }
  return out;
}

interface CardProps {
  theme: ThemeVisual;
  kind: CardKind;
  swatch: CardSwatch;
  flavor: Flavor;
  fit: CardFit;
  cell: Rect;
  size: { w: number; h: number };
  layout: CardLayout;
  transform: { dx: number; dy: number; rot: number };
  majorFont: FontSpec;
  minorFont: FontSpec;
  majorTracking: number;
  leaf: boolean;
  ingredient: IngredientId | null;
}

const rectStyle = (r: Rect): CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h });

function Card({ theme, kind, swatch, flavor, fit, cell, size, layout, transform, majorFont, minorFont, majorTracking, leaf, ingredient }: CardProps) {
  const ink = swatch.ink;
  const majorColor = flavor.vegan ? ink.vegan : ink.regular;
  const minorColor = flavor.vegan ? (ink.minorVegan ?? ink.vegan) : (ink.minorRegular ?? ink.regular);
  const textClass = `card-slot ${theme.chalkText ? 'chalky' : ''}`;
  const showLeaf = leaf && flavor.vegan;
  // The icon follows the colour rule too: green on vegan flavours.
  const iconColor = flavor.vegan ? majorColor : (ink.icon ?? majorColor);
  const gap = size.h * INLINE_GAP;
  // Inline marks sit on the capitals' middle (about 0.34em above the baseline), like words.
  const inlineMark = (px: number, side: 'left' | 'right'): CSSProperties => ({
    width: px,
    height: px,
    [side === 'left' ? 'marginRight' : 'marginLeft']: gap,
    verticalAlign: `calc(0.34em - ${px / 2}px)`,
  });

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
  if (kind === 'rounded' || kind === 'framed' || kind === 'tablet') face = { background: swatch.surface, boxShadow: swatch.shadow };
  const border = kind === 'framed' && swatch.border;
  const borderW = border ? Math.max(1.5, size.h * border.width) : 0;

  return (
    <div className={`card-wrap kind-${kind}`} style={wrapStyle}>
      <div className={`card kind-${kind} ${flavor.soldOut ? 'sold-out' : ''}`} style={face}>
        {layout.window && <div className="polaroid-window" style={{ ...rectStyle(layout.window), background: swatch.surface }} />}
        {kind === 'tablet' && <div className="card-bevel" style={{ borderWidth: bevelOf(size) }} />}
        {border && (
          // The border is its own layer (not the card's CSS border), so the text slots keep their positions.
          <div
            className="card-edge"
            style={{
              borderWidth: borderW,
              borderImage: `${border.color} 1`,
              outline: border.inner ? `${Math.max(1, size.h * 0.007)}px solid ${border.inner}` : undefined,
              outlineOffset: -(borderW + size.h * 0.03),
            }}
          />
        )}
        {kind === 'chalk' && swatch.outline && (
          <svg className="chalk-outline" width={size.w} height={size.h}>
            <path d={chalkOutline(flavor.id, size.w, size.h)} stroke={ink.regular} />
          </svg>
        )}
        <div
          className={`${textClass} ${fit.minor ? 'slot-major' : ''}`}
          style={{ ...rectStyle(fit.minor ? layout.major : layout.solo), color: majorColor, textShadow: ink.shadow }}
        >
          <div style={{ ...fontStyle(majorFont, fit.major.size), lineHeight: LINE_HEIGHT, letterSpacing: `${majorTracking}em` }}>
            {fit.major.lines.map((l, i, all) => (
              // CSS adds the letter spacing after the last letter too: the negative margin takes it back, so the text stays centred.
              <div key={i} style={{ marginRight: `-${majorTracking}em` }}>
                {ingredient && layout.inline && i === 0 && (
                  <IngredientIcon
                    id={ingredient}
                    className={theme.chalkText ? 'chalky' : ''}
                    style={{ ...inlineMark(Math.min(layout.icon.w, fit.major.size * 1.1), 'left'), color: iconColor }}
                  />
                )}
                {l}
                {showLeaf && layout.inline && i === all.length - 1 && (
                  <Leaf style={inlineMark(Math.min(layout.leaf.w, fit.major.size * 0.62), 'right')} color={ink.leaf} />
                )}
              </div>
            ))}
          </div>
        </div>
        {fit.minor && (
          <div className={`${textClass} slot-minor`} style={{ ...rectStyle(layout.minor), color: minorColor, textShadow: ink.shadow }}>
            <div style={{ ...fontStyle(minorFont, fit.minor.size), lineHeight: LINE_HEIGHT }}>
              {fit.minor.lines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        )}
        {showLeaf && !layout.inline && <Leaf style={{ ...rectStyle(layout.leaf), position: 'absolute' }} color={ink.leaf} />}
        {ingredient && !layout.inline && (
          <IngredientIcon
            id={ingredient}
            className={theme.chalkText ? 'chalky' : ''}
            style={{ ...rectStyle(layout.icon), position: 'absolute', color: iconColor }}
          />
        )}
      </div>
      {flavor.soldOut && <SoldOut theme={theme} size={size} />}
    </div>
  );
}

/** The "sold out" strip across a card, in the preset's header font; the text shrinks on narrow cards. */
function SoldOut({ theme, size }: { theme: ThemeVisual; size: { w: number; h: number } }) {
  const font = FONTS[theme.header.font];
  const caps = theme.header.uppercase ?? false;
  const spacing = tracking(font, caps);
  const text = caps ? 'ESAURITO · SOLD OUT' : 'Esaurito · Sold out';
  const width100 = measure(text, cssFont(font, 100)) + spacing * 100 * text.length;
  const px = Math.min(size.h * (caps ? 0.12 : 0.15), ((size.w * 0.82) / width100) * 100);
  return (
    <div className="sold-out-band" style={{ ...fontStyle(font, px), letterSpacing: `${spacing}em`, textIndent: `${spacing}em` }}>
      {text}
    </div>
  );
}

/** The vegan leaf; `style` places it (in a corner of the card, or after the name). */
function Leaf({ style, color }: { style: CSSProperties; color: string }) {
  return (
    <svg className="leaf" viewBox="0 0 24 24" style={{ ...style, color }} aria-label="vegano">
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
          <BoardBoundary resetKey={data} fallback={<div className="board" style={{ width: BOARD_W, height: BOARD_H }}>{children}</div>}>
            <Board data={data}>{children}</Board>
          </BoardBoundary>
        </div>
      </div>
    </div>
  );
}
