import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const QuizProgress = ({ currentQuestion, totalQuestions, answeredCount }) => {
  const { isDark } = useTheme();
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/95 backdrop-blur-sm border border-gray-700' : 'bg-white border border-gray-200'} shadow-xl`}>
      {/* Header */}
      <div className="mb-5">
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Quiz Progress
        </h3>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Question {currentQuestion} of {totalQuestions}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Overall Progress
          </span>
          <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {answeredCount}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Answered
          </p>
        </div>
        <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {totalQuestions - answeredCount}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Remaining
          </p>
        </div>
        <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
          <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {currentQuestion}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Current
          </p>
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
