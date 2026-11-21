import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BellRing, FileText, MessageCircleQuestion } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const steps = [
  { n: '1', t: 'Select type', d: 'Choose a program type.' },
  { n: '2', t: 'Pick course', d: 'Select the course.' },
  { n: '3', t: 'Read entries', d: 'See date, remark and source.' },
];

const ToolCard = ({ to, icon, title, desc, cta, gradient }) => {
  const Icon = icon;
  return (
  <Link
    to={to}
    className="group flex h-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-white/5"
  >
    <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow`}>
      <Icon className="h-6 w-6 text-white" aria-hidden="true" />
    </span>
    <h3 className="text-lg font-black text-gray-900 dark:text-white">{title}</h3>
    <p className="text-sm text-gray-700 dark:text-gray-300">{desc}</p>
    <span className="mt-auto inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
      {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </span>
  </Link>
  );
};

/** JMI result/syllabus lookup, result alerts, Ask a Question, attempts/analytics. */
const ToolsGrid = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section aria-labelledby="home-tools-title" className="relative z-10 space-y-4">
      <div>
        <h2 id="home-tools-title" className="text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
          More Than Quizzes
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Results, alerts, doubts and your progress</p>
      </div>

      {/* JMI results & syllabus */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-300/60 bg-gradient-to-br from-emerald-50 to-blue-50 p-5 shadow-sm dark:border-emerald-400/20 dark:from-emerald-500/10 dark:to-blue-500/10 sm:p-6">
        <div className="relative z-10 grid gap-5 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-white/80 px-3 py-1.5 text-xs font-bold text-gray-900 dark:bg-white/10 dark:text-white">
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              JMI Syllabus &amp; Result Lookup
            </span>
            <h3 className="text-xl font-black leading-tight text-gray-900 dark:text-white sm:text-2xl">
              Search JMI syllabus and result entries in a clean web view.
            </h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Pick a program type and course to open the official syllabus or result list instantly.
            </p>
            <Link
              to="/jmi-result"
              className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 text-sm font-bold text-white shadow-lg sm:text-base"
            >
              Open Syllabus &amp; Result Search <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <ol className="grid grid-cols-3 gap-2 md:grid-cols-1">
            {steps.map((s) => (
              <li key={s.n} className="flex flex-col items-center gap-2 rounded-2xl border border-white/60 bg-white/80 p-3 text-center dark:border-white/10 dark:bg-white/5 md:flex-row md:text-left">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-black text-white">{s.n}</span>
                <span>
                  <span className="block text-sm font-bold text-gray-900 dark:text-white">{s.t}</span>
                  <span className="hidden text-xs text-gray-700 dark:text-gray-300 sm:block">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ToolCard
          to="/tracked-results"
          icon={BellRing}
          gradient="from-amber-500 to-orange-600"
          title="Result Tracking & Alerts"
          desc="Track a course and get notified when its result is published."
          cta={isAuthenticated ? 'Open tracked results' : 'Sign in to track results'}
        />
        <ToolCard
          to="/ask-question"
          icon={MessageCircleQuestion}
          gradient="from-pink-500 to-rose-600"
          title="Ask a Question"
          desc="Stuck on a doubt or a paper? Ask and get an answer from the team."
          cta="Ask now"
        />
        <ToolCard
          to="/attempts"
          icon={BarChart3}
          gradient="from-blue-500 to-purple-600"
          title="Attempts & Analytics"
          desc="Review past attempts, accuracy and subject-wise performance."
          cta={isAuthenticated ? 'View my attempts' : 'Sign in to see analytics'}
        />
      </div>
    </section>
  );
};

export default ToolsGrid;
