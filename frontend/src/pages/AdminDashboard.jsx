import { useState, useEffect } from 'react';
import { addQuiz, updateQuiz, getAllUsers, deleteUser } from '../utils/adminApi';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('quizzes');
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    subject: '',
    examYear: new Date().getFullYear(),
    createdBy: 1, // Adjust based on logged-in admin
    isActive: true,
    isPaid: false,
    price: 0,
    questions: []
  });

  const [editingQuizId, setEditingQuizId] = useState(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, currentPage]);

  const fetchUsers = async () => {
  try {
    setLoading(true);

    const response = await getAllUsers(currentPage, 10);

    setUsers(response.data.users);
    setTotalPages(response.data.pagination.totalPages);

  } catch (error) {
    showMessage('error', error.message);
  } finally {
    setLoading(false);
  }
};


  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAddQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        {
          questionText: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          isCorrect: 1,
          explanation: '',
          imageUrl: null,
          imageFile: null
        }
      ]
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[index][field] = value;
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const handleImageUpload = (index, file) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[index].imageFile = file;
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = quizForm.questions.filter((_, i) => i !== index);
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    
    if (quizForm.questions.length === 0) {
      showMessage('error', 'Please add at least one question');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Add quiz data as JSON
      const quizData = {
        ...quizForm,
        questions: quizForm.questions.map(q => ({
          questionText: q.questionText,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          isCorrect: q.isCorrect,
          explanation: q.explanation,
          imageUrl: q.imageUrl
        }))
      };
      
      formData.append('quizData', JSON.stringify(quizData));
      
      // Add image files
      quizForm.questions.forEach((q, index) => {
        if (q.imageFile) {
          formData.append(`image_${index}`, q.imageFile);
        }
      });

      if (editingQuizId) {
        await updateQuiz(editingQuizId, formData);
        showMessage('success', 'Quiz updated successfully!');
      } else {
        await addQuiz(formData);
        showMessage('success', 'Quiz added successfully!');
      }
      
      // Reset form
      setQuizForm({
        title: '',
        description: '',
        subject: '',
        examYear: new Date().getFullYear(),
        createdBy: 1,
        isActive: true,
        isPaid: false,
        price: 0,
        questions: []
      });
      setEditingQuizId(null);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteUser(userId);
      showMessage('success', 'User deleted successfully!');
      fetchUsers();
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage quizzes and users
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quizzes'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
            >
              Manage Quizzes
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
            >
              Manage Users
            </button>
          </nav>
        </div>

        {/* Quiz Management Tab */}
        {activeTab === 'quizzes' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingQuizId ? 'Edit Quiz' : 'Add New Quiz'}
            </h2>
            
            <form onSubmit={handleSubmitQuiz} className="space-y-6">
              {/* Quiz Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={quizForm.subject}
                    onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Mathematics, Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={quizForm.examYear}
                    onChange={(e) => setQuizForm({ ...quizForm, examYear: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (if paid)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quizForm.price}
                    onChange={(e) => setQuizForm({ ...quizForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter quiz description"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={quizForm.isActive}
                    onChange={(e) => setQuizForm({ ...quizForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={quizForm.isPaid}
                    onChange={(e) => setQuizForm({ ...quizForm, isPaid: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Paid Quiz</span>
                </label>
              </div>

              {/* Questions Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Questions ({quizForm.questions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    + Add Question
                  </button>
                </div>

                {quizForm.questions.map((question, index) => (
                  <div key={index} className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Question {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          required
                          value={question.questionText}
                          onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                          rows="2"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="Enter question text"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((optNum) => (
                          <div key={optNum}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Option {optNum} *
                            </label>
                            <input
                              type="text"
                              required
                              value={question[`option${optNum}`]}
                              onChange={(e) => handleQuestionChange(index, `option${optNum}`, e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                              placeholder={`Enter option ${optNum}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Correct Answer *
                          </label>
                          <select
                            required
                            value={question.isCorrect}
                            onChange={(e) => handleQuestionChange(index, 'isCorrect', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          >
                            <option value={1}>Option 1</option>
                            <option value={2}>Option 2</option>
                            <option value={3}>Option 3</option>
                            <option value={4}>Option 4</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Image (optional)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(index, e.target.files[0])}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                          {question.imageFile && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {question.imageFile.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Explanation (optional)
                        </label>
                        <textarea
                          value={question.explanation}
                          onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                          rows="2"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="Explain why this answer is correct"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                {editingQuizId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuizId(null);
                      setQuizForm({
                        title: '',
                        description: '',
                        subject: '',
                        examYear: new Date().getFullYear(),
                        createdBy: 1,
                        isActive: true,
                        isPaid: false,
                        price: 0,
                        questions: []
                      });
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingQuizId ? 'Update Quiz' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              User Management
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email Verified
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user,idx) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {idx}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isEmailVerified
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
