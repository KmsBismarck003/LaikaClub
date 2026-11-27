import { useState, useEffect, useCallback, useMemo } from 'react';
import { eventAPI } from '../services/api';
import { merchService } from '../services/merch.service';

export function getCartItemKey(item) {
  return `${item?.eventId ?? ''}-${item?.functionId ?? ''}-${item?.sectionId ?? ''}-${item?.variantId ?? item?.id ?? ''}`;
}

export function isMerchCartItem(item) {
  return Boolean(
    item?.sectionId === 'MERCH' ||
    item?.type === 'merch' ||
    item?.isMerch ||
    String(item?.eventId || '').startsWith('merch_') ||
    String(item?.id || '').startsWith('merch_')
  );
}

export function extractMerchIds(item) {
  let variantId = item?.variantId ?? null;
  let productId = item?.merchId ?? null;

  const parseFromRaw = (raw) => {
    if (!raw || !String(raw).startsWith('merch_')) return;
    const parts = String(raw).split('_');
    if (!productId && parts.length >= 2 && !Number.isNaN(parseInt(parts[1], 10))) {
      productId = parseInt(parts[1], 10);
    }
    if (!variantId && parts.length >= 3 && !Number.isNaN(parseInt(parts[2], 10))) {
      variantId = parseInt(parts[2], 10);
    }
  };

  parseFromRaw(item?.eventId);
  parseFromRaw(item?.id);

  return { productId, variantId };
}

function isErrorNotFound(err) {
  const status = err?.status || err?.response?.status;
  if (status === 404 || status === 410) return true;
  const msg = String(err?.message || '').toLowerCase();
  return msg.includes('404') || msg.includes('no encontrado') || msg.includes('not found');
}

function isDatePast(dateStr, timeStr) {
  if (!dateStr) return false;
  const trimmed = String(dateStr).trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  const parsed = dateOnly ? new Date(`${trimmed}T23:59:59`) : new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return false;

  if (dateOnly && timeStr && /^\d{1,2}:\d{2}/.test(String(timeStr).trim())) {
    const [h, m] = String(timeStr).trim().split(':').map(Number);
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      parsed.setHours(h, m, 0, 0);
    }
  }
  return parsed.getTime() < Date.now();
}

export function evaluateEventAvailability(item, eventData, fetchError = null) {
  const qty = Number(item?.quantity || 1);

  if (fetchError) {
    if (isErrorNotFound(fetchError)) {
      return {
        status: 'unavailable',
        available: false,
        reason: 'Este evento ya no está disponible',
        maxStock: 0,
      };
    }
    // Error transitorio de red: validar al menos la fecha almacenada
    if (isDatePast(item?.functionDate, item?.functionTime)) {
      return {
        status: 'unavailable',
        available: false,
        reason: 'Este evento ya finalizó',
        maxStock: 0,
      };
    }
    return { status: 'available', available: true, reason: null, maxStock: null };
  }

  if (!eventData) {
    return {
      status: 'unavailable',
      available: false,
      reason: 'Este evento ya no está disponible',
      maxStock: 0,
    };
  }

  const st = String(eventData.status || '').toLowerCase();
  if (st && ['cancelled', 'canceled', 'draft', 'archived', 'inactive', 'deleted', 'ended', 'finished', 'completed'].includes(st)) {
    return {
      status: 'unavailable',
      available: false,
      reason: st === 'cancelled' || st === 'canceled' ? 'Evento cancelado' : 'Evento no disponible para venta',
      maxStock: 0,
    };
  }

  const dateToCheck = item?.functionDate || eventData.date;
  const timeToCheck = item?.functionTime || eventData.time;
  if (isDatePast(dateToCheck, timeToCheck)) {
    return {
      status: 'unavailable',
      available: false,
      reason: 'Este evento ya finalizó',
      maxStock: 0,
    };
  }

  const rawAvail =
    eventData.available_tickets !== undefined
      ? eventData.available_tickets
      : eventData.availableTickets;

  if (rawAvail !== undefined && rawAvail !== null && !Number.isNaN(Number(rawAvail))) {
    const maxStock = Math.max(0, Number(rawAvail));
    if (maxStock === 0) {
      return {
        status: 'unavailable',
        available: false,
        reason: 'Boletos agotados',
        maxStock: 0,
      };
    }
    if (qty > maxStock) {
      return {
        status: 'partial',
        available: false,
        reason: `Solo ${maxStock === 1 ? 'queda 1 boleto disponible' : `quedan ${maxStock} boletos disponibles`}`,
        maxStock,
      };
    }
    return { status: 'available', available: true, reason: null, maxStock };
  }

  return { status: 'available', available: true, reason: null, maxStock: null };
}

