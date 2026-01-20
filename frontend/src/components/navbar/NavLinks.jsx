import { useAuth } from '../../context/AuthContext';
import NavLink from './NavLink';
import PropTypes from 'prop-types';

const NavLinks = ({ links, onLinkClick }) => {
  const { isAuthenticated } = useAuth();

  return (
    <ul className="flex space-x-1 overflow-x-auto">
      {links.map((link) => {
        // Hide protected links if not authenticated
        if (link.protected && !isAuthenticated) return null;
        
        return (
          <li key={link.path}>
            <NavLink to={link.path} onClick={onLinkClick}>
              {link.name}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
};

NavLinks.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      protected: PropTypes.bool,
    })
  ).isRequired,
  onLinkClick: PropTypes.func,
};

export default NavLinks;
