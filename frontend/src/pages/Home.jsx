import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getQuizzes } from '../utils/quizApi';
import { 
  Users, BookOpen, Award, TrendingUp, Clock, Target, 
  CheckCircle2, Zap, Brain, GraduationCap, Trophy, Rocket, Timer,
  Sparkles, ArrowRight, Star, BarChart3, Shield
} from 'lucide-react';
import QuizCard from '../components/quiz-browser/QuizCard';
import QuizOverview from '../components/modals/QuizOverview';
import PurchaseModal from '../components/modals/PurchaseModal';
import usePageSeo from '../hooks/usePageSeo';

const Home = () => {
  usePageSeo({
    title: 'JMI PYQ & AMU PYQ Quiz Platform | Home',
    description: 'Practice JMI PYQ and AMU PYQ quizzes with mock tests and previous year questions for entrance exam preparation.',
    path: '/',
    breadcrumbs: [
      { name: 'Home', path: '/' },
    ],
  });

  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
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
        this.size = Math.random() * 8 + 4; // Bigger particles (4-12px)
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        // Random shape: circle, square, triangle, diamond, hexagon
        this.shape = Math.floor(Math.random() * 5);
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

    // Create particles
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Connect nearby particles with lines
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = isDark 
              ? `rgba(59, 130, 246, ${0.2 * (1 - distance / 150)})` 
              : `rgba(16, 185, 129, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  // GSAP animations for floating elements
  useEffect(() => {
    if (!heroRef.current) return;

    const floatingElements = heroRef.current.querySelectorAll('[data-float]');
    
    floatingElements.forEach((el, index) => {
      gsap.to(el, {
        y: Math.sin(index) * 20,
        x: Math.cos(index) * 15,
        rotation: Math.sin(index) * 5,
        duration: 3 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch quizzes for each education level separately to ensure balanced display
      const [schoolResponse, undergradResponse, mastersResponse] = await Promise.all([
        getQuizzes({ limit: 6, educationLevel: 'school' }),
        getQuizzes({ limit: 6, educationLevel: 'undergrad' }),
        getQuizzes({ limit: 6, educationLevel: 'masters' })
      ]);
      
      if (schoolResponse.success) {
        setSchoolQuizzes(schoolResponse.data.quizzes);
      }
      if (undergradResponse.success) {
        setUndergradQuizzes(undergradResponse.data.quizzes);
      }
      if (mastersResponse.success) {
        setMastersQuizzes(mastersResponse.data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      
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
    fetchQuizzes();
    alert('Purchase successful! You can now access this quiz.');
  };

  return (
    <div className="relative space-y-16 pb-20">
      {/* SEO H1 Heading for Quiz */}
      <h1 className="sr-only">Quiz Platform - JMI and AMU PYQ, mock tests, and previous year questions</h1>
      {/* Particle Canvas Background */}
      <canvas 
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.4 }}
      />

      {/* Premium Hero - Bento Grid Style */}
      <motion.section 
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 min-h-[85vh] flex items-center"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          
          {/* Main Hero Card - Spans 8 columns */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-8 relative overflow-hidden rounded-3xl lg:rounded-[2.5rem] p-8 lg:p-12 min-h-[500px] lg:min-h-[600px] flex flex-col justify-between shadow-2xl"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(16, 185, 129, 0.2)',
              boxShadow: isDark ? 'none' : '0 20px 60px rgba(16, 185, 129, 0.15), 0 10px 30px rgba(59, 130, 246, 0.1)',
            }}
          >
            {/* Morphing gradient orbs */}
            <div className="absolute inset-0 overflow-hidden opacity-40">
              <motion.div
                data-float
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full blur-3xl"
              />
              <motion.div
                data-float
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full blur-3xl"
              />
            </div>

            <div className="relative z-10">
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full backdrop-blur-xl shadow-lg"
                style={{
                  background: isDark 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Complete AMU & JMI Preparation Platform
                </span>
              </motion.div>

              {/* Main heading with gradient */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-[1.1]"
              >
                <span 
                  className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                  style={{
                    WebkitTextStroke: isDark ? '1px rgba(16, 185, 129, 0.2)' : '0px'
                  }}
                >
                  Master Your
                </span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  Entrance Exam
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className={`text-lg md:text-xl lg:text-2xl max-w-2xl mb-10 font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Ace your entrance exams with comprehensive previous year question papers (PYQs), timed mock tests, 
                performance analytics, and instant feedback designed specifically for AMU & JMI.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link 
                  to={isAuthenticated ? "/quizzes" : "/signup"}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  }}
                >
                  <span className="relative z-10">
                    {isAuthenticated ? "Explore Quizzes" : "Start Free Today"}
                  </span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  
                  {/* Hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </Link>
                
                <Link 
                  to="/about"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                    color: isDark ? 'white' : '#111827'
                  }}
                >
                  How It Works
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* Key Features Highlights */}
            <div className="relative z-10 grid grid-cols-3 gap-4 mt-12">
              {[
                { label: 'Timed Tests', icon: Clock, color: 'from-blue-500 to-cyan-500' },
                { label: 'Instant Results', icon: Zap, color: 'from-purple-500 to-pink-500' },
                { label: 'Free Quizzes', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="backdrop-blur-xl rounded-2xl p-4 border cursor-pointer group shadow-lg"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.2)',
                    boxShadow: isDark ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-sm font-bold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Bento cards */}
          <div className="lg:col-span-4 grid grid-rows-2 gap-4 lg:gap-6">
            
            {/* Top card - Features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl p-6 lg:p-8 backdrop-blur-xl border flex flex-col justify-between group hover:scale-[1.02] transition-transform shadow-xl"
              style={{
                background: isDark 
                  ? 'rgba(59, 130, 246, 0.1)' 
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(239, 246, 255, 0.98) 100%)',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.4)',
                boxShadow: isDark ? 'none' : '0 10px 40px rgba(59, 130, 246, 0.15)',
              }}
            >
              <div>
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl"
                >
                  <BarChart3 className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className={`text-xl lg:text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Performance Analytics
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track your accuracy, time management, and view detailed score breakdowns
                </p>
              </div>
              
              <Link 
                to="/attempts"
                className="mt-4 flex items-center gap-2 text-blue-500 font-semibold text-sm group-hover:gap-3 transition-all"
              >
                View Analytics <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Bottom card - Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative overflow-hidden rounded-3xl p-6 lg:p-8 backdrop-blur-xl border flex flex-col justify-between group hover:scale-[1.02] transition-transform shadow-xl"
              style={{
                background: isDark 
                  ? 'rgba(245, 158, 11, 0.1)' 
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 251, 235, 0.98) 100%)',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.4)',
                boxShadow: isDark ? 'none' : '0 10px 40px rgba(245, 158, 11, 0.15)',
              }}
            >
              <div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl"
                >
                  <Target className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className={`text-xl lg:text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Exam Ready
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Practice with negative marking and time limits just like the real exam
                </p>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                {[
                  { icon: Timer, color: 'from-blue-500 to-cyan-500' },
                  { icon: Shield, color: 'from-purple-500 to-pink-500' },
                  { icon: Award, color: 'from-amber-500 to-orange-500' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Key Benefits Banner */}
      <section className="relative z-10 overflow-hidden py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="backdrop-blur-xl rounded-3xl p-8 border shadow-xl"
          style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.95) 100%)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.3)',
            boxShadow: isDark ? 'none' : '0 10px 40px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle2, text: 'Free to Start', color: 'text-emerald-500' },
              { icon: Clock, text: 'Timed Practice', color: 'text-blue-500' },
              { icon: Target, text: 'Exam Pattern', color: 'text-purple-500' },
              { icon: Zap, text: 'Instant Feedback', color: 'text-orange-500' },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl border shadow-lg`}
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.98)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.2)',
                    boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {benefit.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Community & Support Section (Moved Upfront) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 rounded-[3rem] p-8 lg:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 my-10"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(220, 252, 231, 0.95) 0%, rgba(240, 253, 250, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: isDark ? '1px solid rgba(34, 197, 94, 0.2)' : '2px solid rgba(34, 197, 94, 0.3)',
          boxShadow: isDark ? 'none' : '0 20px 60px rgba(34, 197, 94, 0.15)',
        }}
      >
        {/* Floating background shape */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl opacity-20"
        />

        <div className="relative z-10 flex-1 md:pr-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full backdrop-blur-xl border shadow-md mx-auto md:mx-0"
            style={{
              background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.4)'
            }}
          >
            <Users className="w-5 h-5 text-green-500" />
            <span className={`text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              Community & Support
            </span>
          </div>
          
          <h2 className={`text-3xl lg:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Have Queries or Need Papers?
          </h2>
          <p className={`text-lg mb-8 max-w-2xl mx-auto md:mx-0 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Join our dedicated WhatsApp group to discuss AMU & JMI entrance exam strategies, clear your doubts, or request specific previous year question papers to be added to the platform.
          </p>
          
          <a
            href="https://chat.whatsapp.com/GmEU3AT97AtAwzwg0NIzjr?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-green-300"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              Join Group
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        
        {/* Floating 3D Graphic element */}
        <div className="relative w-full md:w-1/3 flex justify-center mt-12 md:mt-0">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-48 rounded-[2rem] flex items-center justify-center shadow-2xl relative"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 1)',
              border: isDark ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(226, 232, 240, 1)',
            }}
          >
            {/* Inner Green glow */}
            <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 rounded-[2rem]"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-xl">
                 <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </div>
              <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Official Group</p>
            </div>
            
            {/* Small floating chat bubble */}
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 3, delay: 1, repeat: Infinity }}
               className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border"
               style={{ 
                 background: isDark ? '#1f2937' : 'white', 
                 borderColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(226, 232, 240, 1)' 
               }}
            >
              <Users className="w-5 h-5 text-green-500" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Loading State */}
      {loading && (
        <section className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="rounded-2xl p-6 backdrop-blur-xl border animate-pulse shadow-lg"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.98)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.5)',
                  boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div className={`h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4 w-3/4`}></div>
                <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`}></div>
                <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4 w-1/2`}></div>
                <div className={`h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl border rounded-3xl p-8 shadow-xl"
            style={{
              background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 242, 242, 0.98)',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)',
              boxShadow: isDark ? 'none' : '0 10px 40px rgba(239, 68, 68, 0.15)',
            }}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  Failed to Load Quizzes
                </h3>
                <p className={`mb-4 ${isDark ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
              </div>
              <button
                onClick={() => fetchQuizzes()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* School Quizzes - 3D Card Grid */}
      {schoolQuizzes.length > 0 && (
        <section className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className={`text-3xl lg:text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="inline-flex items-center gap-3">
                  <span className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl">
                    <BookOpen className="w-6 h-6" />
                  </span>
                  School Level
                </span>
              </h2>
              <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Foundation quizzes for entrance exam preparation
              </p>
            </div>
            
            <Link 
              to="/quizzes"
              className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schoolQuizzes.slice(0, 3).map((quiz, index) => (
              <QuizCard3D 
                key={quiz.id} 
                quiz={quiz} 
                onClick={handleQuizClick}
                index={index}
                isDark={isDark}
              />
            ))}
          </div>
        </section>
      )}

      {/* Undergraduate Quizzes */}
      {undergradQuizzes.length > 0 && (
        <section className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className={`text-3xl lg:text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="inline-flex items-center gap-3">
                  <span className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl">
                    <GraduationCap className="w-6 h-6" />
                  </span>
                  Bachelors Level
                </span>
              </h2>
              <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                UG entrance preparation for AMU & JMI
              </p>
            </div>
            
            <Link 
              to="/quizzes?level=undergrad"
              className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
              }`}
            >
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {undergradQuizzes.slice(0, 3).map((quiz, index) => (
              <QuizCard3D 
                key={quiz.id} 
                quiz={quiz} 
                onClick={handleQuizClick}
                index={index}
                isDark={isDark}
              />
            ))}
          </div>
        </section>
      )}

      {/* Masters Quizzes */}
      {mastersQuizzes.length > 0 && (
        <section className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className={`text-3xl lg:text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="inline-flex items-center gap-3">
                  <span className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl shadow-xl">
                    <Trophy className="w-6 h-6" />
                  </span>
                  Masters Level
                </span>
              </h2>
              <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Advanced PG entrance preparation
              </p>
            </div>
            
            <Link 
              to="/quizzes"
              className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mastersQuizzes.slice(0, 3).map((quiz, index) => (
              <QuizCard3D 
                key={quiz.id} 
                quiz={quiz} 
                onClick={handleQuizClick}
                index={index}
                isDark={isDark}
              />
            ))}
          </div>
        </section>
      )}

      {/* Premium Features Grid - Glassmorphism */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full backdrop-blur-xl border shadow-lg"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.2)',
              boxShadow: isDark ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.1)',
            }}
          >
            <Rocket className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need
            </span>
          </motion.div>
          <h2 className={`text-4xl lg:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Powerful Features
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Designed specifically for AMU & JMI entrance exam success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Clock,
              title: 'Timed Mock Tests',
              description: 'Practice with real exam timing to perfect your speed and accuracy under pressure',
              gradient: 'from-blue-500 to-cyan-500',
              color: isDark ? 'text-blue-400' : 'text-blue-600',
            },
            {
              icon: BarChart3,
              title: 'Performance Tracking',
              description: 'View detailed analytics of your scores, accuracy rates, and time spent per question',
              gradient: 'from-purple-500 to-pink-500',
              color: isDark ? 'text-purple-400' : 'text-purple-600',
            },
            {
              icon: Target,
              title: 'Previous Year Questions',
              description: 'Practice with authentic PYQs from AMU & JMI entrance exams across all subjects',
              gradient: 'from-orange-500 to-red-500',
              color: isDark ? 'text-orange-400' : 'text-orange-600',
            },
            {
              icon: Shield,
              title: 'Negative Marking',
              description: 'Optional penalty system to simulate actual AMU & JMI exam scoring patterns',
              gradient: 'from-green-500 to-emerald-500',
              color: isDark ? 'text-green-400' : 'text-green-600',
            },
            {
              icon: Zap,
              title: 'Instant Results',
              description: 'Get immediate feedback with correct answers and explanations after each quiz',
              gradient: 'from-yellow-500 to-orange-500',
              color: isDark ? 'text-yellow-400' : 'text-yellow-600',
            },
            {
              icon: BookOpen,
              title: 'All Education Levels',
              description: 'Quizzes available for School, Undergraduate, and Masters level entrance exams',
              gradient: 'from-indigo-500 to-purple-500',
              color: isDark ? 'text-indigo-400' : 'text-indigo-600',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl border hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.4)',
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Gradient overlay on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                }}
              />

              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </motion.div>

              <h3 className={`text-xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.description}
              </p>

              {/* Hover arrow */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                className={`mt-4 flex items-center gap-2 ${feature.color} font-semibold text-sm`}
              >
                Explore <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Journey Section - Premium Design */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 rounded-[3rem] p-12 lg:p-16 overflow-hidden shadow-2xl"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(16, 185, 129, 0.2)',
          boxShadow: isDark ? 'none' : '0 20px 60px rgba(16, 185, 129, 0.15)',
        }}
      >
        {/* Floating orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full blur-3xl opacity-20"
        />

        <div className="relative z-10">
          <div className="text-center mb-16">
            <GraduationCap className={`w-16 h-16 mx-auto mb-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h2 className={`text-4xl lg:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Path to Success
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-2xl mx-auto`}>
              Follow these simple steps and transform your preparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Sign Up Free',
                description: 'Create your account instantly and start practicing',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                step: '02',
                title: 'Take Quizzes',
                description: 'Practice with authentic previous year question papers',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                step: '03',
                title: 'Analyze Results',
                description: 'Review detailed insights and identify weak areas',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                step: '04',
                title: 'Ace the Exam',
                description: 'Achieve your dream score with confidence',
                gradient: 'from-orange-500 to-red-500',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center"
              >
                {/* Connecting line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-blue-500/50" />
                )}

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`relative z-10 w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-black text-3xl shadow-2xl`}
                >
                  {item.step}
                </motion.div>

                <h3 className={`text-xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Join Our Mission / Contributors Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 rounded-[3rem] p-8 lg:p-12 overflow-hidden shadow-2xl mb-16"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(250, 245, 255, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '2px solid rgba(59, 130, 246, 0.3)',
          boxShadow: isDark ? 'none' : '0 20px 60px rgba(59, 130, 246, 0.15)',
        }}
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full backdrop-blur-xl border shadow-md mx-auto"
            style={{
              background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.4)'
            }}
          >
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              Gain Real-Life Experience
            </span>
          </div>
          <h2 className={`text-3xl lg:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Join Our Mission to Grow
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Want to help us build something great and learn along the way? We are looking for passionate people to join the team and make an impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: "UI/UX Designer",
              skills: ["Comfortable with Figma / Canva", "Improve user experience & design flow"],
              icon: Sparkles,
              color: "text-pink-500",
              bgDark: "bg-pink-900/20",
              bgLight: "bg-pink-100",
            },
            {
              title: "Quiz Content Creator",
              skills: ["Comfortable using LLMs (ChatGPT, Claude)", "Basic knowledge of APIs/Postman is a plus"],
              icon: BookOpen,
              color: "text-amber-500",
              bgDark: "bg-amber-900/20",
              bgLight: "bg-amber-100",
            },
            {
              title: "Full Stack Developer",
              skills: ["Familiar with JS, React, Node.js", "Interest in AI tools (Copilot, Claude)"],
              icon: Zap,
              color: "text-blue-500",
              bgDark: "bg-blue-900/20",
              bgLight: "bg-blue-100",
            },
            {
              title: "Marketing / Content",
              skills: ["Create engaging content (Posts, threads)", "Grow reach among JMI & AMU students"],
              icon: TrendingUp,
              color: "text-emerald-500",
              bgDark: "bg-emerald-900/20",
              bgLight: "bg-emerald-100",
            },
          ].map((role, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-3xl border backdrop-blur-xl shadow-lg relative group transition-all"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className={`w-14 h-14 rounded-2xl mb-5 flex items-center justify-center ${isDark ? role.bgDark : role.bgLight}`}>
                <role.icon className={`w-7 h-7 ${role.color}`} />
              </div>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{role.title}</h3>
              <ul className="space-y-3">
                {role.skills.map((skill, index) => (
                  <li key={index} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <a
            href="https://chat.whatsapp.com/CI4ZQ1HsZKTJ0N4DnuFFk5?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Join Group
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </motion.section>

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

// 3D Quiz Card Component with Magnetic Effect
const QuizCard3D = ({ quiz, onClick, index, isDark }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(quiz)}
      className="cursor-pointer"
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <QuizCard
        quiz={quiz}
        onClick={onClick}
        index={index}
      />
    </motion.div>
  );
};

export default Home;
