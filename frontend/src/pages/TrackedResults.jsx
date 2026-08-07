import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bell, BellRing, ExternalLink, Trash2, BellOff } from 'lucide-react';
import usePageSeo from '../hooks/usePageSeo';
import { useTheme } from '../context/ThemeContext';
import {
  getResultNotifications,
  getTrackedCourses,
  markNotificationsRead,
  removeTrackedCourse,
} from '../utils/resultTrackApi';
import { enablePushNotifications, isPushSupported } from '../utils/pushNotifications';

const TrackedResults = () => {
  usePageSeo({
    title: 'Tracked Results | JMI Quiz',
    description: 'Track JMI entrance results and get notified when new results are declared',
    path: '/tracked-results',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Tracked Results', path: '/tracked-results' },
    ],
  });

  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get('n');

  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pushStatus, setPushStatus] = useState('');
  const [pushBusy, setPushBusy] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [coursesRes, notifRes] = await Promise.all([
        getTrackedCourses(),
        getResultNotifications(),
      ]);

      if (!coursesRes.success) throw new Error(coursesRes.message || 'Failed to load courses');
      if (!notifRes.success) throw new Error(notifRes.message || 'Failed to load notifications');

      setCourses(coursesRes.data.courses || []);
      setNotifications(notifRes.data.notifications || []);
      setUnreadCount(notifRes.data.unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Unable to load tracked results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!highlightId || !notifications.length) return;

    const id = Number(highlightId);
    const match = notifications.find((n) => n.id === id);
    if (!match) return;

    const course = courses.find(
      (c) =>
        c.courseTypeId === match.courseTypeId &&
        c.courseNameId === match.courseNameId &&
        (c.phdDisciplineId || '') === (match.phdDisciplineId || '')
    );
    if (course) {
      setExpandedId(course.id);
    }

    if (!match.readAt) {
      markNotificationsRead({ ids: [match.id] })
        .then(() => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === match.id ? { ...n, readAt: new Date().toISOString() } : n))
          );
          setUnreadCount((c) => Math.max(0, c - 1));
        })
        .catch(() => {});
    }
  }, [highlightId, notifications, courses]);

  const highlightedNotification = useMemo(() => {
    if (!highlightId) return null;
    return notifications.find((n) => String(n.id) === String(highlightId)) || null;
  }, [highlightId, notifications]);

  const handleEnablePush = async () => {
    try {
      setPushBusy(true);
      setPushStatus('');
      await enablePushNotifications();
      setPushStatus('Browser notifications enabled.');
    } catch (err) {
      setPushStatus(err.message || 'Could not enable notifications.');
    } finally {
      setPushBusy(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeTrackedCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      setError(err.message || 'Unable to remove course');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead({ all: true });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err.message || 'Unable to mark notifications read');
    }
  };

  const clearHighlight = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('n');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Tracked Results
        </h1>
        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          We check the JMI portal every 15 minutes for your tracked courses and notify you by browser push and email when results change.
        </p>
      </div>

      <div
        className={`rounded-2xl border p-4 sm:p-5 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <BellRing className={`mt-0.5 h-5 w-5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Browser notifications
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isPushSupported()
                  ? 'Enable push so you get alerts even when this tab is closed.'
                  : 'Push is not supported in this browser. You will still get email alerts.'}
              </p>
              {pushStatus && (
                <p className={`mt-1 text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {pushStatus}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            disabled={!isPushSupported() || pushBusy}
            onClick={handleEnablePush}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
          >
            <Bell className="h-4 w-4" />
            {pushBusy ? 'Enabling…' : 'Enable notifications'}
          </button>
        </div>
      </div>

      {highlightedNotification && (
        <div
          className={`rounded-2xl border p-4 ${isDark ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {highlightedNotification.title}
              </p>
              <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {highlightedNotification.body}
              </p>
              {highlightedNotification.resultLink && (
                <a
                  href={highlightedNotification.resultLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300"
                >
                  Open result link <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={clearHighlight}
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading…</p>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your courses ({courses.length})
              </h2>
              <Link
                to="/jmi-result"
                className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}
              >
                Add from Results & Syllabus →
              </Link>
            </div>

            {courses.length === 0 ? (
              <div
                className={`rounded-2xl border border-dashed p-8 text-center ${isDark ? 'border-white/10 text-gray-400' : 'border-gray-200 text-gray-600'}`}
              >
                <BellOff className="mx-auto mb-3 h-8 w-8 opacity-70" />
                <p>No courses tracked yet.</p>
                <Link
                  to="/jmi-result"
                  className="mt-3 inline-block text-sm font-semibold text-emerald-600 dark:text-emerald-300"
                >
                  Browse JMI results and track a course
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => {
                  const results = course.snapshot?.results || [];
                  const isOpen = expandedId === course.id;
                  return (
                    <div
                      key={course.id}
                      id={`track-${course.id}`}
                      className={`rounded-2xl border p-4 ${
                        isOpen
                          ? isDark
                            ? 'border-emerald-400/40 bg-emerald-500/5'
                            : 'border-emerald-300 bg-emerald-50/60'
                          : isDark
                            ? 'border-white/10 bg-white/5'
                            : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <button
                          type="button"
                          className="flex-1 text-left"
                          onClick={() => setExpandedId(isOpen ? null : course.id)}
                        >
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {course.courseName}
                          </p>
                          <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {course.courseTypeName}
                            {course.snapshot?.lastChangedAt
                              ? ` · Updated ${new Date(course.snapshot.lastChangedAt).toLocaleString()}`
                              : course.snapshot?.lastCheckedAt
                                ? ` · Checked ${new Date(course.snapshot.lastCheckedAt).toLocaleString()}`
                                : ' · Waiting for first check'}
                          </p>
                          <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {results.length} cached result row{results.length === 1 ? '' : 's'}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(course.id)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm ${isDark ? 'text-red-300 hover:bg-white/5' : 'text-red-600 hover:bg-red-50'}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>

                      {isOpen && (
                        <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,1)' }}>
                          {results.length === 0 ? (
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              No result rows cached yet. We will notify you when JMI publishes an update.
                            </p>
                          ) : (
                            results.map((row) => (
                              <div
                                key={`${row.courseName}-${row.date}-${row.remark}`}
                                className={`rounded-xl border p-3 text-sm ${isDark ? 'border-white/10 bg-black/20' : 'border-gray-100 bg-gray-50'}`}
                              >
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {row.courseName}
                                </p>
                                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {row.date || '—'} · {row.remark || '—'}
                                </p>
                                {row.link && (
                                  <a
                                    href={row.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-300"
                                  >
                                    Open source <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notifications {unreadCount > 0 ? `(${unreadCount} unread)` : ''}
              </h2>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No result alerts yet.
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setSearchParams({ n: String(n.id) });
                      const course = courses.find(
                        (c) =>
                          c.courseTypeId === n.courseTypeId &&
                          c.courseNameId === n.courseNameId &&
                          (c.phdDisciplineId || '') === (n.phdDisciplineId || '')
                      );
                      if (course) setExpandedId(course.id);
                    }}
                    className={`block w-full rounded-xl border p-3 text-left ${
                      !n.readAt
                        ? isDark
                          ? 'border-emerald-400/30 bg-emerald-500/10'
                          : 'border-emerald-200 bg-emerald-50'
                        : isDark
                          ? 'border-white/10 bg-white/5'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {n.title}
                    </p>
                    <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default TrackedResults;
