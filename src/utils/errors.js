export function messageOf(error, fallback = 'Please try again.') {
  const data = error?.response?.data;
  const detail = data?.detail;
  const nested = typeof data?.message === 'object' ? data.message : null;
  const candidate =
    (typeof data?.message === 'string' ? data.message : null) ||
    nested?.message ||
    nested?.error ||
    data?.error ||
    (typeof detail === 'string' ? detail : null) ||
    detail?.message ||
    detail?.error ||
    error?.message;

  if (typeof candidate === 'string' && candidate.trim()) return candidate;
  if (Array.isArray(nested?.errors) && nested.errors.length) {
    return nested.errors.map((item) => item.message || item.error || item.field).filter(Boolean).join(', ');
  }
  if (Array.isArray(detail?.errors) && detail.errors.length) {
    return detail.errors.map((item) => item.message || item.error || item.field).filter(Boolean).join(', ');
  }
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((item) => item.message || item.error || item.field).filter(Boolean).join(', ');
  }

  return fallback;
}
