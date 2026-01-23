import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';
import { BarChart3, Gift, Star, CheckCircle } from 'lucide-react';

const StatsBar = ({ totalQuizzes, freeCount, paidCount, purchasedCount }) => {
  const { isDark } = useTheme();

  /* OLD CODE - Using emoji icons
  const stats = [
    { label: 'Total', value: totalQuizzes, icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Free', value: freeCount, icon: '🆓', gradient: 'from-green-500 to-emerald-500' },
    { label: 'Premium', value: paidCount, icon: '⭐', gradient: 'from-purple-500 to-pink-500' },
    { label: 'Purchased', value: purchasedCount, icon: '✅', gradient: 'from-orange-500 to-red-500' },
  ];
  */

  // NEW CODE - Using lucide-react icons
  const stats = [
    { label: 'Total', value: totalQuizzes, Icon: BarChart3, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Free', value: freeCount, Icon: Gift, gradient: 'from-green-500 to-emerald-500' },
    { label: 'Premium', value: paidCount, Icon: Star, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Purchased', value: purchasedCount, Icon: CheckCircle, gradient: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden rounded-2xl p-5 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10`} />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              {/* OLD: <span className="text-2xl">{stat.icon}</span> */}
              {/* NEW: Using lucide-react icon component */}
              <stat.Icon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
              <span className={`text-3xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {stat.value}
              </span>
            </div>
            <p className={`text-sm font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

StatsBar.propTypes = {
  totalQuizzes: PropTypes.number.isRequired,
  freeCount: PropTypes.number.isRequired,
  paidCount: PropTypes.number.isRequired,
  purchasedCount: PropTypes.number.isRequired,
};

export default StatsBar;
