import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getMyHousingGroups } from '../utils/housingApi';
import usePageSeo from '../hooks/usePageSeo';
import { GROUP_STATUS_LABELS, getGenderLabel } from '../utils/housingUtils';

const MyHousingGroups = () => {
  usePageSeo({
    title: 'My Roommate Groups | JMI Student Housing',
    description: 'Manage your student housing groups near JMI.',
    path: '/student-housing/my-groups',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Student Housing', path: '/student-housing' },
      { name: 'My Groups', path: '/student-housing/my-groups' },
    ],
  });

  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyHousingGroups();
        if (res.success) setGroups(res.data?.groups || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCopy = async (group) => {
    if (!group.inviteCode) return;
    const url = `${window.location.origin}/student-housing/groups/join/${group.inviteCode}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(group.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-violet-900/30' : 'bg-violet-100'}`}>
            <Users className={`w-6 h-6 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} aria-hidden />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My groups</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Groups you created or joined
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/student-housing/groups/create')}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm"
        >
          <Plus className="w-4 h-4" aria-hidden />
          New group
        </button>
      </div>

      {loading ? (
        <p className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading…</p>
      ) : groups.length === 0 ? (
        <div
          className={`text-center py-16 rounded-2xl border ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
          }`}
        >
          <Users className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} aria-hidden />
          <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No groups yet</p>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create a group and invite friends to find housing together.
          </p>
          <button
            type="button"
            onClick={() => navigate('/student-housing/groups/create')}
            className="text-violet-600 font-semibold text-sm"
          >
            Create your first group →
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {groups.map((group, index) => (
            <motion.li
              key={group.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl border p-5 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-violet-600 text-white">
                      {GROUP_STATUS_LABELS[group.status]}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {getGenderLabel(group.genderPreference)}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 capitalize">
                      {group.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/student-housing/groups/${group.id}`)}
                    className={`text-lg font-bold text-left hover:text-violet-600 dark:hover:text-violet-400 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {group.name}
                  </button>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {group.currentSize}/{group.targetSize} members
                    {group.preferredArea ? ` · ${group.preferredArea}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {group.role === 'creator' && group.inviteCode && (
                    <button
                      type="button"
                      onClick={() => handleCopy(group)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-violet-500/40 text-violet-600 text-xs font-semibold"
                    >
                      {copiedId === group.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Invite link
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/student-housing/groups/${group.id}`)}
                    className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <Link to="/student-housing" className="inline-block mt-8 text-sm font-semibold text-violet-600">
        ← Back to student housing
      </Link>
    </div>
  );
};

export default MyHousingGroups;
