import { motion as Motion } from 'framer-motion';
import { ArrowRight, BookOpen, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';

const JOIN_URL = 'https://chat.whatsapp.com/Fmy37lQACbHAGpcjsfiMow';

const roles = [
  { title: 'UI/UX Designer', skills: ['Comfortable with Figma / Canva', 'Improve user experience & design flow'], icon: Sparkles, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900/20' },
  { title: 'Quiz Content Creator', skills: ['Comfortable using LLMs (ChatGPT, Claude)', 'Basic knowledge of APIs/Postman is a plus'], icon: BookOpen, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/20' },
  { title: 'Full Stack Developer', skills: ['Familiar with JS, React, Node.js', 'Interest in AI tools (Copilot, Claude)'], icon: Zap, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  { title: 'Marketing / Content', skills: ['Create engaging content (Posts, threads)', 'Grow reach among JMI & AMU students'], icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
];

const JoinMission = () => (
  <Motion.section
    aria-labelledby="home-mission-title"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="relative z-10 overflow-hidden rounded-3xl border border-blue-300/60 bg-gradient-to-br from-blue-50/95 to-purple-50/95 p-5 shadow-lg dark:border-blue-400/20 dark:from-blue-500/10 dark:to-purple-500/5 sm:p-8 lg:p-12"
  >
    <div className="mb-8 text-center">
      <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-white/90 px-3 py-1.5 text-sm font-bold text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
        <Sparkles className="h-5 w-5 text-blue-500" aria-hidden="true" />
        Gain Real-Life Experience
      </span>
      <h2 id="home-mission-title" className="mb-3 text-2xl font-black text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
        Join Our Mission to Grow
      </h2>
      <p className="mx-auto max-w-2xl text-base text-gray-700 dark:text-gray-300">
        Want to help us build something great and learn along the way? We are looking for passionate people to join the team and make an impact.
      </p>
    </div>

    <ul className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {roles.map((role) => (
        <li key={role.title} className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 flex items-center gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${role.bg}`}>
              <role.icon className={`h-6 w-6 ${role.color}`} aria-hidden="true" />
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{role.title}</h3>
          </div>
          <ul className="space-y-2">
            {role.skills.map((skill) => (
              <li key={skill} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>

    <div className="flex justify-center">
      <a
        href={JOIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 px-8 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-auto"
      >
        <Users className="h-5 w-5" aria-hidden="true" />
        Join Group
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </a>
    </div>
  </Motion.section>
);

export default JoinMission;
