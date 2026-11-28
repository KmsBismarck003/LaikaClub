import { API_HOST } from '../services/apiClient';

/**
 * Utility to generate full image URLs
 * Handles local vs Vercel/Azure production paths without hardcoded ports
 */
export const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x200?text=No+Image';

    let cleanPath = String(path).trim();
    cleanPath = cleanPath.replace('/api/api/', '/api/');

    // Self-healing: normalizar rutas /uploads/ incluso si en BD traen localhost/127.0.0.1
    const uploadIndex = cleanPath.indexOf('uploads/');
    if (uploadIndex !== -1 && (
        cleanPath.startsWith('/uploads/') ||
        cleanPath.startsWith('uploads/') ||
        cleanPath.includes('localhost') ||
        cleanPath.includes('127.0.0.1')
    )) {
        return `${API_HOST}/${cleanPath.substring(uploadIndex)}`;
    }

    // If it's already an absolute external URL (http/https), blob, or inline data URI, return as is
    if (
        cleanPath.startsWith('http://') ||
        cleanPath.startsWith('https://') ||
        cleanPath.startsWith('blob:') ||
        cleanPath.startsWith('data:')
    ) {
        return cleanPath;
    }

    const finalCleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${API_HOST}${finalCleanPath}`;
};
