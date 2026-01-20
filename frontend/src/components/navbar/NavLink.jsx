import { NavLink as RouterNavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';

const NavLink = ({ to, children, onClick }) => {
  const { isDark } = useTheme();

  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-4 py-3 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
          isActive
            ? `${isDark ? 'text-blue-400 border-blue-400' : 'text-blue-600 border-blue-600'} border-b-2`
            : `${isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`
        }`
      }
    >
      {children}
    </RouterNavLink>
  );
};

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

export default NavLink;
