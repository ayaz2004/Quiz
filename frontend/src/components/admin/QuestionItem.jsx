import { memo } from 'react';

const QuestionItem = memo(({ 
  question, 
  index, 
  onQuestionChange, 
  onImageUpload, 
  onRemove 
}) => {
  return (
    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          Question {index + 1}
        </h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
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
            onChange={(e) => onQuestionChange(index, 'questionText', e.target.value)}
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
                onChange={(e) => onQuestionChange(index, `option${optNum}`, e.target.value)}
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
              onChange={(e) => onQuestionChange(index, 'isCorrect', parseInt(e.target.value))}
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
              onChange={(e) => onImageUpload(index, e.target.files[0])}
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
            onChange={(e) => onQuestionChange(index, 'explanation', e.target.value)}
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            placeholder="Explain why this answer is correct"
          />
        </div>
      </div>
    </div>
  );
});

QuestionItem.displayName = 'QuestionItem';

export default QuestionItem;
