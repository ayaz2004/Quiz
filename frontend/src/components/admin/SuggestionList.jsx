import { useState, useEffect } from 'react';
import { getAllSuggestions, updateSuggestionStatus, deleteSuggestion } from '../../utils/adminApi';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';
import { MessageSquare, User, Calendar, CheckCircle, Clock, XCircle, Trash2, Eye } from 'lucide-react';

const SuggestionList = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSuggestions();
  }, [currentPage, statusFilter]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await getAllSuggestions(currentPage, 10, statusFilter);
      setSuggestions(response.data.suggestions || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setInitialLoad(false);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      showMessage('error', 'Failed to load suggestions');
      setSuggestions([]);
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleStatusUpdate = async (suggestionId, newStatus) => {
    try {
      await updateSuggestionStatus(suggestionId, newStatus);
      showMessage('success', 'Suggestion status updated successfully');
      fetchSuggestions();
    } catch (error) {
      console.error('Error updating suggestion status:', error);
      showMessage('error', 'Failed to update suggestion status');
    }
  };

  const handleDelete = async (suggestionId) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) {
      return;
    }

    try {
      await deleteSuggestion(suggestionId);
      showMessage('success', 'Suggestion deleted successfully');
      fetchSuggestions();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      showMessage('error', 'Failed to delete suggestion');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
      resolved: 'bg-green-100 text-green-800 border-green-300'
    };

    const icons = {
      pending: Clock,
      reviewed: Eye,
      resolved: CheckCircle
    };

    const Icon = icons[status] || Clock;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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

  if (initialLoad && loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-7 h-7" />
          User Suggestions
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

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'reviewed', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No suggestions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {suggestion.quiz.title}
                    </h3>
                    {getStatusBadge(suggestion.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {suggestion.user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(suggestion.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quiz Info */}
              <div className="mb-3 text-sm">
                <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {suggestion.quiz.subject}
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Year: {suggestion.quiz.examYear}
                </span>
              </div>

              {/* Suggestion Text */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                  {expandedSuggestion === suggestion.id || suggestion.suggestionText.length < 200
                    ? suggestion.suggestionText
                    : `${suggestion.suggestionText.substring(0, 200)}...`}
                </p>
                {suggestion.suggestionText.length > 200 && (
                  <button
                    onClick={() => setExpandedSuggestion(
                      expandedSuggestion === suggestion.id ? null : suggestion.id
                    )}
                    className="text-blue-600 dark:text-blue-400 text-sm mt-2 hover:underline"
                  >
                    {expandedSuggestion === suggestion.id ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {suggestion.status !== 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(suggestion.id, 'pending')}
                    className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Clock className="w-4 h-4" />
                    Mark Pending
                  </button>
                )}
                {suggestion.status !== 'reviewed' && (
                  <button
                    onClick={() => handleStatusUpdate(suggestion.id, 'reviewed')}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Mark Reviewed
                  </button>
                )}
                {suggestion.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusUpdate(suggestion.id, 'resolved')}
                    className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => handleDelete(suggestion.id)}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
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

export default SuggestionList;
