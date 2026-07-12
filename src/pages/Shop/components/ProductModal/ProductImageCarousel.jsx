import React, { useState } from 'react';
import { getImageUrl } from '../../../../utils/imageUtils';

const ProductImageCarousel = ({ imageUrls }) => {
    const images = imageUrls ? imageUrls.split(',').map(url => url.trim()).filter(Boolean) : [];
    const [activeIndex, setActiveIndex] = useState(0);

    if (images.length === 0) {
        return (
            <div className="product-carousel-empty">
                <span>Sin Imagen</span>
            </div>
        );
    }

    return (
        <div className="product-image-carousel">
            <div className="carousel-main-image">
                <img src={getImageUrl(images[activeIndex])} alt={`Producto ${activeIndex + 1}`} />
            </div>
            {images.length > 1 && (
                <div className="carousel-thumbnails">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            className={`thumbnail-btn ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => setActiveIndex(index)}
                            type="button"
                        >
                            <img src={getImageUrl(img)} alt={`Miniatura ${index + 1}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageCarousel;
