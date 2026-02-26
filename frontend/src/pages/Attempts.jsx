import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserAttempts, getUserStats } from '../utils/quizApi';
import { useTheme } from '../context/ThemeContext';
import { BarChart3, TrendingUp, Trophy, Target, BookOpen, Calendar, FileText, CheckCircle2, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

const Attempts = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAttempts: 0
  });

  // Particle Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.body.scrollHeight;
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
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = isDark ? '#3b82f6' : '#6366f1';

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

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attemptsData, statsData] = await Promise.all([
        getUserAttempts(pagination.currentPage, 10),
        getUserStats()
      ]);
      
      setAttempts(attemptsData.data.attempts || []);
      setPagination(attemptsData.data.pagination || { currentPage: 1, totalPages: 1, totalAttempts: 0 });
      setStats(statsData.data || null);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleViewDetails = (attemptId) => {
    navigate(`/quiz/result/${attemptId}`);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <canvas 
          ref={canvasRef}
          className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
          style={{ opacity: 0.3 }}
        />
        <div className="relative z-10 text-center backdrop-blur-xl rounded-3xl p-12 border shadow-xl"
          style={{
            background: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(99, 102, 241, 0.4)',
          }}
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading attempts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 py-8 px-4 max-w-7xl mx-auto pb-16">
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
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(239, 246, 255, 0.95) 100%)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.3)',
          boxShadow: isDark ? 'none' : '0 20px 60px rgba(59, 130, 246, 0.15)',
        }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          My Quiz Attempts
        </h1>
      </motion.div>

      {/* Statistics Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 border shadow-xl"
          style={{
            background: isDark 
              ? 'rgba(31, 41, 55, 0.5)'
              : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)',
            boxShadow: isDark ? 'none' : '0 15px 50px rgba(59, 130, 246, 0.12)',
          }}
        >
          <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            Performance Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="backdrop-blur-xl rounded-2xl p-3 sm:p-4 border shadow-lg hover:shadow-xl transition-all"
              style={{
                background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 246, 255, 0.98)',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.4)',
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(59, 130, 246, 0.15)',
              }}
            >
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.totalAttempts || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center font-medium">Total Attempts</p>
              </div>
            </div>
            <div className="backdrop-blur-xl rounded-2xl p-3 sm:p-4 border shadow-lg hover:shadow-xl transition-all"
              style={{
                background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(240, 253, 244, 0.98)',
                borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.4)',
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(34, 197, 94, 0.15)',
              }}
            >
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
                  {stats?.averagePercentage ? stats.averagePercentage.toFixed(1) : '0'}%
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center font-medium">Average Score</p>
              </div>
            </div>
            <div className="backdrop-blur-xl rounded-2xl p-3 sm:p-4 border shadow-lg hover:shadow-xl transition-all"
              style={{
                background: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(250, 245, 255, 0.98)',
                borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.4)',
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(168, 85, 247, 0.15)',
              }}
            >
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {stats?.bestScore || 0}%
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center font-medium">Best Score</p>
              </div>
            </div>
            <div className="backdrop-blur-xl rounded-2xl p-3 sm:p-4 border shadow-lg hover:shadow-xl transition-all"
              style={{
                background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(238, 242, 255, 0.98)',
                borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.4)',
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(99, 102, 241, 0.15)',
              }}
            >
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats?.overallAccuracy ? stats.overallAccuracy.toFixed(1) : '0'}%
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center font-medium">Accuracy</p>
              </div>
            </div>
          </div>

          {/* Subject-wise stats */}
          {stats?.subjectWiseStats && stats.subjectWiseStats.length > 0 && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.5)' }}>
              <h3 className="text-lg sm:text-xl font-black mb-4 flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                Subject-wise Performance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {stats.subjectWiseStats.map((subject, index) => (
                  <div
                    key={index}
                    className="backdrop-blur-xl rounded-2xl p-4 border hover:shadow-xl transition-all"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.97)',
                      borderColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.3)',
                      boxShadow: isDark ? 'none' : '0 4px 15px rgba(168, 85, 247, 0.1)',
                    }}
                  >
                    <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-base sm:text-lg">
                      {subject.subject}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Attempts:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">{subject.attempts}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg Score:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{subject.averageScore}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy:</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{subject.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Attempts List */}
      <div className="relative z-10 space-y-4">
        {attempts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-xl rounded-3xl border shadow-xl p-12 text-center"
            style={{
              background: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.4)',
              boxShadow: isDark ? 'none' : '0 15px 50px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Attempts Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start taking quizzes to see your attempt history here
            </p>
            <button
              onClick={() => navigate('/quizzes')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Browse Quizzes
            </button>
          </motion.div>
        ) : (
          attempts.map((attempt, index) => (
            <motion.div
              key={attempt.attemptId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl rounded-3xl p-4 sm:p-6 hover:shadow-2xl transition-all border"
              style={{
                background: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)',
                boxShadow: isDark ? 'none' : '0 10px 40px rgba(59, 130, 246, 0.1)',
              }}
            >
              <div className="flex flex-col gap-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1 w-full">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
                      {attempt.quiz.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium flex items-center gap-1">
                        <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {attempt.quiz.subject}
                      </span>
                      <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {attempt.quiz.examYear}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(attempt.attemptedAt)}
                    </span>
                    <button
                      onClick={() => handleViewDetails(attempt.attemptId)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-2xl transition-all text-xs sm:text-sm font-bold whitespace-nowrap ml-auto sm:ml-0 flex items-center gap-1.5 transform hover:scale-105"
                    >
                      View Details
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Stats Section */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.4)' }}>
                  <div className="flex flex-col items-center sm:items-start p-2 sm:p-3 backdrop-blur-sm rounded-xl border"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(249, 250, 251, 0.95)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(229, 231, 235, 0.6)',
                    }}
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Score</span>
                    <span className={`text-lg sm:text-xl md:text-2xl font-bold ${
                      attempt.percentage >= 75 ? 'text-green-600 dark:text-green-400' :
                      attempt.percentage >= 60 ? 'text-blue-600 dark:text-blue-400' :
                      attempt.percentage >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {attempt.percentage ? attempt.percentage.toFixed(1) : '0'}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center sm:items-start p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Correct</span>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                      {attempt.correctAnswers}<span className="text-sm text-gray-500">/{attempt.totalQuestions}</span>
                    </span>
                  </div>
                  <div className="flex flex-col items-center sm:items-start p-2 sm:p-3 backdrop-blur-sm rounded-xl border col-span-2 sm:col-span-1"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(249, 250, 251, 0.95)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(229, 231, 235, 0.6)',
                    }}
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time Taken</span>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {formatTime(attempt.timeTaken)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="relative z-10 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all font-bold text-sm sm:text-base flex items-center justify-center gap-2 transform hover:scale-105 disabled:hover:scale-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="px-6 py-3 backdrop-blur-xl rounded-2xl font-bold text-sm sm:text-base border shadow-lg"
            style={{
              background: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.4)',
              color: isDark ? 'white' : '#1f2937',
            }}
          >
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all font-bold text-sm sm:text-base flex items-center justify-center gap-2 transform hover:scale-105 disabled:hover:scale-100"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Attempts;
