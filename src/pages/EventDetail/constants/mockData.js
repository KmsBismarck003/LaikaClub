export const MOCK_MERCH = [
  {
    id: 101, name: "Playera Oficial Tour", price: 450, type: "Playera",
    colors: [
      { name: "Negro", hex: "#111111", images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600","https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600"] },
      { name: "Blanco", hex: "#f5f5f5", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600"] },
      { name: "Azul", hex: "#1e3a8a", images: ["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600","https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600"] },
    ]
  },
  {
    id: 102, name: "Playera Vintage", price: 500, type: "Playera",
    colors: [
      { name: "Gris", hex: "#6b7280", images: ["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600","https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600"] },
      { name: "Verde", hex: "#166534", images: ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600","https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600"] },
    ]
  },
  {
    id: 103, name: "Gorra Bordada", price: 350, type: "Gorra",
    colors: [
      { name: "Negro", hex: "#111111", images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600","https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600"] },
      { name: "Beige", hex: "#d4b896", images: ["https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600","https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600"] },
    ]
  },
  {
    id: 104, name: "Taza Coleccionable", price: 200, type: "Taza",
    colors: [
      { name: "Blanco", hex: "#f5f5f5", images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600","https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=600"] },
      { name: "Negro", hex: "#111111", images: ["https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600","https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600"] },
    ]
  },
  {
    id: 105, name: "Stickers Pack (x5)", price: 100, type: "Sticker",
    colors: [
      { name: "Mix", hex: "linear-gradient(135deg,#f43f5e,#8b5cf6,#3b82f6)", images: ["https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600","https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600"] },
    ]
  },
  {
    id: 106, name: "Bufanda Oficial", price: 250, type: "Bufanda",
    colors: [
      { name: "Negro/Blanco", hex: "#374151", images: ["https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600"] },
      { name: "Rojo", hex: "#991b1b", images: ["https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=600"] },
    ]
  },
  {
    id: 107, name: "Hoodie Unisex", price: 750, type: "Hoodie",
    colors: [
      { name: "Negro", hex: "#111111", images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"] },
      { name: "Gris", hex: "#9ca3af", images: ["https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600","https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600"] },
    ]
  },
  {
    id: 108, name: "Pulsera Oficial", price: 150, type: "Pulsera",
    colors: [
      { name: "Plata", hex: "#c0c0c0", images: ["https://images.unsplash.com/photo-1552343245-87eb1455f5c7?w=600"] },
      { name: "Dorado", hex: "#ca8a04", images: ["https://images.unsplash.com/photo-1573408301185-9519f94fcbb9?w=600"] },
    ]
  },
];

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
