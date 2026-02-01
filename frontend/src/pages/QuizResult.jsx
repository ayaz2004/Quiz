import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import { getAttemptResult } from '../utils/quizApi';

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = useParams(); // This is actually attemptId or quizId depending on route
  const { isDark } = useTheme();
  
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  
  // Data from navigation state (when coming from TakeQuiz)
  const stateResults = location.state?.results;
  const stateQuiz = location.state?.quiz;

  useEffect(() => {
    // If we have data from state, use it
    if (stateResults && stateQuiz) {
      setResultData({
        results: stateResults,
        quiz: stateQuiz
      });
    } else if (quizId) {
      // Otherwise, fetch from API using attemptId (quizId param)
      fetchAttemptResult(quizId);
    } else {
      navigate('/quizzes');
    }
  }, [quizId, stateResults, stateQuiz]);

  const fetchAttemptResult = async (attemptId) => {
    try {
      setLoading(true);
      const response = await getAttemptResult(attemptId);
      
      // Transform API response to match expected format
      setResultData({
        results: {
          attemptId: response.data.attemptId,
          correctAnswers: response.data.correctAnswers,
          wrongAnswers: response.data.wrongAnswers,
          totalQuestions: response.data.totalQuestions,
          score: response.data.score,
          percentage: response.data.percentage,
          timeTaken: response.data.timeTaken,
          attemptedAt: response.data.attemptedAt,
          results: response.data.results
        },
        quiz: response.data.quiz
      });
    } catch (error) {
      console.error('Error fetching attempt result:', error);
      alert('Failed to load quiz result');
      navigate('/attempts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return null;
  }

  const { results, quiz } = resultData;
  const { correctAnswers, wrongAnswers, totalQuestions, score, percentage, timeTaken } = results;
  const unanswered = totalQuestions - (correctAnswers + wrongAnswers);
  
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { level: 'Excellent', color: 'from-green-500 to-emerald-600', emoji: '🎉' };
    if (percentage >= 75) return { level: 'Very Good', color: 'from-blue-500 to-cyan-600', emoji: '🌟' };
    if (percentage >= 60) return { level: 'Good', color: 'from-indigo-500 to-purple-600', emoji: '👍' };
    if (percentage >= 40) return { level: 'Fair', color: 'from-yellow-500 to-orange-600', emoji: '📚' };
    return { level: 'Needs Improvement', color: 'from-red-500 to-pink-600', emoji: '💪' };
  };

  const performance = getPerformanceLevel(percentage);

  return (
    <div className={`min-h-screen py-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="text-6xl mb-4"
          >
            {performance.emoji}
          </motion.div>
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Quiz Completed!
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {quiz.title}
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`max-w-2xl mx-auto mb-8 p-8 rounded-3xl shadow-2xl ${
            isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-white'
          }`}
        >
          <div className="text-center mb-6">
            <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${performance.color} text-white font-bold text-lg mb-4`}>
              {performance.level}
            </div>
            
            <div className="relative w-40 h-40 mx-auto mb-4">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className={isDark ? 'text-gray-700' : 'text-gray-200'}
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#gradient)"
                  strokeWidth="10"
                  fill="transparent"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * percentage) / 100 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{ strokeDasharray: 440 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {percentage.toFixed(1)}%
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Score
                  </div>
                </div>
              </div>
            </div>

            <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {score} / {totalQuestions} Points
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-4 rounded-2xl text-center ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="text-3xl font-bold text-green-500 mb-1">{correctAnswers}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Correct</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`p-4 rounded-2xl text-center ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="text-3xl font-bold text-red-500 mb-1">{wrongAnswers}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wrong</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-4 rounded-2xl text-center ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="text-3xl font-bold text-gray-500 mb-1">{unanswered}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Skipped</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`p-4 rounded-2xl text-center ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="text-3xl font-bold text-blue-500 mb-1">{totalQuestions}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</div>
            </motion.div>
          </div>

          {timeTaken && (
            <div className="mt-4 text-center">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Time Taken: <span className="font-semibold">{formatTime(timeTaken)}</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/quizzes')}
            className={`flex-1 px-8 py-4 rounded-2xl font-semibold transition-all ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-800 shadow-lg'
            }`}
          >
            Back to Quizzes
          </button>
          <button
            onClick={() => navigate(`/attempts`)}
            className="flex-1 px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all shadow-lg"
          >
            View All Attempts
          </button>
        </motion.div>

        {/* Detailed Results Toggle */}
        {results.results && results.results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`w-full p-4 rounded-2xl font-semibold transition-all mb-4 ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-800 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Question-by-Question Review</span>
                <motion.svg
                  animate={{ rotate: showDetails ? 180 : 0 }}
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </div>
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {results.results.map((result, index) => {
                  const getOptionText = (optionNum) => {
                    return result.options[`option${optionNum}`];
                  };

                  return (
                    <motion.div
                      key={result.questionId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-2xl ${
                        isDark ? 'bg-gray-800' : 'bg-white shadow-lg'
                      } ${
                        result.isCorrect 
                          ? 'border-2 border-green-500' 
                          : result.userAnswer === 0 
                          ? 'border-2 border-gray-500' 
                          : 'border-2 border-red-500'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          result.isCorrect 
                            ? 'bg-green-500 text-white' 
                            : result.userAnswer === 0 
                            ? 'bg-gray-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {result.questionText}
                          </h3>

                          {result.imageUrl && (
                            <img 
                              src={result.imageUrl} 
                              alt="Question" 
                              className="mb-3 rounded-lg max-w-md"
                            />
                          )}
                          
                          <div className="space-y-2 mb-3">
                            {result.userAnswer > 0 && (
                              <div className={`p-3 rounded-lg ${
                                result.isCorrect 
                                  ? 'bg-green-500/20 border border-green-500' 
                                  : 'bg-red-500/20 border border-red-500'
                              }`}>
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Your Answer: {String.fromCharCode(64 + result.userAnswer)}. {
                                    getOptionText(result.userAnswer)
                                  }
                                </span>
                              </div>
                            )}
                            
                            {result.userAnswer === 0 && (
                              <div className="p-3 rounded-lg bg-gray-500/20 border border-gray-500">
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Not Answered
                                </span>
                              </div>
                            )}
                            
                            {!result.isCorrect && (
                              <div className="p-3 rounded-lg bg-green-500/20 border border-green-500">
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Correct Answer: {String.fromCharCode(64 + result.correctAnswer)}. {
                                    getOptionText(result.correctAnswer)
                                  }
                                </span>
                              </div>
                            )}
                          </div>

                          {result.explanation && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                <span className="font-semibold">Explanation:</span> {result.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizResult;
