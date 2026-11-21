import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserStats } from '../../utils/quizApi';

const Stat = ({ label, value }) => (
  <div className="min-w-0 rounded-xl bg-white/70 px-3 py-2 text-center dark:bg-white/5">
    <div className="text-lg font-black text-gray-900 dark:text-white">{value}</div>
    <div className="truncate text-xs font-medium text-gray-600 dark:text-gray-300">{label}</div>
  </div>
);

/** Short strip for signed-in users who already have attempts (GET /api/quiz/stats). */
const WelcomeBack = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;

    getUserStats()
      .then((res) => {
        if (!cancelled && res?.success) setStats(res.data);
      })
      .catch(() => {
        /* the strip is optional; stay hidden on failure */
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || !stats || !stats.totalAttempts) return null;

  const name = user?.email?.split('@')[0];
  const accuracy = stats.overallAccuracy ?? stats.averagePercentage;

  return (
    <section
      aria-label="Your progress"
      className="relative z-10 rounded-3xl border border-emerald-300/60 bg-emerald-50/90 p-4 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-500/10 sm:p-5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black text-gray-900 dark:text-white">
            Welcome back{name ? `, ${name}` : ''}!
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">Here is how your practice is going.</p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:w-96">
          <Stat label="Attempts" value={stats.totalAttempts} />
          <Stat label="Avg score" value={`${Math.round(stats.averagePercentage)}%`} />
          <Stat label="Accuracy" value={`${Math.round(accuracy)}%`} />
        </div>

        <div className="flex gap-2">
          <Link
            to="/attempts"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 md:flex-none"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            My analytics
          </Link>
          <Link
            to="/quizzes"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-600 px-4 text-sm font-bold text-emerald-800 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-500/10 md:flex-none"
          >
            Practice <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WelcomeBack;
