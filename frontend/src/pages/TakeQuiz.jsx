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
  const [reviewMarked, setReviewMarked] = useState([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      setReviewMarked(new Array(quizData.questions.length).fill(false));
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

  const toggleReviewMark = () => {
    const newReviewMarked = [...reviewMarked];
    newReviewMarked[currentQuestionIndex] = !newReviewMarked[currentQuestionIndex];
    setReviewMarked(newReviewMarked);
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

  const handleQuestionClick = (questionIndex) => {
    setCurrentQuestionIndex(questionIndex);
  };

  const handleSubmit = () => {
    setShowReviewModal(true);
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      setShowReviewModal(false);

      // Format answers for backend - include all answers, even unanswered (as 0)
      const formattedAnswers = answers.map((answer, index) => ({
        questionId: quiz.questions[index].id,
        selectedOption: answer || 0, // 0 for unanswered
      }));

      console.log('Submitting quiz attempt...', { formattedAnswers, timeTaken });
      const response = await submitQuizAttempt(quizId, formattedAnswers, timeTaken);
      console.log('Submit response:', response);
      
      // Navigate to results page with data
      navigate(`/quiz/result/${quizId}`, { 
        state: { 
          results: response.data,
          quiz: quiz 
        },
        replace: true
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      const errorMsg = error?.message || error?.error || 'Failed to submit quiz. Please try again.';
      alert(errorMsg);
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
      {/* Fixed Timer at Top Right Corner */}
      <div className="fixed top-20 right-4 md:top-4 md:right-6 z-40 w-auto">
        <QuizTimer 
          onTimeUpdate={handleTimeUpdate} 
          isActive={!submitting}
          timeLimit={quiz.timeLimit}
          onTimeUp={submitQuiz}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Sidebar */}
          {!sidebarCollapsed && (
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <div className="relative">
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className={`absolute -right-3 top-4 z-10 p-2 rounded-full shadow-lg transition-colors ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Hide progress panel"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <QuizProgress
                    currentQuestion={currentQuestionIndex + 1}
                    totalQuestions={quiz.questions.length}
                    answeredCount={answeredCount}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Question Area */}
          <div className={sidebarCollapsed ? 'lg:col-span-3' : 'lg:col-span-2'}>
            {/* Show/Hide Sidebar Button */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className={`mb-4 px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700'
                }`}
                title="Show progress panel"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-medium">Show Progress</span>
              </button>
            )}
            <AnimatePresence mode="wait">
              <QuestionCard
                key={currentQuestionIndex}
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                selectedAnswer={answers[currentQuestionIndex]}
                onAnswerSelect={handleAnswerSelect}
                isMarkedForReview={reviewMarked[currentQuestionIndex]}
                onToggleReview={toggleReviewMark}
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
            reviewMarked={reviewMarked}
            onQuestionClick={handleQuestionClick}
          />
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Quiz Review
                  </h3>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {quiz.questions.length}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Questions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {answers.filter(a => a !== undefined).length}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Attempted
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">
                      {reviewMarked.filter(Boolean).length}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      For Review
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">
                      {answers.filter(a => a === undefined).length}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Not Attempted
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Grid */}
              <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                  {quiz.questions.map((_, index) => {
                    const isAnswered = answers[index] !== undefined;
                    const isReviewed = reviewMarked[index];
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentQuestionIndex(index);
                          setShowReviewModal(false);
                        }}
                        className={`relative aspect-square rounded-lg font-semibold text-sm transition-all transform hover:scale-110 ${
                          isCurrent
                            ? 'ring-2 ring-offset-2 ' + (isDark ? 'ring-blue-500 ring-offset-gray-800' : 'ring-blue-500 ring-offset-white')
                            : ''
                        } ${
                          isReviewed
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg'
                            : isAnswered
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {index + 1}
                        {isReviewed && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-teal-600"></div>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Attempted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-yellow-400 to-orange-500"></div>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Not Attempted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded ring-2 ring-blue-500 bg-emerald-500"></div>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current Question</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                {answers.filter(a => a === undefined).length > 0 ? (
                  <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
                      ⚠️ You have {answers.filter(a => a === undefined).length} unanswered question{answers.filter(a => a === undefined).length !== 1 ? 's' : ''}. 
                      Review them before submitting.
                    </p>
                  </div>
                ) : null}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Continue Quiz
                  </button>
                  <button
                    onClick={submitQuiz}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Submitting Overlay */}
      {submitting && (
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
