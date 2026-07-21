import { useEffect, useRef, useState } from 'react';
import MetricIcon from './MetricIcon';

/** Colour + icon for each of the 6 metric axes. */
const META = [
  { color: '#8B5CF6', icon: 'ri-body-scan-line' },
  { color: '#3B82F6', icon: 'ri-flashlight-line' },
  { color: '#22C55E', icon: 'ri-heart-pulse-line' },
  { color: '#F97316', icon: 'custom-chest' },
  { color: '#EF4444', icon: 'custom-legs' },
  { color: '#EC4899', icon: 'custom-back' },
];

const DEFAULT_VALUES = [75, 66, 45, 75, 86, 85];
const HEX_ANGLES = [270, 330, 30, 90, 150, 210];

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function hexPoints(cx: number, cy: number, r: number) {
  return HEX_ANGLES.map((a) => polar(cx, cy, r, a));
}

function pointsToPath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function useCountUp(target: number, duration: number, enabled: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    startRef.current = null;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const progress = Math.min((now - startRef.current) / duration, 1);
      setValue(Math.round(target * easeOutExpo(progress)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, target, duration]);

  return value;
}

function useAnimatedProgress(duration: number, enabled: boolean) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    startRef.current = null;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const p = Math.min((now - startRef.current) / duration, 1);
      setProgress(easeOutExpo(p));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, duration]);

  return progress;
}

interface MetricRadarProps {
  className?: string;
  /** Central score — number animates, string shows as-is. */
  score?: number | string;
  /** Optional delta shown under the score. */
  delta?: number;
  /** Six axis values 0-100 driving the polygon shape. */
  values?: number[];
  /** Renders an empty / dimmed state (used for the "you" slot). */
  placeholder?: boolean;
}

/** Hexagon radar chart with a central fitness score. */
export default function MetricRadar({
  className = '',
  score = 92,
  delta,
  values = DEFAULT_VALUES,
  placeholder = false,
}: MetricRadarProps) {
  const [hexRevealed, setHexRevealed] = useState(false);
  const [fillRevealed, setFillRevealed] = useState(false);
  const [iconsRevealed, setIconsRevealed] = useState(false);

  const polygonProgress = useAnimatedProgress(1200, fillRevealed);
  const numericScore = typeof score === 'number' ? score : 0;
  const counted = useCountUp(numericScore, 1600, fillRevealed && typeof score === 'number');
  const displayScore = typeof score === 'number' ? counted : score;

  useEffect(() => {
    const t1 = setTimeout(() => setHexRevealed(true), 250);
    const t2 = setTimeout(() => setFillRevealed(true), 700);
    const t3 = setTimeout(() => setIconsRevealed(true), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const cx = 350;
  const cy = 350;
  const maxR = 260;

  const outerHex = hexPoints(cx, cy, maxR);

  const dataHex = META.map((_, i) => {
    const v = values[i] ?? 0;
    const targetR = maxR * (v / 100);
    return polar(cx, cy, targetR * polygonProgress, HEX_ANGLES[i]);
  });

  const outerPath = pointsToPath(outerHex);
  const dataPath = pointsToPath(dataHex);
  const dotsOpacity = Math.min(polygonProgress * 2, 1);

  return (
    <div className={`relative aspect-square ${className}`}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 700">
        <defs>
          <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4715D" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#D4A574" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#B8A88A" stopOpacity="0.20" />
          </linearGradient>
        </defs>

        {/* Outer hex frame — permanent base */}
        <path
          d={outerPath}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.5"
          className={`transition-opacity duration-1000 ${hexRevealed ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Glow travelling along the hexagon edge */}
        <path
          d={outerPath}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`hex-trace transition-opacity duration-1000 ${hexRevealed ? 'opacity-100' : 'opacity-0'}`}
          style={{ filter: 'drop-shadow(0 0 7px rgba(255,255,255,0.85))' }}
        />

        {/* Axis lines */}
        {outerHex.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            className={`transition-opacity duration-700 ${hexRevealed ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: `${i * 80}ms` }}
          />
        ))}

        {/* Data polygon */}
        {!placeholder && (
          <path
            d={dataPath}
            fill="url(#radarGrad)"
            stroke="#C4715D"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity={fillRevealed ? 1 : 0}
            style={{
              filter: 'drop-shadow(0 0 16px rgba(196,113,93,0.3))',
              transition: 'opacity 0.4s ease',
            }}
          />
        )}

        {/* Data vertices */}
        {!placeholder &&
          dataHex.map((p, i) => (
            <g
              key={`dot-${i}`}
              opacity={fillRevealed ? dotsOpacity : 0}
              style={{ transition: 'opacity 0.3s ease' }}
            >
              <circle cx={p.x} cy={p.y} r="6" fill={META[i].color} opacity="0.9" />
              <circle cx={p.x} cy={p.y} r="14" fill={META[i].color} opacity="0.12" />
            </g>
          ))}

        {/* Outer vertex icons */}
        {outerHex.map((p, i) => {
          const iconSize = 36;
          const x = p.x - iconSize / 2;
          const y = p.y - iconSize / 2;
          return (
            <g
              key={`icon-${i}`}
              className={`transition-all duration-500 ${iconsRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
              style={{ transitionDelay: `${1000 + i * 80}ms`, transformOrigin: `${p.x}px ${p.y}px` }}
            >
              <rect
                x={x - 6}
                y={y - 6}
                width={iconSize + 12}
                height={iconSize + 12}
                rx="12"
                fill="rgba(10,10,10,0.9)"
                stroke={META[i].color}
                strokeWidth="1.5"
                strokeOpacity={placeholder ? 0.2 : 0.4}
              />
              <foreignObject x={x} y={y} width={iconSize} height={iconSize}>
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ color: META[i].color, opacity: placeholder ? 0.4 : 1 }}
                >
                  <MetricIcon name={META[i].icon} className="text-lg" />
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Center score */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`flex flex-col items-center text-center transition-all duration-700 ${
            fillRevealed ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        >
          <span className="text-display text-5xl sm:text-6xl leading-none tracking-tight drop-shadow-lg min-w-[2ch] text-white">
            {displayScore}
          </span>
          {delta !== undefined && !placeholder ? (
            <span className="mt-1 inline-flex items-center gap-1 text-white/60 text-sm">
              <i className="ri-arrow-up-s-fill text-terracotta" />
              {delta}
            </span>
          ) : null}
          <span
            className={`text-[10px] uppercase tracking-widest2 mt-1 ${
              placeholder ? 'text-white/80' : 'text-white/30'
            }`}
          >
            hero score
          </span>
        </div>
      </div>
    </div>
  );
}
