// Centralized API base URL configuration
// In local development, VITE_API_BASE_URL is empty, defaulting to relative paths proxied by Vite to http://localhost:5000
// In production on Vercel, VITE_API_BASE_URL points to the deployed Express backend (e.g. https://nxtwave-crm-backend.onrender.com)

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
