/**
 * Demo behaviour is a local-development aid only. A public VITE variable must
 * never turn a production build into an unauthenticated publishing surface.
 */
export function canUseInstitutionDemo(isDevelopment = import.meta.env.DEV): boolean {
  return isDevelopment;
}
