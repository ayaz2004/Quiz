import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Quizzes', path: '/quizzes' },
    { name: 'My Attempts', path: '/attempts', protected: true },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'About', path: '/about' },
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    window.location.href = '/';
  };

  return (
    <nav className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'} border-b transition-colors duration-200`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Navigation Links */}
          <ul className="flex space-x-1 overflow-x-auto">
            {navLinks.map((link) => {
              // Hide protected links if not authenticated
              if (link.protected && !isAuthenticated) return null;
              
              return (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `block px-4 py-3 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                        isActive
                          ? `${isDark ? 'text-blue-400 border-blue-400' : 'text-blue-600 border-blue-600'} border-b-2`
                          : `${isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* Auth Section */}
          <div className="flex items-center space-x-3 py-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm`}>
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {user?.username}
                  </span>
                  <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20 ${
                      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}>
                      <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                          {user?.username}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <NavLink
                          to="/attempts"
                          className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Attempts
                        </NavLink>
                        {user?.isAdmin && (
                          <NavLink
                            to="/admin"
                            className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setShowUserMenu(false)}
                          >
                            Admin Dashboard
                          </NavLink>
                        )}
                        <button
                          onClick={handleLogout}
                          className={`w-full text-left px-4 py-2 text-sm text-red-600 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink
                  to="/signin"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-200 hover:bg-gray-800' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/signup"
                  className={`px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg`}
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
