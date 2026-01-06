import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const AuthLayout = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Minimal Header */}
      <header className={`${
        isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/70 border-gray-200'
      } border-b backdrop-blur-md`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                JMI Quiz
              </span>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
