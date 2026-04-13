// API configuration for different environments
export const API_BASE_URL = process.env.NODE_ENV === 'development' && !window.location.protocol.includes('capacitor')
  ? 'http://localhost:5000'
  : 'https://your-backend-server.com'; // Replace with your actual backend URL

export const getApiUrl = (path: string) => {
  // If path already starts with http, return as-is
  if (path.startsWith('http')) {
    return path;
  }
  
  // For Capacitor apps, use the remote backend
  if (window.location.protocol.includes('capacitor')) {
    return `${API_BASE_URL}${path}`;
  }
  
  // For web development, use relative path (will be proxied by Vite)
  return path;
};
