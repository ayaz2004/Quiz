import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuizById } from '../utils/quizApi';
import { submitQuizAttempt } from '../utils/quizApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import QuizTimer from '../components/quiz-player/QuizTimer';
import QuizProgress from '../components/quiz-player/QuizProgress';
import QuestionCard from '../components/quiz-player/QuestionCard';
import QuizNavigation from '../components/quiz-player/QuizNavigation';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchQuiz();
  }, [quizId, isAuthenticated]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await getQuizById(quizId);
      const quizData = response.data;
      
      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        throw new Error('Quiz has no questions');
      }

      setQuiz(quizData);
      setAnswers(new Array(quizData.questions.length).fill(undefined));
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Failed to load quiz. ' + (error.message || ''));
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = useCallback((seconds) => {
    setTimeTaken(seconds);
  }, []);

  const handleAnswerSelect = (optionKey) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionKey;
    setAnswers(newAnswers);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    const answeredCount = answers.filter(a => a !== undefined).length;
    const unansweredCount = quiz.questions.length - answeredCount;
    
    if (unansweredCount > 0) {
      setShowSubmitConfirm(true);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      setShowSubmitConfirm(false);

      // Format answers for backend
      const formattedAnswers = answers
        .map((answer, index) => ({
          questionId: quiz.questions[index].id,
          selectedOption: answer || 0, // 0 for unanswered
        }))
        .filter(a => a.selectedOption !== 0); // Only send answered questions

      const response = await submitQuizAttempt(quizId, formattedAnswers, timeTaken);
      
      // Navigate to results page with data
      navigate(`/quiz/result/${quizId}`, { 
        state: { 
          results: response.data,
          quiz: quiz 
        } 
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading quiz...
          </p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = answers.filter(a => a !== undefined).length;

  return (
    <div className={`min-h-screen pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} shadow-sm`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {quiz.title}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {quiz.subject} • {quiz.examYear}
              </p>
            </div>
            <QuizTimer onTimeUpdate={handleTimeUpdate} isActive={!submitting} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <QuizProgress
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={quiz.questions.length}
                answeredCount={answeredCount}
              />
            </div>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <QuestionCard
                key={currentQuestionIndex}
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                selectedAnswer={answers[currentQuestionIndex]}
                onAnswerSelect={handleAnswerSelect}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <QuizNavigation
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            answers={answers}
          />
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowSubmitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-md w-full p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Submit Quiz?
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You have <span className="font-bold text-yellow-600">{quiz.questions.length - answeredCount}</span> unanswered question{quiz.questions.length - answeredCount !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Review
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Anyway'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submitting Overlay */}
      {submitting && !showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-xl font-semibold">Submitting your quiz...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
