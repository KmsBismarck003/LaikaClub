import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  ShoppingCart, 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  HelpCircle, 
  Info, 
  X 
} from 'lucide-react';
import './ConfirmDialog.css';

/**
 * ConfirmDialog - Modal de confirmación universal y reutilizable
 * Diseñado para LAIKA Club con estética Dark Glassmorphic.
 * 
 * @param {boolean} isOpen - Estado de visibilidad del modal
 * @param {function} onClose - Callback al cancelar o cerrar
 * @param {function} onConfirm - Callback al confirmar la acción (soporta async)
 * @param {string|React.ReactNode} title - Título del diálogo
 * @param {string|React.ReactNode} message - Mensaje o pregunta principal
 * @param {string} confirmText - Texto del botón de confirmación
 * @param {string} cancelText - Texto del botón de cancelación
 * @param {'cart'|'primary'|'danger'|'warning'|'info'|'success'} variant - Tema y color de la acción
 * @param {string|React.ReactNode} icon - Ícono a mostrar (o se deduce según la variante)
 * @param {object|React.ReactNode} itemDetails - Ficha de vista previa del evento/artículo
 * @param {boolean} loading - Estado de carga forzado
 * @param {boolean} closeOnBackdrop - Si se puede cerrar haciendo clic fuera
 * @param {boolean} showCloseButton - Muestra la 'X' superior
 * @param {'small'|'medium'} size - Ancho del modal
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de continuar con esta operación?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  icon = null,
  itemDetails = null,
  loading: externalLoading = false,
  closeOnBackdrop = true,
  showCloseButton = true,
  size = 'small',
  className = '',
  children
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const confirmBtnRef = useRef(null);

  const isLoading = externalLoading || internalLoading;

  // Manejo de animación de cierre
  const handleClose = useCallback(() => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      if (onClose) onClose();
    }, 180);
  }, [isLoading, onClose]);

  // Manejo de confirmación
  const handleConfirm = useCallback(async () => {
    if (isLoading) return;
    if (!onConfirm) {
      handleClose();
      return;
    }

    try {
      const result = onConfirm();
      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
        setInternalLoading(false);
      }
      handleClose();
    } catch (err) {
      setInternalLoading(false);
      console.error('Error in ConfirmDialog onConfirm:', err);
    }
  }, [isLoading, onConfirm, handleClose]);

  // Bloquear scroll de la página y atajos de teclado (Esc, Enter)
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    // Auto-focus en el botón de confirmación para accesibilidad
    const timer = setTimeout(() => {
      if (confirmBtnRef.current) {
        confirmBtnRef.current.focus();
      }
    }, 100);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Enter' && !isLoading && document.activeElement !== confirmBtnRef.current) {
        // Confirmar con Enter salvo que ya esté interactuando con otro botón
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, isLoading, handleClose, handleConfirm]);

  if (!isOpen && !isClosing) return null;

  // Resolver ícono según la variante si no se especificó uno
  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;

    const iconProps = { size: 26, strokeWidth: 2.2 };
    
    if (typeof icon === 'string') {
      const lower = icon.toLowerCase();
      if (lower.includes('cart') || lower.includes('carro')) return <ShoppingCart {...iconProps} />;
      if (lower.includes('bag') || lower.includes('bolsa')) return <ShoppingBag {...iconProps} />;
      if (lower.includes('trash') || lower.includes('borrar') || lower.includes('eliminar')) return <Trash2 {...iconProps} />;
      if (lower.includes('alert') || lower.includes('warn')) return <AlertTriangle {...iconProps} />;
      if (lower.includes('check') || lower.includes('success')) return <CheckCircle2 {...iconProps} />;
      if (lower.includes('info')) return <Info {...iconProps} />;
    }

    switch (variant) {
      case 'cart':
        return <ShoppingCart {...iconProps} />;
      case 'danger':
        return <Trash2 {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      case 'success':
        return <CheckCircle2 {...iconProps} />;
      case 'primary':
      default:
        return <HelpCircle {...iconProps} />;
    }
  };

  // Renderizar la ficha de vista previa del ítem
  const renderItemPreview = () => {
    if (!itemDetails) return null;
    if (React.isValidElement(itemDetails)) return itemDetails;

    const {
      title: itemTitle,
      subtitle: itemSubtitle,
      image: itemImage,
      price: itemPrice,
      quantity: itemQty,
      badge: itemBadge,
      meta: itemMeta
    } = itemDetails;

    return (
      <div className="confirm-dialog-item-preview">
        {itemImage && (
          <div className="confirm-dialog-item-image-box">
            <img 
              src={itemImage} 
              alt={itemTitle || 'Preview'} 
              className="confirm-dialog-item-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="confirm-dialog-item-info">
          {itemBadge && <span className="confirm-dialog-item-badge">{itemBadge}</span>}
          {itemTitle && <h4 className="confirm-dialog-item-title">{itemTitle}</h4>}
          {itemSubtitle && (
            <p className="confirm-dialog-item-subtitle">
              {itemSubtitle}
            </p>
          )}
          {itemMeta && <span className="confirm-dialog-item-meta">{itemMeta}</span>}
        </div>

        {(itemPrice !== undefined || itemQty !== undefined) && (
          <div className="confirm-dialog-item-price-col">
            {itemPrice !== undefined && (
              <span className="confirm-dialog-item-price">
                {typeof itemPrice === 'number' ? `$${itemPrice.toFixed(2)}` : itemPrice}
              </span>
            )}
            {itemQty !== undefined && (
              <span className="confirm-dialog-item-qty">
                Cant: {itemQty}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const backdropClass = `confirm-dialog-backdrop ${isClosing ? 'closing' : ''}`;
  const cardClass = [
    'confirm-dialog-card',
    `confirm-dialog-card--${variant}`,
    `confirm-dialog-card--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={backdropClass}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className={cardClass}>
        {/* Botón de Cerrar */}
        {showCloseButton && (
          <button 
            type="button"
            className="confirm-dialog-close" 
            onClick={handleClose}
            aria-label="Cerrar modal"
            disabled={isLoading}
          >
            <X size={16} />
          </button>
        )}

        {/* Encabezado con Icono y Títulos */}
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon-badge confirm-dialog-icon-badge--${variant}`}>
            {renderIcon()}
          </div>
          <h3 id="confirm-dialog-title" className="confirm-dialog-title">
            {title}
          </h3>
          {message && (
            <p className="confirm-dialog-message">
              {message}
            </p>
          )}
        </div>

        {/* Ficha de Vista Previa (Detalles del evento o producto) */}
        {renderItemPreview()}

        {/* Contenido adicional opcional */}
        {children && (
          <div className="confirm-dialog-body">
            {children}
          </div>
        )}

        {/* Botones de Acción */}
        <div className="confirm-dialog-footer">
          <button
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn--cancel"
            onClick={handleClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            className={`confirm-dialog-btn confirm-dialog-btn--${variant}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="confirm-dialog-spinner" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                {variant === 'cart' && <ShoppingCart size={15} />}
                {variant === 'danger' && <Trash2 size={15} />}
                {variant === 'success' && <CheckCircle2 size={15} />}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export { ConfirmDialog };
export default ConfirmDialog;
