import { useState } from 'react';
import { Maximize2, X, Ruler } from 'lucide-react';

interface RoomDetail {
  name: string;
  category: string;
  dimension: string;
  area: string;
  description: string;
}

const ROOM_DATA: RoomDetail[] = [
  {
    name: 'Living & Dining Great Hall',
    category: 'Living',
    dimension: "24'-0\" × 16'-6\"",
    area: '396 Sq.Ft',
    description: 'Central open-concept hall connecting to the front verandah.'
  },
  {
    name: 'Master Bedroom Suite',
    category: 'Bedroom',
    dimension: "16'-0\" × 14'-0\"",
    area: '224 Sq.Ft',
    description: 'Spacious primary suite with private ensuite bath and wardrobe niche.'
  },
  {
    name: 'Master Ensuite Bathroom',
    category: 'Bath',
    dimension: "9'-0\" × 6'-6\"",
    area: '58.5 Sq.Ft',
    description: 'Private bathroom with shower and vanity space.'
  },
  {
    name: 'Bedroom 02',
    category: 'Bedroom',
    dimension: "14'-0\" × 12'-0\"",
    area: '168 Sq.Ft',
    description: 'Secondary double bedroom with cross-ventilation windows.'
  },
  {
    name: 'Bedroom 03 / Study',
    category: 'Bedroom / Office',
    dimension: "12'-6\" × 11'-0\"",
    area: '137.5 Sq.Ft',
    description: 'Guest bedroom or dedicated executive work-from-home study.'
  },
  {
    name: 'Modular Kitchen & Utility',
    category: 'Kitchen',
    dimension: "12'-0\" × 10'-0\"",
    area: '120 Sq.Ft',
    description: 'Functional kitchen layout with attached 6\'×5\' utility wash bay.'
  },
  {
    name: 'Covered Balcony / Sit-out',
    category: 'Balcony',
    dimension: "22'-0\" × 6'-0\"",
    area: '132 Sq.Ft',
    description: 'Open-air sit-out deck along the front facade.'
  },
  {
    name: 'Foyer & Main Entrance',
    category: 'Entry',
    dimension: "8'-0\" × 6'-0\"",
    area: '48 Sq.Ft',
    description: 'Dedicated foyer entry from the east corridor.'
  }
];

