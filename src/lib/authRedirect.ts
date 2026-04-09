export function getAuthRedirectOrigin() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  }
  return window.location.origin;
}

export function getAuthRedirectUrl(path = '') {
  return `${getAuthRedirectOrigin()}${path}`;
}
