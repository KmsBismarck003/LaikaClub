import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginIncentiveModal.css';

export default function LoginIncentiveModal({ isOpen, onClose, onLater }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleRegister = () => {
    onClose();
    navigate('/register', { state: { from: location.pathname } });
  };

  return (
    <div className="auth-incentive-backdrop" onClick={onClose}>
      <div className="auth-incentive-container" onClick={(e) => e.stopPropagation()}>
        <div className="auth-incentive-glow-orb"></div>
        <button 
          className="auth-incentive-close" 
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
        <div className="auth-incentive-content">
          <div className="auth-incentive-icon-wrapper">
            <span className="auth-incentive-sparkle"></span>
          </div>
          <h2 className="auth-incentive-title">¡Sólo Faltas Tú!</h2>
          <p className="auth-incentive-text">
            El ambiente, la música, la emoción... todo está listo, solo faltas tú. Inicia sesión o regístrate en menos de un minuto para asegurar tus boletos antes de que se agoten. ¡No dejes que te lo cuenten!
          </p>
          <div className="auth-incentive-actions">
            <button 
              className="auth-incentive-btn auth-incentive-btn-login"
              onClick={handleLogin}
            >
              Iniciar Sesión
            </button>
            <button 
              className="auth-incentive-btn auth-incentive-btn-register"
              onClick={handleRegister}
            >
              Registrarse
            </button>
            <button 
              className="auth-incentive-btn-close"
              onClick={onLater || onClose}
            >
              Tal vez más tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
