/**
 * MERCH INVENTORY ENGINE (Simulado)
 * Este servicio sincroniza el estado de la mercancía entre el Dashboard y la Tienda
 * sin necesidad de base de datos activa, usando el almacenamiento del navegador.
 */

const STORAGE_KEY = 'laika_merch_inventory';

const INITIAL_DATA = [];


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
