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
  onQuestionClick
}) => {
  const { isDark } = useTheme();
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;
  const hasAnswer = answers[currentQuestion - 1] !== undefined;

  return (
    <div className={`sticky bottom-0 p-6 rounded-t-2xl ${
      isDark ? 'bg-gray-800' : 'bg-white'
    } shadow-2xl border-t-2 ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between gap-4">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: isFirstQuestion ? 1 : 1.05 }}
          whileTap={{ scale: isFirstQuestion ? 1 : 0.95 }}
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
            isFirstQuestion
              ? isDark
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </motion.button>

        {/* Question Indicators */}
        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          <div className="flex items-center gap-2 min-w-min px-2">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const questionNum = i + 1;
              const isAnswered = answers[i] !== undefined;
              const isCurrent = questionNum === currentQuestion;

              return (
                <motion.button
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onQuestionClick(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all cursor-pointer flex-shrink-0 ${
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
            className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            Submit Quiz
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
              hasAnswer
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg'
                : isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
            }`}
          >
            {hasAnswer ? 'Next' : 'Skip'}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  onQuestionClick: PropTypes.func.isRequired,
};

export default QuizNavigation;
