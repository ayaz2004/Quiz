import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { getQuizzes } from '../utils/quizApi';
import QuizCard from '../components/cards/QuizCard';
import QuizOverview from '../components/modals/QuizOverview';
import PurchaseModal from '../components/modals/PurchaseModal';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const heroRef = useRef(null);
  const [freeQuizzes, setFreeQuizzes] = useState([]);
  const [paidQuizzes, setPaidQuizzes] = useState([]);
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
      const response = await getQuizzes({ limit: 20 });
      
      if (response.success) {
        const quizzes = response.data.quizzes;
        
        // Separate free and paid quizzes
        const free = quizzes.filter(q => !q.isPaid);
        const paid = quizzes.filter(q => q.isPaid);
        
        setFreeQuizzes(free.slice(0, 6)); // Show first 6 free quizzes
        setPaidQuizzes(paid.slice(0, 6)); // Show first 6 paid quizzes
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
            <span className="px-4 py-2 bg-blue-100/60 backdrop-blur-md text-blue-700 text-sm font-semibold rounded-full border border-blue-300/50 hover:bg-blue-100/80 transition-all">
              ✨ Master Your Skills
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600">
              Master Your Knowledge
            </span>
            <br />
            <span className="text-gray-800">with JMI Quiz Platform</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl max-w-3xl text-gray-600 font-medium leading-relaxed mb-10"
          >
            Challenge yourself with premium quizzes, track your progress, compete on leaderboards, and unlock your full potential. 
            Start with free quizzes or go premium for exclusive content.
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
              className="group inline-flex items-center justify-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1"
            >
              {isAuthenticated ? "Browse All Quizzes" : "Start Your Journey"}
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.span>
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/leaderboard"
                className="group inline-flex items-center justify-center gap-2 bg-purple-100/70 backdrop-blur-md text-purple-700 px-8 py-4 rounded-xl font-bold text-lg border border-purple-300/50 hover:bg-purple-100 hover:border-purple-400 transition-all duration-300 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Check Leaderboard
              </Link>
            )}
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

      {/* Free Quizzes Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
              Free Quizzes
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Start learning with our free quizzes - no login required!
            </p>
          </motion.div>
          
          <Link 
            to="/quizzes"
            className="hidden md:flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
          >
            View All
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {loading ? (
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
        ) : error ? (
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
        ) : freeQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeQuizzes.map((quiz, index) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onClick={handleQuizClick}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">No free quizzes available at the moment</p>
          </div>
        )}
      </section>

      {/* Paid Quizzes Section - Only show to logged in users */}
      {isAuthenticated && paidQuizzes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
                Premium Quizzes
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Unlock advanced quizzes with detailed explanations and exclusive content
              </p>
            </motion.div>
            
            <Link 
              to="/quizzes"
              className="hidden md:flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              View All
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paidQuizzes.map((quiz, index) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onClick={handleQuizClick}
                index={index}
                showLockIcon={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            Multiple Subjects
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Access quizzes across various subjects and topics to expand your knowledge
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
            Track Progress
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your performance and improvement over time with detailed analytics
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
            Compete & Win
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Challenge others and climb the leaderboard to win exciting prizes
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
