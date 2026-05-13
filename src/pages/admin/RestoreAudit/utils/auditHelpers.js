import React from 'react';
import { Icon } from '../../../../components';

export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return 'N/A';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const formatDate = (iso) => {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return iso; }
};

export const severityBadge = (sev) => {
  const map = {
    bajo: 'ra-badge ra-badge-success',
    medio: 'ra-badge ra-badge-warning',
    alto: 'ra-badge ra-badge-danger',
    critico: 'ra-badge ra-badge-critical'
  };
  return <span className={map[sev] || 'ra-badge ra-badge-neutral'}>{(sev || 'N/A').toUpperCase()}</span>;
};

export const resultBadge = (result) => {
  if (result === 'exito') return <span className="ra-badge ra-badge-success"><Icon name="checkCircle" size={14} className="mr-1 inline-block" /> Éxito</span>;
  if (result === 'fallo') return <span className="ra-badge ra-badge-danger"><Icon name="xCircle" size={14} className="mr-1 inline-block" /> Fallo</span>;
  return <span className="ra-badge ra-badge-neutral"><Icon name="clock" size={14} className="mr-1 inline-block" /> Pendiente</span>;
};
