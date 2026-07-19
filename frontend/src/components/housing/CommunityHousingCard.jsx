import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { MapPin, UserCircle } from 'lucide-react';
import { getListingTypeLabel, getGenderLabel } from '../../utils/housingUtils';

const statusStyles = {
  active: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
  filled: 'bg-gray-500 text-white',
  inactive: 'bg-gray-400 text-white',
};

const CommunityHousingCard = ({ listing, onSelect, index = 0 }) => {
  const fee =
    listing.feeNotes ||
    (listing.rentMonthly != null ? `Rs. ${listing.rentMonthly.toLocaleString('en-IN')}/month` : null);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.36) }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={() => onSelect(listing)}
      className="relative w-full text-left h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <div className="h-6 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center gap-1">
        <UserCircle className="w-3 h-3 text-white" aria-hidden />
        <span className="text-white font-bold text-[10px] tracking-wide uppercase">Community Listing</span>
      </div>

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
          {listing.availability && (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles.active}`}>
              {listing.availability}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {listing.title}
        </h3>

        {fee && (
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3">{fee}</p>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 line-clamp-2 mb-4 flex-1">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" aria-hidden />
          <span>{listing.address}</span>
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-400">Login to view contact details</p>
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
          View full details →
        </span>
      </div>
    </motion.button>
  );
};

CommunityHousingCard.propTypes = {
  listing: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  index: PropTypes.number,
};

export default CommunityHousingCard;
