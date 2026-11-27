import React, { useState } from 'react';
import useUserProfile from './hooks/useUserProfile';
import ProfileIdentityCard from './components/ProfileIdentityCard';
import ProfilePersonalForm from './components/ProfilePersonalForm';
import ProfileSecuritySection from './components/ProfileSecuritySection';
import { ConfirmDialog } from '../../components';
import styles from './UserProfile.module.css';

export default function UserProfile() {
  const {
    profile,
    loading,
    saving,
    savedOk,
    isDirty,
    uploadingPhoto,
    deletingPhoto,
    deletingAccount,
    changingPassword,
    fileInputRef,
    initials,
    photoUrl,
    roleLabel,
    handleFieldChange,
    handleDiscard,
    handleSave,
    triggerPhotoPicker,
    handlePhotoChange,
    handleDeletePhoto,
    handleChangePassword,
    handleDeleteAccount,
    handleLogout,
  } = useUserProfile();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.skeletonLayout}>
          <div className={styles.skeletonBox} style={{ height: '300px' }} />
          <div className={styles.settingsStack}>
            <div className={styles.skeletonBox} style={{ height: '290px' }} />
            <div className={styles.skeletonBox} style={{ height: '220px' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mi perfil</h1>
        <p className={styles.pageSubtitle}>
          Administra tus datos personales, fotografía y preferencias de seguridad.
        </p>
      </header>

      <div className={styles.layoutGrid}>
        <ProfileIdentityCard
          profile={profile}
          initials={initials}
          photoUrl={photoUrl}
          roleLabel={roleLabel}
          uploadingPhoto={uploadingPhoto}
          deletingPhoto={deletingPhoto}
          fileInputRef={fileInputRef}
          onTriggerPhotoPicker={triggerPhotoPicker}
          onPhotoChange={handlePhotoChange}
          onDeletePhoto={handleDeletePhoto}
        />

        <div className={styles.settingsStack}>
          <ProfilePersonalForm
            profile={profile}
            isDirty={isDirty}
            saving={saving}
            savedOk={savedOk}
            onChange={handleFieldChange}
            onSave={handleSave}
            onDiscard={handleDiscard}
          />

          <ProfileSecuritySection
            changingPassword={changingPassword}
            deletingAccount={deletingAccount}
            onChangePassword={handleChangePassword}
            onRequestDeleteAccount={() => setConfirmDeleteOpen(true)}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          handleDeleteAccount();
        }}
        title="¿Eliminar tu cuenta permanentemente?"
        message="Perderás el acceso a todos tus boletos, historial de compras y datos personales. Esta acción es irreversible."
        confirmText="Sí, eliminar cuenta"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
