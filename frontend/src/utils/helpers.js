export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    .format(price);

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const truncate = (str, len = 80) =>
  str?.length > len ? str.slice(0, len) + '…' : str;

export const getDiscount = (price, salePrice) =>
  price && salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

export const getImageUrl = (path) => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${path}`;
};

export const starArray = (rating) =>
  Array.from({ length: 5 }, (_, i) => ({
    filled: i < Math.floor(rating),
    half:   i === Math.floor(rating) && rating % 1 >= 0.5,
  }));

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};

export const STATUS_COLORS = {
  pending:    'text-yellow-400 bg-yellow-400/10',
  confirmed:  'text-blue-400 bg-blue-400/10',
  processing: 'text-purple-400 bg-purple-400/10',
  shipped:    'text-cyan-400 bg-cyan-400/10',
  delivered:  'text-green-400 bg-green-400/10',
  cancelled:  'text-red-400 bg-red-400/10',
  refunded:   'text-orange-400 bg-orange-400/10',
};
