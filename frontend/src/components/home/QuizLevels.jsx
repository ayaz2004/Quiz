import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { ArrowRight, BookOpen, GraduationCap, Trophy } from 'lucide-react';
import QuizCard from '../quiz-browser/QuizCard';

const LEVELS = [
  { key: 'school', label: 'School', title: 'School Level', blurb: 'Foundation quizzes for entrance exam preparation', icon: BookOpen, accent: 'from-blue-500 to-blue-600' },
  { key: 'undergrad', label: 'Bachelors', title: 'Bachelors Level', blurb: 'UG entrance preparation for AMU & JMI', icon: GraduationCap, accent: 'from-emerald-500 to-teal-600' },
  { key: 'masters', label: 'Masters', title: 'Masters Level', blurb: 'Advanced PG entrance preparation', icon: Trophy, accent: 'from-purple-500 to-indigo-600' },
];

const MAX_PER_TAB = 3;

const QuizTile = ({ quiz, index, onSelect }) => (
  <Motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    role="button"
    tabIndex={0}
    aria-label={`Open quiz: ${quiz.title}`}
    onKeyDown={(e) => {
      if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onSelect(quiz);
      }
    }}
    className="rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
  >
    <QuizCard quiz={quiz} onClick={onSelect} index={index} />
  </Motion.div>
);

const Skeleton = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="mb-4 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mb-2 h-4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mb-4 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    ))}
  </div>
);

/** Previous-year quizzes grouped by level, switched with tabs so the page never stacks three long lists. */
const QuizLevels = ({ quizzesByLevel, loading, error, onRetry, onSelect }) => {
  const [active, setActive] = useState('undergrad');
  const level = LEVELS.find((l) => l.key === active);
  const quizzes = (quizzesByLevel[active] || []).slice(0, MAX_PER_TAB);

  const handleTabKeys = (e) => {
    const i = LEVELS.findIndex((l) => l.key === active);
    if (e.key === 'ArrowRight') setActive(LEVELS[(i + 1) % LEVELS.length].key);
    if (e.key === 'ArrowLeft') setActive(LEVELS[(i + LEVELS.length - 1) % LEVELS.length].key);
  };

  return (
    <section aria-labelledby="home-quizzes-title" className="relative z-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="home-quizzes-title" className="text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
            Previous Year Quizzes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{level.blurb}</p>
        </div>
        <Link to="/quizzes" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Link to="/jmi-pyq" className="inline-flex min-h-11 items-center rounded-full border border-gray-300 bg-white/90 px-4 text-sm font-semibold text-gray-800 dark:border-white/15 dark:bg-white/5 dark:text-gray-100">
          JMI PYQ
        </Link>
        <Link to="/amu-pyq" className="inline-flex min-h-11 items-center rounded-full border border-gray-300 bg-white/90 px-4 text-sm font-semibold text-gray-800 dark:border-white/15 dark:bg-white/5 dark:text-gray-100">
          AMU PYQ
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Education level"
        onKeyDown={handleTabKeys}
        className="mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-gray-200/80 p-1 dark:bg-white/10"
      >
        {LEVELS.map((l) => {
          const selected = l.key === active;
          return (
            <button
              key={l.key}
              type="button"
              role="tab"
              id={`quiz-tab-${l.key}`}
              aria-selected={selected}
              aria-controls="quiz-tabpanel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(l.key)}
              className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-bold transition-colors ${
                selected
                  ? 'bg-white text-emerald-800 shadow dark:bg-gray-900 dark:text-emerald-300'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <l.icon className="hidden h-4 w-4 sm:block" aria-hidden="true" />
              {l.label}
            </button>
          );
        })}
      </div>

      <div id="quiz-tabpanel" role="tabpanel" aria-labelledby={`quiz-tab-${active}`}>
        {loading ? (
          <Skeleton />
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-5 text-center dark:border-red-400/30 dark:bg-red-500/10">
            <p className="mb-3 text-sm text-red-800 dark:text-red-200">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 rounded-xl bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white/90 p-6 text-center text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
            No {level.label.toLowerCase()} quizzes yet. <Link to="/quizzes" className="font-semibold text-emerald-700 underline dark:text-emerald-300">Browse all quizzes</Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz, index) => (
              <QuizTile key={quiz.id} quiz={quiz} index={index} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizLevels;
