import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { getQuizzes, getSubjects } from '../utils/quizApi';
import { 
  BookOpen, GraduationCap, Clock, CheckCircle2, 
  ArrowRight, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { QuizGrid, QuizOverview } from '../components';
import usePageSeo from '../hooks/usePageSeo';

const AmuPyq = () => {
  usePageSeo({
    title: 'AMU PYQ - Aligarh Muslim University Previous Year Questions | JMI Quiz',
    description: 'Practice AMU previous year questions (PYQ) online. Solve Aligarh Muslim University entrance exam papers with timed mock tests, instant results, and detailed analytics.',
    path: '/amu-pyq',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'AMU PYQ', path: '/amu-pyq' },
    ],
  });

  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showOverview, setShowOverview] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Particle canvas background
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
          ? `rgba(239, 68, 68, ${this.opacity})`
          : `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        switch (this.shape) {
          case 0: ctx.arc(0, 0, this.size, 0, Math.PI * 2); break;
          case 1: ctx.rect(-this.size, -this.size, this.size * 2, this.size * 2); break;
          case 2:
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, this.size);
            ctx.lineTo(-this.size, this.size);
            ctx.closePath(); break;
          case 3:
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, 0);
            ctx.lineTo(0, this.size);
            ctx.lineTo(-this.size, 0);
            ctx.closePath(); break;
          case 4:
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              if (i === 0) ctx.moveTo(this.size * Math.cos(angle), this.size * Math.sin(angle));
              else ctx.lineTo(this.size * Math.cos(angle), this.size * Math.sin(angle));
            }
            ctx.closePath(); break;
        }
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.strokeStyle = isDark
              ? `rgba(239, 68, 68, ${0.2 * (1 - dist / 150)})`
              : `rgba(59, 130, 246, ${0.2 * (1 - dist / 150)})`;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [quizRes, subjectsRes] = await Promise.all([
          getQuizzes({ limit: 12, search: 'amu' }),
          getSubjects(),
        ]);
        if (quizRes.success) setQuizzes(quizRes.data.quizzes);
        if (subjectsRes.data?.subjects) setSubjects(subjectsRes.data.subjects);
      } catch (err) {
        console.error('Error fetching AMU data:', err);
        if (err.code === 'ECONNABORTED') {
          setError('Server is waking up. Please wait a moment and try again.');
        } else if (err.message?.includes('Network Error')) {
          setError('Unable to connect. Please check your internet connection.');
        } else {
          setError('Failed to load quizzes. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowOverview(true);
  };

  const subjectColors = [
    'from-red-500 to-orange-500',
    'from-purple-500 to-pink-500',
    'from-blue-500 to-indigo-500',
    'from-green-500 to-emerald-500',
    'from-cyan-500 to-blue-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-purple-500',
  ];

  const faqs = [
    {
      q: 'What is AMU PYQ?',
      a: 'AMU PYQ refers to Previous Year Questions from Aligarh Muslim University entrance exams. Practicing them helps you understand AMU\'s specific exam pattern and difficulty level.',
    },
    {
      q: 'Are AMU PYQ quizzes free on this platform?',
      a: 'Many quizzes are free. We also offer premium quizzes with detailed explanations and advanced analytics for a small fee.',
    },
    {
      q: 'Which AMU programs are covered?',
      a: 'We cover AMU entrance exams for School level, Undergraduate (B.A., B.Sc., B.Tech, etc.), and Postgraduate programs across multiple subjects.',
    },
    {
      q: 'How is this different from PYQ PDFs?',
      a: 'Unlike PDFs, you get timed quiz simulations, automatic grading, negative marking support, and performance tracking — replicating real AMU exam conditions.',
    },
  ];

  return (
    <div className="relative space-y-16 pb-20">
      <h1 className="sr-only">AMU Previous Year Questions (PYQ) - Practice AMU Entrance Exam Papers Online</h1>

      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.4 }}
      />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 min-h-[60vh] flex items-center"
      >
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl lg:rounded-[2.5rem] p-8 lg:p-12 shadow-2xl"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(239, 68, 68, 0.2)',
              boxShadow: isDark ? 'none' : '0 20px 60px rgba(239, 68, 68, 0.12), 0 10px 30px rgba(168, 85, 247, 0.1)',
            }}
          >
            <div className="absolute inset-0 overflow-hidden opacity-40">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-red-400 to-purple-500 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full blur-3xl"
              />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full backdrop-blur-xl shadow-lg"
                style={{
                  background: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <GraduationCap className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Aligarh Muslim University
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-[1.1]"
              >
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-purple-500">
                  AMU Previous Year
                </span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  Questions (PYQ)
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className={`text-lg md:text-xl max-w-3xl mb-10 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Solve authentic AMU entrance exam papers in a timed quiz format. 
                Get instant results, track your progress, and prepare for admission to Aligarh Muslim University.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/quizzes"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #a855f7 100%)' }}
                >
                  <span className="relative z-10">Start Practicing</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  to="/jmi-pyq"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                    color: isDark ? 'white' : '#111827',
                  }}
                >
                  JMI PYQ
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-4 mt-12">
              {[
                { label: 'Authentic PYQs', icon: FileText, color: 'from-red-500 to-rose-500' },
                { label: 'Timed Tests', icon: Clock, color: 'from-purple-500 to-indigo-500' },
                { label: 'Instant Results', icon: CheckCircle2, color: 'from-orange-500 to-amber-500' },
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
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(239, 68, 68, 0.2)',
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
        </div>
      </motion.section>

      {/* Available Subjects — fetched from API */}
      {subjects.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
              Available Subjects
            </h2>
            <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Browse quizzes by subject
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  to={`/quizzes`}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white shadow-lg hover:shadow-xl transition-all bg-gradient-to-r ${subjectColors[index % subjectColors.length]}`}
                >
                  <BookOpen className="w-4 h-4" />
                  {subject}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Quiz Grid */}
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
                <span className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-xl">
                  <BookOpen className="w-6 h-6" />
                </span>
                AMU PYQ Quizzes
              </span>
            </h2>
            <p className={`text-sm lg:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Practice previous year questions from AMU entrance exams
            </p>
          </div>
          <Link
            to="/quizzes"
            className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
          >
            View All
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl border rounded-3xl p-8 shadow-xl mb-8"
            style={{
              background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 242, 242, 0.98)',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)',
            }}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <p className={isDark ? 'text-red-300' : 'text-red-700'}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        <QuizGrid
          quizzes={quizzes}
          loading={loading}
          onQuizClick={handleQuizClick}
          purchasedQuizIds={[]}
        />
      </section>

      {/* SEO Content */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 rounded-3xl p-8 lg:p-10 backdrop-blur-xl border shadow-xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(254, 242, 242, 0.98) 0%, rgba(250, 245, 255, 0.98) 100%)',
          borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.25)',
          boxShadow: isDark ? 'none' : '0 15px 40px rgba(239, 68, 68, 0.1)',
        }}
      >
        <h2 className={`text-xl lg:text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          About AMU Entrance Exams
        </h2>
        <div className={`text-sm lg:text-base leading-relaxed space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <p>
            Aligarh Muslim University (AMU) conducts its own entrance tests for admission to various 
            undergraduate, postgraduate, and school-level programs. Each test has a specific pattern 
            with multiple-choice questions, time limits, and negative marking.
          </p>
          <p>
            Practicing with actual previous year questions helps you understand AMU's specific question style 
            and difficulty. Our platform converts these PYQs into interactive timed quizzes so you can 
            practice under real exam conditions and track your improvement over time.
          </p>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 rounded-3xl p-8 lg:p-10 backdrop-blur-xl border shadow-xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(250, 245, 255, 0.98) 0%, rgba(252, 231, 243, 0.98) 100%)',
          borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.4)',
          boxShadow: isDark ? 'none' : '0 15px 40px rgba(168, 85, 247, 0.12)',
        }}
      >
        <h2 className={`text-xl lg:text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-xl border overflow-hidden ${isDark ? 'border-purple-700/30' : 'border-purple-200'}`}
              style={{ background: isDark ? 'rgba(168, 85, 247, 0.05)' : 'rgba(255, 255, 255, 0.8)' }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className={`w-full flex items-center justify-between p-4 text-left font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                <span>{faq.q}</span>
                {openFaq === index
                  ? <ChevronUp className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  : <ChevronDown className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                }
              </button>
              {openFaq === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`px-4 pb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {faq.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center rounded-3xl p-8 lg:p-10 backdrop-blur-xl border shadow-xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 242, 242, 0.95) 100%)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(239, 68, 68, 0.2)',
          boxShadow: isDark ? 'none' : '0 15px 40px rgba(239, 68, 68, 0.1)',
        }}
      >
        <h2 className={`text-2xl lg:text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Ready to Start Practicing?
        </h2>
        <p className={`text-base mb-6 max-w-xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Browse our complete quiz collection and start your AMU entrance exam preparation.
        </p>
        <Link
          to="/quizzes"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #ef4444 0%, #a855f7 100%)' }}
        >
          Browse All Quizzes
          <ArrowRight className="w-6 h-6" />
        </Link>
      </motion.section>

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
          }),
        }}
      />

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

export default AmuPyq;
