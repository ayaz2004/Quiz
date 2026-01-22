import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';

const UserMenu = ({ user, onLogout }) => {
  const { isDark } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    onLogout();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className={`text-sm font-medium hidden sm:block ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {user?.username}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
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
                to={user?.isAdmin ? "/admin?tab=profile" : "/profile"}
                className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </div>
              </NavLink>
              <button
                onClick={handleLogout}
                className={`w-full text-left px-4 py-2 text-sm text-red-600 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

UserMenu.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
    isAdmin: PropTypes.bool,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default UserMenu;
