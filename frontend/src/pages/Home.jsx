import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getQuizzes } from '../utils/quizApi';
import { 
  Users, BookOpen, Award, TrendingUp, Clock, Target, 
  CheckCircle2, Zap, Brain, GraduationCap, Trophy, Rocket, Timer 
} from 'lucide-react';
import QuizCard from '../components/quiz-browser/QuizCard';
import QuizOverview from '../components/modals/QuizOverview';
import PurchaseModal from '../components/modals/PurchaseModal';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const heroRef = useRef(null);
  const [schoolQuizzes, setSchoolQuizzes] = useState([]);
  const [undergradQuizzes, setUndergradQuizzes] = useState([]);
  const [mastersQuizzes, setMastersQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showOverview, setShowOverview] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseQuiz, setPurchaseQuiz] = useState(null);
  const [error, setError] = useState(null);

  // GSAP Animation for Hero Background
  useEffect(() => {
    if (!heroRef.current) return;

    // Get all animated elements
    const blobs = heroRef.current.querySelectorAll('[data-blob]');
    const particles = heroRef.current.querySelectorAll('[data-particle]');

    // Create timeline for blob animations
    const timeline = gsap.timeline({ repeat: -1 });

    blobs.forEach((blob, index) => {
      timeline.to(
        blob,
        {
          duration: 4 + index,
          x: Math.sin(index) * 100,
          y: Math.cos(index) * 100,
          rotation: 360,
          opacity: 0.3,
          ease: 'sine.inOut',
        },
        0
      );
    });

    // Animate particles with stagger
    gsap.to(particles, {
      duration: 1.5,
      y: -20,
      opacity: 0.8,
      stagger: {
        each: 0.05,
        repeat: -1,
        yoyo: true,
      },
      ease: 'power1.inOut',
    });

    return () => {
      timeline.kill();
    };
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getQuizzes({ limit: 30 });
      
      if (response.success) {
        const quizzes = response.data.quizzes;
        
        // Separate quizzes by education level
        const school = quizzes.filter(q => q.educationLevel === 'school');
        const undergrad = quizzes.filter(q => q.educationLevel === 'undergrad');
        const masters = quizzes.filter(q => q.educationLevel === 'masters');
        
        setSchoolQuizzes(school.slice(0, 6)); // Show first 6
        setUndergradQuizzes(undergrad.slice(0, 6)); // Show first 6
        setMastersQuizzes(masters.slice(0, 6)); // Show first 6
      }
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
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowOverview(true);
  };

  const handlePurchaseClick = (quiz) => {
    setPurchaseQuiz(quiz);
    setShowOverview(false);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    // Refresh quiz data
    fetchQuizzes();
    // Show success message
    alert('Purchase successful! You can now access this quiz.');
  };

  return (
    <div className="space-y-12">
      {/* Hero Section -  */}
      <motion.section 
        ref={heroRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-16 lg:p-20 text-gray-900 shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-between border border-white/40"
      >
        {/* OLD CODE - Previous Framer Motion version:
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ x: [0, 30, 0], y: [0, 20, 0] }} ... />
          <motion.div animate={{ x: [0, -30, 0], y: [0, -20, 0] }} ... />
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }} ... />
        </div>
        */}

        {/* NEW CODE - GSAP Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle Academic Pattern Background */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="academicPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                {/* Diagonal lines */}
                <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
                <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
                
                {/* Small circles at corners */}
                <circle cx="0" cy="0" r="2" fill="rgba(59, 130, 246, 0.12)" />
                <circle cx="100" cy="100" r="2" fill="rgba(59, 130, 246, 0.12)" />
                
                {/* Subtle grid */}
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(139, 92, 246, 0.05)" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(139, 92, 246, 0.05)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#academicPattern)" />
          </svg>

          {/* Animated Blobs with GSAP */}
          <div
            data-blob
            className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-20"
          ></div>
          <div
            data-blob
            className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-15"
          ></div>
          <div
            data-blob
            className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-15"
          ></div>

          {/* Animated Particles with GSAP */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              data-particle
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-0"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            ></div>
          ))}
        </div>
        
        <div className="relative z-10">
          {/* Badge/Tag */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 bg-emerald-100/60 backdrop-blur-md text-emerald-700 text-sm font-semibold rounded-full border border-emerald-300/50 hover:bg-emerald-100/80 transition-all">
              🎓 AMU & JMI Entrance Preparation
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700">
              Ace Your Dream
            </span>
            <br />
            <span className="text-gray-800">AMU & JMI Entrance</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl max-w-3xl text-gray-600 font-medium leading-relaxed mb-10"
          >
            Your complete preparation platform for Aligarh Muslim University (AMU) and Jamia Millia Islamia (JMI) entrance exams. 
            Practice with subject-wise quizzes, mock tests, and compete with thousands of aspirants nationwide.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              to={isAuthenticated ? "/quizzes" : "/signup"}
              className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
            >
              {isAuthenticated ? "Browse All Quizzes" : "Start Preparing Now"}
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.span>
            </Link>
            
            <Link 
              to="/about"
              className="group inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-emerald-300"
            >
              Learn More
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 flex justify-center mt-12"
        >
          <div className="text-gray-600 text-sm font-medium flex flex-col items-center gap-2">
            <span>Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </motion.section>

      {/* Loading State */}
      {loading && (
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <svg className="w-16 h-16 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Failed to Load Quizzes</h3>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              </div>
              <button
                onClick={() => fetchQuizzes()}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* School Level Quizzes Section */}
      {schoolQuizzes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg">
                <BookOpen className="w-6 h-6" />
              </span>
              School Quizzes
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Practice tests for school students preparing for entrance exams
            </p>
          </motion.div>
          
          <Link 
            to="/quizzes"
            className="flex items-center gap-1 sm:gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">View All</span>
            <span className="sm:hidden">View All</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schoolQuizzes.slice(0, 3).map((quiz, index) => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              onClick={handleQuizClick}
              index={index}
            />
          ))}
        </div>
        </section>
      )}

      {/* Undergraduate Level Quizzes Section */}
      {undergradQuizzes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-lg">
                  <GraduationCap className="w-6 h-6" />
                </span>
                Undergraduate Quizzes
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                UG entrance preparation for AMU & JMI admissions
              </p>
            </motion.div>
            
            <Link 
              to="/quizzes?level=undergrad"
              className="flex items-center gap-1 sm:gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap"
            >
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">View All</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {undergradQuizzes.slice(0, 3).map((quiz, index) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onClick={handleQuizClick}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Masters Level Quizzes Section */}
      {mastersQuizzes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg">
                  <Trophy className="w-6 h-6" />
                </span>
                Masters Quizzes
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                PG entrance preparation for advanced programs
              </p>
            </motion.div>
            
            <Link 
              to="/quizzes"
              className="flex items-center gap-1 sm:gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap"
            >
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">View All</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mastersQuizzes.slice(0, 3).map((quiz, index) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onClick={handleQuizClick}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* What We Offer Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`rounded-3xl p-8 md:p-10 ${
          isDark 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
        } shadow-xl`}
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Rocket className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </motion.div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            What We Offer
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Features designed for AMU & JMI entrance exam preparation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl ${
            isDark ? 'bg-gray-700/50' : 'bg-blue-50'
          } border ${isDark ? 'border-gray-600' : 'border-blue-100'}`}>
            <Clock className={`w-8 h-8 mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Timed Mock Tests
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Practice with real exam conditions using timed quizzes that simulate actual entrance tests
            </p>
          </div>

          <div className={`p-6 rounded-2xl ${
            isDark ? 'bg-gray-700/50' : 'bg-purple-50'
          } border ${isDark ? 'border-gray-600' : 'border-purple-100'}`}>
            <TrendingUp className={`w-8 h-8 mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Performance Analytics
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your progress with detailed statistics, accuracy rates, and performance insights
            </p>
          </div>

          <div className={`p-6 rounded-2xl ${
            isDark ? 'bg-gray-700/50' : 'bg-orange-50'
          } border ${isDark ? 'border-gray-600' : 'border-orange-100'}`}>
            <BookOpen className={`w-8 h-8 mb-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Subject-wise Quizzes
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Comprehensive coverage of Physics, Chemistry, Mathematics, Biology, English & GK
            </p>
          </div>

          <div className={`p-6 rounded-2xl ${
            isDark ? 'bg-gray-700/50' : 'bg-emerald-50'
          } border ${isDark ? 'border-gray-600' : 'border-emerald-100'}`}>
            <CheckCircle2 className={`w-8 h-8 mb-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Free Practice Tests
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Access all quizzes completely free with detailed performance breakdown
            </p>
          </div>

          <div className={`p-6 rounded-2xl ${
            isDark ? 'bg-gray-700/50' : 'bg-red-50'
          } border ${isDark ? 'border-gray-600' : 'border-red-100'}`}>
            <Award className={`w-8 h-8 mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Negative Marking
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Optional negative marking system to simulate real exam scoring patterns
            </p>
          </div>

          <div className={`p-6 rounded-2xl ${
            isDark ? 'bg-gray-700/50' : 'bg-green-50'
          } border ${isDark ? 'border-gray-600' : 'border-green-100'}`}>
            <Zap className={`w-8 h-8 mb-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Instant Results
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Get immediate feedback with detailed performance breakdown after every quiz
            </p>
          </div>
        </div>
      </motion.section>

      {/* Your Preparation Journey */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`rounded-3xl p-8 md:p-10 ${
          isDark 
            ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-700/30' 
            : 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200'
        } shadow-xl`}
      >
        <div className="text-center mb-10">
          <GraduationCap className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Success Journey
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-2xl mx-auto`}>
            Follow these simple steps to maximize your preparation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDark ? 'bg-emerald-800/50' : 'bg-emerald-500'
            } text-white font-bold text-2xl shadow-lg`}>
              1
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sign Up Free
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Create your account in seconds and access free quizzes
            </p>
          </div>

          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDark ? 'bg-teal-800/50' : 'bg-teal-500'
            } text-white font-bold text-2xl shadow-lg`}>
              2
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Take Free Tests
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Start with free subject-wise quizzes to assess your level
            </p>
          </div>

          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDark ? 'bg-green-800/50' : 'bg-green-500'
            } text-white font-bold text-2xl shadow-lg`}>
              3
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Analyze Results
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Review detailed analytics to identify weak areas
            </p>
          </div>

          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDark ? 'bg-emerald-700/50' : 'bg-emerald-600'
            } text-white font-bold text-2xl shadow-lg`}>
              4
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ace the Exam
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Practice regularly and achieve your dream score
            </p>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Complete Subject Coverage
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            All subjects covered as per AMU & JMI syllabus
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Performance Analytics
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Track your accuracy, time management, and compare with other aspirants to identify improvement areas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Exam-Like Experience
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Timed tests with negative marking simulation to prepare you for the actual entrance exam day
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <Timer className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Flexible Time Limits
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Customizable time limits for each question to match actual exam durations and improve time management skills
          </p>
        </motion.div>
      </section>

      {/* Modals */}
      {selectedQuiz && (
        <QuizOverview 
          quiz={selectedQuiz}
          isOpen={showOverview}
          onClose={() => {
            setShowOverview(false);
            setSelectedQuiz(null);
          }}
          onPurchase={handlePurchaseClick}
        />
      )}

      {purchaseQuiz && (
        <PurchaseModal
          quiz={purchaseQuiz}
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setPurchaseQuiz(null);
          }}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default Home;
