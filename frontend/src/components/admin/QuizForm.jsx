import QuestionItem from './QuestionItem';

const QuizForm = ({ 
  quizForm, 
  setQuizForm, 
  editingQuizId, 
  setEditingQuizId,
  loading,
  onSubmit,
  onAddQuestion,
  onQuestionChange,
  onImageUpload,
  onRemoveQuestion
}) => {
  const handleCancel = () => {
    setEditingQuizId(null);
    setQuizForm({
      title: '',
      description: '',
      subject: '',
      examYear: new Date().getFullYear(),
      educationLevel: '',
      createdBy: 1,
      isActive: true,
      isPaid: false,
      price: 0,
      timeLimit: null,
      questions: []
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {editingQuizId ? 'Edit Quiz' : 'Add New Quiz'}
      </h2>
      
      {editingQuizId && !quizForm.isActive && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              This quiz is currently <strong>hidden</strong> from users. Use the visibility toggle in "View All Quizzes" to show it.
            </p>
          </div>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Quiz Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              required
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Education Level
            </label>
            <select
              value={quizForm.educationLevel}
              onChange={(e) => setQuizForm({ ...quizForm, educationLevel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Level (Default: Undergraduate)</option>
              <option value="school">School Level</option>
              <option value="undergrad">Undergraduate</option>
              <option value="masters">Masters</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Leave empty to use default (Undergraduate)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price (if paid)
            </label>
            <input
              type="number"
              min="0"
              value={quizForm.price}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setQuizForm({ 
                  ...quizForm, 
                  price: value,
                  isPaid: value > 0 ? true : quizForm.isPaid
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter price (e.g., 99, 149) or 0 for free"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter price greater than 0 to make this a paid quiz. Set to 0 for free quiz.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={quizForm.timeLimit || ''}
              onChange={(e) => setQuizForm({ ...quizForm, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Leave empty for no limit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Negative Marks (per wrong answer)
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              value={quizForm.negativeMarks || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : null;
                setQuizForm({ 
                  ...quizForm, 
                  negativeMarks: value,
                  hasNegativeMarking: value && value > 0 ? true : quizForm.hasNegativeMarking
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., 0.25, 0.5, 1 (Leave empty for no negative marking)"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter value to enable negative marking. Leave empty for no negative marking.
            </p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter quiz description"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={quizForm.isActive}
              onChange={(e) => setQuizForm({ ...quizForm, isActive: e.target.checked })}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={quizForm.isPaid}
              onChange={(e) => setQuizForm({ ...quizForm, isPaid: e.target.checked, price: e.target.checked ? quizForm.price : 0 })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Paid Quiz {quizForm.price > 0 && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  (₹{quizForm.price})
                </span>
              )}
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={quizForm.hasNegativeMarking}
              onChange={(e) => setQuizForm({ ...quizForm, hasNegativeMarking: e.target.checked, negativeMarks: e.target.checked ? quizForm.negativeMarks : null })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Negative Marking {quizForm.negativeMarks && quizForm.negativeMarks > 0 && (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  (-{quizForm.negativeMarks} per wrong)
                </span>
              )}
            </span>
          </label>
        </div>

        {/* Questions Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Questions ({quizForm.questions.length})
            </h3>
            <button
              type="button"
              onClick={onAddQuestion}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-colors shadow-sm"
            >
              + Add Question
            </button>
          </div>

          {quizForm.questions.map((question, index) => (
            <QuestionItem
              key={question.id || index}
              question={question}
              index={index}
              onQuestionChange={onQuestionChange}
              onImageUpload={onImageUpload}
              onRemove={onRemoveQuestion}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {editingQuizId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : editingQuizId ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
