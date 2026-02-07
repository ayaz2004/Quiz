import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getQuizById, checkQuizAccess } from '../../utils/quizApi';

const QuizOverview = ({ quiz, isOpen, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [quizDetails, setQuizDetails] = useState(quiz);

  useEffect(() => {
    if (isOpen && quiz) {
      fetchQuizDetails();
      if (isAuthenticated && quiz.isPaid) {
        checkAccess();
      } else if (!quiz.isPaid) {
        setHasAccess(true);
        setAccessChecked(true);
      } else {
        setAccessChecked(true);
      }
    }
  }, [isOpen, quiz, isAuthenticated]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await getQuizById(quiz.id);
      if (response.success) {
        setQuizDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async () => {
    try {
      const response = await checkQuizAccess(quiz.id);
      if (response.success) {
        setHasAccess(response.data.hasAccess);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    } finally {
      setAccessChecked(true);
    }
  };

  const handleStartQuiz = () => {
    if (!isAuthenticated) {
      // Redirect to login, then back to this quiz
      navigate('/signin', { state: { from: `/quiz/${quiz.id}` } });
      return;
    }

    if (quiz.isPaid && !hasAccess) {
      // Show message with contact information
      alert('This is a Premium Quiz!\n\nPurchase to unlock 3 attempts.\nContact us at: jmi123quiz@gmail.com');
      return;
    }

    // Start the quiz (navigate to quiz page)
    onClose(); // Close modal first
    navigate(`/quiz/${quiz.id}`);
  };

  const getButtonText = () => {
    if (!isAuthenticated) {
      return 'Login to Continue';
    }
    if (quiz.isPaid && !hasAccess) {
      return 'Access Required';
    }
    return 'Start Quiz';
  };

  const getButtonIcon = () => {
    if (!isAuthenticated) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      );
    }
    if (quiz.isPaid && !hasAccess) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white rounded-t-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-12">
                <h2 className="text-3xl font-bold mb-2">{quizDetails.title}</h2>
                <p className="text-emerald-100 text-sm">{quizDetails.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                {quizDetails.subject}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                Year {quizDetails.examYear}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                {quizDetails.educationLevel === 'school' ? 'School' : 
                 quizDetails.educationLevel === 'masters' ? 'Masters' : 'Undergraduate'}
              </span>
              {quizDetails.prize && (
                <span className="px-3 py-1 bg-yellow-400/30 backdrop-blur-sm text-white text-sm font-semibold rounded-full flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {quizDetails.prize}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Quiz Stats */}
            <div className={`grid gap-4 mb-8 ${quizDetails.hasNegativeMarking ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{quizDetails.questionCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {quizDetails.timeLimit ? quizDetails.timeLimit : `~${Math.ceil(quizDetails.questionCount * 1.5)}`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {quizDetails.timeLimit ? 'Minutes (Limit)' : 'Minutes (Est.)'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  {quizDetails.isPaid ? (
                    <div className="w-8 h-8 flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-bold text-2xl">
                      ₹
                    </div>
                  ) : (
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {quizDetails.isPaid ? `₹${quizDetails.price}` : 'Free'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {quizDetails.isPaid ? 'Premium' : 'Access'}
                </p>
              </div>

              {quizDetails.hasNegativeMarking && (
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    -{quizDetails.negativeMarks}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Per Wrong
                  </p>
                </div>
              )}
            </div>

            {/* Access Status */}
            {quizDetails.isPaid && accessChecked && (
              <div className={`mb-6 rounded-xl overflow-hidden ${hasAccess ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800'}`}>
                {hasAccess ? (
                  <div className="p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-green-800 dark:text-green-200 font-medium">You have access to this quiz!</p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">You can attempt this quiz up to 3 times</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-yellow-500 text-white p-2 rounded-lg">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-yellow-900 dark:text-yellow-100 font-bold text-lg mb-1">Premium Quiz</h4>
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">Purchase this quiz to unlock access</p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Price</span>
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">₹{quizDetails.price}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span><strong>3 Attempts</strong> - Take the quiz up to 3 times</span>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500 p-4 rounded">
                      <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-2">
                        <strong>To purchase this quiz:</strong>
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                        Contact us at:
                      </p>
                      <a 
                        href="mailto:jmi123quiz@gmail.com" 
                        className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        jmi123quiz@gmail.com
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instructions
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Read each question carefully before selecting your answer</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You can navigate between questions and change your answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Submit the quiz when you're done to see your results</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Your attempt will be saved in your history for future reference</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {getButtonIcon()}
              <span>{loading ? 'Loading...' : getButtonText()}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

QuizOverview.propTypes = {
  quiz: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default QuizOverview;
