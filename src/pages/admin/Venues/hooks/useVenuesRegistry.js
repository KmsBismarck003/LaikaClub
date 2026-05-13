import { useState, useEffect, useCallback, useMemo } from 'react';
import { venueAPI } from '../../../../services/api';
import { useNotification } from '../../../../context/NotificationContext';

export const useVenuesRegistry = () => {
    const { success, error: showError } = useNotification();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [venueToDelete, setVenueToDelete] = useState(null);

    const fetchVenues = useCallback(async () => {
        setLoading(true);
        try {
            const data = await venueAPI.getAll('all');
            setVenues(data || []);
        } catch (err) {
            console.error(err);
            setVenues([]);
            showError('Error al cargar recintos');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchVenues();
    }, [fetchVenues]);

    const handleCreate = async (data) => {
        try {
            await venueAPI.create(data);
            success('Recinto creado exitosamente');
            fetchVenues();
            setShowModal(false);
        } catch (err) {
            showError(err.message || 'Error al crear recinto');
        }
    };

    const handleUpdate = async (data) => {
        if (!selectedVenue) return;
        try {
            await venueAPI.update(selectedVenue.id, data);
            success('Recinto actualizado exitosamente');
            fetchVenues();
            setShowModal(false);
        } catch (err) {
            showError(err.message || 'Error al actualizar recinto');
        }
    };

    const handleDeleteClick = (venue) => {
        setVenueToDelete(venue);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!venueToDelete) return;
        try {
            await venueAPI.delete(venueToDelete.id);
            success('Recinto eliminado/desactivado');
            fetchVenues();
            setIsDeleteModalOpen(false);
            setVenueToDelete(null);
        } catch (err) {
            showError(err.message || 'Error al eliminar recinto');
        }
    };

    const openCreateModal = () => {
        setSelectedVenue(null);
        setShowModal(true);
    };

    const openEditModal = (venue) => {
        setSelectedVenue(venue);
        setShowModal(true);
    };

    const filteredVenues = useMemo(() => {
        return venues.filter(v =>
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.city.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [venues, searchTerm]);

    return {
        // State
        venues,
        loading,
        searchTerm,
        setSearchTerm,
        selectedVenue,
        showModal,
        setShowModal,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        venueToDelete,
        filteredVenues,
        
        // Actions
        fetchVenues,
        handleCreate,
        handleUpdate,
        handleDeleteClick,
        handleConfirmDelete,
        openCreateModal,
        openEditModal
    };
};
