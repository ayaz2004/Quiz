import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';
import { BookOpen, Gift, Star, CheckCircle } from 'lucide-react';

const FilterBar = ({ activeFilter, onFilterChange }) => {
  const { isDark } = useTheme();

  /* OLD CODE - Using emoji icons
  const filters = [
    { id: 'all', label: 'All Quizzes', icon: '📚' },
    { id: 'free', label: 'Free', icon: '🆓' },
    { id: 'paid', label: 'Premium', icon: '⭐' },
    { id: 'purchased', label: 'My Quizzes', icon: '✅' },
  ];
  */

  // NEW CODE - Using lucide-react icons
  const filters = [
    { id: 'all', label: 'All Quizzes', Icon: BookOpen },
    { id: 'free', label: 'Free', Icon: Gift },
    { id: 'paid', label: 'Premium', Icon: Star },
    { id: 'purchased', label: 'My Quizzes', Icon: CheckCircle },
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
            activeFilter === filter.id
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : isDark
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {/* OLD: <span className="mr-2">{filter.icon}</span> */}
          {/* NEW: Using lucide-react icon component */}
          <filter.Icon className="inline-block mr-2 w-4 h-4" />
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
};

FilterBar.propTypes = {
  activeFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterBar;
