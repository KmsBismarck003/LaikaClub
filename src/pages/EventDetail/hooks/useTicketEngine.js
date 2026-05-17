import { useState, useMemo, useCallback, useEffect } from 'react';
import { cleanPrice } from '../utils/helpers';

/**
 * useTicketEngine — Hook para gestionar la lógica de selección de boletos, secciones, asientos y carrito.
 */
export function useTicketEngine(event, id, user, navigate, location, { success, error }, addToCart) {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [activeTab, setActiveTab] = useState('sections');
  const [selectedSection, setSelectedSection] = useState(null);
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
    if (event?.functions?.length > 0 && !selectedFunction) {
      setSelectedFunction(event.functions[0]);
    }
  }, [event, selectedFunction]);

  const sortedSections = useMemo(() => {
    const sections = selectedFunction?.sections || event?.sections || [];
    return [...sections].sort((a, b) => cleanPrice(b.price) - cleanPrice(a.price));
  }, [event, selectedFunction]);

  const toggleSeat = useCallback((seatId) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) return prev.filter(s => s !== seatId);
      // Limit based on quantity if needed, or just allow free selection
      return [...prev, seatId];
    });
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedSection && sortedSections.length > 0 && !selectedSection) {
       error("Por favor selecciona una sección");
       return;
    }

    const item = {
      id: `${id}-${selectedSection?.id || 'gen'}-${Date.now()}`,
      event_id: id,
      event_name: event.name,
      section_id: selectedSection?.id,
      section_name: selectedSection?.name || "General",
      price: cleanPrice(selectedSection?.price || event.price),
      quantity: selectedSection?.type === 'seating' ? selectedSeats.length : quantity,
      seats: selectedSeats,
      function: selectedFunction,
      image: event.image_url || event.image
    };

    if (item.quantity <= 0) {
      error("Selecciona al menos un boleto o asiento");
      return;
    }

    addToCart(item);
    success("¡Boletos agregados al carrito!");
    setSelectedSeats([]);
  }, [id, event, selectedSection, quantity, selectedSeats, selectedFunction, addToCart, success, error, sortedSections]);

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
