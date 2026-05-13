import { useState, useEffect, useCallback } from 'react';

export const useUsersUI = (filters, updateFilters, toggleStatus, unlockUser) => {
    const [searchInput, setSearchInput] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState(null);

    // MODAL STATES
    const [modals, setModals] = useState({
        showCreateModal: false,
        showEditModal: false,
        showPreviewModal: false,
        showPermissionsModal: false,
        showConfirmModal: false
    });

    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        confirmText: '',
        onConfirm: () => { },
        variant: 'danger'
    });

    // 1. Debounced Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                updateFilters({ search: searchInput });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput, filters.search, updateFilters]);

    // 2. Modal Handlers
    const handleCloseModal = useCallback((type) => {
        const key = `show${type.charAt(0).toUpperCase() + type.slice(1)}Modal`;
        setModals(prev => ({ ...prev, [key]: false }));
    }, []);

    const handleOpenModal = useCallback((type, user = null) => {
        if (user) setSelectedUser(user);
        const key = `show${type.charAt(0).toUpperCase() + type.slice(1)}Modal`;
        setModals(prev => ({ ...prev, [key]: true }));
    }, []);

    // 3. Optimized Confirmation Handlers
    const handleToggleStatus = useCallback((user) => {
        setSelectedUser(user);
        const isDeactivating = user.status === 'active';
        const label = isDeactivating ? 'BAJA' : 'ALTA';
        setConfirmConfig({
            title: `CONFIRMAR ${label}`,
            message: `¿Estás seguro de ${isDeactivating ? 'deshabilitar' : 'habilitar'} a ${user.first_name || user.email}?`,
            confirmText: `${label} ${user.first_name || 'USUARIO'}`.toUpperCase(),
            variant: isDeactivating ? 'danger' : 'success',
            onConfirm: async () => {
                const ok = await toggleStatus(user.id, user.status);
                if (ok) handleCloseModal('confirm');
            }
        });
        handleOpenModal('confirm');
    }, [toggleStatus, handleOpenModal, handleCloseModal]);

    const handleUnlock = useCallback((user) => {
        setSelectedUser(user);
        setConfirmConfig({
            title: 'DESBLOQUEAR CUENTA',
            message: `¿Desbloquear la cuenta de ${user.first_name || user.email}?`,
            confirmText: `DESBLOQUEAR ${user.first_name || 'USUARIO'}`.toUpperCase(),
            variant: 'info',
            onConfirm: async () => {
                const ok = await unlockUser(user.id);
                if (ok) handleCloseModal('confirm');
            }
        });
        handleOpenModal('confirm');
    }, [unlockUser, handleOpenModal, handleCloseModal]);

    return {
        // State
        searchInput,
        setSearchInput,
        selectedUser,
        modals,
        confirmConfig,
        
        // Handlers
        handleOpenModal,
        handleCloseModal,
        handleToggleStatus,
        handleUnlock
    };
};
