import { useState, useMemo, useCallback, useEffect } from 'react';
import { cleanPrice } from '../utils/helpers';

/**
 * useTicketEngine — Hook para gestionar la lógica de selección de boletos, secciones, asientos y carrito.
 */
export function useTicketEngine(event, id, user, navigate, location, { success, error }, addToCart, zones) {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [activeTab, setActiveTab] = useState('sections');
  const [selectedSectionId, setSelectedSectionId] = useState('general');
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Payment states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showDirectPayment, setShowDirectPayment] = useState(false);
  const [directTicketData, setDirectTicketData] = useState(null);
  const [showSuccessTicket, setShowSuccessTicket] = useState(false);
  const [printingData, setPrintingData] = useState(null);
  const [showPrinter, setShowPrinter] = useState(false);
  const [isPrinterProcessing, setIsPrinterProcessing] = useState(false);

  // Initialize selected function
  useEffect(() => {
    if (event?.functions?.length > 0) {
      setSelectedFunction(event.functions[0]);
    } else {
      setSelectedFunction(null);
    }
  }, [event]);

  const isEventSeating = useMemo(() => {
    const hasMapData = (event?.room?.layout_json?.components?.length > 0) ||
                       (event?.seating_map?.layout_json?.components?.length > 0);
    // If it has map components, it's a seating event
    return event?.use_seating_map !== false && hasMapData;
  }, [event]);

  // Synchronize quantity with selected seats length for seating events
  useEffect(() => {
    if (isEventSeating) {
      setQuantity(selectedSeats.length);
    }
  }, [selectedSeats, isEventSeating]);

  const sortedSections = useMemo(() => {
    const sections = selectedFunction?.sections || event?.sections || [];
    if (sections.length > 0) {
      return [...sections].sort((a, b) => cleanPrice(b.price) - cleanPrice(a.price));
    }
    // Single general section using the event's established base price
    return [{
      id: 'general',
      name: 'Boleto General',
      price: event?.price || 0,
      type: isEventSeating ? 'seating' : 'general',
      available: event?.capacity || 100,
      total: event?.capacity || 100
    }];
  }, [event, selectedFunction, isEventSeating]);

  // Derive the active selected section object dynamically from sortedSections (recalculates immediately when event/price loads!)
  const selectedSection = useMemo(() => {
    return sortedSections.find(s => String(s?.id || '') === String(selectedSectionId || '')) || sortedSections[0] || null;
  }, [sortedSections, selectedSectionId]);

  // Backward compatibility setter
  const setSelectedSection = useCallback((sec) => {
    setSelectedSectionId(sec?.id || sec || 'general');
  }, []);

  const toggleSeat = useCallback((seatId) => {
    setSelectedSeats(prev => {
      const nextSeats = prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId];
      
      // Auto-detect and select the matching section/zone on seat toggle
      if (nextSeats.length > 0) {
        const matched = sortedSections.find(s => {
          if (!s) return false;
          const sIdStr = String(s.id || '').toLowerCase();
          const sNameStr = String(s.name || '').toLowerCase().replace(/\s+/g, '-');
          const seatIdStr = String(seatId || '').toLowerCase();
          const seatIdFirstPart = seatIdStr.split('-')[0] || '';
          
          return (
            (sIdStr && seatIdStr.startsWith(sIdStr)) || 
            (sNameStr && seatIdStr.startsWith(sNameStr)) ||
            (sIdStr && sIdStr.startsWith(seatIdFirstPart))
          );
        });
        if (matched && String(selectedSectionId) !== String(matched.id)) {
          setSelectedSectionId(matched.id);
        } else if (!matched && sortedSections.length === 1) {
          setSelectedSectionId(sortedSections[0].id);
        }
      }
      
      return nextSeats;
    });
  }, [sortedSections, selectedSectionId]);

  const handleAddToCart = useCallback(() => {
    if (!selectedSection && sortedSections.length > 0) {
       error("Por favor selecciona una sección");
       return;
    }

    const qty = selectedSection?.type === 'seating' ? selectedSeats.length : quantity;
    if (qty <= 0) {
      error("Selecciona al menos un boleto o asiento");
      return;
    }

    // Call addToCart with correct signature: addToCart(event, quantity, functionData, sectionData, seats)
    addToCart(event, qty, selectedFunction, selectedSection, selectedSeats);
    setSelectedSeats([]);
  }, [event, selectedSection, quantity, selectedSeats, selectedFunction, addToCart, error, sortedSections]);

  const handleDirectBuy = useCallback(() => {
    if (!selectedSection && sortedSections.length > 0) {
       error("Por favor selecciona una sección");
       return;
    }

    const qty = selectedSection?.type === 'seating' ? selectedSeats.length : quantity;
    if (qty <= 0) {
      error("Selecciona al menos un boleto o asiento");
      return;
    }

    setDirectTicketData({
      event: event,
      section: selectedSection,
      seats: selectedSeats,
      quantity: qty,
      total: cleanPrice(selectedSection?.price || event?.price) * qty
    });
    setShowDirectPayment(true);
  }, [event, selectedSection, selectedSeats, quantity, sortedSections, error]);

  return {
    selectedFunction,
    setSelectedFunction,
    activeTab,
    setActiveTab,
    sortedSections,
    selectedSection,
    setSelectedSection,
    quantity,
    setQuantity,
    selectedSeats,
    setSelectedSeats,
    toggleSeat,
    handleAddToCart,
    handleDirectBuy,
    isEventSeating,
    
    // Payment & Printer
    isProcessingPayment, setIsProcessingPayment,
    showDirectPayment, setShowDirectPayment,
    directTicketData, setDirectTicketData,
    showSuccessTicket, setShowSuccessTicket,
    printingData, setPrintingData,
    showPrinter, setShowPrinter,
    isPrinterProcessing, setIsPrinterProcessing
  };
}
