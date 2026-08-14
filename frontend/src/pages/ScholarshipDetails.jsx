import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  IndianRupee,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Users,
  ExternalLink,
} from 'lucide-react';
import usePageSeo from '../hooks/usePageSeo';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const DetailRow = ({ label, value, isDark }) => (
  <div className="flex items-start justify-between gap-4 border-b border-dashed border-gray-200 pb-3 last:border-b-0 last:pb-0 dark:border-white/10">
    <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
    <span className={`text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</span>
  </div>
);

const ScholarshipDetails = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { scholarshipId } = useParams();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchScholarship = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await api.get(`/api/scholarships/${scholarshipId}`);
        const data = res.data?.data || null;
        if (!cancelled) setScholarship(data);
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
        else console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchScholarship();
    return () => { cancelled = true; };
  }, [scholarshipId]);

  usePageSeo({
    title: scholarship ? `${scholarship.title} | Scholarships` : 'Scholarship Details | JMI Quiz',
    description: scholarship ? scholarship.description : 'Browse scholarship details, eligibility, required documents, and how to apply.',
    path: `/scholarships/${scholarshipId || ''}`,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Scholarships', path: '/scholarships' },
    ],
  });

  if (loading) {
    return (
      <div className={`rounded-3xl border p-8 text-center ${isDark ? 'border-white/10 bg-white/5 text-gray-300' : 'border-gray-200 bg-white text-gray-600'}`}>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading scholarship...</h1>
      </div>
    );
  }

  if (notFound || !scholarship) {
    return (
      <div className={`rounded-3xl border p-8 text-center ${isDark ? 'border-white/10 bg-white/5 text-gray-300' : 'border-gray-200 bg-white text-gray-600'}`}>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Scholarship not found</h1>
        <p className="mt-2 text-sm">The scholarship you selected is not available.</p>
        <button
          type="button"
          onClick={() => navigate('/scholarships')}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Scholarships
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/scholarships" className={`inline-flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to Scholarships
        </Link>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[2rem] border p-6 md:p-8 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {scholarship.categoryLabel}
              </span>
              {scholarship.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Featured
                </span>
              )}
            </div>
            <h1 className={`text-3xl font-black tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{scholarship.title}</h1>
            <p className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
              <Building2 className="h-4 w-4" />
              {scholarship.provider}
            </p>
            <p className={`max-w-3xl text-base leading-7 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{scholarship.about}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[26rem] lg:grid-cols-1">
            <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Scholarship amount</p>
              <p className={`mt-2 flex items-center gap-2 text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <IndianRupee className="h-5 w-5 text-emerald-500" />
                {scholarship.amount}
              </p>
            </div>
            <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Deadline</p>
              <p className={`mt-2 flex items-center gap-2 text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <CalendarDays className="h-5 w-5 text-emerald-500" />
                {scholarship.deadline}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className={`rounded-[1.75rem] border p-6 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
          <h2 className={`mb-4 text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
          <div className="space-y-3 text-sm">
            <DetailRow label="Scholarship Name" value={scholarship.title} isDark={isDark} />
            <DetailRow label="Provider" value={scholarship.provider} isDark={isDark} />
            <DetailRow label="Category" value={scholarship.categoryLabel} isDark={isDark} />
            <DetailRow label="Amount / Benefit" value={scholarship.amount} isDark={isDark} />
            <DetailRow label="Deadline" value={scholarship.deadline} isDark={isDark} />
          </div>
        </div>

        <div className={`rounded-[1.75rem] border p-6 lg:col-span-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
          <h2 className={`mb-4 text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>About the Scholarship</h2>
          <p className={`text-sm leading-7 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{scholarship.about}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className={`rounded-[1.75rem] border p-6 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
          <h2 className={`mb-4 flex items-center gap-2 text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Eligibility
          </h2>
          <ul className="space-y-3">
            {scholarship.eligibility.map((item) => (
              <li key={item} className={`flex items-start gap-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="mt-2 h-2 w-2 flex-none rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`rounded-[1.75rem] border p-6 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
          <h2 className={`mb-4 flex items-center gap-2 text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FileText className="h-5 w-5 text-cyan-500" />
            Required Documents
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {scholarship.documents.map((item) => (
              <div key={item} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-white/10 bg-black/20 text-gray-200' : 'border-gray-100 bg-gray-50 text-gray-700'}`}>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className={`rounded-[1.75rem] border p-6 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
          <h2 className={`mb-4 flex items-center gap-2 text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <ListChecks className="h-5 w-5 text-emerald-500" />
            How to Apply
          </h2>
          <ol className="space-y-3">
            {scholarship.steps.map((step, index) => (
              <li key={step} className={`flex items-start gap-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">{index + 1}</span>
                <span className="pt-1 leading-6">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className={`rounded-[1.75rem] border p-6 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
          <h2 className={`mb-4 flex items-center gap-2 text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            Important Information
          </h2>
          <p className={`text-sm leading-7 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{scholarship.importantInfo}</p>
          <div className={`mt-5 rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              <Users className="h-4 w-4" />
              Eligibility summary
            </div>
            <p className={`text-sm leading-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              A short checklist is shown on the scholarship card, while the full eligibility rules and documents are presented here for easy scanning.
            </p>
          </div>
        </div>
      </section>

      <section className={`rounded-[1.75rem] border p-6 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Apply Now</h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>This button uses a placeholder URL for the UI-only version.</p>
          </div>
          <a
            href={scholarship.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:-translate-y-0.5"
          >
            Apply Now
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default ScholarshipDetails;