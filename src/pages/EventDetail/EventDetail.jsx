import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { useCart } from "../../context/CartContext";
import api, { venueAPI } from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";

import { useEventDetailData } from "./hooks/useEventDetailData";
import { useTicketEngine } from "./hooks/useTicketEngine";
import { useLuckySeat } from "./hooks/useLuckySeat";
import { useVenueMap } from "./hooks/useVenueMap";
import { useSeatLock } from "./hooks/useSeatLock";
import { cleanPrice, formatDate, formatTime } from "./utils/helpers";

import EventHero from "./components/EventHero/EventHero";
import TicketSelectionPanel from "./components/TicketSelection/TicketSelectionPanel";
import EventModalsManager from "./components/Modals/EventModalsManager";
import LoginIncentiveModal from "./components/Modals/LoginIncentiveModal";
import EventLocation from "./components/Location/EventLocation";
import EventRules from "./components/Rules/EventRules";
import EventMerchSection from "./components/MerchSection/EventMerchSection";
import VenueMapContainer from "./components/VenueMap/VenueMapContainer";

import { LoadingScreen, AdCarousel } from "../../components";
import "./EventDetail.css";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user } = useAuth();
  const { success, error } = useNotification();
  const { addToCart, setIsOpen: openCart } = useCart();

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const requireAuth = (callback) => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      callback();
    }
  };

  // 1. Core Data Hook
  const { 
    event, 
    loading, 
    busySeats, 
    addBusySeats,
    fetchEventDetail,
    fetchBusySeats,
    zones,
    dynamicMap,
    seatTypes,
    loadDynamicMap,
    getSynchronizedZones
  } = useEventDetailData(id, api, venueAPI, error, navigate);

  useEffect(() => {
    fetchEventDetail();
    window.scrollTo(0, 0);
  }, [fetchEventDetail]);

  // 2. Ticket Engine Hook
  const ticketEngine = useTicketEngine(event, id, user, navigate, location, { success, error }, addToCart, zones);

  // 3. Venue Map Hook
  const venueMap = useVenueMap();

  // Load dynamic map when function changes
  useEffect(() => {
    if (ticketEngine.selectedFunction) {
      loadDynamicMap(ticketEngine.selectedFunction);
      fetchBusySeats(id, ticketEngine.selectedFunction.id);
    }
  }, [ticketEngine.selectedFunction, loadDynamicMap, fetchBusySeats, id]);

  // Sync Zones
  const synchronizedZones = useMemo(() => {
    return getSynchronizedZones(ticketEngine.sortedSections);
  }, [getSynchronizedZones, ticketEngine.sortedSections]);

  // 4. Lucky Seat Hook
  const luckySeat = useLuckySeat(id, user, navigate, location, { success, error }, api, synchronizedZones, addBusySeats);

  // 5. Seat Lock Hook (Pessimistic seat booking timer)
  const { timeLeft, isActive, formatTimeLeft, resetLock } = useSeatLock(
    ticketEngine.selectedSeats,
    ticketEngine.setSelectedSeats,
    error
  );

  // Direct Purchase Flow overrides
  const confirmDirectPayment = async (method) => {
    ticketEngine.setIsProcessingPayment(true);
    try {
      const amount = cleanPrice(ticketEngine.directTicketData.section?.price || event?.price) * ticketEngine.directTicketData.quantity;

      // 1. Create Payment Intent
      const intentResp = await api.payment.createIntent({
         amount: amount,
         method: method,
         eventId: id,
         event_id: id
      });
      
      const paymentId = intentResp.payment_id || intentResp.reference;
      
      // 2. Confirm Payment for cards
      if (method === 'card') {
         await api.payment.confirm(paymentId);
      }

      // 3. Purchase Tickets
      const purchaseItems = [];
      const directSeats = ticketEngine.directTicketData.seats;
      if (directSeats && directSeats.length > 0) {
        for (const seat of directSeats) {
          purchaseItems.push({
            eventId: id,
            quantity: 1,
            functionId: ticketEngine.selectedFunction?.id,
            sectionId: ticketEngine.directTicketData.section?.id,
            sectionName: ticketEngine.directTicketData.section?.name,
            price: cleanPrice(ticketEngine.directTicketData.section?.price || event?.price),
            seatId: seat
          });
        }
      } else {
        for (let i = 0; i < ticketEngine.directTicketData.quantity; i++) {
          purchaseItems.push({
            eventId: id,
            quantity: 1,
            functionId: ticketEngine.selectedFunction?.id,
            sectionId: ticketEngine.directTicketData.section?.id,
            sectionName: ticketEngine.directTicketData.section?.name,
            price: cleanPrice(ticketEngine.directTicketData.section?.price || event?.price),
            seatId: null
          });
        }
      }

      await api.ticket.purchase({
        items: purchaseItems,
        paymentMethod: method,
        paymentId
      });

      // Detener el bloqueo temporal
      resetLock();

      const payload = {
         id: paymentId,
         event: ticketEngine.directTicketData.event,
         section: ticketEngine.directTicketData.section,
         seats: ticketEngine.directTicketData.seats,
         quantity: ticketEngine.directTicketData.quantity,
         total: amount
      };
      
      // Registrar instantáneamente los asientos comprados en la lista de ocupados del mapa
      if (ticketEngine.directTicketData.seats?.length > 0) {
        addBusySeats(ticketEngine.directTicketData.seats);
      }
      
      ticketEngine.setPrintingData(payload);
      ticketEngine.setShowSuccessTicket(true);
      ticketEngine.setSelectedSeats([]); // Vaciar selección activa de asientos
      ticketEngine.setIsProcessingPayment(false);
      ticketEngine.setShowDirectPayment(false);
      success("¡Compra realizada con éxito!");
    } catch(err) {
      ticketEngine.setIsProcessingPayment(false);
      error(err.response?.data?.detail || "Error procesando pago");
    }
  };

  // Local State: Payment & Merch
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
  
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    if (name === "number") setCardData({ ...cardData, number: value.replace(/\D/g, "").slice(0, 16) });
    else if (name === "expiry") {
      let val = value.replace(/\D/g, "");
      if (val.length >= 2) val = val.substring(0, 2) + "/" + val.substring(2, 4);
      setCardData({ ...cardData, expiry: val });
    }
    else if (name === "cvv") setCardData({ ...cardData, cvv: value.replace(/\D/g, "").slice(0, 4) });
  };
  
  const [selectedMerchItem, setSelectedMerchItem] = useState(null);
  const [merchAttributes, setMerchAttributes] = useState({});
  const [merchQty, setMerchQty] = useState(1);

  // Parallax Hero
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 400);
      heroRef.current.style.opacity = opacity;
      heroRef.current.style.transform = `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0005})`;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="event-detail-loading" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingScreen />
      </div>
    );
  }

  if (!event) return null;

  const imageUrl = getImageUrl(event.image_url || event.image);
  const isVideo = imageUrl && (imageUrl.endsWith(".mp4") || imageUrl.includes("tiktok.com"));
  const tiktokId = isVideo && imageUrl.includes("tiktok.com/embed/") ? imageUrl.split("embed/")[1]?.split("?")[0] : null;

  const displayDate = ticketEngine.selectedFunction ? ticketEngine.selectedFunction.date : event.date;
  const displayTime = ticketEngine.selectedFunction ? ticketEngine.selectedFunction.time : event.time;
  const displayVenue = event.venue?.name || event.venue || event.location || "Recinto por confirmar";
  const displayCity = event.venue?.city || "";

  const customTicketDesign = event.printing_canvas_json ? (() => { try { return JSON.parse(event.printing_canvas_json); } catch(e) { return null; } })() : null;

  return (
    <div className="event-detail-page" style={{ "--event-bg": `url(${imageUrl})` }}>
      <div className="event-detail-container">
        {/* HERO SECTION */}
        <EventHero
          heroRef={heroRef}
          imageUrl={imageUrl}
          event={event}
          isVideo={isVideo}
          tiktokId={tiktokId}
          videoRef={videoRef}
          formatDate={formatDate}
          displayDate={displayDate}
          formatTime={formatTime}
          displayTime={displayTime}
          displayVenue={displayVenue}
          displayCity={displayCity}
          navigate={navigate}
        />

        <div className="layout-dual-column">
          {/* LEFT COLUMN: Map, Details, Location */}
          <div className="event-left-column">
            {isActive && (
              <div className="seat-lock-countdown-banner">
                <div className="seat-lock-info">
                  <span style={{ fontSize: '1.2rem', animation: 'pulseLock 1.5s infinite ease-in-out' }}>🔒</span>
                  <span>Reserva temporal activa: tus asientos seleccionados están reservados</span>
                </div>
                <div className="seat-lock-timer">
                  {formatTimeLeft()}
                </div>
              </div>
            )}

            <VenueMapContainer
              event={event}
              synchronizedZones={synchronizedZones}
              sortedSections={ticketEngine.sortedSections}
              selectedSection={ticketEngine.selectedSection}
              setSelectedSection={ticketEngine.setSelectedSection}
              selectedSeats={ticketEngine.selectedSeats}
              toggleSeat={ticketEngine.toggleSeat}
              busySeats={busySeats}
              seatTypes={seatTypes}
              isRouletteActive={luckySeat.isRouletteActive}
              winningSeatId={luckySeat.winningSeatId}
              activeScannerZoneId={luckySeat.activeScannerZoneId}
              activeScannerSeatId={luckySeat.activeScannerSeatId}
              showCrownTransition={luckySeat.showCrownTransition}
              handleRouletteComplete={luckySeat.handleRouletteComplete}
              mapScale={venueMap.mapScale}
              mapPos={venueMap.mapPos}
              isDragging={venueMap.isDragging}
              dragStart={venueMap.dragStart}
              setMapPos={venueMap.setMapPos}
              setIsDragging={venueMap.setIsDragging}
              setDragStart={venueMap.setDragStart}
              handleZoom={venueMap.handleZoom}
              resetMap={venueMap.resetMap}
            />

            <div className="event-description">
                <h2>Acerca del evento</h2>
                <p>{event.description || "Disfruta de este evento exclusivo con la mejor producción y sonido."}</p>
            </div>

            <EventMerchSection
              event={event}
              selectedMerchItem={selectedMerchItem}
              setSelectedMerchItem={setSelectedMerchItem}
              merchAttributes={merchAttributes}
              setMerchAttributes={setMerchAttributes}
              merchQty={merchQty}
              setMerchQty={setMerchQty}
              addToCart={(...args) => requireAuth(() => addToCart(...args))}
              success={success}
              openCart={openCart}
            />

             <EventLocation displayVenue={displayVenue} displayCity={displayCity} />
             <EventRules event={event} />
             {event.ads_enabled && (
               <div className="event-detail-ad-wrapper left-sidebar mt-4">
                 <AdCarousel position="side_left" eventId={id} />
               </div>
             )}
           </div>
 
           {/* RIGHT COLUMN: Ticket Selection */}
           <div className="event-right-column">
              <TicketSelectionPanel
                user={user}
                event={event}
                hasFunctions={event.functions && event.functions.length > 0}
                selectedFunction={ticketEngine.selectedFunction}
                setSelectedFunction={ticketEngine.setSelectedFunction}
                sortedSections={ticketEngine.sortedSections}
                selectedSection={ticketEngine.selectedSection}
                setSelectedSection={ticketEngine.setSelectedSection}
                quantity={ticketEngine.quantity}
                setQuantity={ticketEngine.setQuantity}
                selectedSeats={ticketEngine.selectedSeats}
                cleanPrice={cleanPrice}
                handleAddToCart={() => requireAuth(ticketEngine.handleAddToCart)}
                handleDirectBuy={() => requireAuth(ticketEngine.handleDirectBuy)}
                handleLuckySeat={() => requireAuth(luckySeat.handleLuckySeat)}
                isRouletteActive={luckySeat.isRouletteActive}
                setShowProbModal={luckySeat.setShowProbModal}
              />
             {event.ads_enabled && (
               <div className="event-detail-ad-wrapper right-sidebar mt-4">
                 <AdCarousel position="side_right" eventId={id} />
               </div>
             )}
           </div>
         </div>
      </div>

      <EventModalsManager
        showProbModal={luckySeat.showProbModal}
        setShowProbModal={luckySeat.setShowProbModal}
        showRoulettePayment={luckySeat.showRoulettePayment}
        setShowRoulettePayment={luckySeat.setShowRoulettePayment}
        isProcessingPayment={luckySeat.isProcessingPayment || ticketEngine.isProcessingPayment}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cardData={cardData}
        handleCardChange={handleCardChange}
        confirmRoulettePayment={luckySeat.confirmRoulettePayment}
        showDirectPayment={ticketEngine.showDirectPayment}
        setShowDirectPayment={ticketEngine.setShowDirectPayment}
        directTicketData={ticketEngine.directTicketData}
        selectedSection={ticketEngine.selectedSection}
        confirmDirectPayment={confirmDirectPayment}
        showSuccessTicket={ticketEngine.showSuccessTicket}
        setShowSuccessTicket={ticketEngine.setShowSuccessTicket}
        customTicketDesign={customTicketDesign}
        event={event}
        displayDate={displayDate}
        displayTime={displayTime}
        cleanPrice={cleanPrice}
        formatDate={formatDate}
        formatTime={formatTime}
        navigate={navigate}
        showWinnerModal={luckySeat.showWinnerModal}
        winningSeatInfo={luckySeat.winningSeatInfo}
        luckyConfig={luckySeat.luckyConfig}
        setShowWinnerModal={luckySeat.setShowWinnerModal}
        setWinningSeatId={luckySeat.setWinningSeatId}
        showPrinter={ticketEngine.showPrinter}
        setShowPrinter={ticketEngine.setShowPrinter}
        printingData={ticketEngine.printingData}
        isPrinterProcessing={ticketEngine.isPrinterProcessing}
        setIsPrinterProcessing={ticketEngine.setIsPrinterProcessing}
      />

      <LoginIncentiveModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

export default EventDetail;
