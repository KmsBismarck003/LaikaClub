import React from "react";
import { Icon } from "../../../../components";
import "./MerchProductCard.css";

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

const MerchProductCard = ({ item, onSelect }) => {
  const [cardColorIdx, setCardColorIdx] = React.useState(0);
  const [isFavorite, setIsFavorite] = React.useState(false);

  const colors = item.colors || [...new Set(item.variants.map(v => v.color))].map(c => ({
    name: "Opción",
    hex: c,
    images: [item.image_url]
  }));

  const cardImg = colors[cardColorIdx]?.images[0] || item.image_url || '';
  const isSoldOut = item.status === 'sold_out';

  return (
    <div
      className={`merch-product-card ${isSoldOut ? 'sold-out-visual' : ''}`}
      onClick={() => !isSoldOut && onSelect(cardColorIdx)}
    >
      <div className="merch-card-photo">
        <img src={cardImg} alt={item.name} />

        {isSoldOut ? (
          <div className="merch-sold-out-badge">AGOTADO</div>
        ) : (
          <div className="merch-new-badge">NEW</div>
        )}

        <button
          className="merch-favorite-btn"
          onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
        >
          <Icon name="heart" size={18} fill={isFavorite ? "#ff4444" : "none"} stroke={isFavorite ? "#ff4444" : "#fff"} />
        </button>
      </div>

      <div className="merch-card-swatches" onClick={e => e.stopPropagation()}>
        {colors.map((c, ci) => (
          <button
            key={ci}
            title={c.name}
            className={`merch-swatch ${cardColorIdx === ci ? 'active' : ''}`}
            onClick={e => { e.stopPropagation(); !isSoldOut && setCardColorIdx(ci); }}
            style={{ background: c.hex }}
          />
        ))}
      </div>

      <div className="merch-card-info">
        <h4>{item.name}</h4>
        <span>${(item.price || (item.variants && item.variants[0]?.price) || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
      </div>

      <button className={`merch-add-btn ${isSoldOut ? 'disabled' : ''}`} disabled={isSoldOut}>
        {isSoldOut ? 'NO DISPONIBLE' : 'AGREGAR AL CARRITO'}
      </button>
    </div>
  );
};

export default MerchProductCard;
