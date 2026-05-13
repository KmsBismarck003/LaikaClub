import { useState, useEffect } from 'react';
import { merchInventory } from '../../../services/merchInventory';

/**
 * useMerchInventory — Hook para gestionar el inventario de mercancía y su visualización.
 */
export function useMerchInventory() {
  const [merchList, setMerchList] = useState([]);
  const [selectedMerchItem, setSelectedMerchItem] = useState(null);
  const [merchSize, setMerchSize] = useState('M');
  const [merchQty, setMerchQty] = useState(1);
  const [merchColorIdx, setMerchColorIdx] = useState(0);
  const [merchGalleryIdx, setMerchGalleryIdx] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setMerchList(merchInventory.getAll());
    };
    handleUpdate();
    window.addEventListener('merch_update', handleUpdate);
    return () => window.removeEventListener('merch_update', handleUpdate);
  }, []);

  return {
    merchList,
    selectedMerchItem, setSelectedMerchItem,
    merchSize, setMerchSize,
    merchQty, setMerchQty,
    merchColorIdx, setMerchColorIdx,
    merchGalleryIdx, setMerchGalleryIdx
  };
}
