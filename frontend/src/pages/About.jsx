import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useRef, useEffect } from 'react';
import { 
  GraduationCap, BookOpen, Target, Award, Users, TrendingUp, 
  CheckCircle2, Clock, Sparkles, Mail, MapPin, Phone 
} from 'lucide-react';

const About = () => {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);

  // Particle Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.body.scrollHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 8 + 4;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.shape = Math.floor(Math.random() * 5); // circle, square, triangle, diamond, hexagon
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
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
        ctx.fillStyle = isDark ? '#10b981' : '#059669';

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

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = isDark 
              ? `rgba(16, 185, 129, ${0.15 * (1 - distance / 120)})` 
              : `rgba(5, 150, 105, ${0.1 * (1 - distance / 120)})`;
            ctx.lineWidth = 1;
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

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "AMU & JMI Focused Content",
      description: "Specially curated questions based on previous year papers and exam patterns of AMU and JMI entrance tests."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Subject-wise Practice",
      description: "Comprehensive coverage of all subjects including Physics, Chemistry, Mathematics, Biology, and General Knowledge."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Timed Mock Tests",
      description: "Practice with real exam conditions using our timed quizzes that simulate the actual entrance test experience."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Performance Analytics",
      description: "Track your progress with detailed statistics, accuracy rates, and performance insights after every quiz."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Detailed Solutions",
      description: "Learn from your mistakes with comprehensive explanations for every question in premium quizzes."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Compete with Others (Coming Soon)",
      description: "Compare your performance with thousands of aspirants nationwide and track your rank on the leaderboard."
    }
  ];

  const universities = [
    {
      name: "Aligarh Muslim University (AMU)",
      established: "1920",
      location: "Aligarh, Uttar Pradesh",
      highlight: "One of India's most prestigious universities with diverse programs"
    },
    {
      name: "Jamia Millia Islamia (JMI)",
      established: "1920",
      location: "New Delhi",
      highlight: "Central university known for academic excellence and research"
    }
  ];

  return (
    <div className="relative max-w-7xl mx-auto space-y-12 pb-12">
      {/* Particle Canvas Background */}
      <canvas 
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.3 }}
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 overflow-hidden rounded-3xl backdrop-blur-xl border shadow-xl"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 50%, rgba(5, 150, 105, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(236, 253, 245, 0.98) 0%, rgba(240, 253, 250, 0.98) 50%, rgba(209, 250, 229, 0.98) 100%)',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)',
          boxShadow: isDark ? 'none' : '0 25px 60px rgba(16, 185, 129, 0.2)',
        }}
      >
        <div className="p-8 md:p-12 lg:p-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <Sparkles className="w-6 h-6 text-emerald-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            About Our Platform
          </h1>
          
          <p className={`text-lg md:text-xl max-w-3xl leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Your trusted companion for AMU and JMI entrance exam preparation. We provide 
            comprehensive quizzes, mock tests, and practice materials designed specifically 
            for aspirants aiming to crack these prestigious university entrance exams.
          </p>
        </div>
      </motion.div>

      {/* Universities Info */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {universities.map((uni, index) => (
          <motion.div
            key={uni.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="rounded-3xl p-8 backdrop-blur-xl border shadow-xl hover:shadow-2xl transition-all duration-300 group"
            style={{
              background: isDark 
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(255, 255, 255, 0.97)',
              borderColor: index === 0
                ? (isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)')
                : (isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.4)'),
              boxShadow: isDark ? 'none' : index === 0
                ? '0 15px 40px rgba(239, 68, 68, 0.15)'
                : '0 15px 40px rgba(34, 197, 94, 0.15)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${
                index === 0 
                  ? (isDark ? 'bg-red-900/30' : 'bg-red-100') 
                  : (isDark ? 'bg-green-900/30' : 'bg-green-100')
              }`}>
                <GraduationCap className={`w-6 h-6 ${
                  index === 0 ? 'text-red-500' : 'text-green-600'
                }`} />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {uni.name}
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {uni.location}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Established {uni.established}
                </span>
              </div>
              
              <p className={`text-sm leading-relaxed mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {uni.highlight}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Why Choose Us?
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Everything you need to ace your AMU and JMI entrance exams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="p-6 rounded-2xl backdrop-blur-xl border shadow-lg hover:shadow-2xl transition-all duration-300 group"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.97)',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)',
                boxShadow: isDark ? 'none' : '0 10px 30px rgba(16, 185, 129, 0.12)',
              }}
            >
              <div className={`inline-flex p-3 rounded-xl mb-4 ${
                isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
              } group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Coming Soon Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 rounded-3xl p-8 md:p-10 backdrop-blur-xl border shadow-xl"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(250, 245, 255, 0.98) 0%, rgba(252, 231, 243, 0.98) 100%)',
          borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.4)',
          boxShadow: isDark ? 'none' : '0 25px 60px rgba(168, 85, 247, 0.2)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-purple-800/50' : 'bg-purple-500'}`}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Coming Soon: Premium Quizzes
          </h2>
        </div>
        
        <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          We're introducing paid premium quizzes with exclusive features to enhance your preparation:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-white/60'}`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Detailed Explanations</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Step-by-step solutions for every question</p>
            </div>
          </div>
          
          {/* <div className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-white/60'}`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Full-Length Mock Tests</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Complete exam simulation with all subjects</p>
            </div>
          </div> */}
          
          <div className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-white/60'}`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Advanced Analytics</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>In-depth performance reports and weak area analysis</p>
            </div>
          </div>
          
          <div className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-white/60'}`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Previous Year Papers</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Access to all AMU & JMI previous year questions</p>
            </div>
          </div>
          
          <div className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-white/60'}`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Expert Mentor Guidance</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Personalized guidance from AMU & JMI alumni and expert mentors for each test</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-900/20' : 'bg-purple-100'} border-2 ${isDark ? 'border-purple-700/30' : 'border-purple-300'}`}>
          <p className={`text-center font-medium flex items-center justify-center gap-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
            <Target className="w-5 h-5" />
            Stay tuned! Premium features launching soon to supercharge your exam preparation.
          </p>
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 rounded-3xl p-8 md:p-10 backdrop-blur-xl border shadow-xl"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(236, 253, 245, 0.98) 0%, rgba(240, 253, 250, 0.98) 100%)',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)',
          boxShadow: isDark ? 'none' : '0 25px 60px rgba(16, 185, 129, 0.2)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-800/50' : 'bg-emerald-500'}`}>
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Get In Touch
          </h2>
        </div>
        
        <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Have questions about our platform or need assistance with your preparation? 
          We're here to help you succeed!
        </p>
        
        <div className="flex flex-wrap gap-4">
          <a 
            href="mailto:jmi123quiz@gmail.com"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isDark 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            } shadow-lg hover:shadow-xl hover:scale-105`}
          >
            <Mail className="w-5 h-5" />
            Email Us
          </a>
          
          <a 
            href="/quizzes"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-emerald-600'
            } shadow-lg hover:shadow-xl hover:scale-105`}
          >
            <BookOpen className="w-5 h-5" />
            Start Practicing
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
