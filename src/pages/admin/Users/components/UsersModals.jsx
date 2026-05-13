import React from 'react';
import UserPermissionsModal from '../../../../components/UserPermissionsModal';
import UserFormModal from '../../../../components/UserFormModal';
import UserEditModal from '../../../../components/UserEditModal';
import UserPreviewModal from '../../../../components/UserPreviewModal';
import ConfirmationModal from '../../../../components/ConfirmationModal';

const UsersModals = ({ 
    modals, 
    onClose, 
    selectedUser, 
    confirmConfig,
    handlers 
}) => {
    const {
        createUser,
        updateUser,
        fetchUsers
    } = handlers;

    const {
        showCreateModal,
        showEditModal,
        showPreviewModal,
        showPermissionsModal,
        showConfirmModal
    } = modals;

    return (
        <>
            <UserFormModal
                isOpen={showCreateModal}
                onClose={() => onClose('create')}
                onSubmit={createUser}
            />

            {selectedUser && (
                <>
                    <UserPreviewModal
                        isOpen={showPreviewModal}
                        onClose={() => onClose('preview')}
                        user={selectedUser}
                    />
                    <UserEditModal
                        isOpen={showEditModal}
                        onClose={() => onClose('edit')}
                        user={selectedUser}
                        onUpdate={updateUser}
                    />
                    <UserPermissionsModal
                        isOpen={showPermissionsModal}
                        onClose={() => onClose('permissions')}
                        user={selectedUser}
                        onUpdate={() => fetchUsers()}
                    />
                    <ConfirmationModal
                        isOpen={showConfirmModal}
                        onClose={() => onClose('confirm')}
                        onConfirm={confirmConfig.onConfirm}
                        title={confirmConfig.title}
                        message={confirmConfig.message}
                        confirmText={confirmConfig.confirmText}
                        variant={confirmConfig.variant}
                    />
                </>
            )}
        </>
    );
};

export default UsersModals;
