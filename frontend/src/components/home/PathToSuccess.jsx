import { motion as Motion, useReducedMotion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const steps = [
  { step: '01', title: 'Sign Up Free', description: 'Create your account instantly and start practicing', gradient: 'from-emerald-500 to-teal-500' },
  { step: '02', title: 'Take Quizzes', description: 'Practice with authentic previous year question papers', gradient: 'from-blue-500 to-cyan-500' },
  { step: '03', title: 'Analyze Results', description: 'Review detailed insights and identify weak areas', gradient: 'from-purple-500 to-pink-500' },
  { step: '04', title: 'Ace the Exam', description: 'Achieve your dream score with confidence', gradient: 'from-orange-500 to-red-500' },
];

const PathToSuccess = () => {
  const reduceMotion = useReducedMotion();

  return (
    <Motion.section
      aria-labelledby="home-path-title"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative z-10 overflow-hidden rounded-3xl border border-emerald-300/60 bg-gradient-to-br from-white/95 to-emerald-50/95 p-5 shadow-lg dark:border-white/10 dark:from-emerald-500/10 dark:to-blue-500/10 sm:p-8 lg:p-12"
    >
      <Motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 opacity-20 blur-3xl sm:h-96 sm:w-96"
      />

      <div className="relative z-10">
        <div className="mb-8 text-center">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 text-emerald-600 dark:text-emerald-400 sm:h-14 sm:w-14" aria-hidden="true" />
          <h2 id="home-path-title" className="mb-2 text-2xl font-black text-gray-900 dark:text-white sm:text-4xl">
            Your Path to Success
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-700 dark:text-gray-300">
            Follow these simple steps and transform your preparation
          </p>
        </div>

        <ol className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {steps.map((item, index) => (
            <Motion.li
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative text-center"
            >
              {index < steps.length - 1 && (
                <div aria-hidden="true" className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-emerald-500/50 to-blue-500/50 md:block" />
              )}
              <div className={`relative z-10 mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-xl font-black text-white shadow-xl sm:h-20 sm:w-20 sm:text-2xl`}>
                {item.step}
              </div>
              <h3 className="mb-1 text-base font-black text-gray-900 dark:text-white sm:text-lg">{item.title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
            </Motion.li>
          ))}
        </ol>
      </div>
    </Motion.section>
  );
};

export default PathToSuccess;
