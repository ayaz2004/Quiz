import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NavLinks from './navbar/NavLinks';
import UserMenu from './navbar/UserMenu';
import AuthButtons from './navbar/AuthButtons';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark } = useTheme();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Quizzes', path: '/quizzes' },
    { name: 'My Attempts', path: '/attempts', protected: true },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'About', path: '/about' },
  ];

  const handleLogout = () => {
    // Logout function in AuthContext now handles redirect
    logout();
  };

  return (
    <nav className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'} border-b transition-colors duration-200`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Navigation Links */}
          <NavLinks links={navLinks} />

          {/* Auth Section */}
          <div className="flex items-center space-x-3 py-2">
            {isAuthenticated ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
