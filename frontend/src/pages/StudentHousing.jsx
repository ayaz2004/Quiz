import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  ShieldAlert,
  Building2,
  Sparkles,
  MapPin,
  Phone,
  Users,
  Home,
  Plus,
  List,
} from 'lucide-react';
import usePageSeo from '../hooks/usePageSeo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import HousingCard from '../components/housing/HousingCard';
import HousingDetailModal from '../components/housing/HousingDetailModal';
import CommunityHousingCard from '../components/housing/CommunityHousingCard';
import CommunityHousingDetailModal from '../components/housing/CommunityHousingDetailModal';
import HousingStatsBar from '../components/housing/HousingStatsBar';
import { getCommunityListings, getHousingGroups } from '../utils/housingApi';
import { AVAILABILITY_LABELS, GENDER_FILTER_LABELS, filterHousingListings, getAvailabilityKind, matchesGenderFilter } from '../utils/housingUtils';
import GroupCard from '../components/housing/GroupCard';
import { goWithAuth, redirectToSignIn, redirectToSignUp } from '../utils/requireAuth';
import housingData from '../data/gio-jamia-nagar-girls-hostels.json';

const GROUPS_TAB_PATH = '/student-housing?tab=groups';

const LISTED_DEFAULT_GENDER = housingData.source?.gender || 'female';

const SOURCE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'listed', label: 'Hostels & PGs' },
  { id: 'community', label: 'Community' },
  { id: 'groups', label: 'Roommate Groups' },
];

const heroCardStyle = (isDark) => ({
  background: isDark
    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(139, 92, 246, 0.12) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.97) 0%, rgba(236, 253, 245, 0.97) 100%)',
  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(16,185,129,0.16)',
  backdropFilter: 'blur(18px)',
});

const filterCardStyle = (isDark) => ({
  background: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.96)',
  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16,185,129,0.18)',
});

const inputStyle = (isDark) => ({
  background: isDark ? '#0f172a' : '#fff',
  color: isDark ? '#fff' : '#111827',
  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.28)',
});

