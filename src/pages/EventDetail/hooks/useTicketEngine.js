import { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * useTicketEngine — Hook para gestionar la selección de boletos, funciones y carrito directo.
 */
export function useTicketEngine(event, id, user, navigate, location, { success, error }, addToCart) {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [activeTab, setActiveTab] = useState("lowest"); // 'lowest' or 'best'
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Direct Purchase State
  const [showDirectPayment, setShowDirectPayment] = useState(false);
  const [directTicketData, setDirectTicketData] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Auth Gate & Guest Flow
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [showSuccessTicket, setShowSuccessTicket] = useState(false);

  // 🛡️ RECUPERACIÓN DE ESTADO PERSISTIDO (Anti-Fuga de Datos tras Login)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const guestParam = params.get('guest');
    
    // 1. Forzar modo invitado si viene en el URL
    if (guestParam === 'true') {
      setIsGuest(true);
    }

    // 2. Recuperar Selección (Sección y Asientos)
    const savedSection = localStorage.getItem('laika_pending_section');
    const savedSeats = localStorage.getItem('laika_pending_seats');
    
    if (savedSection) {
      try {
        const parsed = JSON.parse(savedSection);
        if (parsed) setSelectedSection(parsed);
        localStorage.removeItem('laika_pending_section');
      } catch(e) { console.error("Error recuperando sección:", e); }
    }
    if (savedSeats) {
      try {
        const parsed = JSON.parse(savedSeats);
        if (parsed && parsed.length > 0) setSelectedSeats(parsed);
        localStorage.removeItem('laika_pending_seats');
      } catch(e) { console.error("Error recuperando asientos:", e); }
    }
  }, [location.search]); // Escuchamos cambios en la URL por si acaso

  // Clean Price Utility
  const cleanPrice = useCallback((val) => {
    if (!val && val !== 0) return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }, []);

  // Sort sections
  const sortedSections = useMemo(() => {
    if (!event) return [];
    let sections = (event.sections && event.sections.length > 0) ? [...event.sections] : [];
    
    if (activeTab === "lowest") {
      return sections.sort((a, b) => cleanPrice(a.price) - cleanPrice(b.price));
    } else {
      return sections.sort((a, b) => cleanPrice(b.price) - cleanPrice(a.price));
    }
  }, [event, activeTab, cleanPrice]);

  const toggleSeat = useCallback((seatId) => {
    const isRemoving = selectedSeats.includes(seatId);
    if (isRemoving) {
      setSelectedSeats([]);
    } else {
      const sectionIdFromSeat = String(seatId).split('-')[0];
      const zone = sortedSections.find(s => String(s.id) === sectionIdFromSeat);
      if (zone) {
        setSelectedSection(zone);
        setQuantity(1);
      }
      setSelectedSeats([seatId]);
    }
  }, [selectedSeats, sortedSections]);

  const handleAuthGateLogin = () => {
    setShowAuthGate(false);
    navigate("/login", { state: { from: location.pathname, fromPurchase: true } });
  };

  const handleAuthGateGuest = () => {
    setShowAuthGate(false);
    setIsGuest(true);
    // Disparamos el modal de pago directamente
    continueToPurchaseAction();
  };

  const continueToPurchaseAction = useCallback(() => {
    if (!event || event.available_tickets < quantity) {
      error("No hay suficientes boletos disponibles");
      return;
    }

    if (!selectedSection && selectedSeats.length === 0) {
      error("Por favor selecciona una zona o un asiento de la sección deseada.");
      return;
    }

    let functionData = (event.functions && event.functions.length > 0) ? selectedFunction : null;
    if (event.functions && event.functions.length > 0 && !selectedFunction) {
      error("Por favor selecciona una fecha");
      return;
    }

    setDirectTicketData({
      event: event,
      quantity: quantity,
      section: selectedSection,
      functionData: functionData,
      seats: selectedSeats
    });
    setShowDirectPayment(true);
  }, [event, quantity, selectedFunction, selectedSeats, selectedSection, error]);

  const handleAddToCart = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const isReturningGuest = params.get('guest') === 'true';

    if (!user && !isGuest && !isReturningGuest) {
      // PERSISTIR SELECCIÓN ANTES DEL LOGIN
      if (selectedSection) localStorage.setItem('laika_pending_section', JSON.stringify(selectedSection));
      if (selectedSeats.length > 0) localStorage.setItem('laika_pending_seats', JSON.stringify(selectedSeats));
      
      // REDIRECCIÓN NATIVA
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('guest', 'true');
      
      // Construimos la URL de retorno con el intent incluido
      const returnUrl = `${location.pathname}?intent=purchase`;
      searchParams.set('redirect', returnUrl);
      
      navigate(`/login?${searchParams.toString()}`);
      return;
    }
  }, [user, isGuest, continueToPurchaseAction, location, navigate, selectedSection, selectedSeats]);

  const handleRealAddToCart = useCallback(() => {
    if (!event || event.available_tickets < quantity) {
      error("No hay suficientes boletos disponibles");
      return;
    }

    if (!selectedSection && selectedSeats.length === 0) {
      error("Por favor selecciona una zona o un asiento de la sección deseada.");
      return;
    }

    let functionData = (event.functions && event.functions.length > 0) ? selectedFunction : null;
    if (event.functions && event.functions.length > 0 && !selectedFunction) {
      error("Por favor selecciona una fecha");
      return;
    }

    addToCart(event, quantity, functionData, selectedSection);
  }, [event, quantity, selectedFunction, selectedSection, selectedSeats, error, addToCart]);

  return {
    selectedFunction, setSelectedFunction,
    selectedSection, setSelectedSection,
    activeTab, setActiveTab,
    quantity, setQuantity,
    selectedSeats, setSelectedSeats,
    sortedSections,
    cleanPrice,
    toggleSeat,
    handleAddToCart,
    handleRealAddToCart,
    showDirectPayment, setShowDirectPayment,
    directTicketData, setDirectTicketData,
    isProcessingPayment, setIsProcessingPayment,
    // Auth Gate Props
    showAuthGate, setShowAuthGate,
    isGuest, setIsGuest,
    guestEmail, setGuestEmail,
    handleAuthGateLogin,
    handleAuthGateGuest,
    showSuccessTicket, setShowSuccessTicket
  };
}
