import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';

const WHATSAPP_URL = 'https://chat.whatsapp.com/GmEU3AT97AtAwzwg0NIzjr?mode=gi_t';

const WhatsAppIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const CommunitySection = () => {
  const reduceMotion = useReducedMotion();

  return (
    <Motion.section
      aria-labelledby="home-community-title"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative z-10 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl border border-green-300/70 bg-gradient-to-br from-green-100/95 to-emerald-50/95 p-5 shadow-lg dark:border-green-400/20 dark:from-green-500/10 dark:to-emerald-500/5 sm:p-8 md:flex-row lg:p-12"
    >
      <Motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 opacity-20 blur-3xl sm:h-80 sm:w-80"
      />

      <div className="relative z-10 flex-1 text-center md:text-left">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-white/90 px-3 py-1.5 text-sm font-bold text-green-800 dark:bg-green-500/10 dark:text-green-300">
          <Users className="h-5 w-5 text-green-600" aria-hidden="true" />
          Community &amp; Support
        </span>
        <h2 id="home-community-title" className="mb-3 text-2xl font-black text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
          Have Queries or Need Papers?
        </h2>
        <p className="mx-auto mb-6 max-w-2xl text-base text-gray-700 dark:text-gray-300 md:mx-0 lg:text-lg">
          Join our dedicated WhatsApp group to discuss AMU &amp; JMI entrance exam strategies, clear your doubts, or request specific previous year question papers to be added to the platform.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#128C7E] to-[#0b6b5f] px-6 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          <WhatsAppIcon className="h-6 w-6" />
          Join Group
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </a>
      </div>

      {/* Floating graphic: hidden on phones to save vertical space */}
      <div className="relative hidden w-1/3 justify-center md:flex" aria-hidden="true">
        <Motion.div
          animate={reduceMotion ? undefined : { y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-44 w-44 items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-green-400/20 dark:bg-white/5"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-green-500 opacity-20 blur-3xl" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-xl">
              <WhatsAppIcon className="h-10 w-10" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Official Group</p>
          </div>
          <Motion.div
            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 3, delay: 1, repeat: Infinity }}
            className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <Users className="h-5 w-5 text-green-500" />
          </Motion.div>
        </Motion.div>
      </div>
    </Motion.section>
  );
};

export default CommunitySection;
