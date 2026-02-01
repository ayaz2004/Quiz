import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const QuizTimer = ({ onTimeUpdate, isActive = true }) => {
  const { isDark } = useTheme();
  const [seconds, setSeconds] = useState(0);

  // Update timer every second
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Notify parent of time changes
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(seconds);
    }
  }, [seconds, onTimeUpdate]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (seconds < 600) return 'text-green-600 dark:text-green-400'; // < 10 min
    if (seconds < 1800) return 'text-yellow-600 dark:text-yellow-400'; // < 30 min
    return 'text-red-600 dark:text-red-400'; // > 30 min
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg border-2 ${
        seconds < 600 
          ? 'border-green-500/20' 
          : seconds < 1800 
          ? 'border-yellow-500/20' 
          : 'border-red-500/20'
      }`}
    >
      <svg 
        className={`w-6 h-6 ${getTimerColor()}`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <div>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
          Time Elapsed
        </p>
        <p className={`text-2xl font-bold font-mono ${getTimerColor()}`}>
          {formatTime(seconds)}
        </p>
      </div>
    </motion.div>
  );
};

QuizTimer.propTypes = {
  onTimeUpdate: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
};

export default QuizTimer;
