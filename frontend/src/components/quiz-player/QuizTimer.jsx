import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const QuizTimer = ({ onTimeUpdate, isActive = true, timeLimit = null, onTimeUp }) => {
  const { isDark } = useTheme();
  const [seconds, setSeconds] = useState(0);
  const timeUpCalledRef = useRef(false);
  const intervalRef = useRef(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onTimeUpRef = useRef(onTimeUp);
  
  // Keep refs updated without restarting timer
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);
  
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Notify parent of time changes - runs after state update
  useEffect(() => {
    if (onTimeUpdateRef.current && seconds > 0) {
      onTimeUpdateRef.current(seconds);
    }
    
    // Check if time limit is reached
    if (timeLimit && seconds >= timeLimit * 60 && !timeUpCalledRef.current) {
      timeUpCalledRef.current = true;
      if (onTimeUpRef.current) {
        onTimeUpRef.current();
      }
    }
  }, [seconds, timeLimit]);

  // Update timer every second - runs continuously
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          return newSeconds;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLimit]);

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
    if (!timeLimit) {
      // No limit - use elapsed time colors
      if (seconds < 600) return 'text-blue-600 dark:text-blue-400';
      if (seconds < 1800) return 'text-amber-600 dark:text-amber-400';
      return 'text-red-600 dark:text-red-400';
    }
    
    // With limit - use remaining time colors
    const remainingSeconds = (timeLimit * 60) - seconds;
    if (remainingSeconds > timeLimit * 60 * 0.5) return 'text-blue-600 dark:text-blue-400';
    if (remainingSeconds > timeLimit * 60 * 0.2) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getDisplaySeconds = () => {
    if (!timeLimit) return seconds;
    return Math.max(0, (timeLimit * 60) - seconds);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl ${
        isDark ? 'bg-gray-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'
      } shadow-xl border-2 ${
        !timeLimit || getDisplaySeconds() > timeLimit * 60 * 0.5
          ? 'border-blue-500/30' 
          : getDisplaySeconds() > timeLimit * 60 * 0.2
          ? 'border-amber-500/30' 
          : 'border-red-500/30'
      }`}
    >
      <svg 
        className={`w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 ${getTimerColor()}`}
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
        <p className={`text-[0.5rem] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium hidden sm:block`}>
          {timeLimit ? 'Time Remaining' : 'Time Elapsed'}
        </p>
        <p className={`text-xs sm:text-lg md:text-2xl font-bold font-mono ${getTimerColor()}`}>
          {formatTime(getDisplaySeconds())}
        </p>
      </div>
    </motion.div>
  );
};

QuizTimer.propTypes = {
  onTimeUpdate: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  timeLimit: PropTypes.number, // Time limit in minutes (null for no limit)
  onTimeUp: PropTypes.func, // Callback when time runs out
};

export default QuizTimer;
