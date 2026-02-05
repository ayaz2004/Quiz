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

  // Update timer every second - runs continuously
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          
          // Notify parent of time changes using ref
          if (onTimeUpdateRef.current) {
            onTimeUpdateRef.current(newSeconds);
          }
          
          // Check if time limit is reached
          if (timeLimit && newSeconds >= timeLimit * 60 && !timeUpCalledRef.current) {
            timeUpCalledRef.current = true;
            if (onTimeUpRef.current) {
              onTimeUpRef.current();
            }
          }
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
      if (seconds < 600) return 'text-green-600 dark:text-green-400';
      if (seconds < 1800) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
    
    // With limit - use remaining time colors
    const remainingSeconds = (timeLimit * 60) - seconds;
    if (remainingSeconds > timeLimit * 60 * 0.5) return 'text-green-600 dark:text-green-400';
    if (remainingSeconds > timeLimit * 60 * 0.2) return 'text-yellow-600 dark:text-yellow-400';
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
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg border-2 ${
        !timeLimit || getDisplaySeconds() > timeLimit * 60 * 0.5
          ? 'border-green-500/20' 
          : getDisplaySeconds() > timeLimit * 60 * 0.2
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
          {timeLimit ? 'Time Remaining' : 'Time Elapsed'}
        </p>
        <p className={`text-2xl font-bold font-mono ${getTimerColor()}`}>
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
