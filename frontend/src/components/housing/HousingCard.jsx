import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { MapPin, Phone } from 'lucide-react';
import { getAvailabilityKind, getListingTypeLabel, getGenderLabel } from '../../utils/housingUtils';

const availabilityStyles = {
  available: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
  unavailable: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
  unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const HousingCard = ({ listing, onSelect, index = 0 }) => {
  const kind = getAvailabilityKind(listing.availability);
  const availabilityText = listing.availability || 'Contact to confirm';

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.36) }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={() => onSelect(listing)}
      className="relative w-full text-left h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-600/0 group-hover:from-emerald-500/5 group-hover:to-teal-600/5 transition-all duration-300 pointer-events-none" />

      <div className="relative p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-full shadow-sm">
            {getListingTypeLabel(listing.listingType)}
          </span>
          {listing.genderPreference && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-semibold rounded-full">
              {getGenderLabel(listing.genderPreference)}
            </span>
          )}
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${availabilityStyles[kind]}`}>
            {availabilityText}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
          {listing.name}
        </h3>

        {listing.feeNotes && (
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
            {listing.feeNotes}
          </p>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 line-clamp-2 mb-4 flex-1">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
          <span>{listing.address}</span>
        </p>

        {listing.phones?.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden />
            <span>{listing.phones.length} contact number{listing.phones.length > 1 ? 's' : ''}</span>
          </p>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
          View full details →
        </span>
      </div>
    </motion.button>
  );
};

HousingCard.propTypes = {
  listing: PropTypes.shape({
    sn: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    listingType: PropTypes.string,
    address: PropTypes.string,
    feeNotes: PropTypes.string,
    availability: PropTypes.string,
    phones: PropTypes.arrayOf(PropTypes.string),
    genderPreference: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  index: PropTypes.number,
};

export default HousingCard;
