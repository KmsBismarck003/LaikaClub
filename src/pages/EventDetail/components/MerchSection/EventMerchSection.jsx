import React from 'react';
import { Icon } from "../../../../components";
import MerchProductCard, { MOCK_MERCH } from "./MerchProductCard";
import MerchProductModal from "./MerchProductModal";

const EventMerchSection = ({
  merchList,
  setSelectedMerchItem,
  setMerchSize,
  setMerchQty,
  setMerchColorIdx,
  setMerchGalleryIdx,
  selectedMerchItem,
  merchColorIdx,
  merchGalleryIdx,
  merchSize,
  handleAddToCart,
  navigate
}) => {
  return (
    <div className="event-merch-section" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
      <h3 className="section-label-premium" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
        <Icon name="shoppingBag" size={16} /> Mercancía Oficial
      </h3>
      <div className="merch-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
         {(merchList.length > 0 ? merchList : MOCK_MERCH).slice(0, 9).map(item => (
            <MerchProductCard
              key={item.id}
              item={item}
              onSelect={(cardColorIdx) => {
                setSelectedMerchItem(item);
                setMerchSize('M');
                setMerchQty(1);
                setMerchColorIdx(cardColorIdx);
                setMerchGalleryIdx(0);
              }}
            />
         ))}
      </div>

      <MerchProductModal
        selectedMerchItem={selectedMerchItem}
        setSelectedMerchItem={setSelectedMerchItem}
        merchColorIdx={merchColorIdx}
        merchGalleryIdx={merchGalleryIdx}
        setMerchGalleryIdx={setMerchGalleryIdx}
        merchSize={merchSize}
        setMerchSize={setMerchSize}
        handleAddToCart={handleAddToCart}
        navigate={navigate}
      />
    </div>
  );
};

export default EventMerchSection;
