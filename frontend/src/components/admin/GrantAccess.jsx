import { useState, useEffect } from 'react';
import { grantQuizAccess, getAllUsers, getAllQuizzes } from '../../utils/adminApi';
import PropTypes from 'prop-types';

const GrantAccess = ({ onSuccess, onError }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [searchQuiz, setSearchQuiz] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [usersRes, quizzesRes] = await Promise.all([
        getAllUsers(1, 100), // Get more users for selection
        getAllQuizzes(1, 100) // Get more quizzes for selection
      ]);
      setUsers(usersRes.data.users);
      setQuizzes(quizzesRes.data.quizzes);
    } catch (error) {
      onError(error.message || 'Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUserId || !selectedQuizId) {
      onError('Please select both a user and a quiz');
      return;
    }

    try {
      setLoading(true);
      await grantQuizAccess(parseInt(selectedUserId), parseInt(selectedQuizId));
      onSuccess('Quiz access granted successfully!');
      setSelectedUserId('');
      setSelectedQuizId('');
      setSearchUser('');
      setSearchQuiz('');
    } catch (error) {
      onError(error.response?.data?.message || error.message || 'Failed to grant access');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchQuiz.toLowerCase()) ||
    quiz.subject.toLowerCase().includes(searchQuiz.toLowerCase())
  );

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Grant Quiz Access
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manually grant access to paid quizzes for specific users
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select User
          </label>
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Select a user --</option>
            {filteredUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} (ID: {user.id})
              </option>
            ))}
          </select>
          {filteredUsers.length === 0 && searchUser && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No users found matching &quot;{searchUser}&quot;</p>
          )}
        </div>

        {/* Quiz Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Quiz
          </label>
          <input
            type="text"
            placeholder="Search quizzes by title or subject..."
            value={searchQuiz}
            onChange={(e) => setSearchQuiz(e.target.value)}
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Select a quiz --</option>
            {filteredQuizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title} - {quiz.subject} ({quiz.examYear}) {quiz.isPaid ? '💰' : '🆓'}
              </option>
            ))}
          </select>
          {filteredQuizzes.length === 0 && searchQuiz && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No quizzes found matching &quot;{searchQuiz}&quot;</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !selectedUserId || !selectedQuizId}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Granting Access...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Grant Access
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">Note:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>This will grant the user immediate access to the quiz without payment</li>
              <li>Free quizzes are already accessible to all users</li>
              <li>The access will be recorded as a purchase with $0 amount</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

GrantAccess.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default GrantAccess;
