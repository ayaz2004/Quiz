import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserAttempts, getUserStats } from '../utils/quizApi';
import { useTheme } from '../context/ThemeContext';

const Attempts = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAttempts: 0
  });

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attemptsData, statsData] = await Promise.all([
        getUserAttempts(pagination.currentPage, 10),
        getUserStats()
      ]);
      
      setAttempts(attemptsData.data.attempts);
      setPagination(attemptsData.data.pagination);
      setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleViewDetails = (attemptId) => {
    navigate(`/quiz/result/${attemptId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading attempts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8 px-4 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 dark:text-white"
      >
        My Quiz Attempts
      </motion.h1>

      {/* Statistics Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalAttempts}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Total Attempts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.averagePercentage.toFixed(1)}%
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Average Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.bestScore}%
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Best Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.overallAccuracy.toFixed(1)}%
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Accuracy</p>
            </div>
          </div>

          {/* Subject-wise stats */}
          {stats.subjectWiseStats.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Subject-wise Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.subjectWiseStats.map((subject, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                      {subject.subject}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>Attempts: {subject.attempts}</p>
                      <p>Avg Score: {subject.averageScore}%</p>
                      <p>Accuracy: {subject.accuracy}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Attempts List */}
      <div className="space-y-4">
        {attempts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Attempts Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start taking quizzes to see your attempt history here
            </p>
            <button
              onClick={() => navigate('/quizzes')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Quizzes
            </button>
          </motion.div>
        ) : (
          attempts.map((attempt, index) => (
            <motion.div
              key={attempt.attemptId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    {attempt.quiz.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {attempt.quiz.subject}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                      {attempt.quiz.examYear}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className={`font-semibold ${
                      attempt.percentage >= 75 ? 'text-green-600 dark:text-green-400' :
                      attempt.percentage >= 60 ? 'text-blue-600 dark:text-blue-400' :
                      attempt.percentage >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      Score: {attempt.percentage.toFixed(1)}%
                    </span>
                    <span>
                      Correct: {attempt.correctAnswers}/{attempt.totalQuestions}
                    </span>
                    <span>Time: {formatTime(attempt.timeTaken)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(attempt.attemptedAt)}
                  </span>
                  <button
                    onClick={() => handleViewDetails(attempt.attemptId)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-800 dark:text-white">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Attempts;
