import React from 'react';
import { Button } from '../../../../components';

const AuditPagination = ({ currentPage, totalPages, setCurrentPage }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="audit-pagination">
            <Button 
                variant="outline" 
                size="small" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
            >
                ← ANTERIOR
            </Button>
            <div className="page-info">
                CAPA {currentPage} DE {totalPages}
            </div>
            <Button 
                variant="outline" 
                size="small" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)}
            >
                SIGUIENTE →
            </Button>
        </div>
    );
};

export default AuditPagination;
