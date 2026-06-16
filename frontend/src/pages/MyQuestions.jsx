import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Search,
  Filter,
  GraduationCap
} from 'lucide-react';
import { getMyQuestions } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const MyQuestions = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0
  });

  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getMyQuestions({ page, limit: 10 });
      setQuestions(response.data.data.questions);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError('Failed to load your questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter(q => {
    if (filter === 'all') return true;
    if (filter === 'pending') return q.status === 'pending';
    if (filter === 'answered') return q.status === 'answered';
    return true;
  });

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

  const getStatusIcon = (status) => {
    if (status === 'answered') {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    return <Clock className="w-5 h-5 text-amber-500" />;
  };

  const getStatusText = (status) => {
    if (status === 'answered') {
      return { text: 'Answered', color: isDark ? 'text-green-400' : 'text-green-600' };
    }
    return { text: 'Pending', color: isDark ? 'text-amber-400' : 'text-amber-600' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading your questions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  My Questions
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {pagination.totalQuestions} question{pagination.totalQuestions !== 1 ? 's' : ''} asked
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/ask-question')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ask New Question
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3 mb-6"
        >
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <Filter className="w-4 h-4" />
            Filter:
          </div>
          {['all', 'pending', 'answered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-xl mb-6 ${
              isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'
            }`}
          >
            {error}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredQuestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-16 rounded-2xl ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}
          >
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <HelpCircle className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {filter === 'all' ? 'No questions yet' : `No ${filter} questions`}
            </h3>
            <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {filter === 'all' 
                ? "You haven't asked any questions yet. Ask your first question about JMI, AMU, or any general query."
                : `You don't have any ${filter} questions.`}
            </p>
            <button
              onClick={() => navigate('/ask-question')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ask Your First Question
            </button>
          </motion.div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredQuestions.map((q, index) => (
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
                } ${q.status === 'answered' ? 'ring-1 ring-green-500/20' : ''}`}
              >
                {/* Question Header */}
                <button
                  onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getCategoryColor(q.category)}`}>
                      {getCategoryIcon(q.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(q.category)}`}>
                          {q.category.toUpperCase()}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatDate(q.createdAt)}
                        </span>
                      </div>
                      <p className={`font-medium line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {q.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(q.status)}
                        <span className={`text-sm font-medium ${getStatusText(q.status).color}`}>
                          {getStatusText(q.status).text}
                        </span>
                      </div>
                      {expandedId === q.id ? (
                        <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Answer */}
                <AnimatePresence>
                  {expandedId === q.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={`px-5 pb-5 pt-0 border-t ${
                        isDark ? 'border-gray-700' : 'border-gray-100'
                      }`}>
                        <div className="pt-4 pl-14">
                          {q.status === 'answered' ? (
                            <div className={`p-4 rounded-xl ${
                              isDark ? 'bg-green-900/20' : 'bg-green-50'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                                <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                  Expert Answer
                                </span>
                                {q.answeredAt && (
                                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {formatDate(q.answeredAt)}
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {q.answer}
                              </p>
                            </div>
                          ) : (
                            <div className={`flex items-center gap-3 p-4 rounded-xl ${
                              isDark ? 'bg-amber-900/20' : 'bg-amber-50'
                            }`}>
                              <Clock className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                              <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                  Waiting for Answer
                                </p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                  Our team is reviewing your question. You will receive an answer within 24-48 hours.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => fetchQuestions(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                isDark 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
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
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuestions;
