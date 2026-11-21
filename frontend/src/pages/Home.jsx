import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getQuizzes } from '../utils/quizApi';
import usePageSeo from '../hooks/usePageSeo';
import QuizOverview from '../components/modals/QuizOverview';
import PurchaseModal from '../components/modals/PurchaseModal';
import BackgroundCanvas from '../components/home/BackgroundCanvas';
import Hero from '../components/home/Hero';
import WelcomeBack from '../components/home/WelcomeBack';
import QuizLevels from '../components/home/QuizLevels';
import ScholarshipsSection from '../components/home/ScholarshipsSection';
import ToolsGrid from '../components/home/ToolsGrid';
import CommunitySection from '../components/home/CommunitySection';
import PathToSuccess from '../components/home/PathToSuccess';
import JoinMission from '../components/home/JoinMission';

const LEVEL_KEYS = ['school', 'undergrad', 'masters'];

const describeError = (error) => {
  if (error?.code === 'ECONNABORTED') {
    return 'The server is taking longer than usual to respond. This may be due to the free hosting service waking up. Please wait a moment and try again.';
  }
  if (error?.message?.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  return 'Failed to load quizzes. Please try again later.';
};

const Home = () => {
  usePageSeo({
    title: 'JMI PYQ & AMU PYQ Quiz Platform | Home',
    description: 'Practice JMI PYQ and AMU PYQ quizzes with mock tests and previous year questions for entrance exam preparation.',
    path: '/',
    breadcrumbs: [{ name: 'Home', path: '/' }],
  });

  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [quizzesByLevel, setQuizzesByLevel] = useState({ school: [], undergrad: [], masters: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [purchaseQuiz, setPurchaseQuiz] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      // One request per level keeps the three tabs balanced
      const responses = await Promise.all(
        LEVEL_KEYS.map((educationLevel) => getQuizzes({ limit: 6, educationLevel }))
      );
      const next = {};
      LEVEL_KEYS.forEach((key, i) => {
        next[key] = responses[i]?.success ? responses[i].data.quizzes : [];
      });
      setQuizzesByLevel(next);
      setError(null);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const retry = () => {
    setLoading(true);
    setError(null);
    fetchQuizzes();
  };

  const handlePurchaseClick = (quiz) => {
    setPurchaseQuiz(quiz);
    setSelectedQuiz(null);
  };

  const handlePurchaseSuccess = () => {
    fetchQuizzes();
    alert('Purchase successful! You can now access this quiz.');
  };

  return (
    <div className="relative space-y-8 pb-10 sm:space-y-12 lg:space-y-16">
      <BackgroundCanvas isDark={isDark} />

      <Hero />
      {isAuthenticated && <WelcomeBack />}
      <QuizLevels
        quizzesByLevel={quizzesByLevel}
        loading={loading}
        error={error}
        onRetry={retry}
        onSelect={setSelectedQuiz}
      />
      <ScholarshipsSection />
      <ToolsGrid />
      <CommunitySection />
      <PathToSuccess />
      <JoinMission />

      {selectedQuiz && (
        <QuizOverview
          quiz={selectedQuiz}
          isOpen
          onClose={() => setSelectedQuiz(null)}
          onPurchase={handlePurchaseClick}
        />
      )}

      {purchaseQuiz && (
        <PurchaseModal
          quiz={purchaseQuiz}
          isOpen
          onClose={() => setPurchaseQuiz(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default Home;
