import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const QuestionCard = ({ question, questionNumber, selectedAnswer, onAnswerSelect, isMarkedForReview, onToggleReview }) => {
  const { isDark } = useTheme();

  const options = [
    { key: 1, text: question.option1 },
    { key: 2, text: question.option2 },
    { key: 3, text: question.option3 },
    { key: 4, text: question.option4 },
  ];

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`absolute inset-0 p-4 sm:p-6 md:p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-y-auto`}
    >
      {/* Question Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          {questionNumber}
        </div>
        <div className="flex-grow">
          <p className={`text-xl font-semibold leading-relaxed ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            {question.questionText}
          </p>
        </div>
      </div>

      {/* Question Image */}
      {question.imageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <img 
            src={question.imageUrl} 
            alt="Question visual" 
            className="w-full max-h-96 object-contain bg-gray-100 dark:bg-gray-700"
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-4 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-2 border-transparent'
                  : isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-2 border-gray-600'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-2 border-gray-200'
              }`}
            >
              {/* Option Letter */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : isDark
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {String.fromCharCode(64 + option.key)}
              </div>
              
              {/* Option Text */}
              <span className="flex-grow font-medium">
                {option.text}
              </span>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Mark for Review Button */}
      <div className="mt-6 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleReview}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
            isMarkedForReview
              ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
              : isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-2 border-gray-600'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300'
          }`}
        >
          {isMarkedForReview ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Marked for Review
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Mark for Review
            </>
          )}
        </motion.button>
      </div>
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
  onToggleReview: PropTypes.func.isRequired,
};

export default QuestionCard;