const StudentHousing = () => {
  usePageSeo({
    title: 'PGs & Hostels near JMI Jamia Nagar | Student Housing',
    description:
      'PGs and hostels in Jamia Nagar near JMI for boys and girls. Filter by gender, browse listings, or post your own.',
    path: '/student-housing',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Student Housing', path: '/student-housing' },
    ],
  });

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark } = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sourceTab, setSourceTab] = useState('all');
  const [selectedListedListing, setSelectedListedListing] = useState(null);
  const [selectedCommunityListing, setSelectedCommunityListing] = useState(null);
  const [communityListings, setCommunityListings] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState('');
  const [housingGroups, setHousingGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState('');

  const { listings: rawListings } = housingData;

  const listedHostels = useMemo(
    () =>
      rawListings.map((listing) => ({
        ...listing,
        genderPreference: listing.genderPreference || LISTED_DEFAULT_GENDER,
      })),
    [rawListings]
  );

  useEffect(() => {
    let cancelled = false;
    const loadCommunity = async () => {
      setCommunityLoading(true);
      setCommunityError('');
      try {
        const res = await getCommunityListings({ limit: 50 });
        if (!cancelled && res.success) {
          setCommunityListings(res.data?.listings || []);
        }
      } catch {
        if (!cancelled) setCommunityError('Could not load community listings');
      } finally {
        if (!cancelled) setCommunityLoading(false);
      }
    };
    loadCommunity();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setHousingGroups([]);
      setGroupsLoading(false);
      setGroupsError('');
      return undefined;
    }

    let cancelled = false;
    const loadGroups = async () => {
      setGroupsLoading(true);
      setGroupsError('');
      try {
        const res = await getHousingGroups({ limit: 50 });
        if (!cancelled && res.success) {
          setHousingGroups(res.data?.groups || []);
        }
      } catch {
        if (!cancelled) setGroupsError('Could not load roommate groups');
      } finally {
        if (!cancelled) setGroupsLoading(false);
      }
    };
    loadGroups();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const filteredListedHostels = useMemo(
    () => filterHousingListings(listedHostels, { search, availability, gender: genderFilter }),
    [listedHostels, search, availability, genderFilter]
  );

  const filteredCommunityListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return communityListings.filter((listing) => {
      const kind = getAvailabilityKind(listing.availability);
      if (availability !== 'all' && kind !== availability) return false;
      if (!matchesGenderFilter(listing.genderPreference, genderFilter)) return false;
      if (!q) return true;
      const haystack = [listing.title, listing.address, listing.area, listing.description, listing.feeNotes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [communityListings, search, availability, genderFilter]);

  const filteredHousingGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return housingGroups.filter((group) => {
      if (!matchesGenderFilter(group.genderPreference, genderFilter)) return false;
      if (!q) return true;
      const haystack = [group.name, group.description, group.preferredArea]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [housingGroups, search, genderFilter]);

  const displayCount = useMemo(() => {
    if (sourceTab === 'listed') return filteredListedHostels.length;
    if (sourceTab === 'community') return filteredCommunityListings.length;
    if (sourceTab === 'groups') return filteredHousingGroups.length;
    return filteredListedHostels.length + filteredCommunityListings.length;
  }, [sourceTab, filteredListedHostels, filteredCommunityListings, filteredHousingGroups]);

  const stats = useMemo(() => {
    let available = 0;
    let pgCount = 0;
    let hostelCount = 0;
    for (const listing of listedHostels) {
      if (getAvailabilityKind(listing.availability) === 'available') available += 1;
      if (listing.listingType === 'pg') pgCount += 1;
      if (listing.listingType === 'hostel') hostelCount += 1;
    }
    return { total: listedHostels.length, available, pgCount, hostelCount, community: communityListings.length, groups: housingGroups.length };
  }, [listedHostels, communityListings, housingGroups]);

  useEffect(() => {
    if (authLoading) return;
    const wantsGroups = searchParams.get('tab') === 'groups';
    if (!wantsGroups) return;

    if (!isAuthenticated) {
      redirectToSignIn(navigate, GROUPS_TAB_PATH);
      return;
    }
    setSourceTab('groups');
  }, [authLoading, isAuthenticated, searchParams, navigate]);

  const goToGroups = () => {
    if (!isAuthenticated) {
      redirectToSignIn(navigate, GROUPS_TAB_PATH);
      return;
    }
    setSourceTab('groups');
    setSearchParams({ tab: 'groups' });
  };

  const handleSourceTab = (tabId) => {
    if (tabId === 'groups' && !isAuthenticated) {
      redirectToSignIn(navigate, GROUPS_TAB_PATH);
      return;
    }
    setSourceTab(tabId);
    if (tabId === 'groups') {
      setSearchParams({ tab: 'groups' });
    } else {
      setSearchParams({});
    }
  };

  const goToCreateGroup = () => {
    goWithAuth(navigate, isAuthenticated, '/student-housing/groups/create');
  };

  const goToMyGroups = () => {
    goWithAuth(navigate, isAuthenticated, '/student-housing/my-groups');
  };

  const goToGroupDetail = (groupId) => {
    goWithAuth(navigate, isAuthenticated, `/student-housing/groups/${groupId}`);
  };

  const heroPills = [
    { icon: MapPin, label: 'Jamia Nagar' },
    { icon: Users, label: 'Boys & Girls' },
    { icon: Phone, label: 'Direct contact' },
  ];

  return (
    <div className="relative w-full space-y-10 overflow-x-hidden pb-20 md:space-y-12 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 w-full overflow-hidden rounded-[2rem] p-5 shadow-2xl sm:p-6 lg:p-10"
        style={heroCardStyle(isDark)}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.15, 1, 1.15], rotate: [360, 180, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 blur-3xl"
          />
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 items-start">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(16,185,129,0.22)',
              }}
            >
              <Sparkles className={`h-4 w-4 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} aria-hidden />
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                JMI Student Housing
              </span>
            </div>

            <h1
              className={`mt-6 text-3xl font-black leading-tight sm:text-4xl md:text-5xl ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              PGs &amp; Hostels near JMI
            </h1>

            <p
              className={`mt-5 max-w-2xl text-sm leading-7 sm:text-base ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Finding safe, affordable accommodation near Jamia Millia Islamia can be stressful during
              admission season. Browse PGs and hostels in Jamia Nagar for{' '}
              <strong className={isDark ? 'text-white' : 'text-gray-900'}>boys, girls, or co-ed</strong>
              , or post your own listing.
            </p>
            <p className={`mt-3 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Pre-loaded &quot;Hostels &amp; PGs&quot; listings are for girls only. Boys and co-ed options appear
              under Community when posted.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
              {heroPills.map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-semibold shadow-lg sm:px-4"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(148, 163, 184, 0.18)',
                  }}
                >
                  <item.icon className={`h-4 w-4 ${isDark ? 'text-cyan-300' : 'text-emerald-600'}`} aria-hidden />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative rounded-[2rem] border p-5 sm:p-6 shadow-2xl"
            style={filterCardStyle(isDark)}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                <Building2 className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} aria-hidden />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>List your PG</h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Jamia Nagar · near JMI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-4">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/student-housing/post' : '/signin')}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" aria-hidden />
                Post listing
              </button>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/student-housing/my-listings' : '/signin')}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <List className="w-4 h-4" aria-hidden />
                My listings
              </button>
              <button
                type="button"
                onClick={goToCreateGroup}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-violet-500/40 text-sm font-semibold text-violet-700 dark:text-violet-400 hover:bg-violet-500/10"
              >
                <Users className="w-4 h-4" aria-hidden />
                Create roommate group
              </button>
              <button
                type="button"
                onClick={goToMyGroups}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:underline"
              >
                My groups
              </button>
            </div>

            <div
              className="flex gap-3 p-4 rounded-2xl border"
              style={{
                background: isDark ? 'rgba(251, 191, 36, 0.08)' : 'rgba(254, 243, 199, 0.6)',
                borderColor: isDark ? 'rgba(251, 191, 36, 0.25)' : 'rgba(251, 191, 36, 0.4)',
              }}
              role="note"
            >
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                Verify rent and availability in person before paying. JMI Quiz is not affiliated with these hostels.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats */}
      <section>
        <HousingStatsBar
          total={stats.total}
          available={stats.available}
          pgCount={stats.pgCount}
          hostelCount={stats.hostelCount}
        />
      </section>

      {/* Filters */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-[2rem] border p-4 sm:p-6 shadow-xl"
        style={filterCardStyle(isDark)}
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {SOURCE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSourceTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                sourceTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.id === 'groups' && !isAuthenticated && (
                <span className="ml-1.5 text-[10px] uppercase opacity-80">· Sign in</span>
              )}
              {tab.id === 'community' && communityListings.length > 0 && (
                <span className="ml-1.5 opacity-80">({communityListings.length})</span>
              )}
              {tab.id === 'groups' && housingGroups.length > 0 && (
                <span className="ml-1.5 opacity-80">({housingGroups.length})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, area, or facility…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border outline-none transition focus:border-emerald-500"
              style={inputStyle(isDark)}
              aria-label="Search listings"
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl border outline-none transition focus:border-emerald-500 sm:min-w-[180px]"
            style={inputStyle(isDark)}
            aria-label="Filter by student type"
          >
            {Object.entries(GENDER_FILTER_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            disabled={sourceTab === 'groups'}
            className="px-4 py-3 rounded-2xl border outline-none transition focus:border-emerald-500 sm:min-w-[180px] disabled:opacity-50"
            style={inputStyle(isDark)}
            aria-label="Filter by availability"
          >
            {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing <strong className={isDark ? 'text-white' : 'text-gray-900'}>{displayCount}</strong>{' '}
          {sourceTab === 'groups' ? 'group' : 'listing'}
          {displayCount !== 1 ? 's' : ''}
          {communityError && sourceTab !== 'listed' && sourceTab !== 'groups' && (
            <span className="text-amber-600 dark:text-amber-400"> · {communityError}</span>
          )}
          {groupsError && sourceTab === 'groups' && (
            <span className="text-amber-600 dark:text-amber-400"> · {groupsError}</span>
          )}
        </p>
      </motion.section>

      {/* Listings */}
      <section>
        {(communityLoading && sourceTab === 'community') || (groupsLoading && sourceTab === 'groups') ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {sourceTab === 'groups' ? 'Loading roommate groups…' : 'Loading community listings…'}
          </div>
        ) : sourceTab === 'groups' && !isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-20 rounded-[2rem] border ${
              isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
            }`}
          >
            <Users className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} aria-hidden />
            <p className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sign in to use roommate groups
            </p>
            <p className={`text-sm mb-4 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Create or join a group with friends to find shared accommodation near JMI.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => redirectToSignIn(navigate, GROUPS_TAB_PATH)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => redirectToSignUp(navigate, GROUPS_TAB_PATH)}
                className="px-5 py-2.5 rounded-xl border border-violet-500/40 text-violet-700 dark:text-violet-400 text-sm font-semibold"
              >
                Create account
              </button>
            </div>
          </motion.div>
        ) : displayCount === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-20 rounded-[2rem] border ${
              isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
            }`}
          >
            <Home className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} aria-hidden />
            <p className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {sourceTab === 'groups' ? 'No roommate groups match your filters' : 'No listings match your filters'}
            </p>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {sourceTab === 'community'
                ? 'Be the first to post a PG or hostel near JMI.'
                : sourceTab === 'groups'
                  ? 'Create a group and invite friends to find housing together.'
                  : 'Try a different search or select "All" for availability.'}
            </p>
            {sourceTab === 'community' && (
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/student-housing/post' : '/signin')}
                className="text-emerald-600 font-semibold text-sm"
              >
                Post a listing →
              </button>
            )}
            {sourceTab === 'groups' && (
              <button
                type="button"
                onClick={goToCreateGroup}
                className="text-violet-600 font-semibold text-sm"
              >
                Create a group →
              </button>
            )}
          </motion.div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {(sourceTab === 'all' || sourceTab === 'listed') &&
              filteredListedHostels.map((listing, index) => (
                <li key={`listed-${listing.sn}`} className="h-full">
                  <HousingCard listing={listing} onSelect={setSelectedListedListing} index={index} />
                </li>
              ))}
            {(sourceTab === 'all' || sourceTab === 'community') &&
              filteredCommunityListings.map((listing, index) => (
                <li key={`community-${listing.id}`} className="h-full">
                  <CommunityHousingCard
                    listing={listing}
                    onSelect={setSelectedCommunityListing}
                    index={sourceTab === 'all' ? index + filteredListedHostels.length : index}
                  />
                </li>
              ))}
            {sourceTab === 'groups' &&
              filteredHousingGroups.map((group, index) => (
                <li key={`group-${group.id}`} className="h-full">
                  <GroupCard
                    group={group}
                    onSelect={(g) => goToGroupDetail(g.id)}
                    index={index}
                  />
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Roommate groups CTA */}
      <motion.footer
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-[2rem] p-6 sm:p-8 text-center shadow-xl"
        style={heroCardStyle(isDark)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 pointer-events-none" />
        <div className="relative">
          <Users className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} aria-hidden />
          <p className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Looking for roommates near JMI?
          </p>
          <p className={`text-sm max-w-lg mx-auto mb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Form a group with friends, set your budget and move-in date, and let PG owners reach you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={goToGroups}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-violet-700 dark:text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-colors"
            >
              Browse groups
            </button>
            <button
              type="button"
              onClick={goToCreateGroup}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md"
            >
              Create a group
            </button>
          </div>
        </div>
      </motion.footer>

      {selectedListedListing && (
        <HousingDetailModal listing={selectedListedListing} onClose={() => setSelectedListedListing(null)} />
      )}
      {selectedCommunityListing && (
        <CommunityHousingDetailModal
          listing={selectedCommunityListing}
          onClose={() => setSelectedCommunityListing(null)}
        />
      )}
    </div>
  );
};

export default StudentHousing;