export default function PropertyBlueprint() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  return (
    <>
      {/* Inset Blueprint Card - Strictly Minimal, White Background, Black Lines */}
      <div 
        onClick={() => setIsOpen(true)}
        className="group relative cursor-pointer overflow-hidden bg-white p-2.5 sm:p-3 shadow-xl border border-[#141414]/15 transition-all duration-300 hover:border-[#141414] rounded-xl"
        title="Click to view full blueprint and dimensions"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#141414]/10">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#141414]"></span>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase text-[#141414]">
              Floor Plan • 3-BHK (2,150 Sq.Ft)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-[#737373] group-hover:text-[#141414] transition-colors">
            <Maximize2 size={11} strokeWidth={2} />
            <span className="hidden xs:inline">Enlarge</span>
          </div>
        </div>

        {/* Minimal Black & White Vector Blueprint */}
        <div className="w-full relative bg-white">
          <MinimalBlueprintSVG />
        </div>

        {/* Footer Bar */}
        <div className="mt-2 pt-2 border-t border-[#141414]/10 flex items-center justify-between text-[9px] sm:text-[10px] tracking-wider uppercase text-[#737373]">
          <span className="text-[#141414] font-semibold">Dimensions in Feet & Inches</span>
          <span>JDA Approved</span>
        </div>
      </div>

      {/* Expanded Minimal Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-white border border-[#141414]/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/10 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 border border-[#141414] flex items-center justify-center text-[#141414]">
                  <Ruler size={15} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-[#141414] tracking-tight">
                    Architectural Floor Plan
                  </h3>
                  <p className="text-[11px] text-[#737373] tracking-wider uppercase">
                    3-BHK Villa • Jagatpura, Jaipur • 2,150 Sq.Ft
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#737373] hover:text-[#141414] transition-colors"
                aria-label="Close"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Blueprint View */}
              <div className="lg:col-span-7 bg-white p-2 border border-[#141414]/10">
                <MinimalBlueprintSVG 
                  isInteractive 
                  onSelectRoom={(name) => setActiveRoom(name)} 
                  selectedRoom={activeRoom} 
                />
              </div>

              {/* Right: Room Dimension Schedule */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="pb-2 border-b border-[#141414]/10 flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#141414]">
                    Room Dimensions
                  </span>
                  <span className="text-[11px] text-[#737373]">
                    8 Areas
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {ROOM_DATA.map((room) => {
                    const isSelected = activeRoom === room.name;
                    return (
                      <div
                        key={room.name}
                        onClick={() => setActiveRoom(isSelected ? null : room.name)}
                        className={`p-3 border cursor-pointer transition-colors text-left ${
                          isSelected 
                            ? 'bg-[#141414] text-white border-[#141414]' 
                            : 'bg-white border-[#141414]/10 hover:border-[#141414]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[13px] font-medium tracking-tight ${isSelected ? 'text-white' : 'text-[#141414]'}`}>
                            {room.name}
                          </span>
                          <span className={`text-[12px] font-mono font-semibold ${isSelected ? 'text-white' : 'text-[#141414]'}`}>
                            {room.dimension}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={isSelected ? 'text-white/70' : 'text-[#737373]'}>
                            {room.category}
                          </span>
                          <span className={`font-medium ${isSelected ? 'text-white' : 'text-[#141414]'}`}>
                            {room.area}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Specs Box */}
                <div className="mt-2 p-3 border border-[#141414]/10 bg-gray-50 text-[11px] space-y-1 text-[#141414]">
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Super Built-up:</span>
                    <span className="font-semibold">2,150 Sq.Ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Carpet Area:</span>
                    <span className="font-semibold">1,680 Sq.Ft (78%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Ceiling Height:</span>
                    <span className="font-semibold">11'-0" Clear</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[#141414]/10 flex items-center justify-between text-[11px] text-[#737373]">
              <span>Happy Homes • Jaipur, Rajasthan</span>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-[#141414] text-white px-5 py-1.5 text-[11px] font-bold tracking-wider uppercase rounded-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Ultra-Minimal Vector Floor Plan
 * Pure White Background, Drawn & Written Entirely in Black
 */
function MinimalBlueprintSVG({ 
  isInteractive = false, 
  onSelectRoom, 
  selectedRoom 
}: { 
  isInteractive?: boolean; 
  onSelectRoom?: (roomName: string) => void; 
  selectedRoom?: string | null; 
}) {
  const handleRoomClick = (roomName: string) => {
    if (isInteractive && onSelectRoom) {
      onSelectRoom(roomName);
    }
  };

  return (
    <svg 
      viewBox="0 0 800 620" 
      className="w-full h-auto select-none"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <defs>
        {/* Crisp Black Dimension Ticks */}
        <marker id="tick-black" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 2 8 L 8 2" stroke="#141414" strokeWidth="1.5" />
        </marker>
        <marker id="arrow-black" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 2 L 10 5 L 0 8 z" fill="#141414" />
        </marker>
      </defs>

      {/* Pure White Background */}
      <rect width="800" height="620" fill="#ffffff" />

      {/* Outer Border Frame */}
      <rect x="15" y="15" width="770" height="590" fill="none" stroke="#141414" strokeWidth="1" />

      {/* ======================================================== */}
      {/* EXTERIOR OVERALL DIMENSIONS IN BLACK                     */}
      {/* ======================================================== */}
      
      {/* TOP: 44'-0" (X: 90 to 710) */}
      <g stroke="#141414" strokeWidth="1">
        <line x1="90" y1="40" x2="90" y2="70" strokeDasharray="2 2" stroke="#737373" strokeWidth="0.8" />
        <line x1="710" y1="40" x2="710" y2="70" strokeDasharray="2 2" stroke="#737373" strokeWidth="0.8" />
        <line x1="90" y1="48" x2="710" y2="48" markerStart="url(#tick-black)" markerEnd="url(#tick-black)" />
      </g>
      <rect x="345" y="38" width="110" height="20" fill="#ffffff" />
      <text x="400" y="52" fill="#141414" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.05em">
        44'-0" OVERALL
      </text>

      {/* LEFT: 36'-0" (Y: 75 to 515) */}
      <g stroke="#141414" strokeWidth="1">
        <line x1="45" y1="75" x2="85" y2="75" strokeDasharray="2 2" stroke="#737373" strokeWidth="0.8" />
        <line x1="45" y1="515" x2="85" y2="515" strokeDasharray="2 2" stroke="#737373" strokeWidth="0.8" />
        <line x1="55" y1="75" x2="55" y2="515" markerStart="url(#tick-black)" markerEnd="url(#tick-black)" />
      </g>
      <rect x="25" y="280" width="60" height="20" fill="#ffffff" />
      <text x="55" y="294" fill="#141414" fontSize="11" fontWeight="700" textAnchor="middle" transform="rotate(-90 55 294)">
        36'-0"
      </text>

      {/* ======================================================== */}
      {/* ROOMS & WALLS - DRAWN IN SOLID BLACK ON WHITE            */}
      {/* ======================================================== */}

      {/* 1. MASTER BEDROOM (Top-Left) */}
      <g 
        className={isInteractive ? 'cursor-pointer' : ''}
        onClick={() => handleRoomClick('Master Bedroom Suite')}
      >
        <rect 
          x="90" y="75" width="300" height="220" 
          fill={selectedRoom === 'Master Bedroom Suite' ? '#f5f5f5' : '#ffffff'} 
          stroke="#141414" strokeWidth="1.8" 
        />
        <text x="245" y="160" fill="#141414" fontSize="13" fontWeight="700" textAnchor="middle">
          MASTER BEDROOM
        </text>
        <text x="245" y="180" fill="#141414" fontSize="12" fontWeight="600" textAnchor="middle">
          16'-0" × 14'-0"
        </text>
        <text x="245" y="198" fill="#737373" fontSize="10" textAnchor="middle">
          224 SQ.FT
        </text>

        {/* Master Ensuite Bath (Inner box) */}
        <rect 
          x="90" y="75" width="110" height="95" 
          fill="#ffffff" 
          stroke="#141414" strokeWidth="1.4" 
        />
        <text x="145" y="115" fill="#141414" fontSize="10" fontWeight="700" textAnchor="middle">
          ENSUITE BATH
        </text>
        <text x="145" y="132" fill="#141414" fontSize="10" fontWeight="600" textAnchor="middle">
          9'-0" × 6'-6"
        </text>

        {/* Door Swing */}
        <path d="M 290 295 A 35 35 0 0 1 325 260" fill="none" stroke="#141414" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="290" y1="295" x2="325" y2="295" stroke="#141414" strokeWidth="1.4" />
      </g>

      {/* 2. BEDROOM 02 (Top-Right) */}
      <g 
        className={isInteractive ? 'cursor-pointer' : ''}
        onClick={() => handleRoomClick('Bedroom 02')}
      >
        <rect 
          x="390" y="75" width="200" height="220" 
          fill={selectedRoom === 'Bedroom 02' ? '#f5f5f5' : '#ffffff'} 
          stroke="#141414" strokeWidth="1.8" 
        />
        <text x="490" y="160" fill="#141414" fontSize="13" fontWeight="700" textAnchor="middle">
          BEDROOM 02
        </text>
        <text x="490" y="180" fill="#141414" fontSize="12" fontWeight="600" textAnchor="middle">
          14'-0" × 12'-0"
        </text>
        <text x="490" y="198" fill="#737373" fontSize="10" textAnchor="middle">
          168 SQ.FT
        </text>

        {/* Door Swing */}
        <path d="M 400 295 A 30 30 0 0 0 430 265" fill="none" stroke="#141414" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="400" y1="295" x2="430" y2="295" stroke="#141414" strokeWidth="1.4" />
      </g>

      {/* 3. COMMON BATHROOM */}
      <g>
        <rect 
          x="590" y="75" width="120" height="100" 
          fill="#ffffff" 
          stroke="#141414" strokeWidth="1.4" 
        />
        <text x="650" y="115" fill="#141414" fontSize="10" fontWeight="700" textAnchor="middle">
          BATH / TOILET
        </text>
        <text x="650" y="132" fill="#141414" fontSize="10" fontWeight="600" textAnchor="middle">
          8'-0" × 5'-0"
        </text>
      </g>

      {/* 4. FOYER & MAIN ENTRANCE */}
      <g>
        <rect 
          x="590" y="175" width="120" height="120" 
          fill="#ffffff" 
          stroke="#141414" strokeWidth="1.4" 
        />
        <text x="650" y="222" fill="#141414" fontSize="11" fontWeight="700" textAnchor="middle">
          FOYER
        </text>
        <text x="650" y="240" fill="#141414" fontSize="10" fontWeight="600" textAnchor="middle">
          8'-0" × 6'-0"
        </text>
        
        {/* Entry Pointer Arrow */}
        <line x1="730" y1="240" x2="705" y2="240" stroke="#141414" strokeWidth="2" markerEnd="url(#arrow-black)" />
        <text x="752" y="244" fill="#141414" fontSize="10" fontWeight="700" textAnchor="middle">ENTRY</text>

        {/* Main Door Swing */}
        <path d="M 685 190 A 35 35 0 0 1 650 225" fill="none" stroke="#141414" strokeWidth="1.2" strokeDasharray="3 3" />
        <line x1="685" y1="190" x2="685" y2="225" stroke="#141414" strokeWidth="1.8" />
      </g>

      {/* 5. LIVING & DINING GREAT HALL */}
      <g 
        className={isInteractive ? 'cursor-pointer' : ''}
        onClick={() => handleRoomClick('Living & Dining Great Hall')}
      >
        <rect 
          x="90" y="295" width="440" height="160" 
          fill={selectedRoom === 'Living & Dining Great Hall' ? '#f5f5f5' : '#ffffff'} 
          stroke="#141414" strokeWidth="2" 
        />
        <text x="310" y="365" fill="#141414" fontSize="14" fontWeight="700" textAnchor="middle">
          LIVING & DINING GREAT HALL
        </text>
        <text x="310" y="388" fill="#141414" fontSize="13" fontWeight="600" textAnchor="middle">
          24'-0" × 16'-6"
        </text>
        <text x="310" y="408" fill="#737373" fontSize="10" textAnchor="middle">
          396 SQ.FT • 11'-0" CEILING HEIGHT
        </text>
      </g>

      {/* 6. MODULAR KITCHEN & UTILITY */}
      <g 
        className={isInteractive ? 'cursor-pointer' : ''}
        onClick={() => handleRoomClick('Modular Kitchen & Utility')}
      >
        <rect 
          x="530" y="295" width="180" height="160" 
          fill={selectedRoom === 'Modular Kitchen & Utility' ? '#f5f5f5' : '#ffffff'} 
          stroke="#141414" strokeWidth="1.8" 
        />
        <text x="620" y="358" fill="#141414" fontSize="12" fontWeight="700" textAnchor="middle">
          KITCHEN
        </text>
        <text x="620" y="378" fill="#141414" fontSize="11" fontWeight="600" textAnchor="middle">
          12'-0" × 10'-0"
        </text>

        {/* Utility Compartment */}
        <rect x="630" y="405" width="80" height="50" fill="#ffffff" stroke="#141414" strokeWidth="1" />
        <text x="670" y="426" fill="#141414" fontSize="9" fontWeight="700" textAnchor="middle">UTILITY</text>
        <text x="670" y="440" fill="#737373" fontSize="8.5" textAnchor="middle">6' × 5'</text>
      </g>

      {/* 7. BALCONY / DECK */}
      <g 
        className={isInteractive ? 'cursor-pointer' : ''}
        onClick={() => handleRoomClick('Covered Balcony / Sit-out')}
      >
        <rect 
          x="90" y="455" width="340" height="60" 
          fill={selectedRoom === 'Covered Balcony / Sit-out' ? '#f5f5f5' : '#ffffff'} 
          stroke="#141414" strokeWidth="1.4" 
          strokeDasharray="4 2"
        />
        <text x="260" y="482" fill="#141414" fontSize="11" fontWeight="700" textAnchor="middle">
          COVERED BALCONY / SIT-OUT
        </text>
        <text x="260" y="500" fill="#141414" fontSize="10" fontWeight="600" textAnchor="middle">
          22'-0" × 6'-0" (132 SQ.FT)
        </text>
      </g>

      {/* 8. BEDROOM 03 / STUDY */}
      <g 
        className={isInteractive ? 'cursor-pointer' : ''}
        onClick={() => handleRoomClick('Bedroom 03 / Study')}
      >
        <rect 
          x="430" y="455" width="280" height="60" 
          fill={selectedRoom === 'Bedroom 03 / Study' ? '#f5f5f5' : '#ffffff'} 
          stroke="#141414" strokeWidth="1.8" 
        />
        <text x="570" y="482" fill="#141414" fontSize="11" fontWeight="700" textAnchor="middle">
          BEDROOM 03 / STUDY
        </text>
        <text x="570" y="500" fill="#141414" fontSize="10" fontWeight="600" textAnchor="middle">
          12'-6" × 11'-0"
        </text>
      </g>

      {/* ======================================================== */}
      {/* WINDOW CUTOUTS (Clean double black lines)                */}
      {/* ======================================================== */}
      {/* Top Windows */}
      <line x1="200" y1="75" x2="270" y2="75" stroke="#ffffff" strokeWidth="5" />
      <line x1="200" y1="73" x2="270" y2="73" stroke="#141414" strokeWidth="1" />
      <line x1="200" y1="77" x2="270" y2="77" stroke="#141414" strokeWidth="1" />

      <line x1="440" y1="75" x2="510" y2="75" stroke="#ffffff" strokeWidth="5" />
      <line x1="440" y1="73" x2="510" y2="73" stroke="#141414" strokeWidth="1" />
      <line x1="440" y1="77" x2="510" y2="77" stroke="#141414" strokeWidth="1" />

      {/* Bottom Windows */}
      <line x1="480" y1="515" x2="560" y2="515" stroke="#ffffff" strokeWidth="5" />
      <line x1="480" y1="513" x2="560" y2="513" stroke="#141414" strokeWidth="1" />
      <line x1="480" y1="517" x2="560" y2="517" stroke="#141414" strokeWidth="1" />

      {/* ======================================================== */}
      {/* TITLE BLOCK IN BLACK & WHITE                             */}
      {/* ======================================================== */}
      <g>
        <rect x="30" y="535" width="740" height="55" fill="#ffffff" stroke="#141414" strokeWidth="1" />
        <line x1="260" y1="535" x2="260" y2="590" stroke="#141414" strokeWidth="1" />
        <line x1="540" y1="535" x2="540" y2="590" stroke="#141414" strokeWidth="1" />
        <line x1="680" y1="535" x2="680" y2="590" stroke="#141414" strokeWidth="1" />

        {/* Section 1: Project Details */}
        <text x="45" y="556" fill="#141414" fontSize="10" fontWeight="700" letterSpacing="0.05em">HAPPY HOMES • JAIPUR</text>
        <text x="45" y="574" fill="#737373" fontSize="9">PROJECT: 3-BHK RESIDENTIAL VILLA</text>

        {/* Section 2: Area Breakdown */}
        <text x="275" y="556" fill="#141414" fontSize="10" fontWeight="700">TOTAL BUILT-UP: 2,150 SQ.FT</text>
        <text x="275" y="574" fill="#737373" fontSize="9">CARPET: 1,680 SQ.FT • 3 BED / 3 BATH</text>

        {/* Section 3: Technical Specs */}
        <text x="555" y="556" fill="#141414" fontSize="10" fontWeight="700">SCALE: 1/4" = 1'-0"</text>
        <text x="555" y="574" fill="#737373" fontSize="9">CLEAR HEIGHT: 11'-0"</text>

        {/* Section 4: Minimal North Compass */}
        <g transform="translate(730, 562)">
          <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#141414" strokeWidth="1" />
          <polygon points="0,-12 3,2 0,0" fill="#141414" />
          <polygon points="0,-12 -3,2 0,0" fill="#ffffff" stroke="#141414" strokeWidth="0.5" />
          <polygon points="0,12 3,-2 0,0" fill="#ffffff" stroke="#141414" strokeWidth="0.5" />
          <polygon points="0,12 -3,-2 0,0" fill="#141414" />
          <text x="0" y="-15" fill="#141414" fontSize="8" fontWeight="700" textAnchor="middle">N</text>
        </g>
      </g>
    </svg>
  );
}
