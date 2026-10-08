import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './LoadingScreen.css';

/**
 * LoadingScreen — velo de transición premium.
 *
 * Props:
 *  - label      Texto principal (opcional).
 *  - status     Texto secundario fijo (opcional). Si se omite, rotan `messages`.
 *  - messages   Frases cálidas que rotan con un crossfade sereno.
 *  - isVisible  Salida controlada: al pasar a `false` se desvanece y luego se desmonta.
 *  - onExited   Callback al terminar la salida.
 *
 * Salida elegante garantizada: aunque el padre desmonte el componente de golpe
 * (p. ej. `if (loading) return <LoadingScreen />`), se crea un "fantasma" visual
 * idéntico que se disuelve suavemente sobre la app recién revelada.
 */

const DEFAULT_LABEL = 'Preparando tu experiencia';

const DEFAULT_MESSAGES = [
  'Afinando los últimos detalles…',
  'Creando algo único, solo para ti…',
  'Un instante más…',
];

const EXIT_DURATION_MS = 900; // sincronizado con --ls-exit en el CSS
const MESSAGE_INTERVAL_MS = 3200;
const MESSAGE_FADE_MS = 450;

const LoadingScreen = ({
  label = DEFAULT_LABEL,
  status,
  messages = DEFAULT_MESSAGES,
  isVisible = true,
  onExited,
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isShown, setIsShown] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageIn, setMessageIn] = useState(true);

  const nodeRef = useRef(null);
  const shownRef = useRef(false);
  const onExitedRef = useRef(onExited);

  const setNode = useCallback((node) => {
    if (node) nodeRef.current = node; // nunca se anula: lo necesitamos al desmontar
  }, []);

  useEffect(() => {
    onExitedRef.current = onExited;
  }, [onExited]);

  useEffect(() => {
    shownRef.current = isShown;
  }, [isShown]);

  /* ---------------- Entrada / salida controlada ---------------- */
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      let raf2;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setIsShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    setIsShown(false);
    const t = setTimeout(() => {
      setShouldRender(false);
      onExitedRef.current?.();
    }, EXIT_DURATION_MS);
    return () => clearTimeout(t);
  }, [isVisible]);

  /* ---------------- Salida elegante ante desmontaje abrupto ---------------- */
  useLayoutEffect(() => {
    return () => {
      const node = nodeRef.current;
      if (!node || !shownRef.current || typeof document === 'undefined') return;

      const ghost = node.cloneNode(true);
      ghost.classList.add('laika-ls--ghost', 'laika-ls--leaving');
      ghost.removeAttribute('role');
      ghost.removeAttribute('aria-live');
      ghost.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ghost);

      void ghost.offsetHeight; // fuerza layout para que la transición arranque
      requestAnimationFrame(() => ghost.classList.remove('laika-ls--visible'));
      setTimeout(() => ghost.remove(), EXIT_DURATION_MS + 150);
    };
  }, []);

  /* ---------------- Crossfade de mensajes ---------------- */
  const rotating = !status && messages.length > 1;

  useEffect(() => {
    if (!rotating || !shouldRender) return undefined;
    let swap;
    const id = setInterval(() => {
      setMessageIn(false);
      swap = setTimeout(() => {
        setMessageIndex((i) => (i + 1) % messages.length);
        setMessageIn(true);
      }, MESSAGE_FADE_MS);
    }, MESSAGE_INTERVAL_MS);
    return () => {
      clearInterval(id);
      clearTimeout(swap);
    };
  }, [rotating, shouldRender, messages.length]);

  if (!shouldRender) return null;

  const secondary = status || messages[messageIndex % messages.length];

  return (
    <div
      ref={setNode}
      className={`laika-ls${isShown ? ' laika-ls--visible' : ''}${!isVisible ? ' laika-ls--leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={isVisible}
    >
      <div className="laika-ls__aura" aria-hidden="true" />

      <div className="laika-ls__stage">
        <div className="laika-ls__mark">
          <span className="laika-ls__glow" aria-hidden="true" />
          <img src="/logob.png" alt="Laika" className="laika-ls__logo" draggable="false" />
        </div>

        <div className="laika-ls__copy">
          <div className="laika-ls__title">{label}</div>
          <div className="laika-ls__subtitle-wrap">
            <div className={`laika-ls__subtitle${messageIn ? '' : ' is-out'}`}>{secondary}</div>
          </div>
        </div>

        <div className="laika-ls__track" aria-hidden="true">
          <span className="laika-ls__beam" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
