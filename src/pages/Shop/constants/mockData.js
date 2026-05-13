// --- ARTIST-SPECIFIC PREMIUM CATALOG ---
const OFFICIAL_ARTIST_MERCH = [
    {
        id: 'bb-hoodie-01',
        name: "Sudadera Chrome Industrial Bad Bunny",
        description: "Sudadera oficial de edición limitada con tipografía de cromo brillante. 100% algodón pesado.",
        brand: "Bad Bunny",
        category: "Sudaderas",
        image_url: "/assets/merch/hoodie.png",
        variants: [
            { id: 'v1', name: "S", price: 85.00, stock: 50 },
            { id: 'v2', name: "M", price: 85.00, stock: 45 },
            { id: 'v3', name: "L", price: 85.00, stock: 30 }
        ],
        rating: 5,
        isOfficial: true,
        isNew: true
    },
    {
        id: 'hs-vinyl-01',
        name: "Vinilo Splatter Harry Styles (Limitado)",
        description: "Vinilo splatter transparente con grabaciones exclusivas en vivo y libro de arte minimalista.",
        brand: "Harry Styles",
        category: "Vinilos",
        image_url: "/assets/merch/vinyl.png",
        variants: [
            { id: 'v1', name: "Estándar", price: 45.00, stock: 100 }
        ],
        rating: 5,
        isOfficial: true,
        isNew: true
    },
    {
        id: 'cp-tee-01',
        name: "Camiseta del Tour 'Spheres' de Coldplay",
        description: "Camiseta oficial del tour Music of the Spheres, algodón orgánico sostenible y gráficos neón.",
        brand: "Coldplay",
        category: "Camisetas",
        image_url: "/assets/merch/tee.png",
        variants: [
            { id: 'v1', name: "M", price: 35.00, stock: 120 },
            { id: 'v2', name: "L", price: 35.00, stock: 80 }
        ],
        rating: 4.8,
        isOfficial: true
    },
    {
        id: 'ls-tote-01',
        name: "Bolsa Tote Folklore LAIK Swift",
        description: "Bolso de lona con estética minimalista y costuras industriales de alta resistencia.",
        brand: "LAIK Swift",
        category: "Accesorios",
        image_url: "/assets/merch/tote.png",
        variants: [
            { id: 'v1', name: "Única", price: 25.00, stock: 200 }
        ],
        rating: 5,
        isOfficial: true
    }
];

// Add generated images to the mock data
export const getOfficialMerch = () => {
    const merch = [...OFFICIAL_ARTIST_MERCH];
    merch[0].image_url = "/assets/merch/hoodie.png";
    merch[1].image_url = "/assets/merch/vinyl.png";
    merch[2].image_url = "/assets/merch/tee.png";
    merch[3].image_url = "/assets/merch/tote.png";
    
    // Add new premium items to the catalog
    merch.push({
        id: 'gen-vinyl-01',
        name: "Edición Platino Vinilo Laika",
        description: "Edición exclusiva de coleccionista con arte de ciencia ficción y acabado metálico.",
        brand: "LAIKA",
        category: "Vinilos",
        image_url: "/assets/merch/vinyl.png",
        variants: [{ id: 'v1', name: "Estándar", price: 55.00, stock: 30 }],
        rating: 5,
        isOfficial: true,
        isNew: true
    });
    
    merch.push({
        id: 'gen-tee-01',
        name: "Camiseta Cyber-Artist Studio",
        description: "Camiseta blanca minimalista con gráficos de cromo de alta densidad.",
        brand: "LAIKA",
        category: "Camisetas",
        image_url: "/assets/merch/tee.png",
        variants: [{ id: 'v1', name: "XL", price: 40.00, stock: 15 }],
        rating: 4.9,
        isOfficial: true
    });

    merch.push({
        id: 'gen-hood-01',
        name: "Sudadera Heavy Industrial Core",
        description: "Sudadera negra ultra pesada con bordado industrial.",
        brand: "LAIKA",
        category: "Sudaderas",
        image_url: "/assets/merch/hoodie.png",
        variants: [{ id: 'v1', name: "L", price: 95.00, stock: 20 }],
        rating: 5,
        isOfficial: true
    });

    // --- NEW CATEGORIES: GORRAS, GAFAS, STICKERS ---
    const NEW_ARTIST_ITEMS = [
        { id: 'bb-cap-01', name: "Trucker Hat 'Un Verano'", brand: "Bad Bunny", category: "Gorras", price: 35, image_url: "/assets/merch/hoodie.png", isNew: true },
        { id: 'hs-beanie-01', name: "Pleasing Chrome Beanie", brand: "Harry Styles", category: "Gorras", price: 30, image_url: "/assets/merch/hoodie.png" },
        { id: 'cp-glasses-01', name: "Music Spheres Cyber Gafas", brand: "Coldplay", category: "Gafas", price: 120, image_url: "/assets/merch/hoodie.png", isNew: true },
        { id: 'ls-stickers-01', name: "Folklore Decal Pack", brand: "LAIK Swift", category: "Stickers", price: 15, image_url: "/assets/merch/hoodie.png" },
        { id: 'gen-vinyl-02', name: "After Hours Vinyl Pack", brand: "The Artist", category: "Vinilos", price: 65, image_url: "/assets/merch/vinyl.png", isNew: true },
        { id: 'bb-glasses-01', name: "Monaco Race Shades", brand: "Bad Bunny", category: "Gafas", price: 150, image_url: "/assets/merch/hoodie.png" },
        { id: 'gen-cap-02', name: "Industrial Logo Cap", brand: "LAIKA", category: "Gorras", price: 25, image_url: "/assets/merch/hoodie.png" },
        { id: 'ls-card-01', name: "Midnights Card Set", brand: "LAIK Swift", category: "Stickers", price: 20, image_url: "/assets/merch/hoodie.png" },
        { id: 'gen-vinyl-03', name: "Chrome Anthology Vinyl", brand: "LAIKA", category: "Vinilos", price: 80, image_url: "/assets/merch/vinyl.png", isOfficial: true },
        { id: 'cp-sticker-02', name: "Neon Tour Stickers", brand: "Coldplay", category: "Stickers", price: 12, image_url: "/assets/merch/hoodie.png" },
        { id: 'gen-glass-03', name: "Studio Vision Gafas", brand: "LAIKA", category: "Gafas", price: 90, image_url: "/assets/merch/hoodie.png" },
        { id: 'bb-hood-03', name: "Most Wanted Hoodie", brand: "Bad Bunny", category: "Sudaderas", price: 85, image_url: "/assets/merch/hoodie.png" }
    ];

    NEW_ARTIST_ITEMS.forEach(item => {
        merch.push({
            ...item,
            description: `Edición oficial ${item.category}. Calidad industrial certificada.`,
            variants: [{ id: 'v1', name: "Default", price: item.price, stock: 100 }],
            rating: 5,
            isOfficial: item.isOfficial || true
        });
    });

    return merch;
};

