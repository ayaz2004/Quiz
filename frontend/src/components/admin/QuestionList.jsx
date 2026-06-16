import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Trash2, 
  Search,
  Filter,
  GraduationCap,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { getAllQuestions, answerQuestion, deleteQuestion, getQAStats } from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const QuestionList = ({ onSuccess, onError }) => {
  const { isDark } = useTheme();
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({ totalQuestions: 0, pendingQuestions: 0, answeredQuestions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await getQAStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch Q&A stats');
    }
  }, []);

  const fetchQuestions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit: 10,
        status: filter === 'all' ? undefined : filter,
        category: categoryFilter === 'all' ? undefined : categoryFilter
      };
      const response = await getAllQuestions(params);
      setQuestions(response.data.data.questions);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filter, categoryFilter]);

  useEffect(() => {
    fetchQuestions(1);
    fetchStats();
  }, [fetchQuestions, fetchStats]);

  const handleAnswerSubmit = async (questionId) => {
    if (!answerText.trim()) {
      onError?.('Please enter an answer');
      return;
    }

    try {
      setSubmittingAnswer(true);
      await answerQuestion(questionId, { answer: answerText });
      setAnswerText('');
      setExpandedId(null);
      fetchQuestions(pagination.currentPage);
      fetchStats();
      onSuccess?.('Answer submitted successfully');
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await deleteQuestion(questionId);
      fetchQuestions(pagination.currentPage);
      fetchStats();
      onSuccess?.('Question deleted successfully');
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'JMI': return '🎓';
      case 'AMU': return '🏛️';
      default: return '❓';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'JMI': return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
      case 'AMU': return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      default: return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Questions</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalQuestions}</p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pendingQuestions}</p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Answered</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.answeredQuestions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            Status:
          </div>
          {['all', 'pending', 'answered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : isDark 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <GraduationCap className="w-4 h-4" />
            Category:
          </div>
          {['all', 'JMI', 'AMU', 'general'].map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                categoryFilter === c
                  ? 'bg-purple-600 text-white'
                  : isDark 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c === 'all' ? 'All' : c.toUpperCase()}
            </button>
          ))}

          <div className="flex-1" />
          
          <button
            onClick={() => { fetchQuestions(1); fetchStats(); }}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {questions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border overflow-hidden transition-all ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } ${q.status === 'answered' ? 'ring-1 ring-green-500/20' : 'ring-1 ring-amber-500/20'}`}
            >
              {/* Question Header */}
              <button
                onClick={() => {
                  setExpandedId(expandedId === q.id ? null : q.id);
                  setAnswerText('');
                }}
                className="w-full p-5 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getCategoryColor(q.category)}`}>
                    {getCategoryIcon(q.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(q.category)}`}>
                        {q.category.toUpperCase()}
                      </span>
                      {q.status === 'answered' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Answered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {q.question}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {q.user?.email || q.guestEmail || 'Unknown'}
                        {q.guestEmail && <span className="text-amber-500">(Guest)</span>}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(q.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {expandedId === q.id ? (
                      <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === q.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={`px-5 pb-5 pt-0 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="pt-4 pl-14 space-y-4">
                        {/* Full Question */}
                        <div>
                          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full Question:</p>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{q.question}</p>
                        </div>

                        {/* Existing Answer */}
                        {q.status === 'answered' && q.answer && (
                          <div className={`p-4 rounded-xl ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>Answer:</p>
                            <p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{q.answer}</p>
                            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              Answered on {formatDate(q.answeredAt)}
                            </p>
                          </div>
                        )}

                        {/* Answer Input (for pending questions) */}
                        {q.status === 'pending' && (
                          <div className="space-y-3">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Your Answer:
                            </label>
                            <textarea
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              rows={4}
                              placeholder="Type your answer here..."
                              className={`w-full px-4 py-3 rounded-xl border resize-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                              }`}
                              maxLength={3000}
                            />
                            <div className="flex items-center justify-between">
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {answerText.length}/3000 characters
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setExpandedId(null)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isDark 
                                      ? 'text-gray-300 hover:bg-gray-700' 
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleAnswerSubmit(q.id)}
                                  disabled={submittingAnswer || !answerText.trim()}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                  {submittingAnswer ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4" />
                                      Send Answer
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Question
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!loading && questions.length === 0 && (
        <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            No questions found
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {filter !== 'all' || categoryFilter !== 'all' ? 'Try changing your filters' : 'Questions will appear here when users ask them'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => fetchQuestions(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Previous
          </button>
          <span className={`px-4 py-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchQuestions(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionList;
