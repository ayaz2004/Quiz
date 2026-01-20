import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';

const SearchAndSort = ({ 
  searchTerm, 
  onSearchChange, 
  selectedSubject, 
  onSubjectChange, 
  selectedYear, 
  onYearChange,
  subjects = [],
  years = []
}) => {
  const { isDark } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search quizzes..."
          className={`w-full px-4 py-3 pl-11 rounded-xl border transition-all duration-200 ${
            isDark
              ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
        />
        <svg
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Subject Filter */}
      <select
        value={selectedSubject}
        onChange={(e) => onSubjectChange(e.target.value)}
        className={`px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
          isDark
            ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500'
            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
        } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
      >
        <option value="">All Subjects</option>
        {subjects.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>

      {/* Year Filter */}
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        className={`px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
          isDark
            ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500'
            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
        } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
      >
        <option value="">All Years</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

SearchAndSort.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedSubject: PropTypes.string.isRequired,
  onSubjectChange: PropTypes.func.isRequired,
  selectedYear: PropTypes.string.isRequired,
  onYearChange: PropTypes.func.isRequired,
  subjects: PropTypes.arrayOf(PropTypes.string),
  years: PropTypes.arrayOf(PropTypes.number),
};

export default SearchAndSort;
