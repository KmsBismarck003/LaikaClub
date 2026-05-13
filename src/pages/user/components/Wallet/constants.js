export const ACCENTS = [
  { from: '#0d2a6b', to: '#0a1a4a', line: '#0070F3', badge: '#0070F3' },
  { from: '#2d1060', to: '#1a0a3a', line: '#7928CA', badge: '#7928CA' },
  { from: '#4a1a00', to: '#2a0f00', line: '#f97316', badge: '#f97316' },
  { from: '#4a0d2a', to: '#2a0a1a', line: '#ec4899', badge: '#ec4899' },
  { from: '#0a3a1a', to: '#062211', line: '#22c55e', badge: '#22c55e' },
  { from: '#3a2a00', to: '#1f1500', line: '#eab308', badge: '#eab308' },
];

export const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200&q=80',
  'https://images.unsplash.com/photo-1501386761578-eaa54b618547?w=200&q=80',
];

export function qr(code) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(code)}&qzone=1&color=cccccc&bgcolor=111111`;
}
