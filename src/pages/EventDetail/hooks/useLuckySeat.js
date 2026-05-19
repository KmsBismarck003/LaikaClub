import { useState, useEffect, useCallback } from 'react';

/**
 * useLuckySeat — Hook para gestionar la ruleta de asientos ganadores.
 */
export function useLuckySeat(id, user, navigate, location, { success, error }, api, synchronizedZones, addBusySeats) {
  // Configuración dinámica de Lucky Seat
  const [luckyConfig, setLuckyConfig] = useState(() => {
    const saved = localStorage.getItem('laika_lucky_config');
    return saved ? JSON.parse(saved) : {
      probs: { platinum: 15, gold: 25, general: 60 },
      themes: { bronze: '#cd7f32', silver: '#cbd5e1', gold: '#EAB308', platinum: '#ffffff' },
      pointsRate: { earnPerDollar: 0.1, luckySeatCost: 40, attendanceBonus: 50 }
    };
  });

  const [isRouletteActive, setIsRouletteActive] = useState(false);
  const [rouletteWinner, setRouletteWinner] = useState(null);
  const [showProbModal, setShowProbModal] = useState(false);
  const [winningSeatId, setWinningSeatId] = useState(null);
  const [showRoulettePayment, setShowRoulettePayment] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showCrownTransition, setShowCrownTransition] = useState(false);
  const [winningSeatInfo, setWinningSeatInfo] = useState(null);
  const [activeScannerZoneId, setActiveScannerZoneId] = useState(null);
  const [activeScannerSeatId, setActiveScannerSeatId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentApproved, setIsPaymentApproved] = useState(false);

  const handleLuckySeat = useCallback(() => {
    if (!user) {
      error("Debes iniciar sesión para jugar a la ruleta");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setIsProcessingPayment(false); 
    setShowRoulettePayment(true);
  }, [user, error, navigate, location]);

  const confirmRoulettePayment = useCallback(async (method, selectedFunction) => {
    setIsProcessingPayment(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      let response;
      try {
        response = await api.ticket.luckySeatAssign(id, {
          payment_method: method,
          function_id: selectedFunction?.id,
        });
      } catch (err) {
        console.warn("Lucky Seat API failed, using mock:", err);
        const availableZones = synchronizedZones.filter(z => z.type === 'seating');
        const randomZone = availableZones[Math.floor(Math.random() * availableZones.length)] || { id: 'platino-vip', name: 'PLATINO VIP' };
        response = {
          success: true,
          seatId: `${randomZone.id}-2-4`,
          seat_label: `ASIENTO 2-4`,
          section_name: randomZone.name
        };
      }

      if (response.success) {
        setIsPaymentApproved(true);
        setIsProcessingPayment(false);

        // Fase de "Palomita" de 2 segundos antes de girar la ruleta
        await new Promise((resolve) => setTimeout(resolve, 2500));

        setShowRoulettePayment(false);
        setIsPaymentApproved(false);

        setRouletteWinner(response);
        setWinningSeatId(response.seatId);
        setWinningSeatInfo({
          id: response.seatId,
          name: response.seat_label || `ASIENTO ${response.seatId.split("-").slice(-2).join("-")}`,
          zoneName: response.section_name || "ZONA PREMIADA",
          price: 400.0,
          category: "LUCKY SEAT",
        });
        
        if (addBusySeats) {
          addBusySeats([response.seatId]);
        }
        
        setIsRouletteActive(true);
      } else {
        error(response.message || "Error al procesar el pago de la ruleta.");
        setIsProcessingPayment(false);
      }
    } catch (err) {
      error("Fallo en la conexión. No se pudo procesar el pago.");
      setIsProcessingPayment(false);
    }
  }, [api, id, synchronizedZones, success, error, addBusySeats]);

  const handleRouletteComplete = useCallback(() => {
    setShowWinnerModal(true);
    setIsRouletteActive(false);
    setActiveScannerZoneId(null);
  }, []);

  // Roulette Animation Logic
  useEffect(() => {
    if (!isRouletteActive || !winningSeatId || !synchronizedZones.length) {
      setActiveScannerZoneId(null);
      return;
    }

    const DURATION_ZONES = 4500;
    const DURATION_SEATS = 4500;
    const startTime = Date.now();
    const winnerZoneId = winningSeatId.split('-')[0];
    let timerId;

    const runScan = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < DURATION_ZONES) {
        const availableZones = synchronizedZones.filter(z => z.type === 'seating');
        const randomZone = availableZones[Math.floor(Math.random() * availableZones.length)];
        setActiveScannerZoneId(randomZone.id);
        setActiveScannerSeatId(null);
        timerId = setTimeout(runScan, 100);
      } else if (elapsed < DURATION_ZONES + DURATION_SEATS) {
        setActiveScannerZoneId(winnerZoneId);
        const seatsInZone = [];
        for(let r=0; r<5; r++) for(let c=0; c<8; c++) seatsInZone.push(`${winnerZoneId}-${r}-${c}`);
        const subElapsed = elapsed - DURATION_ZONES;
        const progress = subElapsed / DURATION_SEATS;
        const seatIdx = Math.min(Math.floor(progress * seatsInZone.length), seatsInZone.length - 1);
        setActiveScannerSeatId(seatsInZone[seatIdx]);
        timerId = setTimeout(runScan, 50);
      } else {
        setActiveScannerSeatId(winningSeatId);
        setShowCrownTransition(true);
        setTimeout(() => {
          setShowCrownTransition(false);
          handleRouletteComplete();
        }, 3000);
      }
    };
    runScan();
    return () => clearTimeout(timerId);
  }, [isRouletteActive, winningSeatId, synchronizedZones, handleRouletteComplete]);

  return {
    luckyConfig, setLuckyConfig,
    isRouletteActive,
    rouletteWinner,
    showProbModal, setShowProbModal,
    winningSeatId, setWinningSeatId,
    showRoulettePayment, setShowRoulettePayment,
    showWinnerModal, setShowWinnerModal,
    showCrownTransition,
    winningSeatInfo,
    activeScannerZoneId,
    activeScannerSeatId,
    isProcessingPayment,
    isPaymentApproved,
    handleLuckySeat,
    confirmRoulettePayment
  };
}
