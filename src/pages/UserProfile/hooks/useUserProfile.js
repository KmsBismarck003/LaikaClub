import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';

import { API_HOST } from '../../../services/apiClient';

const EMPTY_PROFILE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  profilePhoto: '',
  role: 'usuario',
  createdAt: '',
};

const ROLE_LABELS = {
  admin: 'Administrador',
  gestor: 'Gestor de eventos',
  operador: 'Operador de acceso',
  usuario: 'Miembro',
};

function formatProfilePhotoUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }
  return `${API_HOST}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

export default function useUserProfile() {
  const { success, error: showError } = useNotification();
  const { user: currentUser, updateUser, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [savedSnapshot, setSavedSnapshot] = useState(EMPTY_PROFILE);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const r = await api.user.getProfile();
        if (!active) return;

        const normalized = {
          firstName: r.firstName || r.first_name || '',
          lastName: r.lastName || r.last_name || '',
          email: r.email || '',
          phone: r.phone || '',
          birthDate: r.birthDate || r.birth_date || '',
          profilePhoto: r.avatarUrl || r.avatar_url || r.profile_photo || r.profilePhoto || '',
          role: r.role || currentUser?.role || 'usuario',
          createdAt: r.createdAt || r.created_at || '',
        };

        setProfile(normalized);
        setSavedSnapshot(normalized);

        updateUser({
          firstName: normalized.firstName,
          lastName: normalized.lastName,
          avatarUrl: normalized.profilePhoto,
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (active && currentUser) {
          const fallback = {
            ...EMPTY_PROFILE,
            firstName: currentUser.firstName || currentUser.first_name || '',
            lastName: currentUser.lastName || currentUser.last_name || '',
            email: currentUser.email || '',
            role: currentUser.role || 'usuario',
          };
          setProfile(fallback);
          setSavedSnapshot(fallback);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const isDirty = useMemo(
    () =>
      profile.firstName !== savedSnapshot.firstName ||
      profile.lastName !== savedSnapshot.lastName ||
      profile.phone !== savedSnapshot.phone ||
      profile.birthDate !== savedSnapshot.birthDate,
    [profile, savedSnapshot]
  );

  const handleFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSavedOk(false);
  }, []);

  const handleDiscard = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      firstName: savedSnapshot.firstName,
      lastName: savedSnapshot.lastName,
      phone: savedSnapshot.phone,
      birthDate: savedSnapshot.birthDate,
    }));
    setSavedOk(false);
  }, [savedSnapshot]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await api.user.updateProfile({
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        birth_date: profile.birthDate,
      });

      updateUser({
        firstName: profile.firstName,
        lastName: profile.lastName,
      });

      setSavedSnapshot(profile);
      setSavedOk(true);
      success('Cambios guardados correctamente');
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err) {
      showError(err?.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  }, [profile, updateUser, success, showError]);

  const triggerPhotoPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePhotoChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showError('Formato no compatible. Usa JPG, PNG o WebP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError('La imagen supera el límite de 5 MB.');
        return;
      }

      setUploadingPhoto(true);
      const previousPhoto = profile.profilePhoto;

      const reader = new FileReader();
      reader.onload = (evt) => {
        setProfile((prev) => ({ ...prev, profilePhoto: evt.target.result }));
      };
      reader.readAsDataURL(file);

      try {
        const r = await api.user.uploadPhoto(file);
        const newAvatarUrl = r.avatarUrl || r.avatar_url || '';
        setProfile((prev) => ({ ...prev, profilePhoto: newAvatarUrl }));
        setSavedSnapshot((prev) => ({ ...prev, profilePhoto: newAvatarUrl }));
        updateUser({ avatarUrl: newAvatarUrl });
        success('Foto de perfil actualizada');
      } catch (err) {
        showError(err?.message || 'Error al subir la imagen');
        setProfile((prev) => ({ ...prev, profilePhoto: previousPhoto }));
      } finally {
        setUploadingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [profile.profilePhoto, updateUser, success, showError]
  );

  const handleDeletePhoto = useCallback(async () => {
    setDeletingPhoto(true);
    try {
      await api.user.deletePhoto();
      setProfile((prev) => ({ ...prev, profilePhoto: '' }));
      setSavedSnapshot((prev) => ({ ...prev, profilePhoto: '' }));
      updateUser({ avatarUrl: '' });
      success('Foto de perfil eliminada');
    } catch (err) {
      showError(err?.message || 'Error al eliminar la foto');
    } finally {
      setDeletingPhoto(false);
    }
  }, [updateUser, success, showError]);

  const handleChangePassword = useCallback(
    async ({ currentPassword, newPassword, confirmPassword }) => {
      if (!currentPassword || !newPassword) {
        showError('Completa la contraseña actual y la nueva contraseña.');
        return false;
      }
      if (newPassword.length < 8) {
        showError('La nueva contraseña debe tener al menos 8 caracteres.');
        return false;
      }
      if (newPassword !== confirmPassword) {
        showError('La confirmación de contraseña no coincide.');
        return false;
      }

      setChangingPassword(true);
      try {
        await api.user.changePassword(currentPassword, newPassword);
        success('Contraseña actualizada correctamente');
        return true;
      } catch (err) {
        showError(
          err?.response?.data?.message ||
            err?.message ||
            'No se pudo actualizar la contraseña. Verifica tu contraseña actual.'
        );
        return false;
      } finally {
        setChangingPassword(false);
      }
    },
    [success, showError]
  );

  const handleDeleteAccount = useCallback(async () => {
    setDeletingAccount(true);
    try {
      await api.user.deleteMe();
      await logout(true);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || 'Error al eliminar la cuenta');
      setDeletingAccount(false);
    }
  }, [logout, showError]);

  const initials = useMemo(() => {
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  }, [profile.firstName, profile.lastName]);

  const photoUrl = useMemo(() => formatProfilePhotoUrl(profile.profilePhoto), [profile.profilePhoto]);
  const roleLabel = ROLE_LABELS[profile.role] || 'Miembro';

  return {
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
    handleLogout: () => logout(false),
  };
}

