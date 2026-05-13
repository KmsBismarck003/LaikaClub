/* ══════════════════════════════════════════════════════════════
   VENUE ZONES — EventDetail Component
   Datos de zonas para los diferentes tipos de venue/escenario
   ══════════════════════════════════════════════════════════════ */

export const INITIAL_ZONES = [
  {
    id: "escenario",
    name: "ESCENARIO",
    type: "stage",
    points: [
      { x: 10, y: 150 }, { x: 130, y: 120 }, { x: 130, y: 480 }, { x: 10, y: 450 },
    ],
  },
  {
    id: "platino-vip",
    name: "PLATINO VIP",
    type: "seating",
    price: "$2,500",
    rows: 4, count: 80,
    points: [
      { x: 145, y: 190 }, { x: 265, y: 160 }, { x: 265, y: 440 }, { x: 145, y: 410 },
    ],
  },
  {
    id: "zona-platino",
    name: "ZONA PLATINO",
    type: "seating",
    price: "$1,800",
    rows: 6, count: 180,
    points: [
      { x: 275, y: 150 }, { x: 435, y: 100 }, { x: 435, y: 500 }, { x: 275, y: 450 },
    ],
  },
  {
    id: "general-bronce",
    name: "GENERAL BRONCE",
    type: "seating",
    price: "$900",
    rows: 10, count: 400,
    points: [
      { x: 445, y: 90 }, { x: 700, y: 20 }, { x: 700, y: 580 }, { x: 445, y: 510 },
    ],
  },
  {
    id: "plata-izq",
    name: "ZONA PLATA IZQ",
    type: "seating",
    price: "$1,200",
    rows: 10, count: 150,
    points: [
      { x: 145, y: 30 }, { x: 435, y: 10 }, { x: 435, y: 90 }, { x: 145, y: 180 },
    ],
  },
  {
    id: "plata-der",
    name: "ZONA PLATA DER",
    type: "seating",
    price: "$1,200",
    rows: 10, count: 150,
    points: [
      { x: 145, y: 420 }, { x: 435, y: 510 }, { x: 435, y: 590 }, { x: 145, y: 570 },
    ],
  },
];

export const STADIUM_ZONES = [
  {
    id: "norte", name: "GRADA NORTE", type: "seating", price: "$600", rows: 8, count: 200,
    points: [{ x: 150, y: 110 }, { x: 650, y: 110 }, { x: 700, y: 50 }, { x: 100, y: 50 }],
  },
  {
    id: "sur", name: "GRADA SUR", type: "seating", price: "$600", rows: 8, count: 200,
    points: [{ x: 100, y: 450 }, { x: 700, y: 450 }, { x: 650, y: 390 }, { x: 150, y: 390 }],
  },
  {
    id: "oriente", name: "GRADA ORIENTE", type: "seating", price: "$1,200", rows: 10, count: 120,
    points: [{ x: 680, y: 120 }, { x: 780, y: 80 }, { x: 780, y: 420 }, { x: 680, y: 380 }],
  },
  {
    id: "poniente", name: "GRADA PONIENTE", type: "seating", price: "$1,200", rows: 10, count: 120,
    points: [{ x: 20, y: 80 }, { x: 120, y: 120 }, { x: 120, y: 380 }, { x: 20, y: 420 }],
  },
  {
    id: "cancha", name: "CANCHA / FIELD", type: "corridor",
    points: [{ x: 160, y: 140 }, { x: 640, y: 140 }, { x: 640, y: 360 }, { x: 160, y: 360 }],
  },
  {
    id: "escenario", name: "ESCENARIO", type: "stage",
    points: [{ x: 150, y: 10 }, { x: 650, y: 10 }, { x: 680, y: 120 }, { x: 120, y: 120 }],
  },
];

export const SUMMER_EDITION_PRESET = [
  { id: "stage-main", name: "STAGE", type: "stage", points: [{ x: 600, y: 200 }, { x: 750, y: 200 }, { x: 750, y: 400 }, { x: 600, y: 400 }] },
  { id: "stage-runway", name: "RUNWAY", type: "stage", points: [{ x: 430, y: 280 }, { x: 600, y: 280 }, { x: 600, y: 320 }, { x: 430, y: 320 }] },
  { id: "stage-thrust", name: "THRUST", type: "stage", points: [{ x: 360, y: 240 }, { x: 430, y: 240 }, { x: 430, y: 360 }, { x: 360, y: 360 }] },
  { id: "ga-blue", name: "GENERAL ADMISSION", type: "corridor", points: [{ x: 60, y: 170 }, { x: 340, y: 170 }, { x: 340, y: 430 }, { x: 60, y: 430 }] },
  { id: "vip-red-top", name: "VIP FRONT B", type: "seating", price: "$2,500", rows: 6, count: 100, points: [{ x: 360, y: 140 }, { x: 580, y: 140 }, { x: 580, y: 230 }, { x: 440, y: 230 }] },
  { id: "vip-red-bottom", name: "VIP FRONT B", type: "seating", price: "$2,500", rows: 6, count: 100, points: [{ x: 360, y: 370 }, { x: 580, y: 370 }, { x: 580, y: 460 }, { x: 440, y: 460 }] },
  { id: "box-top-left", name: "BOX 1", type: "seating", price: "$1,500", rows: 2, count: 10, points: [{ x: 200, y: 90 }, { x: 350, y: 90 }, { x: 350, y: 130 }, { x: 200, y: 130 }] },
  { id: "box-top-right", name: "BOX 2", type: "seating", price: "$1,500", rows: 2, count: 10, points: [{ x: 370, y: 90 }, { x: 520, y: 90 }, { x: 520, y: 130 }, { x: 370, y: 130 }] },
  { id: "box-bottom-left", name: "BOX 3", type: "seating", price: "$1,500", rows: 2, count: 10, points: [{ x: 200, y: 470 }, { x: 350, y: 470 }, { x: 350, y: 510 }, { x: 200, y: 510 }] },
  { id: "box-bottom-right", name: "BOX 4", type: "seating", price: "$1,500", rows: 2, count: 10, points: [{ x: 370, y: 470 }, { x: 520, y: 470 }, { x: 520, y: 510 }, { x: 370, y: 510 }] },
  { id: "tier-inner-blue", name: "TIER INNER BLUE", type: "seating", price: "$1,200", rows: 10, count: 200, points: [{ x: 10, y: 120 }, { x: 180, y: 80 }, { x: 180, y: 520 }, { x: 10, y: 480 }] },
  { id: "tier-middle-red", name: "TIER MIDDLE RED", type: "seating", price: "$800", rows: 12, count: 300, points: [{ x: 190, y: 20 }, { x: 550, y: 20 }, { x: 550, y: 70 }, { x: 190, y: 70 }] },
  { id: "tier-outer-yellow", name: "TIER OUTER YELLOW", type: "seating", price: "$400", rows: 15, count: 500, points: [{ x: 570, y: 20 }, { x: 780, y: 20 }, { x: 780, y: 180 }, { x: 570, y: 100 }] },
  { id: "tier-outer-yellow-2", name: "TIER OUTER YELLOW 2", type: "seating", price: "$400", rows: 15, count: 500, points: [{ x: 570, y: 500 }, { x: 780, y: 420 }, { x: 780, y: 580 }, { x: 570, y: 580 }] },
];

export const EXPERIENCE_MOCK = [];
export const REVIEWS_MOCK = [];
export const RELATED_EVENTS_MOCK = [];