export function evaluateMerchAvailability(item, prodData, fetchError = null) {
  const qty = Number(item?.quantity || 1);
  const { variantId } = extractMerchIds(item);

  if (fetchError) {
    if (isErrorNotFound(fetchError)) {
      return {
        status: 'unavailable',
        available: false,
        reason: 'Producto retirado del catálogo',
        maxStock: 0,
      };
    }
    if (item?.isAvailable === false || (item?.stock !== undefined && Number(item.stock) <= 0)) {
      return {
        status: 'unavailable',
        available: false,
        reason: 'Producto agotado',
        maxStock: 0,
      };
    }
    if (item?.stock !== undefined && qty > Number(item.stock)) {
      const s = Math.max(0, Number(item.stock));
      return {
        status: 'partial',
        available: false,
        reason: `Solo ${s === 1 ? 'queda 1 unidad disponible' : `quedan ${s} unidades disponibles`}`,
        maxStock: s,
      };
    }
    return { status: 'available', available: true, reason: null, maxStock: item?.stock ?? null };
  }

  if (!prodData) {
    return {
      status: 'unavailable',
      available: false,
      reason: 'Producto retirado del catálogo',
      maxStock: 0,
    };
  }

  const st = String(prodData.status || '').toLowerCase();
  const adminSt = String(prodData.admin_status || prodData.adminStatus || '').toLowerCase();
  if (
    ['archived', 'draft', 'inactive', 'deleted'].includes(st) ||
    ['rejected'].includes(adminSt)
  ) {
    return {
      status: 'unavailable',
      available: false,
      reason: 'Producto ya no disponible en catálogo',
      maxStock: 0,
    };
  }

  let stock = null;
  if (variantId && Array.isArray(prodData.variants) && prodData.variants.length > 0) {
    const variant = prodData.variants.find((v) => String(v.id) === String(variantId));
    if (!variant || variant.isActive === false || variant.is_active === false) {
      return {
        status: 'unavailable',
        available: false,
        reason: 'Esta talla o variante ya no está disponible',
        maxStock: 0,
      };
    }
    if (variant.stock !== undefined && variant.stock !== null) {
      stock = Math.max(0, Number(variant.stock));
    }
  } else if (prodData.stock !== undefined && prodData.stock !== null) {
    stock = Math.max(0, Number(prodData.stock));
  }

  if (stock !== null) {
    if (stock === 0) {
      return {
        status: 'unavailable',
        available: false,
        reason: 'Producto agotado',
        maxStock: 0,
      };
    }
    if (qty > stock) {
      return {
        status: 'partial',
        available: false,
        reason: `Solo ${stock === 1 ? 'queda 1 unidad disponible' : `quedan ${stock} unidades disponibles`}`,
        maxStock: stock,
      };
    }
    return { status: 'available', available: true, reason: null, maxStock: stock };
  }

  return { status: 'available', available: true, reason: null, maxStock: null };
}

