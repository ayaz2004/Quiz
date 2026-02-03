import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  GraduationCap, BookOpen, Target, Award, Users, TrendingUp, 
  CheckCircle2, Clock, Sparkles, Mail, MapPin, Phone 
} from 'lucide-react';

const About = () => {
  const { isDark } = useTheme();

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
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <div className={`p-8 md:p-12 lg:p-16 ${
          isDark 
            ? 'bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-green-900/40' 
            : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50'
        } border ${isDark ? 'border-emerald-700/30' : 'border-emerald-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl ${
              isDark ? 'bg-emerald-800/50' : 'bg-emerald-500'
            }`}>
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <Sparkles className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            About Our Platform
          </h1>
          
          <p className={`text-lg md:text-xl max-w-3xl leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Your trusted companion for AMU and JMI entrance exam preparation. We provide 
            comprehensive quizzes, mock tests, and practice materials designed specifically 
            for aspirants aiming to crack these prestigious university entrance exams.
          </p>
        </div>
      </motion.div>

      {/* Universities Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {universities.map((uni, index) => (
          <motion.div
            key={uni.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`rounded-3xl p-8 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
            } shadow-xl hover:shadow-2xl transition-all duration-300`}
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
      >
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Why Choose Us?
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
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
              className={`p-6 rounded-2xl ${
                isDark 
                  ? 'bg-gray-800 border border-gray-700 hover:border-emerald-600' 
                  : 'bg-white border border-gray-200 hover:border-emerald-400'
              } shadow-lg hover:shadow-xl transition-all duration-300 group`}
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
        className={`rounded-3xl p-8 md:p-10 ${
          isDark 
            ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-700/30' 
            : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
        } shadow-xl`}
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
        className={`rounded-3xl p-8 md:p-10 ${
          isDark 
            ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-700/30' 
            : 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200'
        } shadow-xl`}
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
