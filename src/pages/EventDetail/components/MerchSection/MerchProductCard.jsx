import React from "react";
import { Icon } from "../../../../components";
import "./MerchProductCard.css";

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
