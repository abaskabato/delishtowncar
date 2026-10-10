import type { VehicleId } from "@/lib/config";

// Side-profile drawings of the two cars, used until real photos are added.
// Front of the car faces right.

const BODY: Record<VehicleId, string> = {
  sedan:
    "M14,82 C14,72 20,68 34,66 L92,60 C108,44 128,34 156,32 L206,32 C228,32 244,44 262,58 L292,62 C304,64 310,70 310,80 L310,90 L267,90 A21,21 0 0 0 225,90 L99,90 A21,21 0 0 0 57,90 L14,90 Z",
  suv:
    "M14,90 L14,30 C14,22 20,18 28,18 L226,18 C236,18 242,21 248,28 L272,52 L298,58 C306,60 310,66 310,74 L310,90 L267,90 A21,21 0 0 0 225,90 L99,90 A21,21 0 0 0 57,90 L14,90 Z",
};

const WINDOWS: Record<VehicleId, string[]> = {
  sedan: ["M104,60 C118,46 134,39 154,38 L176,38 L176,60 Z", "M182,38 L205,38 C222,38 236,47 250,59 L182,60 Z"],
  suv: ["M26,26 L70,26 L70,52 L26,52 Z", "M76,26 L150,26 L150,52 L76,52 Z", "M156,26 L222,26 C230,26 236,29 240,34 L258,52 L156,52 Z"],
};

export default function VehicleArt({ vehicle, className }: { vehicle: VehicleId; className?: string }) {
  const id = `va-${vehicle}`;
  const beltY = vehicle === "sedan" ? 72 : 66;
  return (
    <svg className={className} viewBox="0 0 324 120" role="img" aria-label={vehicle === "sedan" ? "Black sedan" : "Black luxury SUV"}>
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a404c" />
          <stop offset=".45" stopColor="#15181e" />
          <stop offset="1" stopColor="#07080a" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6f86a8" />
          <stop offset=".55" stopColor="#24324a" />
          <stop offset="1" stopColor="#131b29" />
        </linearGradient>
      </defs>
      <ellipse cx="162" cy="108" rx="150" ry="6" fill="#000" opacity=".22" />
      <path d={BODY[vehicle]} fill={`url(#${id}-paint)`} stroke="#9aa4b4" strokeWidth="1.2" strokeOpacity=".7" />
      {WINDOWS[vehicle].map((d) => (
        <path key={d} d={d} fill={`url(#${id}-glass)`} />
      ))}
      <line x1="24" y1={beltY} x2="302" y2={beltY} stroke="#c9d1dc" strokeWidth="1.6" strokeOpacity=".75" />
      {/* Headlight (front, right) and taillight (rear, left). */}
      <rect x="298" y={beltY - 6} width="10" height="4" rx="2" fill="#dbe8ff" />
      <rect x="15" y={beltY - 6} width="7" height="5" rx="2" fill="#d6283f" />
      {[78, 246].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="90" r="18" fill="#0b0c0f" stroke="#2c313b" strokeWidth="2" />
          <circle cx={cx} cy="90" r="9" fill="#b9c2cf" />
          <circle cx={cx} cy="90" r="3.5" fill="#4a5262" />
        </g>
      ))}
    </svg>
  );
}
