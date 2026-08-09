import React from 'react';
import Icon from '../../../components/Icons/Icons';

const PHASE_LABELS = {
    summary: { title: 'Resumen', icon: 'shoppingBag', subtitle: 'Revisión de pedido' },
    delivery: { title: 'Entrega', icon: 'truck', subtitle: 'Dirección y envío' },
    payment: { title: 'Pago', icon: 'creditCard', subtitle: 'Método de pago' },
    confirmation: { title: 'Confirmación', icon: 'shieldCheck', subtitle: 'Revisión final' },
    success: { title: 'Completado', icon: 'check', subtitle: 'Transacción exitosa' }
};

const CheckoutStepper = ({ phases, currentPhaseIndex, onSelectStep }) => {
    // Ocultar barra en pantalla de éxito para mayor limpieza
    if (phases[currentPhaseIndex] === 'success') return null;

    const visiblePhases = phases.filter(p => p !== 'success');

    return (
        <div className="checkout-stepper-container">
            <div className="checkout-stepper-track">
                {visiblePhases.map((phaseKey, idx) => {
                    const stepInfo = PHASE_LABELS[phaseKey] || { title: phaseKey, icon: 'circle', subtitle: '' };
                    const isCompleted = idx < currentPhaseIndex;
                    const isCurrent = idx === currentPhaseIndex;
                    const isPending = idx > currentPhaseIndex;
                    const canNavigate = isCompleted;

                    return (
                        <React.Fragment key={phaseKey}>
                            <div 
                                className={`stepper-step ${isCompleted ? 'step--completed' : ''} ${isCurrent ? 'step--current' : ''} ${isPending ? 'step--pending' : ''} ${canNavigate ? 'step--clickable' : ''}`}
                                onClick={() => canNavigate && onSelectStep && onSelectStep(idx)}
                                role={canNavigate ? "button" : undefined}
                                tabIndex={canNavigate ? 0 : undefined}
                                title={canNavigate ? "Volver a este paso" : undefined}
                            >
                                <div className="stepper-icon-wrapper">
                                    {isCompleted ? (
                                        <div className="stepper-badge completed-badge">
                                            <Icon name="check" size={14} />
                                        </div>
                                    ) : (
                                        <div className={`stepper-badge ${isCurrent ? 'current-badge' : 'pending-badge'}`}>
                                            <span>{idx + 1}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="stepper-text-content">
                                    <span className="stepper-title">{stepInfo.title}</span>
                                    <span className="stepper-subtitle">{stepInfo.subtitle}</span>
                                </div>
                            </div>

                            {idx < visiblePhases.length - 1 && (
                                <div className={`stepper-connector ${idx < currentPhaseIndex ? 'connector--active' : ''}`}>
                                    <div className="connector-line" />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default CheckoutStepper;
