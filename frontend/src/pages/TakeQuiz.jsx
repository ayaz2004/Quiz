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
  const [questionTimes, setQuestionTimes] = useState([]); // Time spent on each question
  const [questionStartTime, setQuestionStartTime] = useState(Date.now()); // When current question was started

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

      const sortedQuestions = [...quizData.questions].sort((a, b) => {
        const aOrder = a.questionOrder ?? a.id ?? 0;
        const bOrder = b.questionOrder ?? b.id ?? 0;
        return aOrder - bOrder;
      });

      const normalizedQuiz = { ...quizData, questions: sortedQuestions };

      setQuiz(normalizedQuiz);
      setAnswers(new Array(normalizedQuiz.questions.length).fill(undefined));
      setReviewMarked(new Array(normalizedQuiz.questions.length).fill(false));
      setQuestionTimes(new Array(normalizedQuiz.questions.length).fill(0));
      setQuestionStartTime(Date.now());
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

  // Save time spent on current question before switching
  const saveCurrentQuestionTime = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setQuestionTimes(prev => {
      const newTimes = [...prev];
      newTimes[currentQuestionIndex] = (newTimes[currentQuestionIndex] || 0) + timeSpent;
      return newTimes;
    });
  }, [currentQuestionIndex, questionStartTime]);

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
      saveCurrentQuestionTime();
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      saveCurrentQuestionTime();
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const markForReviewAndNext = () => {
    toggleReviewMark();
    if (currentQuestionIndex < quiz.questions.length - 1) {
      saveCurrentQuestionTime();
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleQuestionClick = (questionIndex) => {
    saveCurrentQuestionTime();
    setCurrentQuestionIndex(questionIndex);
    setQuestionStartTime(Date.now());
  };

  const handleSubmit = () => {
    setShowReviewModal(true);
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      setShowReviewModal(false);

      // Save time for current question before submitting
      saveCurrentQuestionTime();
      const finalQuestionTimes = [...questionTimes];
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      finalQuestionTimes[currentQuestionIndex] = (finalQuestionTimes[currentQuestionIndex] || 0) + timeSpent;

      // Format answers for backend - include all answers, even unanswered (as 0)
      const formattedAnswers = answers.map((answer, index) => ({
        questionId: quiz.questions[index].id,
        selectedOption: answer || 0, // 0 for unanswered
        timeSpent: finalQuestionTimes[index] || 0, // Time spent on this question
      }));

      console.log('Submitting quiz attempt...', { formattedAnswers, timeTaken, questionTimes: finalQuestionTimes });
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
    <div className={`min-h-screen pb-24 sm:pb-28 md:pb-32 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      {/* Fixed Timer at Top Right Corner */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-40">
        <QuizTimer 
          onTimeUpdate={handleTimeUpdate} 
          isActive={!submitting}
          timeLimit={quiz.timeLimit}
          onTimeUp={submitQuiz}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-8">
        <div className={`grid grid-cols-1 gap-5 md:gap-6 ${sidebarCollapsed ? '' : 'lg:grid-cols-4'}`}>
          {/* Progress Sidebar */}
          {!sidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 md:top-8">
                <div className="relative">
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className={`absolute -right-2 top-3 z-10 p-2 rounded-lg shadow-lg transition-all hover:scale-105 ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-300'
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
            </motion.div>
          )}

          {/* Question Area */}
          <div className={sidebarCollapsed ? '' : 'lg:col-span-3'}>
            {/* Show/Hide Sidebar Button */}
            {sidebarCollapsed && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSidebarCollapsed(false)}
                className={`mb-5 px-4 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2 ${
                  isDark ? 'bg-gray-800/95 hover:bg-gray-700 text-gray-100 border border-gray-700' : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300'
                }`}
                title="Show progress panel"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-semibold">Show Progress</span>
              </motion.button>
            )}
            <div className="relative min-h-[450px] sm:min-h-[520px] md:min-h-[580px]">
              <AnimatePresence mode="wait">
                <QuestionCard
                  key={currentQuestionIndex}
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  selectedAnswer={answers[currentQuestionIndex]}
                  onAnswerSelect={handleAnswerSelect}
                  isMarkedForReview={reviewMarked[currentQuestionIndex]}
                  timeSpent={questionTimes[currentQuestionIndex] || 0}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <QuizNavigation
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            onMarkForReviewAndNext={markForReviewAndNext}
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
              className={`max-w-5xl w-full max-h-[90vh] flex flex-col rounded-3xl ${isDark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-2xl`}
            >
              {/* Header */}
              <div className={`px-6 py-5 border-b-2 flex-shrink-0 ${isDark ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Review Your Answers
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Check your responses before final submission
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
                      isDark ? 'hover:bg-gray-700 text-gray-400 bg-gray-700/50' : 'hover:bg-gray-200 text-gray-600 bg-gray-100'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className={`px-6 py-5 border-b-2 flex-shrink-0 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white border border-gray-200'}`}>
                    <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {quiz.questions.length}
                    </div>
                    <div className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total
                    </div>
                  </div>
                  <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white border border-gray-200'}`}>
                    <div className="text-3xl font-bold text-green-500">
                      {answers.filter(a => a !== undefined).length}
                    </div>
                    <div className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Answered
                    </div>
                  </div>
                  <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white border border-gray-200'}`}>
                    <div className="text-3xl font-bold text-amber-500">
                      {reviewMarked.filter(Boolean).length}
                    </div>
                    <div className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Review
                    </div>
                  </div>
                  <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white border border-gray-200'}`}>
                    <div className="text-3xl font-bold text-red-500">
                      {answers.filter(a => a === undefined).length}
                    </div>
                    <div className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Skipped
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Grid */}
              <div className="px-6 py-5 overflow-y-auto flex-1">
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2.5">
                  {quiz.questions.map((_, index) => {
                    const isAnswered = answers[index] !== undefined;
                    const isReviewed = reviewMarked[index];
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCurrentQuestionIndex(index);
                          setShowReviewModal(false);
                        }}
                        className={`relative aspect-square rounded-xl font-bold text-sm transition-all ${
                          isCurrent
                            ? 'ring-3 ring-offset-2 ' + (isDark ? 'ring-blue-400 ring-offset-gray-800' : 'ring-blue-500 ring-offset-white')
                            : ''
                        } ${
                          isReviewed
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg'
                            : isAnswered
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-gray-300'
                        }`}
                      >
                        {index + 1}
                        {/* Review marker */}
                        {isReviewed && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className={`mt-6 pt-5 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Legend:</p>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-sm"></div>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm"></div>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>For Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-lg ${isDark ? 'bg-gray-700 border-2 border-gray-600' : 'bg-gray-200 border-2 border-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Unanswered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg ring-3 ring-blue-500 bg-green-500 shadow-md"></div>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Currently Viewing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className={`px-6 py-5 border-t-2 flex-shrink-0 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                {answers.filter(a => a === undefined).length > 0 ? (
                  <div className={`mb-4 p-4 rounded-xl ${isDark ? 'bg-amber-900/20 border-2 border-amber-800' : 'bg-amber-50 border-2 border-amber-300'}`}>
                    <div className="flex items-start gap-3">
                      <svg className={`w-6 h-6 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className={`text-sm font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                        You have {answers.filter(a => a === undefined).length} unanswered question{answers.filter(a => a === undefined).length !== 1 ? 's' : ''}. 
                        <span className="block mt-1 font-normal">You can still submit, but consider reviewing them first.</span>
                      </p>
                    </div>
                  </div>
                ) : null}
                
                {/* Navigation Row */}
                <div className="flex gap-3 mb-3">
                  <motion.button
                    whileHover={{ scale: currentQuestionIndex === 0 ? 1 : 1.02 }}
                    whileTap={{ scale: currentQuestionIndex === 0 ? 1 : 0.98 }}
                    onClick={() => {
                      if (currentQuestionIndex > 0) {
                        setCurrentQuestionIndex(prev => prev - 1);
                      }
                    }}
                    disabled={currentQuestionIndex === 0}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      currentQuestionIndex === 0
                        ? isDark
                          ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border-2 border-gray-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                        : isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 border-2 border-gray-600'
                        : 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: currentQuestionIndex === quiz.questions.length - 1 ? 1 : 1.02 }}
                    whileTap={{ scale: currentQuestionIndex === quiz.questions.length - 1 ? 1 : 0.98 }}
                    onClick={() => {
                      if (currentQuestionIndex < quiz.questions.length - 1) {
                        setCurrentQuestionIndex(prev => prev + 1);
                      }
                    }}
                    disabled={currentQuestionIndex === quiz.questions.length - 1}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      currentQuestionIndex === quiz.questions.length - 1
                        ? isDark
                          ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border-2 border-gray-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                        : isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 border-2 border-gray-600'
                        : 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300'
                    }`}
                  >
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>

                {/* Action Buttons Row */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const newReviewMarked = [...reviewMarked];
                      newReviewMarked[currentQuestionIndex] = !newReviewMarked[currentQuestionIndex];
                      setReviewMarked(newReviewMarked);
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                      reviewMarked[currentQuestionIndex]
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={reviewMarked[currentQuestionIndex] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>{reviewMarked[currentQuestionIndex] ? 'Marked' : 'Mark'} for Review</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submitQuiz}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Submitting Overlay */}
      {submitting && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <div className={`text-center p-8 rounded-3xl ${isDark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-2xl`}>
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Submitting Quiz</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Please wait while we process your answers...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TakeQuiz;
