import { motion, AnimatePresence } from 'framer-motion';
import QuizCard from '../cards/QuizCard';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';

const QuizGrid = ({ quizzes, loading, onQuizClick }) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`h-72 rounded-2xl animate-pulse ${
              isDark ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center py-16 rounded-2xl ${
          isDark ? 'bg-gray-800' : 'bg-gray-50'
        }`}
      >
        <div className="text-6xl mb-4">📚</div>
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          No Quizzes Found
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Try adjusting your filters or search criteria
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {quizzes.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <QuizCard
              quiz={quiz}
              index={index}
              onClick={() => onQuizClick(quiz)}
              showLockIcon={true}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

QuizGrid.propTypes = {
  quizzes: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  onQuizClick: PropTypes.func.isRequired,
};

export default QuizGrid;
