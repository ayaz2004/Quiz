const Quizzes = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Available Quizzes
        </h1>
        <div className="flex space-x-4">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option>All Subjects</option>
            <option>Mathematics</option>
            <option>Science</option>
            <option>English</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option>All Years</option>
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((quiz) => (
          <div key={quiz} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                Mathematics
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">2024</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Sample Quiz {quiz}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Test your knowledge with this comprehensive quiz covering various topics.
            </p>
            
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>20 Questions</span>
              <span>Free</span>
            </div>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors duration-200">
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quizzes;