// CURATED PREMIUM ADVERTISEMENTS - 8 UNIQUE ROTATIONS PER POSITION (24 TOTAL)
export const COMMERCIAL_ADS = [
    // MAIN BANNER (8 ITEMS)
    // MAIN BANNER (8 ITEMS)
    { id: 'm1', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200', title: 'EDICIÓN LIMITADA: SUDADERA GLITCH', position: 'main', link_url: '/shop?category=Hoodies' },
    { id: 'm2', image_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200', title: 'VINILOS FIRMADOS: ANIVERSARIO', position: 'main', link_url: '/shop?category=Vinyls' },
    { id: 'm3', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200', title: 'COLECCIÓN CAMISETAS CORE - 2026', position: 'main', link_url: '/shop?category=Playeras' },
    { id: 'm4', image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e881?w=1200', title: 'LANZAMIENTO GORRAS ELITE', position: 'main', link_url: '/shop?category=Gorras' },
    { id: 'm5', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200', title: 'MERCH GAMER: SERIE PRO', position: 'main', link_url: '/shop' },
    { id: 'm6', image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200', title: 'POSTERS EXCLUSIVOS DE CONCIERTO', position: 'main', link_url: '/shop?category=Poster' },
    { id: 'm7', image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200', title: 'PASES BACKSTAGE BUNDLES', position: 'main', link_url: '/shop' },
    { id: 'm8', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', title: 'ACCESORIOS FOODIE FEST', position: 'main', link_url: '/shop' },

    // SIDE LEFT (8 ITEMS)
    { id: 'sl1', image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400', title: 'EDICIÓN VINILO ROJO', position: 'side_left', link_url: '/shop?category=Vinyls' },
    { id: 'sl2', image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400', title: 'GORROS: COLECCIÓN INVIERNO', position: 'side_left', link_url: '/shop?category=Gorras' },
    { id: 'sl3', image_url: 'https://images.unsplash.com/photo-1517256010-52f05a72d48b?w=400', title: 'TAZA MINIMALISTA NEGRA', position: 'side_left', link_url: '/shop?category=Tazas' },
    { id: 'sl4', image_url: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=400', title: 'LLAVEROS IRIDISCENTES', position: 'side_left', link_url: '/shop?category=Llaveros' },
    { id: 'sl5', image_url: 'https://images.unsplash.com/photo-1572375927501-44447e533464?w=400', title: 'PAQUETES DE STICKERS', position: 'side_left', link_url: '/shop?category=Stickers' },
    { id: 'sl6', image_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400', title: 'CAMISETAS SONIC WAVE', position: 'side_left', link_url: '/shop?category=Playeras' },
    { id: 'sl7', image_url: 'https://images.unsplash.com/photo-1576085898323-2183ba9a200c?w=400', title: 'TERMOS INDUSTRIALES', position: 'side_left', link_url: '/shop?category=Vasos' },
    { id: 'sl8', image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400', title: 'POSTERS DEL TOUR', position: 'side_left', link_url: '/shop?category=Poster' },

    // SIDE RIGHT (8 ITEMS)
    { id: 'sr1', image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', title: 'TAZA EDICIÓN ESPECIAL', position: 'side_right', link_url: '/shop?category=Tazas' },
    { id: 'sr2', image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400', title: 'MERCHAN DE COLECCIÓN', position: 'side_right', link_url: '/shop' },
    { id: 'sr3', image_url: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400', title: 'RESTOCK: VINILOS', position: 'side_right', link_url: '/shop?category=Vinyls' },
    { id: 'sr4', image_url: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400', title: 'EQUIPO INDUSTRIAL', position: 'side_right', link_url: '/shop' },
    { id: 'sr5', image_url: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=400', title: 'STICKERS LAVABLES', position: 'side_right', link_url: '/shop?category=Stickers' },
    { id: 'sr6', image_url: 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=400', title: 'CALIFICA NUESTRO EQUIPO', position: 'side_right', link_url: '/shop' },
    { id: 'sr7', image_url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=400', title: '¿JERSEYS DE FÚTBOL?', position: 'side_right', link_url: '/shop' },
    { id: 'sr8', image_url: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=400', title: 'REBAJAS TERMINANDO', position: 'side_right', link_url: '/shop' }
];
