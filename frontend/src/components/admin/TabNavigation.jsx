const TabNavigation = ({ activeTab, setActiveTab, setCurrentPage }) => {
  const tabs = [
    { id: 'quizzes', label: 'Add/Edit Quiz' },
    { id: 'viewQuizzes', label: 'View All Quizzes' },
    { id: 'users', label: 'Manage Users' }
  ];

  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== 'quizzes') {
                setCurrentPage(1);
              }
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;
