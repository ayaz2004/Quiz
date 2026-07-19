/**
 * Helpers for curated housing listings (static data, no API).
 * Validates external URLs and phone numbers before rendering links.
 */

const SAFE_URL_PATTERN = /^https:\/\/([\w-]+\.)?(google\.com|googleapis\.com|goo\.gl|maps\.app\.goo\.gl)(\/|$)/i;

/** Strip to digits only; returns empty string if invalid length. */
export const normalizePhoneDigits = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) return '';
  return digits;
};

/** Build tel: href for Indian numbers. */
export const buildTelHref = (phone) => {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return null;
  if (digits.length === 10) return `tel:+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `tel:+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `tel:+${digits}`;
  return `tel:+${digits}`;
};

/** WhatsApp only for 10-digit mobile numbers (not landlines). */
export const buildWhatsAppHref = (phone) => {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return null;
  let mobile = digits;
  if (digits.length === 11 && digits.startsWith('0')) mobile = digits.slice(1);
  else if (digits.length === 12 && digits.startsWith('91')) mobile = digits.slice(2);
  if (mobile.length !== 10 || mobile.startsWith('0')) return null;
  const text = encodeURIComponent('Assalamualaikum, I found your PG/hostel listing on JMI Quiz and would like to enquire about availability.');
  return `https://wa.me/91${mobile}?text=${text}`;
};

/** Only allow Google Maps short links and google.com/maps URLs. */
export const getSafeMapsUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!SAFE_URL_PATTERN.test(trimmed)) return null;
  return trimmed;
};

export const formatPhoneDisplay = (phone) => {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return phone;
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
};

/** Classify availability for client-side filtering. */
export const getAvailabilityKind = (availability) => {
  if (!availability || typeof availability !== 'string') return 'unknown';
  const lower = availability.toLowerCase();
  if (lower.includes('not available') || lower === 'not available') return 'unavailable';
  if (lower.includes('available')) return 'available';
  return 'unknown';
};

export const AVAILABILITY_LABELS = {
  all: 'All',
  available: 'Available',
  unavailable: 'Not available',
  unknown: 'Contact to confirm',
};

export const GENDER_FILTER_LABELS = {
  all: 'All students',
  male: 'Boys',
  female: 'Girls',
  any: 'Boys & Girls (co-ed)',
};

export const getGenderLabel = (gender) => {
  if (gender === 'male') return 'Boys only';
  if (gender === 'female') return 'Girls only';
  if (gender === 'any') return 'Boys & Girls';
  return 'Not specified';
};

/** Boys filter includes co-ed; girls filter includes co-ed. */
export const matchesGenderFilter = (listingGender, filter) => {
  if (!filter || filter === 'all') return true;
  const g = listingGender || 'female';
  if (filter === 'any') return g === 'any';
  if (filter === 'male') return g === 'male' || g === 'any';
  if (filter === 'female') return g === 'female' || g === 'any';
  return true;
};

export const filterHousingListings = (listings, { search = '', availability = 'all', gender = 'all' } = {}) => {
  const q = search.trim().toLowerCase();

  return listings.filter((listing) => {
    const kind = getAvailabilityKind(listing.availability);
    if (availability !== 'all' && kind !== availability) return false;
    if (!matchesGenderFilter(listing.genderPreference, gender)) return false;

    if (!q) return true;
    const haystack = [
      listing.name || listing.title,
      listing.address,
      listing.feeNotes,
      listing.availability,
      ...(listing.facilities || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
};

export const getListingTypeLabel = (type) => {
  if (type === 'pg') return 'PG';
  if (type === 'hostel') return 'Hostel';
  if (type === 'room') return 'Room';
  return 'Listing';
};

export const GROUP_STATUS_LABELS = {
  recruiting: 'Recruiting',
  full: 'Full',
  closed: 'Closed',
};

export const formatBudget = (amount) => {
  if (amount == null) return null;
  return `Rs. ${Number(amount).toLocaleString('en-IN')}/person`;
};

export const formatMoveInDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
