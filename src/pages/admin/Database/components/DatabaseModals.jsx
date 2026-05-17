import React from 'react';
import { Modal, Button, Skeleton, ConfirmationModal } from '../../../../components';
import AutomaticBackupConfig from '../../../../components/Admin/AutomaticBackupConfig/AutomaticBackupConfig';

const DatabaseModals = ({ 
    activeView,
    modals, 
    onClose, 
    handlers,
    data 
}) => {
    const {
        showBackupModal,
        showNoSqlBackupModal,
        showSelectiveModal,
        showAutoBackupModal,
        showConfirmModal
    } = modals;

    const {
        createBackup,
        createNoSqlBackup,
        selectiveBackup,
        toggleTableSelection
    } = handlers;

    const {
        tables,
        selectedTables,
        confirmConfig
    } = data;

    return (
        <>
            {/* Modal Manual Backup SQL */}
            <Modal
                isOpen={showBackupModal}
                onClose={() => onClose('backup')}
                title="CREAR RESPALDO SQL"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button onClick={() => createBackup('completo')}>RESPALDO COMPLETO</Button>
                    <Button variant="secondary" onClick={() => createBackup('incremental')}>RESPALDO INCREMENTAL</Button>
                    <Button variant="info" onClick={() => {
                        onClose('backup');
                        handlers.openSelective();
                    }}>RESPALDO SELECTIVO</Button>
                </div>
            </Modal>

            {/* Modal Manual NoSQL Backup */}
            <Modal
                isOpen={showNoSqlBackupModal}
                onClose={() => onClose('noSqlBackup')}
                title="CREAR RESPALDO NOSQL (ATLAS)"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button onClick={() => createNoSqlBackup('atlas')}>SINCRONIZAR CLOUD ATLAS</Button>
                    <Button variant="secondary" onClick={() => createNoSqlBackup('disk')}>RESPALDO A DISCO (JSON)</Button>
                </div>
            </Modal>

            {/* Modal Selective Backup */}
            <Modal
                isOpen={showSelectiveModal}
                onClose={() => onClose('selective')}
                title="RESPALDO SELECTIVO POR TABLAS"
            >
                {tables.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }}>
                        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} type="text" width={`${60 + i * 8}%`} height="14px" />)}
                    </div>
                ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #333', padding: '10px', marginBottom: '15px', background: '#000', color: '#fff' }}>
                        {tables.map(table => (
                            <label key={table.name} style={{ display: 'flex', gap: '10px', padding: '8px', borderBottom: '1px solid #222', fontSize: '0.75rem', fontWeight: 700 }}>
                                <input
                                    type="checkbox"
                                    checked={selectedTables.includes(table.name)}
                                    onChange={() => toggleTableSelection(table.name)}
                                />
                                <span style={{ fontFamily: 'monospace' }}>{table.name}</span>
                                <span style={{ color: '#666', marginLeft: 'auto' }}>({table.row_count} REGISTROS)</span>
                            </label>
                        ))}
                    </div>
                )}
                <Button disabled={selectedTables.length === 0} onClick={selectiveBackup} fullWidth style={{ fontWeight: 900 }}>
                    INICIAR EXTRACCIÓN ({selectedTables.length})
                </Button>
            </Modal>

            {/* Modal Auto Backup */}
            <AutomaticBackupConfig
                isOpen={showAutoBackupModal}
                onClose={() => onClose('autoBackup')}
            />

            {/* Modal de Confirmación Táctica */}
            {showConfirmModal && (
                <ConfirmationModal
                    isOpen={showConfirmModal}
                    title={confirmConfig.title}
                    message={confirmConfig.message}
                    confirmText={confirmConfig.confirmText}
                    onConfirm={confirmConfig.onConfirm}
                    onClose={() => onClose('confirm')}
                />
            )}
        </>
    );
};

export default DatabaseModals;
