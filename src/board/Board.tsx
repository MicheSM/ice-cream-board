import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { AppData, BoardConfig, Flavor, Placement } from '../model/types';
import { cellKey } from '../model/types';
import { FONTS } from './fonts';
import {
  BOARD_H,
  BOARD_W,
  CARD_PAD_X,
  CARD_PAD_Y,
  FRAME,
  cardSize,
  cellRect,
  handCutClip,
  jitterTransform,
  textBox,
  type Rect,
} from './layout';
import { fitBoard, LINE_HEIGHT, MAJOR_SHARE, type CardFit, type Measure } from './textFit';
import { CARD_FIBERS, CARD_GRAIN, HAMMERED_SILVER, PAPER_BLOTCHES, PAPER_GRAIN } from './textures';
import './board.css';

const INK_VEGAN = '#9edcaa';
const INK_REGULAR = '#f3f0e7';

// Measures text with the real font via an off-screen <canvas>. Widths are
// cached: the same text in the same font always has the same width.
const measure: Measure = (() => {
  const ctx = document.createElement('canvas').getContext('2d')!;
  const cache = new Map<string, number>();
  return (text, font) => {
    const key = `${font}|${text}`;
    let w = cache.get(key);
    if (w === undefined) {
      ctx.font = `100px "${font}"`;
      w = ctx.measureText(text).width;
      cache.set(key, w);
    }
    return w;
  };
})();

/** True once the given font families are downloaded and usable (measuring before that would give wrong sizes). */
function useFontsReady(families: string[]) {
  const key = families.join('|');
  const [readyKey, setReadyKey] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all(key.split('|').map((f) => document.fonts.load(`100px "${f}"`))).then(() => {
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
  const majorFont = FONTS[style.majorFont].family;
  const minorFont = FONTS[style.minorFont].family;
  const fontsReady = useFontsReady([majorFont, minorFont]);

  const cards = useMemo(() => placedCards(board, flavors), [board, flavors]);
  const size = cardSize(board);

  const fits = useMemo(() => {
    if (!fontsReady) return null;
    const texts = cards.map(({ flavor }) => ({
      major: style.majorUppercase ? flavor.major.toLocaleUpperCase('it') : flavor.major,
      minor: flavor.minor,
    }));
    return fitBoard(texts, { box: textBox(size), majorFont, minorFont, measure });
  }, [fontsReady, cards, size.w, size.h, style.majorUppercase, majorFont, minorFont]);

  return (
    <div className="board" style={{ width: BOARD_W, height: BOARD_H }}>
      {board.frame && <div className="board-frame" style={{ backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,0) 40%, rgba(0,0,0,.18)), ${HAMMERED_SILVER}` }} />}
      <div
        className={`board-paper ${board.frame ? 'framed' : ''}`}
        style={{ inset: board.frame ? FRAME : 0, backgroundImage: `${PAPER_GRAIN}, ${PAPER_BLOTCHES}, radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(60,0,0,.28))` }}
      />
      {fits &&
        cards.map((c, i) => (
          <Card
            key={c.flavor.id}
            flavor={c.flavor}
            fit={fits[i]}
            cell={cellRect(board, c.row, c.col)}
            size={size}
            transform={jitterTransform(c.placement.jitter, board.natural, cellRect(board, c.row, c.col))}
            majorFont={majorFont}
            minorFont={minorFont}
            leaf={style.leafIcon}
          />
        ))}
      {children}
    </div>
  );
}

interface CardProps {
  flavor: Flavor;
  fit: CardFit;
  cell: Rect;
  size: { w: number; h: number };
  transform: { dx: number; dy: number; rot: number };
  majorFont: string;
  minorFont: string;
  leaf: boolean;
}

function Card({ flavor, fit, cell, size, transform, majorFont, minorFont, leaf }: CardProps) {
  const box = textBox(size);
  const wrapStyle: CSSProperties = {
    left: cell.x + (cell.w - size.w) / 2,
    top: cell.y + (cell.h - size.h) / 2,
    width: size.w,
    height: size.h,
    transform: `translate(${transform.dx}px, ${transform.dy}px) rotate(${transform.rot}deg)`,
  };
  const cardStyle = {
    clipPath: handCutClip(flavor.id),
    padding: `${size.h * CARD_PAD_Y}px ${size.w * CARD_PAD_X}px`,
    backgroundImage: `${CARD_GRAIN}, ${CARD_FIBERS}, linear-gradient(160deg, rgba(255,255,255,.04), rgba(0,0,0,.12))`,
    '--ink': flavor.vegan ? INK_VEGAN : INK_REGULAR,
  } as CSSProperties;

  return (
    <div className="card-wrap" style={wrapStyle}>
      <div className={`card ${flavor.soldOut ? 'sold-out' : ''}`} style={cardStyle}>
        <div className="card-slot" style={{ height: fit.minor ? box.h * MAJOR_SHARE : box.h }}>
          <div style={{ fontFamily: majorFont, fontSize: fit.major.size, lineHeight: LINE_HEIGHT }}>
            {fit.major.lines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
        {fit.minor && (
          <div className="card-slot" style={{ height: box.h * (1 - MAJOR_SHARE) }}>
            <div style={{ fontFamily: minorFont, fontSize: fit.minor.size, lineHeight: LINE_HEIGHT }}>
              {fit.minor.lines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        )}
        {leaf && flavor.vegan && <Leaf size={size.h * 0.19} />}
      </div>
      {flavor.soldOut && (
        <div className="sold-out-band" style={{ fontFamily: majorFont, fontSize: size.h * 0.15 }}>
          Esaurito · Sold out
        </div>
      )}
    </div>
  );
}

function Leaf({ size }: { size: number }) {
  return (
    <svg className="leaf" viewBox="0 0 24 24" width={size} height={size} aria-label="vegano">
      <path d="M4 20C4 11 9 5 21 3c-1 11-7 17-17 17z" fill="currentColor" />
      <path d="M4.5 19.5C8 15 11 11.5 16 8" stroke="#2c2320" strokeWidth="1.3" fill="none" strokeLinecap="round" />
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
