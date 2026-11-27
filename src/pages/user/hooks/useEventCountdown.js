import { useState, useEffect, useMemo } from 'react';
import { formatTime } from '../../EventDetail/utils/helpers';

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const EXCITEMENT_WINDOW_MS = 30 * DAY_MS;

function buildTargetTimestamp(dateRaw, timeRaw) {
  if (!dateRaw) return null;

  let baseDate;
  const trimmed = String(dateRaw).trim();
  const isoCalendar = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ]00:00(?::00(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/
  );
  const ddMmYyyy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (isoCalendar) {
    const [, year, month, day] = isoCalendar;
    baseDate = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
  } else if (ddMmYyyy) {
    const [, day, month, year] = ddMmYyyy;
    baseDate = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
  } else {
    baseDate = new Date(trimmed);
  }

  if (Number.isNaN(baseDate.getTime())) return null;

  // Si dateRaw es solo fecha (sin hora explícita) y existe timeRaw válido, la combinamos en hora local
  const hasExplicitTime = /T\d{2}:\d{2}/.test(trimmed) && !/T00:00(:00)?/.test(trimmed);
  if (!hasExplicitTime) {
    if (timeRaw && timeRaw !== 'N/A') {
      const formatted = formatTime(timeRaw);
      const match = formatted.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        baseDate.setHours(Number(match[1]), Number(match[2]), 0, 0);
      }
    } else {
      baseDate.setHours(23, 59, 0, 0);
    }
  }

  return baseDate.getTime();
}

function computeSnapshot(targetMs) {
  if (!targetMs) {
    return null;
  }

  const now = new Date();
  const nowMs = now.getTime();
  const diffMs = targetMs - nowMs;
  const clampedMs = Math.max(0, diffMs);

  const days = Math.floor(clampedMs / DAY_MS);
  const hours = Math.floor((clampedMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((clampedMs % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((clampedMs % MINUTE_MS) / SECOND_MS);

  const targetDate = new Date(targetMs);
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const calendarDayDiff = Math.round((startTarget - startToday) / DAY_MS);

  const isSameDay = calendarDayDiff === 0;
  const isTomorrow = calendarDayDiff === 1;
  const isStarted = diffMs <= 0;

  let phase = 'calm';
  let badge = 'Confirmado';
  let eyebrow = 'Tu próxima experiencia';
  let emotionNote = 'Tu lugar está asegurado. Prepárate para disfrutarlo.';

  if (isStarted) {
    phase = 'live_today';
    badge = 'En curso';
    eyebrow = 'El momento llegó';
    emotionNote = 'Tu evento ya comenzó. Ten tu boleto a la mano.';
  } else if (isSameDay) {
    phase = 'live_today';
    badge = 'Hoy';
    eyebrow = 'Es hoy • Prepara tu acceso';
    emotionNote = 'Faltan horas para empezar. Revisa tu zona y abre tu acceso al llegar.';
  } else if (isTomorrow || clampedMs <= 2 * DAY_MS) {
    phase = 'imminent';
    badge = isTomorrow ? 'Mañana' : 'Muy pronto';
    eyebrow = isTomorrow ? 'Es mañana • Prepárate' : 'La espera casi termina';
    emotionNote = 'Falta muy poco para vivirlo. Planea tu llegada con anticipación.';
  } else if (days <= 14) {
    phase = 'building';
    badge = 'Cada vez más cerca';
    eyebrow = 'Cuenta regresiva en marcha';
    emotionNote = 'Los días se acortan. Tu acceso digital ya está listo en tu bóveda.';
  }

  const proximityPercent = isStarted
    ? 100
    : Math.max(
        8,
        Math.min(
          99,
          Math.round((1 - Math.min(clampedMs, EXCITEMENT_WINDOW_MS) / EXCITEMENT_WINDOW_MS) * 100)
        )
      );

  return {
    days,
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    totalMs: clampedMs,
    isStarted,
    isSameDay,
    phase,
    badge,
    eyebrow,
    emotionNote,
    proximityPercent,
  };
}

export default function useEventCountdown(dateRaw, timeRaw) {
  const targetMs = useMemo(() => buildTargetTimestamp(dateRaw, timeRaw), [dateRaw, timeRaw]);
  const [snapshot, setSnapshot] = useState(() => computeSnapshot(targetMs));

  useEffect(() => {
    if (!targetMs) {
      setSnapshot(null);
      return undefined;
    }

    setSnapshot(computeSnapshot(targetMs));
    const timer = setInterval(() => {
      setSnapshot(computeSnapshot(targetMs));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetMs]);

  return snapshot;
}

