import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/Icons/Icons';

const Step4_Success = ({ paymentMethod, lastReference }) => {
    const navigate = useNavigate();

    return (
        <div className="success-step py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                <Icon name="check" size={40} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4" style={{ color: '#ffffff' }}>¡GRACIAS POR TU COMPRA!</h2>
            <div className="max-w-sm mx-auto mb-12 space-y-4">
                <p>Tu orden ha sido procesada exitosamente.</p>
                {paymentMethod === 'oxxo' && (
                    <div className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-lg text-left animate-in fade-in zoom-in duration-500">
                        <p className="text-[10px] font-black text-orange-500 uppercase mb-2 tracking-widest">Instrucciones de Pago Oxxo Pay</p>
                        <p className="text-xl font-black font-mono tracking-tighter text-white">REF: {lastReference || 'Generando...'}</p>
                        <div className="mt-4 border-t border-orange-500/20 pt-4">
                            <p className="text-[10px] opacity-80 leading-relaxed">
                                1. Acude a cualquier OXXO.<br/>
                                2. Indica que vas a realizar un pago de **OXXO Pay**.<br/>
                                3. Dicta la referencia de arriba y paga en efectivo.<br/>
                                4. Tu reserva se confirmará automáticamente.
                            </p>
                        </div>
                    </div>
                )}
                <p className="text-xs opacity-50">Recibirás un correo con la confirmación de tu pedido y los detalles para el acceso.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <button className="primary-btn w-full" onClick={() => navigate('/')}>VOLVER AL INICIO</button>
                <button 
                    className="w-full bg-white text-black font-black uppercase tracking-tighter py-4 rounded hover:bg-white/90 transition-all flex items-center justify-center gap-2" 
                    onClick={() => navigate('/user/tickets')}
                >
                    <Icon name="ticket" size={18} />
                    VER MIS BOLETOS
                </button>
            </div>
        </div>
    );
};

export default Step4_Success;
