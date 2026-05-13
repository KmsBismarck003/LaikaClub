import React from 'react';
import { Search, History } from 'lucide-react';
import { Button } from '../../../../components';

const MerchActions = ({ searchTerm, setSearchTerm, loadData }) => {
    return (
        <div className="actions-bar-industrial">
            <div className="search-wrapper">
                <Search size={18} />
                <input 
                    type="text" 
                    placeholder="BUSCAR GESTOR POR EMAIL O NOMBRE..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="secondary" onClick={loadData} className="tech-btn">
                <History size={16} /> REFRESCAR SISTEMA
            </Button>
        </div>
    );
};

export default MerchActions;
