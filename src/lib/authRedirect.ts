const PREVIEW_ORIGIN = 'https://id-preview--3fa77241-3ad3-417d-93be-0637cf8d3666.lovable.app';

export function getAuthRedirectOrigin() {
  if (typeof window === 'undefined') {
    return PREVIEW_ORIGIN;
  }

  return window.location.hostname.endsWith('.lovableproject.com')
    ? PREVIEW_ORIGIN
    : window.location.origin;
}

export function getAuthRedirectUrl(path = '') {
  return `${getAuthRedirectOrigin()}${path}`;
}
