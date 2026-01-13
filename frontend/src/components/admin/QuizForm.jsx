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
      createdBy: 1,
      isActive: true,
      isPaid: false,
      price: 0,
      questions: []
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {editingQuizId ? 'Edit Quiz' : 'Add New Quiz'}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
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
              onClick={onAddQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + Add Question
            </button>
          </div>

          {quizForm.questions.map((question, index) => (
            <QuestionItem
              key={index}
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
  );
};

export default QuizForm;
