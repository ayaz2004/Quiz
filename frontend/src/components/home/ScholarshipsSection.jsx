import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CalendarDays, GraduationCap } from 'lucide-react';
import api from '../../utils/api';
import { formatScholarshipDate } from '../../utils/formatScholarshipDate';

const daysLeft = (deadline) => {
  const match = typeof deadline === 'string' && deadline.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const end = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end - today) / 86400000);
};

const DeadlineBadge = ({ deadline }) => {
  const days = daysLeft(deadline);
  if (days === null) return <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">No deadline announced</span>;
  const urgent = days <= 7;
  const text = days <= 0 ? 'Last day' : days === 1 ? '1 day left' : `${days} days left`;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${urgent ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200' : 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200'}`}>
      {text}
    </span>
  );
};

/** Open scholarships, nearest deadline first (GET /api/scholarships?open=true&sort=deadline). */
const ScholarshipsSection = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let cancelled = false;

    api
      .get('/api/scholarships', { params: { open: true, sort: 'deadline', limit: 3 } })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data?.data?.scholarships || []);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="home-scholarships-title" className="relative z-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="home-scholarships-title" className="text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
            Scholarships Closing Soon
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Open applications, nearest deadline first</p>
        </div>
        <Link to="/scholarships" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          All scholarships <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p role="alert" className="rounded-2xl border border-gray-200 bg-white/90 p-5 text-center text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
          Could not load scholarships right now. <Link to="/scholarships" className="font-semibold text-emerald-700 underline dark:text-emerald-300">Open the scholarships page</Link>
        </p>
      )}

      {status === 'ready' && items.length === 0 && (
        <p className="rounded-2xl border border-gray-200 bg-white/90 p-5 text-center text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
          No scholarships are open right now. <Link to="/scholarships" className="font-semibold text-emerald-700 underline dark:text-emerald-300">Check back on the scholarships page</Link>
        </p>
      )}

      {status === 'ready' && items.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="min-w-0">
              <Link
                to={`/scholarships/${item.id}`}
                className="flex h-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <GraduationCap className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="line-clamp-1">{(item.categoryLabels || []).join(' · ') || 'Scholarship'}</span>
                  </span>
                  <DeadlineBadge deadline={item.deadline} />
                </div>
                <h3 className="line-clamp-2 text-lg font-black leading-snug text-gray-900 dark:text-white">{item.title}</h3>
                <p className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="line-clamp-1">{item.provider}</span>
                </p>
                <p className="mt-auto flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CalendarDays className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  Deadline: {formatScholarshipDate(item.deadline)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ScholarshipsSection;
