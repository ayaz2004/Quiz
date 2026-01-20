import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Button from '../Button';

const AuthButtons = () => {
  const { isDark } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <NavLink to="/signin">
        <Button
          variant="secondary"
          size="sm"
          className={`${
            isDark 
              ? 'text-gray-200 hover:bg-gray-800 bg-transparent' 
              : 'text-gray-700 hover:bg-gray-200 bg-transparent'
          }`}
        >
          Sign In
        </Button>
      </NavLink>
      <NavLink to="/signup">
        <Button
          variant="primary"
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
        >
          Sign Up
        </Button>
      </NavLink>
    </div>
  );
};

export default AuthButtons;
