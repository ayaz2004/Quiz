import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { Building2, CheckCircle, Home, BedDouble } from 'lucide-react';

const HousingStatsBar = ({ total, available, pgCount, hostelCount }) => {
  const { isDark } = useTheme();

  const stats = [
    { label: 'Total listings', value: total, Icon: Building2, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Available', value: available, Icon: CheckCircle, gradient: 'from-green-500 to-emerald-500' },
    { label: 'PGs', value: pgCount, Icon: BedDouble, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Hostels', value: hostelCount, Icon: Home, gradient: 'from-teal-500 to-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className={`relative overflow-hidden rounded-2xl p-5 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10`} />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <stat.Icon className="w-8 h-8 text-gray-600 dark:text-gray-300" aria-hidden />
              <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {stat.value}
              </span>
            </div>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

HousingStatsBar.propTypes = {
  total: PropTypes.number.isRequired,
  available: PropTypes.number.isRequired,
  pgCount: PropTypes.number.isRequired,
  hostelCount: PropTypes.number.isRequired,
};

export default HousingStatsBar;
