/**
 * Utility to generate full image URLs
 * Handles local vs server paths
 */
export const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x200?text=No+Image';

    // Self-healing: if the path has double /api/api/, fix it first
    let cleanPath = path;
    if (typeof cleanPath === 'string') {
        cleanPath = cleanPath.replace('/api/api/', '/api/');
    }

    // If it's already an absolute URL (http/https) or blob, return as is
    if (cleanPath.startsWith('http') || cleanPath.startsWith('https') || cleanPath.startsWith('blob:')) {
        return cleanPath;
    }

    // Construct backend base URL based on current window location
    // Use port 8000 for backend
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // Default to port 8000 if not specified (assumption for this project)
    const port = '8000';
    const baseUrl = `${protocol}//${hostname}:${port}`;

    // Ensure path starts with /
    const finalCleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    return `${baseUrl}${finalCleanPath}`;
};
