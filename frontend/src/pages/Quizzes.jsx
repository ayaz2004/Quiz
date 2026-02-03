import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getQuizzes, getMyQuizzes } from '../utils/quizApi';
import { FilterBar, SearchAndSort, QuizGrid, StatsBar, QuizOverview, PurchaseModal } from '../components';

const Quizzes = () => {
  const { isAuthenticated } = useAuth();
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  // Modal states
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showOverview, setShowOverview] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  // Unique subjects and years
  const [subjects, setSubjects] = useState([]);
  const [years, setYears] = useState([]);
  
  // Error state
  const [error, setError] = useState(null);

  // Fetch quizzes on mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Fetch my quizzes when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyQuizzes();
    } else {
      setMyQuizzes([]);
    }
  }, [isAuthenticated]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getQuizzes();
      // Backend returns: { success: true, data: { quizzes: [...], pagination: {...} } }
      const quizzes = response.data?.quizzes || [];
      setAllQuizzes(quizzes);
      setFilteredQuizzes(quizzes);
      
      // Extract unique subjects and years
      const uniqueSubjects = [...new Set(quizzes.map(q => q.subject))].filter(Boolean);
      const uniqueYears = [...new Set(quizzes.map(q => q.examYear))].filter(Boolean).sort((a, b) => b - a);
      setSubjects(uniqueSubjects);
      setYears(uniqueYears);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      
      // Set user-friendly error message
      if (error.code === 'ECONNABORTED') {
        setError('The server is taking longer than usual to respond. This may be due to the free hosting service waking up. Please wait a moment and try again.');
      } else if (error.message?.includes('Network Error')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('Failed to load quizzes. Please try again later.');
      }
      
      setAllQuizzes([]);
      setFilteredQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyQuizzes = async () => {
    try {
      const response = await getMyQuizzes();
      // API returns { success: true, data: { quizzes: [...], total: n } }
      const quizzes = response.data?.quizzes || [];
      setMyQuizzes(quizzes);
    } catch (error) {
      console.error('Error fetching my quizzes:', error);
      setMyQuizzes([]);
    }
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [activeFilter, searchTerm, selectedSubject, selectedYear, allQuizzes, myQuizzes]);

  const applyFilters = () => {
    // Safety check: ensure allQuizzes is an array
    if (!Array.isArray(allQuizzes)) {
      setFilteredQuizzes([]);
      return;
    }
    
    let filtered = [...allQuizzes];

    // Filter by type (all/free/paid/purchased)
    if (activeFilter === 'free') {
      filtered = filtered.filter(q => !q.isPaid);
    } else if (activeFilter === 'paid') {
      filtered = filtered.filter(q => q.isPaid);
    } else if (activeFilter === 'purchased') {
      const purchasedIds = myQuizzes.map(q => q.id);
      filtered = filtered.filter(q => purchasedIds.includes(q.id));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter(q => q.subject === selectedSubject);
    }

    // Filter by year
    if (selectedYear) {
      filtered = filtered.filter(q => q.examYear === parseInt(selectedYear));
    }

    setFilteredQuizzes(filtered);
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowOverview(true);
  };

  const handlePurchaseClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    fetchMyQuizzes();
    fetchQuizzes();
  };

  // Calculate stats with safety checks
  const stats = {
    total: Array.isArray(allQuizzes) ? allQuizzes.length : 0,
    free: Array.isArray(allQuizzes) ? allQuizzes.filter(q => !q.isPaid).length : 0,
    paid: Array.isArray(allQuizzes) ? allQuizzes.filter(q => q.isPaid).length : 0,
    purchased: Array.isArray(myQuizzes) ? myQuizzes.length : 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
          Explore Quizzes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your knowledge with our comprehensive quiz collection
        </p>
      </motion.div>

      {/* Stats Bar */}
      <StatsBar
        totalQuizzes={stats.total}
        freeCount={stats.free}
        paidCount={stats.paid}
        purchasedCount={stats.purchased}
      />

      {/* Filter Bar */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Search and Sort */}
      <SearchAndSort
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        subjects={subjects}
        years={years}
      />

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-800 dark:text-gray-200">{filteredQuizzes.length}</span> quiz{filteredQuizzes.length !== 1 ? 'zes' : ''}
        </p>
        {(searchTerm || selectedSubject || selectedYear || activeFilter !== 'all') && (
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearchTerm('');
              setSelectedSubject('');
              setSelectedYear('');
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </motion.div>

      {/* Error Message */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-red-800 dark:text-red-200 font-semibold mb-1">Failed to Load Quizzes</h3>
              <p className="text-red-700 dark:text-red-300 text-sm mb-3">{error}</p>
              <button
                onClick={() => fetchQuizzes()}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quiz Grid */}
      <QuizGrid
        quizzes={filteredQuizzes}
        loading={loading}
        onQuizClick={handleQuizClick}
      />

      {/* Modals */}
      {showOverview && selectedQuiz && (
        <QuizOverview
          quiz={selectedQuiz}
          isOpen={showOverview}
          onClose={() => setShowOverview(false)}
          onPurchase={() => {
            setShowOverview(false);
            handlePurchaseClick(selectedQuiz);
          }}
        />
      )}

      {showPurchaseModal && selectedQuiz && (
        <PurchaseModal
          quiz={selectedQuiz}
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default Quizzes;
