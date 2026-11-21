import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, BarChart3, Award, Clock, CheckCircle2, Zap, Shield, Sparkles, Target, Timer,
  Trophy, GraduationCap, BellRing, MessageCircleQuestion,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const quickLinks = [
  { to: '/quizzes', label: 'Quizzes', icon: Trophy },
  { to: '/scholarships', label: 'Scholarships', icon: GraduationCap },
  { to: '/jmi-result', label: 'Results & Syllabus', icon: Award },
  { to: '/tracked-results', label: 'Result Alerts', icon: BellRing },
  { to: '/ask-question', label: 'Ask a Question', icon: MessageCircleQuestion },
];

const features = [
  { label: 'Timed Tests', icon: Clock, color: 'from-blue-500 to-cyan-500' },
  { label: 'Instant Results', icon: Zap, color: 'from-purple-500 to-pink-500' },
  { label: 'Free Quizzes', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
];

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // GSAP: gentle floating of the [data-float] elements
  useEffect(() => {
    if (reduceMotion) return undefined;
    let active = true;
    const tweens = [];

    import('gsap').then(({ default: gsap }) => {
      if (!active || !heroRef.current) return;
      heroRef.current.querySelectorAll('[data-float]').forEach((el, index) => {
        tweens.push(
          gsap.to(el, {
            y: Math.sin(index + 1) * 20,
            x: Math.cos(index + 1) * 15,
            rotation: Math.sin(index + 1) * 5,
            duration: 3 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          })
        );
      });
    });

    return () => {
      active = false;
      tweens.forEach((tween) => tween.kill());
    };
  }, [reduceMotion]);

  const orbMotion = (from, to, duration) =>
    reduceMotion
      ? {}
      : {
          animate: { scale: [from, to, from], rotate: [0, 180, 360] },
          transition: { duration, repeat: Infinity, ease: 'linear' },
        };

  return (
    <section
      ref={heroRef}
      aria-labelledby="home-hero-title"
      className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6"
    >
      {/* Main hero card */}
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl p-5 shadow-xl sm:p-8 lg:col-span-8 lg:rounded-[2.5rem] lg:p-12"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        {/* Morphing gradient orbs (GSAP floats the wrappers, framer-motion morphs the orbs) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40" aria-hidden="true">
          <div data-float className="absolute -right-20 -top-20 h-64 w-64 sm:h-96 sm:w-96">
            <Motion.div
              {...orbMotion(1, 1.2, 20)}
              className="h-full w-full rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 blur-3xl"
            />
          </div>
          <div data-float className="absolute -bottom-20 -left-20 h-64 w-64 sm:h-96 sm:w-96">
            <Motion.div
              {...orbMotion(1.2, 1, 25)}
              className="h-full w-full rounded-full bg-gradient-to-tr from-purple-400 to-pink-500 blur-3xl"
            />
          </div>
        </div>

        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-gray-900 dark:bg-white/10 dark:text-white sm:text-sm">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            Complete AMU &amp; JMI Preparation Platform
          </div>

          <h1
            id="home-hero-title"
            className="mb-3 text-4xl font-black leading-[1.1] sm:text-5xl lg:text-7xl"
          >
            <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
              Master Your
            </span>
            <span className="text-gray-900 dark:text-white">Entrance Exam</span>
          </h1>
          <p className="sr-only">Quiz Platform - JMI and AMU PYQ, mock tests, and previous year questions</p>

          <p className="mb-6 max-w-2xl text-base font-medium text-gray-700 dark:text-gray-300 sm:text-lg lg:text-xl">
            JMI &amp; AMU previous year papers, timed mock tests, scholarships, result alerts and instant feedback — all in one place.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to={isAuthenticated ? '/quizzes' : '/signup'}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-3 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              {isAuthenticated ? 'Explore Quizzes' : 'Start Free Today'}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/about"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white/90 px-6 py-3 text-base font-bold text-gray-900 transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-white/20 dark:bg-white/10 dark:text-white"
            >
              How It Works
            </Link>
          </div>

          {/* Quick links: wrap instead of scrolling */}
          <nav aria-label="Quick links" className="mt-5 flex flex-wrap gap-2">
            {quickLinks.map(({ to, label, icon }) => {
              const Icon = icon;
              return (
              <Link
                key={to}
                to={to}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 text-sm font-semibold text-gray-800 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-white/15 dark:bg-white/5 dark:text-gray-100 dark:hover:text-emerald-300"
              >
                <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                {label}
              </Link>
              );
            })}
          </nav>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="rounded-2xl border border-gray-200 bg-white/90 p-3 text-center shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow sm:h-11 sm:w-11`}>
                  <feature.icon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div className="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">{feature.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Motion.div>

      {/* Side cards: desktop only, the same destinations are in the sections below */}
      <div className="hidden gap-6 lg:col-span-4 lg:grid lg:grid-rows-2">
        <Motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-between rounded-3xl border border-blue-300/60 bg-gradient-to-br from-white to-blue-50 p-8 shadow-xl dark:border-blue-400/30 dark:from-blue-500/10 dark:to-blue-500/10"
        >
          <div>
            <Motion.div
              animate={reduceMotion ? undefined : { rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl"
            >
              <BarChart3 className="h-7 w-7 text-white" aria-hidden="true" />
            </Motion.div>
            <h2 className="mb-2 text-2xl font-black text-gray-900 dark:text-white">Performance Analytics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Track your accuracy, time management, and view detailed score breakdowns
            </p>
          </div>
          <Link to="/attempts" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
            View Analytics <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col justify-between rounded-3xl border border-amber-300/60 bg-gradient-to-br from-white to-amber-50 p-8 shadow-xl dark:border-amber-400/30 dark:from-amber-500/10 dark:to-amber-500/10"
        >
          <div>
            <Motion.div
              animate={reduceMotion ? undefined : { scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl"
            >
              <Target className="h-7 w-7 text-white" aria-hidden="true" />
            </Motion.div>
            <h2 className="mb-2 text-2xl font-black text-gray-900 dark:text-white">Exam Ready</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Practice with negative marking and time limits just like the real exam
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2" aria-hidden="true">
            {[
              { icon: Timer, color: 'from-blue-500 to-cyan-500' },
              { icon: Shield, color: 'from-purple-500 to-pink-500' },
              { icon: Award, color: 'from-amber-500 to-orange-500' },
            ].map((item, i) => (
              <div key={i} className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${item.color} shadow`}>
                <item.icon className="h-4 w-4 text-white" />
              </div>
            ))}
          </div>
        </Motion.div>
      </div>
    </section>
  );
};

export default Hero;
