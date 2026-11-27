import React from 'react';
import Icon from '../../../components/Icons/Icons';
import { BentoBadge } from '../../../components/Bento';
import styles from '../UserProfile.module.css';

function formatDisplayName(firstName, lastName) {
  const full = [firstName, lastName]
    .filter(Boolean)
    .map((part) => part.trim())
    .join(' ');
  return full || 'Usuario LAIKA';
}

function formatMemberSince(createdAt) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
}

export default function ProfileIdentityCard({
  profile,
  initials,
  photoUrl,
  roleLabel,
  uploadingPhoto,
  deletingPhoto,
  fileInputRef,
  onTriggerPhotoPicker,
  onPhotoChange,
  onDeletePhoto,
}) {
  const fullName = formatDisplayName(profile.firstName, profile.lastName);
  const memberSince = formatMemberSince(profile.createdAt);

  return (
    <aside className={`${styles.card} ${styles.identityCard}`} aria-label="Resumen de identidad">
      <div className={styles.avatarSection}>
        <button
          type="button"
          className={styles.avatarFrame}
          onClick={onTriggerPhotoPicker}
          disabled={uploadingPhoto}
          title="Cambiar foto de perfil"
          aria-label="Cambiar foto de perfil"
        >
          {photoUrl ? (
            <img src={photoUrl} alt={fullName} className={styles.avatarImg} />
          ) : (
            <span>{initials}</span>
          )}
          <span
            className={`${styles.avatarOverlay} ${uploadingPhoto ? styles.avatarOverlayVisible : ''}`}
            aria-hidden="true"
          >
            <Icon name={uploadingPhoto ? 'loader' : 'camera'} size={20} />
          </span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onPhotoChange}
          accept="image/jpeg,image/png,image/webp"
          className={styles.hiddenInput}
        />

        <div className={styles.identityText}>
          <h2 className={styles.identityName} title={fullName}>
            {fullName}
          </h2>
          <p className={styles.identityEmail} title={profile.email}>
            {profile.email || 'Sin correo registrado'}
          </p>
        </div>

        <div className={styles.photoControls}>
          <button
            type="button"
            className={styles.photoBtn}
            onClick={onTriggerPhotoPicker}
            disabled={uploadingPhoto}
          >
            <Icon name="camera" size={14} />
            <span>{uploadingPhoto ? 'Subiendo...' : 'Cambiar foto'}</span>
          </button>

          {profile.profilePhoto && (
            <button
              type="button"
              className={`${styles.photoBtn} ${styles.photoBtnDanger}`}
              onClick={onDeletePhoto}
              disabled={deletingPhoto}
            >
              <Icon name="trash2" size={14} />
              <span>{deletingPhoto ? 'Quitando...' : 'Quitar'}</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.identityMetaList}>
        <div className={styles.identityMetaRow}>
          <span className={styles.identityMetaLabel}>Tipo de cuenta</span>
          <BentoBadge variant="neutral">{roleLabel}</BentoBadge>
        </div>

        <div className={styles.identityMetaRow}>
          <span className={styles.identityMetaLabel}>Teléfono</span>
          <span className={styles.identityMetaValue}>
            {profile.phone ? profile.phone : 'Sin registrar'}
          </span>
        </div>

        {memberSince && (
          <div className={styles.identityMetaRow}>
            <span className={styles.identityMetaLabel}>Miembro desde</span>
            <span className={styles.identityMetaValue}>{memberSince}</span>
          </div>
        )}
      </div>
    </aside>
  );
}

