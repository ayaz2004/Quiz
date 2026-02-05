import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const QuizNavigation = ({ 
  currentQuestion, 
  totalQuestions, 
  onPrevious, 
  onNext, 
  onSubmit,
  answers,
  reviewMarked,
  onQuestionClick
}) => {
  const { isDark } = useTheme();
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;
  const hasAnswer = answers[currentQuestion - 1] !== undefined;

  return (
    <div className={`sticky bottom-0 p-2 sm:p-4 md:p-6 rounded-t-xl sm:rounded-t-2xl ${
      isDark ? 'bg-gray-800' : 'bg-white'
    } shadow-2xl border-t sm:border-t-2 ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: isFirstQuestion ? 1 : 1.05 }}
          whileTap={{ scale: isFirstQuestion ? 1 : 0.95 }}
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className={`px-2 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
            isFirstQuestion
              ? isDark
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </motion.button>

        {/* Question Indicators */}
        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 min-w-min px-1 sm:px-2">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const questionNum = i + 1;
              const isAnswered = answers[i] !== undefined;
              const isCurrent = questionNum === currentQuestion;
              const isReviewed = reviewMarked[i];

              return (
                <motion.button
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onQuestionClick(i)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-md sm:rounded-lg flex items-center justify-center text-[0.65rem] sm:text-xs md:text-sm font-bold transition-all cursor-pointer flex-shrink-0 relative ${
                    isCurrent
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg ring-2 ring-emerald-300'
                      : isAnswered
                      ? isDark
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : isDark
                      ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {questionNum}
                  {isReviewed && (
                    <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Next/Submit Button */}
        {isLastQuestion ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSubmit}
            className="px-2 py-2 sm:px-4 sm:py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-all duration-200 flex items-center gap-1 sm:gap-2"
          >
            <span className="hidden sm:inline">Submit Quiz</span>
            <span className="sm:hidden">Submit</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className={`px-2 py-2 sm:px-4 sm:py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
              hasAnswer
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg'
                : isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
            }`}
          >
            {hasAnswer ? 'Next' : 'Skip'}
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
};

QuizNavigation.propTypes = {
  currentQuestion: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  answers: PropTypes.array.isRequired,
  reviewMarked: PropTypes.array.isRequired,
  onQuestionClick: PropTypes.func.isRequired,
};

export default QuizNavigation;
