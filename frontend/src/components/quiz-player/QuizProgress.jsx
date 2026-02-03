import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const QuizProgress = ({ currentQuestion, totalQuestions, answeredCount }) => {
  const { isDark } = useTheme();
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {currentQuestion}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Current
          </p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
            {answeredCount}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Answered
          </p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {totalQuestions - answeredCount}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Remaining
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Progress
          </span>
          <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

QuizProgress.propTypes = {
  currentQuestion: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  answeredCount: PropTypes.number.isRequired,
};

export default QuizProgress;