export default function useCartAvailability(cart = [], { removeFromCart, updateQuantity } = {}) {
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [checking, setChecking] = useState(false);

  const checkAvailability = useCallback(async () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      setAvailabilityMap({});
      setChecking(false);
      return;
    }

    setChecking(true);

    const uniqueEventIds = [
      ...new Set(
        cart
          .filter((item) => !isMerchCartItem(item) && item?.eventId != null)
          .map((item) => item.eventId)
      ),
    ];

    const uniqueMerchIds = [
      ...new Set(
        cart
          .filter((item) => isMerchCartItem(item))
          .map((item) => extractMerchIds(item).productId)
          .filter(Boolean)
      ),
    ];

    const eventCache = {};
    const merchCache = {};

    await Promise.all([
      ...uniqueEventIds.map(async (eventId) => {
        try {
          const data = await eventAPI.getById(eventId);
          eventCache[String(eventId)] = { data, error: null };
        } catch (err) {
          eventCache[String(eventId)] = { data: null, error: err };
        }
      }),
      ...uniqueMerchIds.map(async (productId) => {
        try {
          const data = await merchService.getMerchandiseById(productId);
          merchCache[String(productId)] = { data, error: null };
        } catch (err) {
          merchCache[String(productId)] = { data: null, error: err };
        }
      }),
    ]);

    const nextMap = {};
    for (const item of cart) {
      const key = getCartItemKey(item);
      if (isMerchCartItem(item)) {
        const { productId } = extractMerchIds(item);
        const cached = productId ? merchCache[String(productId)] : null;
        nextMap[key] = cached
          ? evaluateMerchAvailability(item, cached.data, cached.error)
          : evaluateMerchAvailability(item, null, new Error('offline'));
      } else {
        const cached = item?.eventId != null ? eventCache[String(item.eventId)] : null;
        nextMap[key] = cached
          ? evaluateEventAvailability(item, cached.data, cached.error)
          : { status: 'available', available: true, reason: null, maxStock: null };
      }
    }

    setAvailabilityMap(nextMap);
    setChecking(false);
  }, [cart]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!active) return;
      await checkAvailability();
    };
    run();
    return () => {
      active = false;
    };
  }, [checkAvailability]);

  const getItemStatus = useCallback(
    (item) => {
      const key = getCartItemKey(item);
      if (availabilityMap[key]) return availabilityMap[key];
      const fallbackAvail = item?.isAvailable !== false && (item?.stock === undefined || Number(item.stock) > 0);
      return {
        status: fallbackAvail ? 'available' : 'unavailable',
        available: fallbackAvail,
        reason: fallbackAvail ? null : 'Agotado o no disponible',
        maxStock: item?.stock ?? null,
      };
    },
    [availabilityMap]
  );

  const { unavailableItems, partialStockItems, issueItems } = useMemo(() => {
    const unavailable = [];
    const partial = [];
    for (const item of cart) {
      const st = getItemStatus(item);
      if (st.status === 'unavailable') unavailable.push({ item, status: st });
      else if (st.status === 'partial') partial.push({ item, status: st });
    }
    return {
      unavailableItems: unavailable,
      partialStockItems: partial,
      issueItems: [...unavailable, ...partial],
    };
  }, [cart, getItemStatus]);

  const resolveAllIssues = useCallback(async () => {
    let removedCount = 0;
    let adjustedCount = 0;

    for (const { item } of unavailableItems) {
      if (removeFromCart) {
        await removeFromCart(item.eventId, item.functionId, item.sectionId);
        removedCount += 1;
      }
    }

    for (const { item, status } of partialStockItems) {
      if (updateQuantity && status.maxStock > 0) {
        updateQuantity(item.eventId, status.maxStock, item.functionId, item.sectionId);
        adjustedCount += 1;
      }
    }

    return { removedCount, adjustedCount };
  }, [unavailableItems, partialStockItems, removeFromCart, updateQuantity]);

  return {
    availabilityMap,
    checking,
    getItemStatus,
    unavailableItems,
    partialStockItems,
    issueItems,
    hasBlockingIssues: issueItems.length > 0,
    resolveAllIssues,
    recheck: checkAvailability,
  };
}

