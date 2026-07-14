import { MapPin } from "lucide-react";

interface LocationMapProps {
  locations: string[];
}

const markers = [
  { match: "Johor", x: 250, y: 252 },
  { match: "Kuala Lumpur", x: 195, y: 182 },
  { match: "Selangor", x: 181, y: 177 },
  { match: "Penang", x: 142, y: 102 },
  { match: "Sabah", x: 527, y: 105 },
  { match: "Sarawak", x: 417, y: 183 },
];

export function LocationMap({ locations }: LocationMapProps) {
  const active = markers.filter((marker) => locations.some((location) => location.includes(marker.match)));
  return (
    <div className="border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[0.14em] text-leaf uppercase">Location spread</p><h3 className="mt-1 font-display text-2xl font-bold text-forest">Matches across Malaysia</h3></div><MapPin className="size-5 text-leaf" /></div>
      <svg viewBox="0 0 640 300" className="mt-5 w-full" role="img" aria-label={`Map showing ${active.length} matched university locations`}>
        <path d="M123 48c35 11 66 47 82 84 17 39 39 83 76 120-21 18-47 14-66-8-37-43-56-88-74-124-18-37-32-55-18-72Z" fill="#dff2e9" stroke="#247158" strokeWidth="3" />
        <path d="M342 143c54-42 98-78 171-75 47 2 71 20 77 51-38 1-58 18-80 39-31 29-89 60-153 59-22-1-36-17-15-74Z" fill="#dff2e9" stroke="#247158" strokeWidth="3" />
        {active.map((marker) => <g key={marker.match} transform={`translate(${marker.x} ${marker.y})`}><circle r="14" fill="#123f32" opacity="0.15" /><circle r="6" fill="#123f32" /><text y="-18" textAnchor="middle" fontSize="12" fontWeight="700" fill="#10231d">{marker.match}</text></g>)}
      </svg>
    </div>
  );
}
