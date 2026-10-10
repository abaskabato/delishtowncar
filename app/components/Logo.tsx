// The Delish Town Car badge: gold rings, a band of Ethiopian-style crosses and
// wine diamonds (from the Delish Ethiopian Cuisine badge), and a gold sedan.

const CROSS_COUNT = 28;
const TEETH = 56;

function Sedan({ fill, hub, x, y, width }: { fill: string; hub: string; x: number; y: number; width: number }) {
  return (
    <svg x={x} y={y} width={width} height={(width * 60) / 200} viewBox="0 0 200 60">
      <path
        fill={fill}
        fillRule="evenodd"
        d="M8,42 C8,36 13,33 22,32 L54,29 C64,21 76,15 94,14 L128,14 C143,14 153,21 164,28 L186,31 C194,32 198,37 198,42 L198,46 L181,46 A15,15 0 0 0 151,46 L63,46 A15,15 0 0 0 33,46 L8,46 Z M62,29 C70,22 80,18 93,18 L107,18 L107,29 Z M112,18 L128,18 C139,18 147,23 155,29 L112,29 Z"
      />
      <circle cx="48" cy="46" r="11" fill={fill} />
      <circle cx="48" cy="46" r="5" fill={hub} />
      <circle cx="166" cy="46" r="11" fill={fill} />
      <circle cx="166" cy="46" r="5" fill={hub} />
    </svg>
  );
}

function GoldGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f1dc9c" />
      <stop offset=".45" stopColor="#c9a24a" />
      <stop offset=".75" stopColor="#9c7a2e" />
      <stop offset="1" stopColor="#d9b866" />
    </linearGradient>
  );
}

function Ring({ gold }: { gold: string }) {
  return (
    <g>
      {Array.from({ length: CROSS_COUNT }, (_, i) => (
        <g key={i} transform={`rotate(${(i * 360) / CROSS_COUNT}) translate(0 -83)`}>
          {i % 2 === 0 ? (
            <>
              <rect x={-1.4} y={-5.5} width={2.8} height={11} fill={gold} />
              <rect x={-5.5} y={-1.4} width={11} height={2.8} fill={gold} />
              {[[0, -7], [0, 7], [-7, 0], [7, 0]].map(([cx, cy]) => (
                <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={1.3} fill="#c9a24a" />
              ))}
            </>
          ) : (
            <rect x={-3.6} y={-3.6} width={7.2} height={7.2} transform="rotate(45)" fill="#8e1b26" stroke="#c9a24a" strokeWidth={0.7} />
          )}
        </g>
      ))}
      {Array.from({ length: TEETH }, (_, i) => (
        <path key={i} d="M-1.6,-74 L1.6,-74 L0,-71.5 Z" transform={`rotate(${(i * 360) / TEETH + 360 / (TEETH * 2)})`} fill="#c9a24a" />
      ))}
    </g>
  );
}

export function Badge({ id, size = 200, title = "Delish Town Car" }: { id: string; size?: number; title?: string }) {
  const gold = `url(#${id}-gold)`;
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" role="img" aria-label={title}>
      <defs>
        <GoldGradient id={`${id}-gold`} />
        <path id={`${id}-top`} d="M -62,0 A 62,62 0 0 1 62,0" />
        <path id={`${id}-bot`} d="M -63,0 A 63,63 0 0 0 63,0" />
      </defs>
      <circle r="99" fill="#0d0b0a" />
      <circle r="97" fill="none" stroke={gold} strokeWidth="1.6" />
      <circle r="92" fill="none" stroke={gold} strokeWidth=".6" />
      <Ring gold={gold} />
      <circle r="74" fill="none" stroke={gold} strokeWidth=".6" />
      <circle r="71" fill="#0d0b0a" stroke={gold} strokeWidth="1.4" />
      <text fontFamily="var(--font-logo), Georgia, serif" fontSize="7.2" letterSpacing="3.2" fill="#c9a24a" textAnchor="middle">
        <textPath href={`#${id}-top`} startOffset="50%">SEATTLE</textPath>
      </text>
      <text fontFamily="var(--font-logo), Georgia, serif" fontSize="7.2" letterSpacing="3.2" fill="#c9a24a" textAnchor="middle">
        <textPath href={`#${id}-bot`} startOffset="50%">SEA-TAC</textPath>
      </text>
      <Sedan fill={gold} hub="#0d0b0a" x={-46} y={-40} width={92} />
      <text y="18" fontFamily="var(--font-script), cursive" fontSize="34" fill={gold} textAnchor="middle">Delish</text>
      <line x1="-34" y1="28" x2="34" y2="28" stroke="#8e1b26" strokeWidth="1.2" />
      <text y="40" fontFamily="var(--font-logo), Georgia, serif" fontWeight="600" fontSize="8.6" letterSpacing="4" fill="#e6cc86" textAnchor="middle">
        TOWN CAR
      </text>
    </svg>
  );
}

// Small badge plus "DELISH / TOWN CAR" for the site header.
export function HeaderLogo() {
  const id = "hdr";
  const gold = `url(#${id}-gold)`;
  return (
    <svg viewBox="0 0 380 92" height="46" role="img" aria-label="Delish Town Car">
      <defs>
        <GoldGradient id={`${id}-gold`} />
      </defs>
      <g transform="translate(46 46) scale(.44)">
        <circle r="99" fill="#0d0b0a" />
        <circle r="97" fill="none" stroke={gold} strokeWidth="2.4" />
        <circle r="92" fill="none" stroke={gold} strokeWidth="1" />
        <Ring gold={gold} />
        <circle r="71" fill="#0d0b0a" stroke={gold} strokeWidth="2" />
        <Sedan fill={gold} hub="#0d0b0a" x={-50} y={-36} width={100} />
        <text y="30" fontFamily="var(--font-script), cursive" fontSize="40" fill={gold} textAnchor="middle">Delish</text>
      </g>
      {/* Wordmark colors come from the theme (see .logo-word in globals.css). */}
      <text className="logo-word" x="104" y="50" fontFamily="var(--font-logo), Georgia, serif" fontWeight="700" fontSize="38" letterSpacing="7">
        DELISH
      </text>
      <line className="logo-rule" x1="106" y1="60" x2="372" y2="60" strokeWidth="1.2" />
      <text className="logo-sub" x="106" y="80" fontFamily="var(--font-logo), Georgia, serif" fontWeight="500" fontSize="12.5" letterSpacing="7.2">
        TOWN CAR · SEATTLE
      </text>
    </svg>
  );
}
