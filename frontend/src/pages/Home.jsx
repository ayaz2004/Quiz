import { motion as Motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, ChevronDown } from 'lucide-react';
import BackgroundCanvas from '../components/home/BackgroundCanvas';
import Hero from '../components/home/Hero';
import WelcomeBack from '../components/home/WelcomeBack';
import QuizLevels from '../components/home/QuizLevels';
import ScholarshipsSection from '../components/home/ScholarshipsSection';
import ToolsGrid from '../components/home/ToolsGrid';
import PathToSuccess from '../components/home/PathToSuccess';
import JoinMission from '../components/home/JoinMission';
import CommunitySection from '../components/home/CommunitySection';
import { quizApi } from '../utils/quizApi';
import { useTheme } from '../context/ThemeContext';

const Hero = () => (
  <Motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-center"
  >
    <h1 className="mb-4 text-4xl font-black text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
      Master Your Entrance Exams
    </h1>
    <p className="mb-8 mx-auto max-w-2xl text-lg text-gray-700 dark:text-gray-300 sm:text-xl">
      Practice with authentic previous year question papers for AMU and JMI exams. Build your confidence with real exam patterns.
    </p>
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
      <a
        href="/quizzes"
        className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        Start Practicing
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </a>
      <a
        href="/about"
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-6 text-base font-bold text-gray-900 shadow-lg transition-transform hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        Learn More
      </a>
    </div>
  </Motion.div>
);

const WelcomeBack = () => (
  <Motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.1 }}
    className="text-center"
  >
    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-bold text-white">
      <Award className="h-4 w-4" aria-hidden="true" />
      Keep Learning, Keep Growing
    </div>
  </Motion.div>
);

const QuizLevels = () => (
  <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
    <div className="text-center">
      <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
        <Award className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-black text-gray-900 dark:text-white">School Level</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300">Class 10 & 12 exams</p>
    </div>
    <ChevronDown className="hidden sm:block h-6 w-6 text-gray-400" aria-hidden="true" />
    <div className="text-center">
      <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
        <BookOpen className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-black text-gray-900 dark:text-white">Bachelors Level</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300">UG entrance exams</p>
    </div>
    <ChevronDown className="hidden sm:block h-6 w-6 text-gray-400" aria-hidden="true" />
    <div className="text-center">
      <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
        <Award className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-black text-gray-900 dark:text-white">Masters Level</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300">PG entrance exams</p>
    </div>
  </div>
);

const ScholarshipsSection = () => {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const data = await quizApi.getScholarships();
        setScholarships(data);
      } catch (error) {
        console.error('Failed to fetch scholarships:', error);
      }
    };
    fetchScholarships();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">Available Scholarships</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">Financial aid opportunities to support your education</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scholarships.slice(0, 6).map((scholarship) => (
          <a
            key={scholarship.id}
            href={`/scholarships/${scholarship.id}`}
            className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                <Award className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 text-base font-bold text-gray-900 dark:text-white truncate">{scholarship.title}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{scholarship.description}</p>
                {scholarship.open && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    Open
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const { isDark } = useTheme();
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <BackgroundCanvas isDark={isDark} />

      <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Hero />

        <WelcomeBack />

        <QuizLevels />

        <ScholarshipsSection />

        <ToolsGrid />

        <PathToSuccess />

        <JoinMission />

        <CommunitySection />
      </div>
    </div>
  );
};

export default Home;