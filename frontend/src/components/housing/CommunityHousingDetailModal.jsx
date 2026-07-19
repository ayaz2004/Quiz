import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Phone,
  Clock,
  Utensils,
  Users,
  ExternalLink,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { revealListingContact } from '../../utils/housingApi';
import {
  buildTelHref,
  buildWhatsAppHref,
  formatPhoneDisplay,
  getSafeMapsUrl,
  getListingTypeLabel,
  getGenderLabel,
} from '../../utils/housingUtils';

const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 shrink-0 h-fit">
        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed">{value}</p>
      </div>
    </div>
  );
};

DetailRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

const CommunityHousingDetailModal = ({ listing, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [contact, setContact] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [contactError, setContactError] = useState('');

  if (!listing) return null;

  const mapsUrl = getSafeMapsUrl(listing.mapsUrl);
  const fee =
    listing.feeNotes ||
    (listing.rentMonthly != null ? `Rs. ${listing.rentMonthly.toLocaleString('en-IN')}/month` : null);

  const handleRevealContact = async () => {
    if (!isAuthenticated) {
      navigate('/signin', { state: { from: '/student-housing' } });
      return;
    }
    setLoadingContact(true);
    setContactError('');
    try {
      const res = await revealListingContact(listing.id);
      if (res.success) {
        setContact(res.data);
      } else {
        setContactError(res.message || 'Could not load contact');
      }
    } catch (err) {
      setContactError(err.response?.data?.message || err.message || 'Could not load contact');
    } finally {
      setLoadingContact(false);
    }
  };

  const phones = contact
    ? [contact.contactPhone, contact.whatsappNumber].filter(Boolean)
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
        <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 24 }}
          className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 sm:p-8 text-white rounded-t-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-4">
              Community · {getListingTypeLabel(listing.listingType)} · {getGenderLabel(listing.genderPreference)}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold pr-10 leading-tight">{listing.title}</h2>
            {listing.description && (
              <p className="mt-3 text-emerald-100 text-sm leading-relaxed">{listing.description}</p>
            )}
            <div className="mt-4 flex items-start gap-2 text-emerald-50 text-sm">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              <span>{listing.address}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 sm:p-5">
              <DetailRow icon={Clock} label="Entry timing" value={listing.entryTiming} />
              <DetailRow icon={Utensils} label="Meals" value={listing.meals} />
              <DetailRow icon={Users} label="Visitors" value={listing.visitors} />
              {fee && <DetailRow icon={Phone} label="Fee" value={fee} />}
            </div>

            {listing.amenities?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Facilities</p>
                <ul className="flex flex-wrap gap-2">
                  {listing.amenities.map((item) => (
                    <li
                      key={item}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {listing.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {listing.images.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="rounded-xl w-full h-28 object-cover border border-gray-200 dark:border-gray-700"
                    loading="lazy"
                  />
                ))}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Contact owner</p>
              {!contact ? (
                <button
                  type="button"
                  onClick={handleRevealContact}
                  disabled={loadingContact}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-md hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60"
                >
                  {loadingContact ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  ) : (
                    <Phone className="w-4 h-4" aria-hidden />
                  )}
                  {isAuthenticated ? 'Show contact details' : 'Sign in to contact'}
                </button>
              ) : (
                <div className="space-y-2">
                  {[...new Set(phones)].map((phone) => {
                    const tel = buildTelHref(phone);
                    const wa = buildWhatsAppHref(phone);
                    return (
                      <div key={phone} className="flex flex-wrap gap-2">
                        {tel && (
                          <a
                            href={tel}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold"
                          >
                            <Phone className="w-4 h-4" aria-hidden />
                            Call {formatPhoneDisplay(phone)}
                          </a>
                        )}
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold"
                          >
                            <MessageCircle className="w-4 h-4" aria-hidden />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {contactError && <p className="text-sm text-red-600 mt-2">{contactError}</p>}
            </div>

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold"
              >
                <ExternalLink className="w-4 h-4" aria-hidden />
                Open in Google Maps
              </a>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pt-4 border-t border-gray-100 dark:border-gray-700">
              Verify rent and availability in person before paying. JMI Quiz does not guarantee community listings.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

CommunityHousingDetailModal.propTypes = {
  listing: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default CommunityHousingDetailModal;
