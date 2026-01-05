const Attempts = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        My Quiz Attempts
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</p>
            <p className="text-gray-600 dark:text-gray-400">Total Attempts</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">75%</p>
            <p className="text-gray-600 dark:text-gray-400">Average Score</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">95%</p>
            <p className="text-gray-600 dark:text-gray-400">Best Score</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((attempt) => (
          <div key={attempt} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  Mathematics Quiz {attempt}
                </h3>
                <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Score: 85%</span>
                  <span>Correct: 17/20</span>
                  <span>Time: 15 mins</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  2 days ago
                </span>
                <button className="block mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attempts;
