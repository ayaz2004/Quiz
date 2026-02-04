import { useState, useEffect } from 'react';
import { getAllAttempts, deleteAttempt } from '../../utils/adminApi';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';
import { ClipboardList, User, BookOpen, Calendar, Trash2, Trophy, Target, XCircle, CheckCircle, Clock } from 'lucide-react';

const AttemptList = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAttempts();
  }, [currentPage]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const response = await getAllAttempts(currentPage, 15);
      setAttempts(response.data.attempts || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setInitialLoad(false);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      showMessage('error', 'Failed to load attempts');
      setAttempts([]);
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleDelete = async (attemptId) => {
    if (!window.confirm('Are you sure you want to delete this attempt? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteAttempt(attemptId);
      showMessage('success', 'Attempt deleted successfully');
      fetchAttempts();
    } catch (error) {
      console.error('Error deleting attempt:', error);
      showMessage('error', 'Failed to delete attempt');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (initialLoad && loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <ClipboardList className="w-7 h-7" />
          Quiz Attempts
        </h2>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <ClipboardList className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No attempts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">
                    {attempt.quiz.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {attempt.user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {attempt.quiz.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(attempt.attemptedAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(attempt.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete attempt"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Score</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {attempt.score}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Percentage</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {attempt.percentage.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">Correct</span>
                  </div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {attempt.correctAnswers}
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-xs font-medium text-red-700 dark:text-red-300">Wrong</span>
                  </div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    {attempt.wrongAnswers}
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Time</span>
                  </div>
                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {formatTime(attempt.timeTaken)}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Questions: <span className="font-semibold text-gray-800 dark:text-white">{attempt.totalQuestions}</span>
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Attempt ID: #{attempt.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default AttemptList;
