/**
 * Get allowed CORS origins from environment variables
 * @returns Array of allowed origin URLs
 */
export function getCorsOrigins(): string[] {
  const origins: string[] = [];
  
  // Always allow localhost for development
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000');
  }
  
  // Add FRONTEND_URL if provided
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  // Add additional allowed origins from ALLOWED_ORIGINS (comma-separated)
  if (process.env.ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    origins.push(...additionalOrigins);
  }
  
  return origins;
}
