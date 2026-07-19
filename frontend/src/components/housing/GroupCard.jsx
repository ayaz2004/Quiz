import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Users, MapPin, Calendar, IndianRupee } from 'lucide-react';
import {
  getGenderLabel,
  GROUP_STATUS_LABELS,
  formatBudget,
  formatMoveInDate,
} from '../../utils/housingUtils';

const statusStyles = {
  recruiting: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white',
  full: 'bg-gray-500 text-white',
  closed: 'bg-gray-400 text-white',
};

const GroupCard = ({ group, onSelect, index = 0 }) => {
  const spotsLeft = Math.max(0, group.targetSize - (group.currentSize ?? 0));

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.36) }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={() => onSelect?.(group)}
      className="relative w-full text-left h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      <div className="h-6 bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center gap-1">
        <Users className="w-3 h-3 text-white" aria-hidden />
        <span className="text-white font-bold text-[10px] tracking-wide uppercase">Roommate Group</span>
      </div>

      <div className="relative p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[group.status] || statusStyles.recruiting}`}>
            {GROUP_STATUS_LABELS[group.status] || group.status}
          </span>
          {group.genderPreference && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-semibold rounded-full">
              {getGenderLabel(group.genderPreference)}
            </span>
          )}
          <span className="px-3 py-1 bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 text-xs font-semibold rounded-full">
            {group.currentSize ?? 0}/{group.targetSize} members
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {group.name}
        </h3>

        {group.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
            {group.description}
          </p>
        )}

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {group.preferredArea && (
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-violet-600" aria-hidden />
              <span>{group.preferredArea}</span>
            </p>
          )}
          {group.budgetPerPerson != null && (
            <p className="flex items-center gap-2 font-semibold text-violet-700 dark:text-violet-400">
              <IndianRupee className="w-4 h-4 shrink-0" aria-hidden />
              <span>{formatBudget(group.budgetPerPerson)}</span>
            </p>
          )}
          {group.moveInDate && (
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0 text-violet-600" aria-hidden />
              <span>Move-in: {formatMoveInDate(group.moveInDate)}</span>
            </p>
          )}
        </div>

        {group.status === 'recruiting' && spotsLeft > 0 && (
          <p className="mt-4 text-xs font-semibold text-violet-600 dark:text-violet-400">
            {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} open
          </p>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 group-hover:underline">
          View group →
        </span>
      </div>
    </motion.button>
  );
};

GroupCard.propTypes = {
  group: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  index: PropTypes.number,
};

export default GroupCard;
