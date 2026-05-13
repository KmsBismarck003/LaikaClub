import React from 'react';
import { Card, Button, Input, Icon } from '../../../../components';
import { Camera } from 'lucide-react';
import QRScanner from '../QRScanner';

const ScannerManager = ({ 
    isScanning, 
    setIsScanning, 
    ticketCode, 
    setTicketCode, 
    onVerify, 
    loading 
}) => {
    return (
        <Card className="scanner-card">
            {isScanning ? (
                <>
                    <QRScanner onScanSuccess={(text) => onVerify(text)} />
                    <Button variant="outline" fullWidth onClick={() => setIsScanning(false)} style={{ marginTop: '1rem' }}>
                        Ingresar Código Manualmente
                    </Button>
                </>
            ) : (
                <div className="scanner-container">
                    <div className="qr-scanner-placeholder" onClick={() => setIsScanning(true)}>
                        <Camera size={64} className="scanner-icon" />
                        <p>Tocar para activar cámara</p>
                    </div>
                    <div className="scanner-divider"><span>O</span></div>
                    <form onSubmit={(e) => { e.preventDefault(); onVerify(); }}>
                        <Input
                            label="Código del Boleto"
                            value={ticketCode}
                            onChange={(e) => setTicketCode(e.target.value)}
                            placeholder="Ej: TKT-12345678"
                            fullWidth
                        />
                        <Button 
                            type="submit" 
                            variant="primary" 
                            size="large" 
                            fullWidth 
                            loading={loading} 
                            disabled={!ticketCode.trim()} 
                            style={{ marginTop: '1rem' }}
                        >
                            Verificar Boleto
                        </Button>
                    </form>
                </div>
            )}
        </Card>
    );
};

export default ScannerManager;
