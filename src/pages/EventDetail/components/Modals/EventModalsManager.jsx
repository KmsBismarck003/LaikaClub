import React from 'react';
import { ProbabilityModal, LuckySeatPaymentModal, WinnerModal } from "../LuckySeatModal/LuckySeatModal";
import { PurchaseModal, SuccessModal } from "../PurchaseModal/PurchaseModal";
import { Modal, Button, Icon } from "../../../../components";
import "./CommonModals.css";
import TicketPrinterOverlay from "../../../user/UserCart/TicketPrinterOverlay";

const EventModalsManager = ({
  showProbModal,
  setShowProbModal,
  showRoulettePayment,
  setShowRoulettePayment,
  isProcessingPayment,
  event,
  displayDate,
  displayTime,
  paymentMethod,
  setPaymentMethod,
  cardData,
  handleCardChange,
  getFormattedNumber,
  confirmRoulettePayment,
  showDirectPayment,
  setShowDirectPayment,
  directTicketData,
  selectedSection,
  confirmDirectPayment,
  cleanPrice,
  showSuccessTicket,
  setShowSuccessTicket,
  navigate,
  showWinnerModal,
  setShowWinnerModal,
  winningSeatInfo,
  luckyConfig,
  setWinningSeatId,
  success,
  showPrinter,
  setShowPrinter,
  printingData,
  isPrinterProcessing,
  isPaymentApproved,
  guestEmail,
  setGuestEmail
}) => {
  return (
    <>
      <ProbabilityModal 
        isOpen={showProbModal} 
        onClose={() => setShowProbModal(false)} 
      />

      <LuckySeatPaymentModal
        isOpen={showRoulettePayment}
        onClose={() => setShowRoulettePayment(false)}
        isProcessingPayment={isProcessingPayment}
        isPaymentApproved={isPaymentApproved}
        event={event}
        displayDate={displayDate}
        displayTime={displayTime}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cardData={cardData}
        handleCardChange={handleCardChange}
        getFormattedNumber={getFormattedNumber}
        confirmRoulettePayment={confirmRoulettePayment}
      />

      <PurchaseModal
        isOpen={showDirectPayment}
        onClose={() => setShowDirectPayment(false)}
        isProcessingPayment={isProcessingPayment}
        isPaymentApproved={isPaymentApproved}
        event={event}
        displayDate={displayDate}
        displayTime={displayTime}
        directTicketData={directTicketData}
        selectedSection={selectedSection}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cardData={cardData}
        handleCardChange={handleCardChange}
        getFormattedNumber={getFormattedNumber}
        cleanPrice={cleanPrice}
        confirmDirectPayment={confirmDirectPayment}
      />

      <SuccessModal
        isOpen={showSuccessTicket}
        onClose={() => setShowSuccessTicket(false)}
        event={event}
        directTicketData={printingData}
        selectedSection={selectedSection}
        cleanPrice={cleanPrice}
        navigate={navigate}
      />

      <WinnerModal
        isOpen={showWinnerModal}
        winningSeatInfo={winningSeatInfo}
        luckyConfig={luckyConfig}
        onClose={() => { 
          setShowWinnerModal(false); 
          setWinningSeatId(null); 
        }}
        success={success}
        navigate={navigate}
      />

      <TicketPrinterOverlay
         isOpen={showPrinter}
         ticketData={printingData}
         isProcessing={isPrinterProcessing}
         onComplete={() => {
           setShowPrinter(false);
           setShowSuccessTicket(false);
           navigate('/user/tickets');
         }}
      />
    </>
  );
};

export default EventModalsManager;
