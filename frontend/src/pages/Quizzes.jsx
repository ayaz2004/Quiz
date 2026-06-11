import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getQuizzes, getMyQuizzes, getSubjects, getYears } from '../utils/quizApi';
import { SearchAndSort, QuizGrid, StatsBar, QuizOverview } from '../components';
import { School, GraduationCap, BookOpen, Building2 } from 'lucide-react';
import usePageSeo from '../hooks/usePageSeo';

const Quizzes = () => {
  const [searchParams] = useSearchParams();
  const universityParam = searchParams.get('university');
  
  // Dynamic SEO based on university filter
  const getSeoTitle = () => {
    if (universityParam === 'JMI') return 'JMI PYQ | Jamia Millia Islamia Previous Year Questions';
    if (universityParam === 'AMU') return 'AMU PYQ | Aligarh Muslim University Previous Year Questions';
    return 'JMI PYQ & AMU PYQ Quizzes | JMI Quiz';
  };
  
  const getSeoDescription = () => {
    if (universityParam === 'JMI') return 'Practice JMI PYQ (Jamia Millia Islamia Previous Year Questions) with subject-wise quizzes and mock tests. Prepare for JMI entrance exams.';
    if (universityParam === 'AMU') return 'Practice AMU PYQ (Aligarh Muslim University Previous Year Questions) with subject-wise quizzes and mock tests. Prepare for AMU entrance exams.';
    return 'Browse subject-wise JMI PYQ and AMU PYQ quizzes, mock tests, and previous year questions.';
  };

  usePageSeo({
    title: getSeoTitle(),
    description: getSeoDescription(),
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(universityParam || 'all'); // all, JMI, AMU
  
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

  // Sync university filter with URL parameter
  useEffect(() => {
    const newUniversity = universityParam || 'all';
    if (newUniversity !== selectedUniversity) {
      setSelectedUniversity(newUniversity);
    }
  }, [universityParam]);

  // Fetch quizzes when filters change
  useEffect(() => {
    fetchQuizzes(1, false);
  }, [selectedEducationLevel, selectedSubject, selectedYear, searchTerm]);

  // When university filter changes alone, ensure we have all data by re-fetching
  useEffect(() => {
    // Only re-fetch if we're not already filtering by education level (which triggers its own fetch)
    if (!selectedEducationLevel && !selectedSubject && !selectedYear && !searchTerm) {
      fetchQuizzes(1, false);
    }
  }, [selectedUniversity]);

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
      
      // If only university filter is selected without other filters, fetch more to ensure we get all
      const isOnlyUniversityFilter = selectedUniversity !== 'all' && 
        !selectedEducationLevel && 
        !selectedSubject && 
        !selectedYear && 
        !searchTerm;
      
      const response = await getQuizzes({
        limit: isOnlyUniversityFilter && page === 1 ? 100 : 18, 
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
  }, [searchTerm, selectedSubject, selectedYear, selectedEducationLevel, selectedUniversity, allQuizzes, myQuizzes]);

  const applyFilters = () => {
    // Safety check: ensure allQuizzes is an array
    if (!Array.isArray(allQuizzes)) {
      setFilteredQuizzes([]);
      return;
    }
    
    let filtered = [...allQuizzes];

    // Filter by university - check title, subject, and description for JMI/AMU keywords
    if (selectedUniversity !== 'all') {
      const universityKeywords = selectedUniversity === 'JMI' 
        ? ['jmi', 'jamia', 'millia', 'islamia']
        : ['amu', 'aligarh', 'muslim', 'university'];
      
      filtered = filtered.filter(q => {
        const textToSearch = `${q.title || ''} ${q.subject || ''} ${q.description || ''}`.toLowerCase();
        return universityKeywords.some(keyword => textToSearch.includes(keyword));
      });
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

    // Filter by education level - only if explicitly selected
    if (selectedEducationLevel && selectedEducationLevel !== '') {
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

      {/* Page Header with University Tabs */}
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
          JMI & AMU PYQ Quizzes
        </h1>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Practice Previous Year Questions for Jamia Millia Islamia and Aligarh Muslim University
        </p>
        
        {/* University Tabs */}
        <div className="flex justify-center mt-6">
          <div className={`inline-flex rounded-2xl p-1.5 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
            {[
              { id: 'all', label: 'All Quizzes', icon: Building2 },
              { id: 'JMI', label: 'JMI PYQ', icon: GraduationCap },
              { id: 'AMU', label: 'AMU PYQ', icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedUniversity(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  selectedUniversity === tab.id
                    ? isDark
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                    : isDark
                      ? 'text-gray-300 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Education Level Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10"
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            { 
              level: 'school', 
              title: 'School Level', 
              icon: School,
              gradient: 'from-blue-500 to-cyan-500',
              bgGradient: isDark ? 'from-blue-900/20 to-cyan-900/20' : 'from-blue-50 to-cyan-50',
              borderColor: isDark ? 'border-blue-500/30' : 'border-blue-200',
              iconBg: 'bg-blue-500'
            },
            { 
              level: 'undergrad', 
              title: 'Undergraduate', 
              icon: GraduationCap,
              gradient: 'from-emerald-500 to-teal-500',
              bgGradient: isDark ? 'from-emerald-900/20 to-teal-900/20' : 'from-emerald-50 to-teal-50',
              borderColor: isDark ? 'border-emerald-500/30' : 'border-emerald-200',
              iconBg: 'bg-emerald-500'
            },
            { 
              level: 'masters', 
              title: 'Masters', 
              icon: BookOpen,
              gradient: 'from-violet-500 to-purple-500',
              bgGradient: isDark ? 'from-violet-900/20 to-purple-900/20' : 'from-violet-50 to-purple-50',
              borderColor: isDark ? 'border-violet-500/30' : 'border-violet-200',
              iconBg: 'bg-violet-500'
            },
          ].map((card) => (
            <motion.button
              key={card.level}
              onClick={() => setSelectedEducationLevel(selectedEducationLevel === card.level ? '' : card.level)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 text-center ${
                selectedEducationLevel === card.level 
                  ? `${isDark ? 'bg-white/10' : 'bg-white'} ring-2 ring-offset-2 ${isDark ? 'ring-emerald-500 ring-offset-gray-900' : 'ring-emerald-500 ring-offset-white'}` 
                  : isDark ? `bg-gradient-to-br ${card.bgGradient} hover:bg-white/5` : `bg-gradient-to-br ${card.bgGradient} hover:shadow-lg`
              } ${card.borderColor}`}
            >
              <div className="flex flex-col items-center justify-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.iconBg} text-white shadow-lg mb-3`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className={`text-xs sm:text-sm md:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {card.title}
                </h3>
                {selectedEducationLevel === card.level && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
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
        {(searchTerm || selectedSubject || selectedYear || selectedEducationLevel || selectedUniversity !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSubject('');
              setSelectedYear('');
              setSelectedEducationLevel('');
              setSelectedUniversity('all');
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

      {/* Empty State for University Filter */}
      {!loading && filteredQuizzes.length === 0 && selectedUniversity !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 backdrop-blur-xl border rounded-3xl p-8 shadow-xl text-center"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.98)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.4)',
          }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No {selectedUniversity} Quizzes Found
          </h3>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            We couldn't find any quizzes tagged with {selectedUniversity}. Try browsing all quizzes or switch to a different filter.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSelectedUniversity('all')}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:scale-105 transition-transform shadow-lg"
            >
              Show All Quizzes
            </button>
          </div>
        </motion.div>
      )}

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
