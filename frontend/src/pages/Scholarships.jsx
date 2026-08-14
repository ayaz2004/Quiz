import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  Building2,
  Search,
  Filter,
  CalendarDays,
  IndianRupee,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import usePageSeo from '../hooks/usePageSeo';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const Scholarships = () => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [scholarshipsList, setScholarshipsList] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', label: 'All Categories' }]);
  const [loading, setLoading] = useState(false);

  usePageSeo({
    title: 'Scholarships | JMI Quiz',
    description: 'Discover scholarships for school and college students with quick search, class filters, and clear application details.',
    path: '/scholarships',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Scholarships', path: '/scholarships' },
    ],
  });

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = { limit: 100 };
        if (query && query.trim()) params.search = query.trim();
        if (selectedCategory && selectedCategory !== 'all') {
          const catObj = categories.find((c) => String(c.id) === String(selectedCategory));
          if (catObj) params.category = catObj.label;
          else params.category = selectedCategory;
        }

        const res = await api.get('/api/scholarships', { params });
        const data = res.data?.data || {};
        const list = data.scholarships || [];
        if (cancelled) return;
        setScholarshipsList(list);

        // derive categories from returned data
        const seen = new Map();
        list.forEach((s) => {
          if (s.categoryId && s.categoryLabel && !seen.has(s.categoryId)) seen.set(s.categoryId, { id: s.categoryId, label: s.categoryLabel });
        });
        // Merge derived categories with existing ones so dropdown doesn't shrink
        setCategories((prev) => {
          const prevNonAll = prev.filter((c) => String(c.id) !== 'all');
          const derivedList = Array.from(seen.values());
          const merged = [];
          const added = new Set();

          // keep previous order first
          prevNonAll.forEach((c) => { added.add(String(c.id)); merged.push(c); });
          // append any new categories found in derived
          derivedList.forEach((c) => { if (!added.has(String(c.id))) { added.add(String(c.id)); merged.push(c); } });

          return [{ id: 'all', label: 'All Categories' }, ...merged];
        });
      } catch (err) {
        setScholarshipsList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, selectedCategory]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('all');
  };

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-10"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-emerald-950/20 dark:via-gray-900 dark:to-cyan-950/20" />
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Sparkles className="h-4 w-4" />
            Scholarships that move with your ambition
          </div>
          <h1 className={`text-3xl font-black tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Unlock the right scholarship for your next step
          </h1>
          <p className={`max-w-2xl text-base md:text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Find opportunities that match your education level and get all the details you need to apply.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr_auto]">
          <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-white/5 text-gray-200' : 'border-gray-200 bg-white text-gray-700'}`}>
            <Search className="h-5 w-5 text-emerald-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a scholarship or provider name"
              className="w-full bg-transparent outline-none placeholder:text-gray-400"
            />
          </label>

          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
            <Filter className="h-5 w-5 text-emerald-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full bg-transparent outline-none ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:-translate-y-0.5"
          >
            Clear filters
          </button>
        </div>
      </motion.section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {scholarshipsList.length} scholarship{scholarshipsList.length === 1 ? '' : 's'} found
          </p>
          {(query || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={clearFilters}
              className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}
            >
              Reset filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border p-10 text-center">
            Loading scholarships...
          </div>
        ) : scholarshipsList.length === 0 ? (
          <div className={`rounded-3xl border p-10 text-center ${isDark ? 'border-white/10 bg-white/5 text-gray-300' : 'border-gray-200 bg-white text-gray-600'}`}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <Building2 className="h-7 w-7" />
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>No scholarships found</h2>
            <p className="mt-2 text-sm">Try a different keyword or switch to another class category.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
            >
              Reset and explore again
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {scholarshipsList.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`group flex h-full flex-col rounded-[1.75rem] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                      {item.categoryLabel}
                    </span>
                    {item.featured && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-300">
                        <Award className="h-3.5 w-3.5" />
                        Featured
                      </span>
                    )}
                  </div>
                  <div className={`rounded-xl p-2 ${isDark ? 'bg-white/10 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                    <IndianRupee className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className={`text-xl font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h2>
                  <p className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    <Building2 className="h-4 w-4" />
                    {item.provider}
                  </p>
                  <p className={`text-sm leading-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Amount / Benefit</p>
                    <p className={`mt-1 text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.amount}</p>
                  </div>
                  <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Application deadline</p>
                    <p className={`mt-1 flex items-center gap-2 text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <CalendarDays className="h-4 w-4 text-emerald-500" />
                      {item.deadline}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 pt-1">
                  <Link
                    to={`/scholarships/${item.id}`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:-translate-y-0.5"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.categoryLabel}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Scholarships;