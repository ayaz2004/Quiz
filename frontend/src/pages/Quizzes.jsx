import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getQuizzes, getMyQuizzes, getSubjects, getYears } from '../utils/quizApi';
import { FilterBar, SearchAndSort, QuizGrid, StatsBar, QuizOverview } from '../components';
import usePageSeo from '../hooks/usePageSeo';

const Quizzes = () => {
  usePageSeo({
    title: 'JMI PYQ & AMU PYQ Quizzes | JMI Quiz',
    description: 'Browse subject-wise JMI PYQ and AMU PYQ quizzes, mock tests, and previous year questions.',
    path: '/quizzes',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Quizzes', path: '/quizzes' },
    ],
  });

  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [quizStats, setQuizStats] = useState({ total: 0, free: 0, paid: 0 });
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState('');
  
  // Modal states
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showOverview, setShowOverview] = useState(false);
  
  // Unique subjects and years
  const [subjects, setSubjects] = useState([]);
  const [years, setYears] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Error state
  const [error, setError] = useState(null);

  // Interactive particle canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 8 + 4;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.shape = Math.floor(Math.random() * 5); // circle, square, triangle, diamond, hexagon
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = isDark 
          ? `rgba(59, 130, 246, ${this.opacity})` 
          : `rgba(16, 185, 129, ${this.opacity})`;
        
        ctx.beginPath();
        
        switch(this.shape) {
          case 0: // Circle
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            break;
          
          case 1: // Square
            ctx.rect(-this.size, -this.size, this.size * 2, this.size * 2);
            break;
          
          case 2: // Triangle
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, this.size);
            ctx.lineTo(-this.size, this.size);
            ctx.closePath();
            break;
          
          case 3: // Diamond
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, 0);
            ctx.lineTo(0, this.size);
            ctx.lineTo(-this.size, 0);
            ctx.closePath();
            break;
          
          case 4: // Hexagon
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const x = this.size * Math.cos(angle);
              const y = this.size * Math.sin(angle);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
        }
        
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < 60; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  // Fetch quizzes when filters change
  useEffect(() => {
    fetchQuizzes(1, false);
  }, [selectedEducationLevel, selectedSubject, selectedYear, searchTerm]);

  // Fetch my quizzes when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyQuizzes();
    } else {
      setMyQuizzes([]);
    }
  }, [isAuthenticated]);

  // Fetch all unique subjects and years
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [subjectsRes, yearsRes] = await Promise.all([
          getSubjects(),
          getYears()
        ]);
        
        if (subjectsRes.data?.subjects) {
          setSubjects(subjectsRes.data.subjects);
        }
        if (yearsRes.data?.years) {
          setYears(yearsRes.data.years.sort((a, b) => b - a));
        }
      } catch (err) {
        console.error('Error fetching filter data:', err);
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const fetchQuizzes = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await getQuizzes({
        limit: 18, 
        page,
        educationLevel: selectedEducationLevel || undefined,
        subject: selectedSubject || undefined,
        year: selectedYear || undefined,
        search: searchTerm || undefined
      });
      // Backend returns: { success: true, data: { quizzes: [...], pagination: {...}, stats: {...} } }
      const quizzes = response.data?.quizzes || [];
      const pagination = response.data?.pagination || {};
      const stats = response.data?.stats || { total: 0, free: 0, paid: 0 };
      
      if (append) {
        setAllQuizzes(prev => [...prev, ...quizzes]);
      } else {
        setAllQuizzes(quizzes);
        setQuizStats(stats); // Update stats only on initial load or refresh
      }
      
      setTotalQuizzes(pagination.totalQuizzes || 0);
      setHasMore(pagination.currentPage < pagination.totalPages);
      setCurrentPage(pagination.currentPage || 1);
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
      
      if (!append) {
        setAllQuizzes([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreQuizzes = () => {
    if (!loadingMore && hasMore) {
      fetchQuizzes(currentPage + 1, true);
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
  }, [activeFilter, searchTerm, selectedSubject, selectedYear, selectedEducationLevel, allQuizzes, myQuizzes]);

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
      filtered = filtered.filter(q => String(q.examYear) === String(selectedYear));
    }

    // Filter by education level
    if (selectedEducationLevel) {
      filtered = filtered.filter(q => q.educationLevel === selectedEducationLevel);
    }

    setFilteredQuizzes(filtered);
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowOverview(true);
  };

  // Calculate stats with safety checks
  const stats = {
    total: quizStats.total,
    free: quizStats.free,
    paid: quizStats.paid,
    purchased: Array.isArray(myQuizzes) ? myQuizzes.length : 0,
  };

  return (
    <div className="relative space-y-6 pb-12">
      {/* Particle Canvas Background */}
      <canvas 
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.3 }}
      />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center backdrop-blur-xl rounded-3xl p-8 lg:p-12 border shadow-xl"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.95) 100%)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.2)',
          boxShadow: isDark ? 'none' : '0 20px 60px rgba(16, 185, 129, 0.15)',
        }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
          Explore Quizzes
        </h1>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Test your knowledge with our comprehensive quiz collection designed for AMU & JMI
        </p>
      </motion.div>

      {/* Stats Bar */}
      <div className="relative z-10">
        <StatsBar
          totalQuizzes={stats.total}
          freeCount={stats.free}
          paidCount={stats.paid}
          purchasedCount={stats.purchased}
        />
      </div>

      {/* Filter Bar */}
      <div className="relative z-10">
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* Search and Sort */}
      <div className="relative z-10">
        <SearchAndSort
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedEducationLevel={selectedEducationLevel}
          onEducationLevelChange={setSelectedEducationLevel}
          subjects={subjects}
          years={years}
          filtersLoading={filtersLoading}
        />
      </div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex items-center justify-between backdrop-blur-xl rounded-xl p-4 border shadow-lg"
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.4)',
        }}
      >
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{filteredQuizzes.length}</span> quiz{filteredQuizzes.length !== 1 ? 'zes' : ''}
        </p>
        {(searchTerm || selectedSubject || selectedYear || selectedEducationLevel || activeFilter !== 'all') && (
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearchTerm('');
              setSelectedSubject('');
              setSelectedYear('');
              setSelectedEducationLevel('');
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
          className="relative z-10 backdrop-blur-xl border rounded-3xl p-8 shadow-xl"
          style={{
            background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 242, 242, 0.98)',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)',
            boxShadow: isDark ? 'none' : '0 10px 40px rgba(239, 68, 68, 0.15)',
          }}
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
      <div className="relative z-10">
        <QuizGrid
          quizzes={filteredQuizzes}
          loading={loading}
          onQuizClick={handleQuizClick}
          purchasedQuizIds={myQuizzes.map(q => q.id)}
        />
      </div>

      {/* Load More Button */}
      {!loading && hasMore && filteredQuizzes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex flex-col items-center gap-4 py-8 backdrop-blur-xl rounded-3xl border shadow-lg"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.4)',
          }}
        >
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing <span className="font-bold">{allQuizzes.length}</span> of <span className="font-bold">{totalQuizzes}</span> quizzes
          </p>
          <button
            onClick={loadMoreQuizzes}
            disabled={loadingMore}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Load More Quizzes'
            )}
          </button>
        </motion.div>
      )}

      {/* Modals */}
      {showOverview && selectedQuiz && (
        <QuizOverview
          quiz={selectedQuiz}
          isOpen={showOverview}
          onClose={() => setShowOverview(false)}
        />
      )}
    </div>
  );
};

export default Quizzes;
