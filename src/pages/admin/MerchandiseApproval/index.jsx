import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { LoadingScreen } from '../../../components';
import { merchService } from '../../../services/merch.service';
import api from '../../../services/api';

/* COMPONENTES MODULARES */
import MerchHeader from './components/MerchHeader';
import MerchActions from './components/MerchActions';
import MerchTable from './components/MerchTable';
import MerchEditModal from './components/MerchEditModal';

import './MerchandiseApproval.css';

const MerchandiseApproval = () => {
    const { success, error: showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [gestores, setGestores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [editingSettings, setEditingSettings] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Buscamos usuarios con rol gestor usando el cliente API de administración
            const usersData = await api.adminUsers.getAll({ role: 'gestor' });
            
            // Unificamos con sus configuraciones de tienda
            const combinedData = await Promise.all(
                (Array.isArray(usersData) ? usersData : []).map(async (u) => {
                    try {
                        const settings = await merchService.getSettings(u.id);
                        return { ...u, settings };
                    } catch (e) {
                        return { 
                            ...u, 
                            settings: { 
                                is_enabled: false, 
                                commission_percentage: 10, 
                                activation_fee_paid: false,
                                product_limit: 50
                            } 
                        };
                    }
                })
            );
            
            setGestores(combinedData);
        } catch (error) {
            console.error("Error loading gestores:", error);
            showError('Error al cargar datos de control');
        } finally {
            setLoading(false);
        }
    };

    const togglePremium = async (userId, currentStatus) => {
        try {
            setUpdatingId(userId);
            const newStatus = !currentStatus;
            
            await api.put(`/api/auth/users/${userId}/permissions`, {
                is_premium: newStatus,
                premium_until: newStatus ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
            });

            success(`Membresía ${newStatus ? 'Premium ACTIVADA' : 'ESTÁNDAR'} reflejada`);
            loadData();
        } catch (error) {
            showError('Ocurrió un error al actualizar permisos');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await merchService.updateSettings(editingSettings.id, {
                is_enabled: editingSettings.settings.is_enabled,
                activation_fee_paid: editingSettings.settings.activation_fee_paid,
                commission_percentage: parseFloat(editingSettings.settings.commission_percentage),
                product_limit: parseInt(editingSettings.settings.product_limit) || 50
            });
            success('Configuraciones actualizadas industrialmente');
            setEditingSettings(null);
            loadData();
        } catch (error) {
            showError('Error al sincronizar cambios');
        }
    };

    const filteredGestores = gestores.filter(g => 
        g.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${g.first_name} ${g.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingScreen />;

    return (
        <div className="merch-approval-container industrial-page">
            <MerchHeader gestores={gestores} />

            <MerchActions 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                loadData={loadData} 
            />

            <MerchTable 
                filteredGestores={filteredGestores} 
                updatingId={updatingId} 
                togglePremium={togglePremium} 
                setEditingSettings={setEditingSettings} 
            />

            <MerchEditModal 
                editingSettings={editingSettings} 
                setEditingSettings={setEditingSettings} 
                handleSaveSettings={handleSaveSettings} 
            />
        </div>
    );
};

export default MerchandiseApproval;
