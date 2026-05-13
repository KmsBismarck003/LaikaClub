/**
 * MERCH INVENTORY ENGINE (Simulado)
 * Este servicio sincroniza el estado de la mercancía entre el Dashboard y la Tienda
 * sin necesidad de base de datos activa, usando el almacenamiento del navegador.
 */

const STORAGE_KEY = 'laika_merch_inventory';

const INITIAL_DATA = [
    {
        id: 'merch-1',
        eventId: 'event-1', // Concierto Laika
        name: 'Playera Oficial Tour 2026',
        category: 'Ropa',
        description: 'Algodón premium con estampado industrial.',
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
        status: 'active',
        sold_count: 24,
        variants: [
            { size: 'M', color: '#000000', price: 450, stock: 50 },
            { size: 'L', color: '#000000', price: 450, stock: 30 }
        ]
    },
    {
        id: 'merch-2',
        eventId: 'event-1',
        name: 'Gorra Bordada Laika Club',
        category: 'Accesorios',
        description: 'Gorra técnica con bordado de alta densidad.',
        image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
        status: 'active',
        sold_count: 15,
        variants: [
            { size: 'Única', color: '#ffffff', price: 350, stock: 100 }
        ]
    },
    {
        id: 'merch-3',
        eventId: 'event-2', // Spring Festival
        name: 'Hoodie Pro "Cyber-White"',
        category: 'Ropa',
        description: 'Sudadera premium con detalles reflectantes.',
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
        status: 'active',
        sold_count: 42,
        variants: [
            { size: 'L', color: '#fff', price: 890, stock: 20 },
            { size: 'XL', color: '#fff', price: 890, stock: 15 }
        ]
    },
    {
        id: 'merch-4',
        eventId: 'event-2',
        name: 'Poster Litográfico Limited',
        category: 'Arte',
        description: 'Impresión en papel satinado 300g.',
        image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800',
        status: 'active',
        sold_count: 120,
        variants: [
            { size: '50x70', color: 'Multicolor', price: 150, stock: 200 }
        ]
    },
    {
        id: 'merch-5',
        eventId: 'event-3', // Rave Techno
        name: 'Vinilo "Laika Beats" Vol.1',
        category: 'Música',
        description: 'Edición especial en vinilo transparente.',
        image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800',
        status: 'active',
        sold_count: 8,
        variants: [
            { size: '12"', color: 'Clear', price: 1200, stock: 5 }
        ]
    },
    {
        id: 'merch-6',
        eventId: 'event-1',
        name: 'Tote Bag Industrial Grey',
        category: 'Accesorios',
        description: 'Bolsa de carga pesada con logo industrial.',
        image_url: 'https://images.unsplash.com/photo-1544816153-12ad5d713bd0?auto=format&fit=crop&q=80&w=800',
        status: 'active',
        sold_count: 55,
        variants: [
            { size: 'Grande', color: '#ccc', price: 250, stock: 10 }
        ]
    }
];

export const merchInventory = {
    getAll: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
            return INITIAL_DATA;
        }
        return JSON.parse(data);
    },

    save: (items) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        // Disparar evento para sincronización entre pestañas
        window.dispatchEvent(new Event('merch_update'));
    },

    updateItem: (updatedItem) => {
        const items = merchInventory.getAll();
        const index = items.findIndex(i => i.id === updatedItem.id);
        if (index !== -1) {
            items[index] = updatedItem;
        } else {
            items.push(updatedItem);
        }
        merchInventory.save(items);
    },

    deleteItem: (id) => {
        const items = merchInventory.getAll();
        const filtered = items.filter(i => i.id !== id);
        merchInventory.save(filtered);
    },

    toggleStatus: (id) => {
        const items = merchInventory.getAll();
        const item = items.find(i => i.id === id);
        if (item) {
            item.status = item.status === 'active' ? 'sold_out' : 'active';
            merchInventory.save(items);
        }
    }
};
