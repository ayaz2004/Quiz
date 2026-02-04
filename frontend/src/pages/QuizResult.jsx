import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import { getAttemptResult, submitSuggestion } from '../utils/quizApi';
import { 
  Tag, 
  Calendar, 
  Clock, 
  Home, 
  ClipboardList, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  AlertCircle,
  Info,
  Trophy,
  FileText,
  Target,
  Zap,
  Award,
  BookOpen,
  ChevronDown,
  Timer,
  BarChart3,
  TrendingDown,
  Percent,
  Star,
  ThumbsUp,
  Dumbbell
} from 'lucide-react';

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = useParams(); // This is actually attemptId or quizId depending on route
  const { isDark } = useTheme();
  
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [suggestionText, setSuggestionText] = useState('');
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState({ type: '', text: '' });
  
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
          actualWrongAnswers: response.data.actualWrongAnswers,
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
  const { correctAnswers, wrongAnswers, actualWrongAnswers, totalQuestions, score, percentage, timeTaken } = results;
  // Calculate unanswered: total - correct - actually wrong answers
  const unanswered = actualWrongAnswers !== undefined 
    ? totalQuestions - correctAnswers - actualWrongAnswers 
    : totalQuestions - correctAnswers - wrongAnswers;
  
  // Calculate attempted questions (total - unanswered)
  const attemptedQuestions = totalQuestions - unanswered;
  
  // Accuracy rate should match the score percentage (which includes negative marking)
  // Not just correct/attempted ratio
  const accuracyRate = percentage; // Use the percentage from backend which includes negative marking
  
  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    
    if (!suggestionText.trim()) {
      setSuggestionMessage({ type: 'error', text: 'Please enter a suggestion' });
      return;
    }

    if (suggestionText.length > 2000) {
      setSuggestionMessage({ type: 'error', text: 'Suggestion must be less than 2000 characters' });
      return;
    }

    try {
      setSuggestionLoading(true);
      setSuggestionMessage({ type: '', text: '' });
      
      await submitSuggestion({
        quizId: quiz.id,
        attemptId: results.attemptId || null,
        suggestionText: suggestionText.trim()
      });

      setSuggestionMessage({ type: 'success', text: 'Thank you! Your suggestion has been submitted successfully.' });
      setSuggestionText('');
      setTimeout(() => {
        setShowSuggestionForm(false);
        setSuggestionMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      setSuggestionMessage({ 
        type: 'error', 
        text: error.message || 'Failed to submit suggestion. Please try again.' 
      });
    } finally {
      setSuggestionLoading(false);
    }
  };
  
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
    if (percentage >= 90) return { 
      level: 'Outstanding!', 
      color: 'from-emerald-500 to-teal-600', 
      icon: Trophy,
      message: 'Exceptional performance! You\'ve mastered this topic.',
      bg: 'from-emerald-50 to-teal-50'
    };
    if (percentage >= 75) return { 
      level: 'Great Job!', 
      color: 'from-emerald-400 to-green-600', 
      icon: Star,
      message: 'Excellent work! You have a strong understanding.',
      bg: 'from-emerald-50 to-green-50'
    };
    if (percentage >= 60) return { 
      level: 'Good Effort!', 
      color: 'from-blue-500 to-cyan-600', 
      icon: ThumbsUp,
      message: 'Good job! Keep practicing to improve further.',
      bg: 'from-blue-50 to-cyan-50'
    };
    if (percentage >= 40) return { 
      level: 'Keep Trying!', 
      color: 'from-yellow-500 to-orange-600', 
      icon: BookOpen,
      message: 'You\'re making progress. Review the material and try again.',
      bg: 'from-yellow-50 to-orange-50'
    };
    return { 
      level: 'Needs Work', 
      color: 'from-red-500 to-pink-600', 
      icon: Dumbbell,
      message: 'Don\'t give up! Practice more and you\'ll improve.',
      bg: 'from-red-50 to-pink-50'
    };
  };

  const performance = getPerformanceLevel(percentage);

  return (
    <div className={`min-h-screen py-8 md:py-12 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50'}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Confetti Background Effect */}
        {percentage >= 75 && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, x: Math.random() * window.innerWidth, opacity: 1 }}
                animate={{ 
                  y: window.innerHeight + 100, 
                  rotate: 360,
                  opacity: 0 
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2, 
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="absolute w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Header with Quiz Info */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 md:mb-8 p-4 md:p-6 rounded-2xl ${
            isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm shadow-lg'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className={`text-xl md:text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {quiz.title}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Tag className="w-4 h-4" />
                  {quiz.subject}
                </span>
                <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar className="w-4 h-4" />
                  Year: {quiz.examYear}
                </span>
                {timeTaken && (
                  <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Clock className="w-4 h-4" />
                    Time: {formatTime(timeTaken)}
                  </span>
                )}
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className={`p-4 rounded-2xl bg-gradient-to-r ${performance.color}`}
            >
              {performance.icon && <performance.icon className="w-12 h-12 md:w-16 md:h-16 text-white" />}
            </motion.div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Score Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Score Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`p-6 md:p-8 rounded-3xl shadow-2xl ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50'
              }`}
            >
              <div className="text-center">
                <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${performance.color} text-white font-bold text-lg md:text-xl mb-4 shadow-lg`}>
                  {performance.level}
                </div>
                
                <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-6">
                  <svg className="transform -rotate-90 w-full h-full">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className={isDark ? 'text-gray-700' : 'text-gray-200'}
                    />
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="url(#emeraldGradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * percentage) / 100 }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      style={{ strokeDasharray: 440 }}
                    />
                    <defs>
                      <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${performance.color} bg-clip-text text-transparent`}
                      >
                        {percentage ? percentage.toFixed(1) : '0'}%
                      </motion.div>
                      <div className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Score Percentage
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Target className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <div className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {score} / {totalQuestions}
                    <span className={`text-base md:text-lg font-normal ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Points
                    </span>
                  </div>
                </motion.div>

                <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-md mx-auto`}>
                  {performance.message}
                </p>
              </div>
            </motion.div>

            {/* Detailed Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-4 md:p-5 rounded-2xl text-center relative overflow-hidden ${
                  isDark 
                    ? 'bg-gradient-to-br from-emerald-900/40 to-green-900/40 border border-emerald-700/30' 
                    : 'bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200'
                }`}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="absolute top-2 right-2 opacity-20"
                >
                  <Zap className="w-8 h-8 text-emerald-500" />
                </motion.div>
                <div className="text-3xl md:text-4xl font-bold text-emerald-500 mb-1">{correctAnswers}</div>
                <div className={`text-xs md:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Correct</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(0) : 0}%
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`p-4 md:p-5 rounded-2xl text-center relative overflow-hidden ${
                  isDark 
                    ? 'bg-gradient-to-br from-red-900/40 to-pink-900/40 border border-red-700/30' 
                    : 'bg-gradient-to-br from-red-50 to-pink-50 border border-red-200'
                }`}
              >
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute top-2 right-2 opacity-20"
                >
                  <TrendingDown className="w-8 h-8 text-red-500" />
                </motion.div>
                <div className="text-3xl md:text-4xl font-bold text-red-500 mb-1">{wrongAnswers}</div>
                <div className={`text-xs md:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Wrong</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {totalQuestions > 0 ? ((wrongAnswers / totalQuestions) * 100).toFixed(0) : 0}%
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`p-4 md:p-5 rounded-2xl text-center relative overflow-hidden ${
                  isDark 
                    ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300'
                }`}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="absolute top-2 right-2 opacity-20"
                >
                  <Timer className="w-8 h-8 text-gray-500" />
                </motion.div>
                <div className="text-3xl md:text-4xl font-bold text-gray-500 mb-1">{unanswered}</div>
                <div className={`text-xs md:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Skipped</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {totalQuestions > 0 ? ((unanswered / totalQuestions) * 100).toFixed(0) : 0}%
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`p-4 md:p-5 rounded-2xl text-center relative overflow-hidden ${
                  isDark 
                    ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-700/30' 
                    : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200'
                }`}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="absolute top-2 right-2 opacity-20"
                >
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </motion.div>
                <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-1">{totalQuestions}</div>
                <div className={`text-xs md:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Questions
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column - Action Cards */}
          <div className="space-y-4">
            {/* Performance Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className={`p-5 md:p-6 rounded-2xl ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 shadow-lg'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Performance Insights
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-emerald-50'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Percent className="w-4 h-4" />
                      Accuracy Rate
                    </span>
                    <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {accuracyRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, accuracyRate))}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                    />
                  </div>
                </div>

                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Target className="w-4 h-4" />
                      Attempt Rate
                    </span>
                    <span className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {attemptedQuestions > 0 ? ((attemptedQuestions / totalQuestions) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, attemptedQuestions > 0 ? (attemptedQuestions / totalQuestions) * 100 : 0))}%` }}
                      transition={{ duration: 1, delay: 0.9 }}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    />
                  </div>
                </div>

                {quiz.hasNegativeMarking && (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-red-900/30 border border-red-700/30' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        <AlertCircle className="w-4 h-4" />
                        Negative Marking
                      </span>
                      <span className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        -{quiz.negativeMarks} per wrong
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Base Score (Correct × 1)</span>
                        <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          +{correctAnswers}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Deduction (Wrong × {quiz.negativeMarks})</span>
                        <span className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                          -{((actualWrongAnswers || 0) * quiz.negativeMarks).toFixed(2)}
                        </span>
                      </div>
                      <div className={`flex justify-between text-sm font-bold pt-1 border-t ${isDark ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-800'}`}>
                        <span>Final Score</span>
                        <span>{typeof score === 'number' ? score.toFixed(2) : score}</span>
                      </div>
                    </div>
                  </div>
                )}

                {quiz.prize && (
                  <motion.div 
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1, type: "spring" }}
                    className={`p-3 rounded-lg border-2 ${
                    isDark 
                      ? 'border-yellow-700/50 bg-yellow-900/20' 
                      : 'border-yellow-300 bg-yellow-50'
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className="relative">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <Award className="w-3 h-3 text-yellow-600 absolute -top-1 -right-1" />
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                          Prize Available
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {quiz.prize}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <button
                onClick={() => navigate('/quizzes')}
                className={`w-full px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                    : 'bg-white hover:bg-gray-50 text-gray-800 shadow-lg border border-gray-200'
                }`}
              >
                <Home className="w-5 h-5" />
                Back to Quizzes
              </button>
              
              <button
                onClick={() => navigate('/attempts')}
                className="w-full px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ClipboardList className="w-5 h-5" />
                View All Attempts
              </button>

              <button
                onClick={() => navigate(`/quiz/${quiz.id}`)}
                className={`w-full px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  isDark 
                    ? 'bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-700/50' 
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
                Retake Quiz
              </button>
            </motion.div>
          </div>
        </div>

        {/* Suggestion Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6"
        >
          <div className={`p-5 rounded-xl ${showSuggestionForm ? 'max-w-4xl' : 'max-w-xl'} mx-auto transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-50 shadow-md border border-gray-200'
          }`}>
            {!showSuggestionForm ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 mb-3">
                  <ThumbsUp className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Have Feedback?
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Help us improve! Share your thoughts about this quiz.
                </p>
                <button
                  onClick={() => setShowSuggestionForm(true)}
                  className="px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white transition-all shadow-md text-sm flex items-center justify-center gap-2 mx-auto"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Submit Suggestion
                </button>
              </div>
            ) : (
              <form onSubmit={handleSuggestionSubmit}>
                <div className="text-center mb-4">
                  <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Share Your Feedback
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tell us what you think about this quiz
                  </p>
                </div>
                
                {suggestionMessage.text && (
                  <div className={`mb-3 p-3 rounded-lg ${
                    suggestionMessage.type === 'success'
                      ? isDark ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isDark ? 'bg-red-900/30 text-red-400 border border-red-700' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <p className="text-sm">{suggestionMessage.text}</p>
                  </div>
                )}
                
                <textarea
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="Share your thoughts, report issues, suggest improvements..."
                  rows="3"
                  className={`w-full p-3 rounded-lg border transition-colors mb-2 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={suggestionLoading}
                />
                
                <div className="text-xs text-right mb-3 text-gray-500">
                  {suggestionText.length}/2000 characters
                </div>
                
                <div className="flex gap-2 justify-center">
                  <button
                    type="submit"
                    disabled={suggestionLoading || !suggestionText.trim()}
                    className="px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md text-sm"
                  >
                    {suggestionLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuggestionForm(false);
                      setSuggestionText('');
                      setSuggestionMessage({ type: '', text: '' });
                    }}
                    disabled={suggestionLoading}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } disabled:opacity-50`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* Detailed Results Toggle */}
        {results.results && results.results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`w-full p-5 md:p-6 rounded-2xl font-semibold transition-all mb-6 ${
                isDark 
                  ? 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white border border-gray-700' 
                  : 'bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-800 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </span>
                  <div className="text-left">
                    <div className="text-lg md:text-xl font-bold">Detailed Question Review</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      View answers and explanations for all {totalQuestions} questions
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showDetails ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-6 h-6 flex-shrink-0" />
                </motion.div>
              </div>
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 md:space-y-5"
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
                      transition={{ delay: index * 0.05 }}
                      className={`p-5 md:p-6 rounded-2xl ${
                        isDark ? 'bg-gray-800 border-2' : 'bg-white shadow-lg border-2'
                      } ${
                        result.isCorrect 
                          ? isDark ? 'border-emerald-700/50' : 'border-emerald-300' 
                          : result.userAnswer === 0 
                          ? isDark ? 'border-gray-600' : 'border-gray-300'
                          : isDark ? 'border-red-700/50' : 'border-red-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Question Number Badge */}
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-bold text-lg ${
                            result.isCorrect 
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg' 
                              : result.userAnswer === 0 
                              ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                              : 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg'
                          }`}>
                            {index + 1}
                          </div>
                          {/* Status Icon */}
                          <div className="mt-2 text-center">
                            {result.isCorrect ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                            ) : result.userAnswer === 0 ? (
                              <MinusCircle className="w-6 h-6 text-gray-500 mx-auto" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-500 mx-auto" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-3">
                            <BookOpen className={`w-5 h-5 flex-shrink-0 mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <h3 className={`font-semibold text-base md:text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {result.questionText}
                            </h3>
                          </div>

                          {result.imageUrl && (
                            <img 
                              src={result.imageUrl} 
                              alt="Question" 
                              className="mb-4 rounded-xl max-w-full md:max-w-md shadow-md"
                            />
                          )}
                          
                          <div className="space-y-2 mb-3">
                            {result.userAnswer > 0 && (
                              <div className={`p-3 md:p-4 rounded-xl border-2 ${
                                result.isCorrect 
                                  ? isDark 
                                    ? 'bg-emerald-900/20 border-emerald-700' 
                                    : 'bg-emerald-50 border-emerald-300'
                                  : isDark 
                                    ? 'bg-red-900/20 border-red-700' 
                                    : 'bg-red-50 border-red-300'
                              }`}>
                                <div className="flex items-start gap-2">
                                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                    result.isCorrect 
                                      ? 'bg-emerald-500 text-white' 
                                      : 'bg-red-500 text-white'
                                  }`}>
                                    {String.fromCharCode(64 + result.userAnswer)}
                                  </span>
                                  <div className="flex-1">
                                    <div className={`text-xs font-semibold mb-1 ${
                                      result.isCorrect 
                                        ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                                        : isDark ? 'text-red-400' : 'text-red-700'
                                    }`}>
                                      Your Answer {result.isCorrect ? '✓' : '✗'}
                                    </div>
                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {getOptionText(result.userAnswer)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {result.userAnswer === 0 && (
                              <div className={`p-3 md:p-4 rounded-xl border-2 ${
                                isDark 
                                  ? 'bg-gray-700/50 border-gray-600' 
                                  : 'bg-gray-100 border-gray-300'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5 text-gray-500" />
                                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Question Not Attempted
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {!result.isCorrect && (
                              <div className={`p-3 md:p-4 rounded-xl border-2 ${
                                isDark 
                                  ? 'bg-emerald-900/20 border-emerald-700' 
                                  : 'bg-emerald-50 border-emerald-300'
                              }`}>
                                <div className="flex items-start gap-2">
                                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-500 text-white">
                                    {String.fromCharCode(64 + result.correctAnswer)}
                                  </span>
                                  <div className="flex-1">
                                    <div className={`text-xs font-semibold mb-1 ${
                                      isDark ? 'text-emerald-400' : 'text-emerald-700'
                                    }`}>
                                      Correct Answer ✓
                                    </div>
                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {getOptionText(result.correctAnswer)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {result.explanation && (
                            <div className={`p-3 md:p-4 rounded-xl ${
                              isDark 
                                ? 'bg-blue-900/20 border border-blue-800' 
                                : 'bg-blue-50 border border-blue-200'
                            }`}>
                              <div className="flex items-start gap-2">
                                <Info className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                <div>
                                  <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                    Explanation
                                  </p>
                                  <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                                    {result.explanation}
                                  </p>
                                </div>
                              </div>
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
