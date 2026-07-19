import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getMyHousingListings, updateHousingListingStatus } from '../utils/housingApi';
import { getListingTypeLabel } from '../utils/housingUtils';
import usePageSeo from '../hooks/usePageSeo';

const statusConfig = {
  pending_review: { label: 'Pending review', icon: Clock, class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  active: { label: 'Live', icon: CheckCircle, class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  filled: { label: 'Filled', icon: CheckCircle, class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  inactive: { label: 'Inactive', icon: XCircle, class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  rejected: { label: 'Rejected', icon: XCircle, class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const MyListings = () => {
  usePageSeo({
    title: 'My Housing Listings | JMI Quiz',
    description: 'Manage your PG and hostel listings on JMI Quiz.',
    path: '/student-housing/my-listings',
  });

  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMyHousingListings();
      setListings(res.data?.listings || []);
    } catch {
      setMessage('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateHousingListingStatus(id, status);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
            <Building2 className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} aria-hidden />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Listings</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track approval and manage your posts</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/student-housing/post')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-md"
        >
          <Plus className="w-4 h-4" aria-hidden />
          New listing
        </button>
      </motion.div>

      {message && <p className="text-sm text-red-600 mb-4">{message}</p>}

      {loading ? (
        <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading…</div>
      ) : listings.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No listings yet</p>
          <button type="button" onClick={() => navigate('/student-housing/post')} className="text-emerald-600 font-semibold text-sm">
            Post your first PG or hostel →
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {listings.map((listing) => {
            const cfg = statusConfig[listing.status] || statusConfig.pending_review;
            const StatusIcon = cfg.icon;
            return (
              <li
                key={listing.id}
                className={`rounded-2xl border p-5 shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${cfg.class}`}>
                      <StatusIcon className="w-3 h-3" aria-hidden />
                      {cfg.label}
                    </span>
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{listing.title}</h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getListingTypeLabel(listing.listingType)} · {listing.address}
                    </p>
                  </div>
                  {listing.status === 'active' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatus(listing.id, 'filled')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        Mark filled
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatus(listing.id, 'inactive')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                      >
                        Deactivate
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MyListings;
