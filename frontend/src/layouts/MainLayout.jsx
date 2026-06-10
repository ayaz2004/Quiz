import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = () => {
  const location = useLocation();
  const isQuizPage = location.pathname.startsWith('/quiz/') && !location.pathname.includes('/result');
  const isJmiResultPage = location.pathname.startsWith('/jmi-result');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {!isQuizPage && <Header />}
      <main className={isJmiResultPage ? 'flex-grow w-full px-0 py-0' : 'flex-grow container mx-auto px-4 py-6 md:py-8'}>
        <Outlet />
      </main>
      {!isQuizPage && <Footer />}
    </div>
  );
};

export default MainLayout;
