import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const QuestionCard = ({ question, questionNumber, selectedAnswer, onAnswerSelect, isMarkedForReview, onToggleReview, timeSpent }) => {
  const { isDark } = useTheme();

  const options = [
    { key: 1, text: question.option1 },
    { key: 2, text: question.option2 },
    { key: 3, text: question.option3 },
    { key: 4, text: question.option4 },
  ];

  // Format time spent
  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`absolute inset-0 p-4 sm:p-6 md:p-8 rounded-2xl ${isDark ? 'bg-gray-800/95 backdrop-blur-sm border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl overflow-y-auto`}
    >
      {/* Question Header */}
      <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
          {questionNumber}
        </div>
        <div className="flex-grow min-w-0">
          <p className={`text-lg sm:text-xl md:text-2xl font-semibold leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {question.questionText}
          </p>
          {/* Time spent indicator */}
          {timeSpent > 0 && (
            <div className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatTime(timeSpent)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Question Image */}
      {question.imageUrl && (
        <div className={`mb-6 rounded-2xl overflow-hidden border-2 ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-md`}>
          <img 
            src={question.imageUrl} 
            alt="Question visual" 
            className="w-full max-h-96 object-contain bg-gray-100 dark:bg-gray-900"
          />
        </div>
      )}

      {/* Answer Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.key;
          return (
            <motion.button
              key={option.key}
              onClick={() => onAnswerSelect(option.key)}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              className={`w-full p-4 sm:p-5 rounded-xl text-left transition-all duration-200 flex items-center gap-3 sm:gap-4 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-2 border-blue-400'
                  : isDark
                  ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-100 border-2 border-gray-600 hover:border-gray-500'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Option Letter */}
              <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg ${
                isSelected
                  ? 'bg-white/25 text-white'
                  : isDark
                  ? 'bg-gray-600 text-gray-200'
                  : 'bg-white text-gray-700 shadow-sm'
              }`}>
                {String.fromCharCode(64 + option.key)}
              </div>
              
              {/* Option Text */}
              <span className="flex-grow font-medium text-base sm:text-lg break-words">
                {option.text}
              </span>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Review Status Indicator */}
      {isMarkedForReview && (
        <div className="mt-6 sm:mt-8 flex justify-end">
          <div className={`px-5 py-3 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-semibold flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg border-2 border-amber-400`}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Marked for Review</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
    questionText: PropTypes.string.isRequired,
    option1: PropTypes.string.isRequired,
    option2: PropTypes.string.isRequired,
    option3: PropTypes.string.isRequired,
    option4: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
  questionNumber: PropTypes.number.isRequired,
  selectedAnswer: PropTypes.number,
  onAnswerSelect: PropTypes.func.isRequired,
  isMarkedForReview: PropTypes.bool,
  timeSpent: PropTypes.number,
};

export default QuestionCard;
