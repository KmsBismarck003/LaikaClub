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
import { useSeatPolling } from "./hooks/useSeatPolling";
import { useDirectPayment } from "./hooks/useDirectPayment";
import { cleanPrice, formatDate, formatTime } from "./utils/helpers";
import { useFreeEventFlow } from "../../hooks/useFreeEventFlow";

import EventHeroV2 from "./components/EventHero/EventHeroV2";
import TicketSelectionPanel from "./components/TicketSelection/TicketSelectionPanel";
import EventModalsManager from "./components/Modals/EventModalsManager";
import LoginIncentiveModal from "./components/Modals/LoginIncentiveModal";
import EventLocation from "./components/Location/EventLocation";
import EventRules from "./components/EventRules/EventRules";
import EventMerchSection from "./components/MerchSection/EventMerchSection";
import VenueMapContainer from "./components/VenueMap/VenueMapContainer";
import EventPoster from "./components/EventPoster/EventPoster";
import EventDescription from "./components/EventDescription/EventDescription";
import EventGallery from "./components/EventGallery/EventGallery";

import { LoadingScreen, AdCarousel } from "../../components";
import { usePresale, PresaleGate } from "../../features/presale";
import "./EventDetail.css";

/**
 * EventDetail — Orquestador visual de la página de detalle de evento.
 *
 * Responsabilidad: componer sub-componentes y conectar hooks.
 * Toda la lógica de negocio vive en los custom hooks.
 */
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
  const { isEventSeating } = ticketEngine;

  // 3. Presale Hook
  const presale = usePresale(event);

  // 4. Venue Map Hook
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

  // 5. Lucky Seat Hook
  const luckySeat = useLuckySeat(id, user, navigate, location, { success, error }, api, synchronizedZones, addBusySeats);

  // 6. Seat Lock Hook
  const { timeLeft, isActive, formatTimeLeft, resetLock } = useSeatLock(
    ticketEngine.selectedSeats,
    ticketEngine.setSelectedSeats,
    error
  );

  // 7. Polling Sincronizador de Asientos
  useSeatPolling(
    id,
    ticketEngine.selectedFunction?.id,
    fetchBusySeats,
    ticketEngine.selectedSeats,
    ticketEngine.setSelectedSeats,
    busySeats,
    error
  );

  // 8. Free Event Hook
  const freeFlow = useFreeEventFlow(
    event,
    ticketEngine.selectedSection,
    { success, error },
    (_result) => {
      success('Entrada registrada en tu Wallet');
      navigate('/user/tickets');
    }
  );

  // 9. Direct Payment Hook (lógica extraída del orquestador)
  const directPayment = useDirectPayment({
    id,
    event,
    ticketEngine,
    addBusySeats,
    fetchBusySeats,
    resetLock,
    notifications: { success, error },
    api,
    cleanPrice,
  });

  // Merch local state (pertenece al orquestador por ser UI pura)
  const [selectedMerchItem, setSelectedMerchItem] = useState(null);
  const [merchAttributes, setMerchAttributes] = useState({});
  const [merchQty, setMerchQty] = useState(1);

  const heroRef = useRef(null);
  const videoRef = useRef(null);

  if (loading) {
    return (
      <div className="event-detail-loading">
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
  const displayVenue = ticketEngine.selectedFunction?.venue_name || event.venue?.name || event.venue || event.location || "Recinto por confirmar";
  const displayCity = ticketEngine.selectedFunction?.venue_city || event.venue?.city || "";

  const customTicketDesign = event.printing_canvas_json
    ? (() => { try { return JSON.parse(event.printing_canvas_json); } catch (e) { return null; } })()
    : null;

  return (
    <div className="event-detail-page">

      {/* PRESALE GATE */}
      {presale.needsPresaleGate && (
        <PresaleGate
          presaleState={presale.presaleState}
          binInput={presale.binInput}
          onBinChange={presale.handleBinChange}
          validationError={presale.validationError}
          isValidating={presale.isValidating}
          onSubmit={presale.attemptUnlock}
        />
      )}

      {/* ── HERO (full-bleed, sin container wrapper) ── */}
      <EventHeroV2
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
        isLockActive={isActive}
        formatTimeLeft={formatTimeLeft}
        presale={presale.needsPresaleGate ? null : presale}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="event-detail-container">
        <div className="layout-dual-column">

          {/* LEFT COLUMN */}
          <div className="event-left-column">
            {isEventSeating ? (
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
            ) : event.gallery_urls ? (
              <EventGallery galleryUrls={event.gallery_urls} />
            ) : (
              <EventPoster imageUrl={imageUrl} eventName={event.name} />
            )}

            <EventDescription event={event} isEventSeating={isEventSeating} />

            {/* EventRules renderiza null automáticamente si no hay reglas */}
            <EventRules rules={event.rules} />

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

            {event.ads_enabled && (
              <div className="event-detail-ad-wrapper left-sidebar mt-4">
                <AdCarousel position="side_left" eventId={id} />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
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
              isFreeEvent={freeFlow.isFreeEvent}
              onClaimFree={() => requireAuth(() => freeFlow.claimFreeTicket({
                functionId: ticketEngine.selectedFunction?.id,
                seats: ticketEngine.selectedSeats?.length > 0 ? ticketEngine.selectedSeats : null,
                quantity: ticketEngine.selectedSection?.type === 'seating' ? ticketEngine.selectedSeats.length : ticketEngine.quantity
              }))}
              isClaimingFree={freeFlow.loading}
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
        paymentMethod={directPayment.paymentMethod}
        setPaymentMethod={directPayment.setPaymentMethod}
        cardData={directPayment.cardData}
        handleCardChange={directPayment.handleCardChange}
        confirmRoulettePayment={luckySeat.confirmRoulettePayment}
        showDirectPayment={ticketEngine.showDirectPayment}
        setShowDirectPayment={ticketEngine.setShowDirectPayment}
        directTicketData={ticketEngine.directTicketData}
        selectedSection={ticketEngine.selectedSection}
        confirmDirectPayment={directPayment.confirmDirectPayment}
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
