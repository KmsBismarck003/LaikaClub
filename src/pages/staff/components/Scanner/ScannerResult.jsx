import React from 'react';
import { Card, Button } from '../../../../components';
import StatusMessage from '../StatusMessage';
import TicketInfo from '../TicketInfo';
import api from '../../../../services/api';

const ScannerResult = ({ 
    result, 
    onRedeem, 
    onReset, 
    onSuccessNotification 
}) => {
    if (!result) return null;

    const handleResend = () => {
        api.ticket.resendTicket(result.ticketCode);
        onSuccessNotification('Boleto reenviado al correo');
    };

    return (
        <Card className={`result-card ${result.status}`}>
            <StatusMessage status={result.status} message={result.message} />
            <TicketInfo ticket={result} />
            
            {result.status === 'valid' && (
                <Button variant="success" size="large" fullWidth onClick={onRedeem} style={{ marginTop: '1rem' }}>
                    Registrar Entrada
                </Button>
            )}
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Button variant="outline" fullWidth onClick={handleResend}>
                    Reenviar
                </Button>
                <Button variant="secondary" fullWidth onClick={onReset}>
                    Siguiente
                </Button>
            </div>
        </Card>
    );
};

export default ScannerResult;
