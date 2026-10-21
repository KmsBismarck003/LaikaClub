import React, { useState } from 'react';
import { Tag, Copy, Check, Ticket, Sparkles } from 'lucide-react';

/**
 * ShopPromoCard - Fan Benefit / Promo Bento Widget (Proposal 1 & 2 Fusion)
 * Displays exclusive promo code with interactive copy-to-clipboard functionality.
 */
const ShopPromoCard = ({
    code = 'LAIKACLUB10',
    discountText = '10% OFF',
    title = 'DESCUENTO FAN CLUB',
    subtitle = 'Válido en mercancía oficial de festivales y artistas.',
    tag = 'EXCLUSIVO FANS'
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = code;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error('Failed to copy promo code:', err);
        }
    };

    return (
        <div className="shop-promo-card">
            <div className="shop-promo-card__glow" />

            <div className="shop-promo-card__top">
                <span className="shop-promo-card__tag">
                    <Sparkles size={12} />
                    {tag}
                </span>
                <span className="shop-promo-card__discount">
                    {discountText}
                </span>
            </div>

            <div className="shop-promo-card__body">
                <div className="shop-promo-card__icon-wrapper">
                    <Ticket size={24} className="shop-promo-card__icon" />
                </div>
                <div className="shop-promo-card__text">
                    <h4 className="shop-promo-card__title">{title}</h4>
                    <p className="shop-promo-card__subtitle">{subtitle}</p>
                </div>
            </div>

            <div className="shop-promo-card__code-container">
                <div className="shop-promo-card__code-display">
                    <Tag size={14} className="shop-promo-card__tag-icon" />
                    <span className="shop-promo-card__code-text">{code}</span>
                </div>
                <button
                    type="button"
                    className={`shop-promo-card__copy-btn ${copied ? 'shop-promo-card__copy-btn--copied' : ''}`}
                    onClick={handleCopy}
                    aria-label={`Copiar código de descuento ${code}`}
                >
                    {copied ? (
                        <>
                            <Check size={14} />
                            <span>¡COPIADO!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            <span>COPIAR</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ShopPromoCard;
