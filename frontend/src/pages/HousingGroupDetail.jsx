import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { redirectToSignIn } from '../utils/requireAuth';
import {
  getHousingGroup,
  requestJoinHousingGroup,
  handleHousingGroupJoinRequest,
  leaveHousingGroup,
  updateHousingGroupStatus,
  revealHousingGroupContact,
} from '../utils/housingApi';
import {
  getGenderLabel,
  GROUP_STATUS_LABELS,
  formatBudget,
  formatMoveInDate,
  buildTelHref,
  buildWhatsAppHref,
  formatPhoneDisplay,
} from '../utils/housingUtils';

const HousingGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  usePageSeo({
    title: group ? `${group.name} | Roommate Group` : 'Roommate Group | JMI Student Housing',
    description: group?.description || 'Student roommate group near JMI.',
    path: `/student-housing/groups/${id}`,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Student Housing', path: '/student-housing' },
      { name: group?.name || 'Group', path: `/student-housing/groups/${id}` },
    ],
  });

  const loadGroup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getHousingGroup(id);
      if (res.success) setGroup(res.data);
      else setError(res.message || 'Group not found');
    } catch (err) {
      setError(err.message || 'Could not load group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
  }, [id]);

  const inviteUrl =
    group?.inviteCode && typeof window !== 'undefined'
      ? `${window.location.origin}/student-housing/groups/join/${group.inviteCode}`
      : '';

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestJoin = async () => {
    if (!isAuthenticated) {
      redirectToSignIn(navigate, `/student-housing/groups/${id}`);
      return;
    }
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await requestJoinHousingGroup(id, joinMessage);
      setMessage({ type: 'success', text: res.message || 'Request sent' });
      await loadGroup();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Request failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    setActionLoading(true);
    try {
      await handleHousingGroupJoinRequest(id, requestId, status);
      await loadGroup();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Action failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this group?')) return;
    setActionLoading(true);
    try {
      await leaveHousingGroup(id);
      navigate('/student-housing/my-groups');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Could not leave group' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseGroup = async () => {
    if (!window.confirm('Close this group? It will no longer accept members.')) return;
    setActionLoading(true);
    try {
      await updateHousingGroupStatus(id, 'closed');
      await loadGroup();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Could not close group' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevealContact = async () => {
    if (!isAuthenticated) {
      redirectToSignIn(navigate, `/student-housing/groups/${id}`);
      return;
    }
    setActionLoading(true);
    try {
      const res = await revealHousingGroupContact(id);
      if (res.success) setContact(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Could not reveal contact' });
    } finally {
      setActionLoading(false);
    }
  };

  const cardClass = `rounded-2xl border p-6 ${
    isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200 shadow-lg'
  }`;

  if (loading) {
    return (
      <div className={`text-center py-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Loading group…
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {error || 'Group not found'}
        </p>
        <Link to="/student-housing" className="text-violet-600 font-semibold">
          ← Back to housing
        </Link>
      </div>
    );
  }

  const isMember = group.membership?.isMember;
  const isCreator = group.membership?.isCreator;
  const canJoin =
    !isMember &&
    group.status === 'recruiting' &&
    group.currentSize < group.targetSize &&
    !group.myJoinRequest?.status;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-violet-600 text-white text-xs font-semibold rounded-full">
            {GROUP_STATUS_LABELS[group.status]}
          </span>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-semibold rounded-full">
            {getGenderLabel(group.genderPreference)}
          </span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-semibold rounded-full">
            {group.currentSize}/{group.targetSize} members
          </span>
        </div>

        <h1 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {group.name}
        </h1>

        {group.description && (
          <p className={`text-sm leading-relaxed mb-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {group.description}
          </p>
        )}

        <div className={`grid sm:grid-cols-2 gap-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {group.preferredArea && (
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-500 shrink-0" aria-hidden />
              {group.preferredArea}
            </p>
          )}
          {group.budgetPerPerson != null && (
            <p className="flex items-center gap-2 font-semibold text-violet-600 dark:text-violet-400">
              <IndianRupee className="w-4 h-4 shrink-0" aria-hidden />
              {formatBudget(group.budgetPerPerson)}
            </p>
          )}
          {group.moveInDate && (
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-500 shrink-0" aria-hidden />
              Move-in: {formatMoveInDate(group.moveInDate)}
            </p>
          )}
          {group.creator && (
            <p className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500 shrink-0" aria-hidden />
              Created by {group.creator.name}
            </p>
          )}
        </div>
      </motion.div>

      {/* Members */}
      <div className={cardClass}>
        <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Members</h2>
        <ul className="space-y-2">
          {group.members?.map((m) => (
            <li
              key={m.id}
              className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                isDark ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}
            >
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{m.name}</span>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 capitalize">
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Creator: invite link */}
      {isCreator && inviteUrl && (
        <div className={cardClass}>
          <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Invite friends
          </h2>
          <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Share this link — friends join instantly without approval.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteUrl}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
            />
            <button
              type="button"
              onClick={handleCopyInvite}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold flex items-center gap-1"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {group.whatsappGroupLink && (
            <a
              href={group.whatsappGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-green-600"
            >
              <MessageCircle className="w-4 h-4" aria-hidden />
              Open WhatsApp group
            </a>
          )}
        </div>
      )}

      {/* Member: WhatsApp group link */}
      {isMember && !isCreator && group.whatsappGroupLink && (
        <div className={cardClass}>
          <a
            href={group.whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-600"
          >
            <MessageCircle className="w-4 h-4" aria-hidden />
            Join group WhatsApp chat
          </a>
        </div>
      )}

      {/* Creator: pending requests */}
      {isCreator && group.pendingRequests?.length > 0 && (
        <div className={cardClass}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Join requests
          </h2>
          <ul className="space-y-3">
            {group.pendingRequests.map((req) => (
              <li
                key={req.id}
                className={`p-4 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200'}`}
              >
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{req.user.name}</p>
                {req.message && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{req.message}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleRequestAction(req.id, 'approved')}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleRequestAction(req.id, 'rejected')}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Join flow */}
      {canJoin && (
        <div className={cardClass}>
          <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Request to join
          </h2>
          <textarea
            value={joinMessage}
            onChange={(e) => setJoinMessage(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Introduce yourself (optional)"
            className={`w-full px-4 py-3 rounded-xl border mb-3 text-sm ${
              isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200'
            }`}
          />
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleRequestJoin}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold disabled:opacity-60"
          >
            {actionLoading ? 'Sending…' : 'Send join request'}
          </button>
        </div>
      )}

      {group.myJoinRequest?.status === 'pending' && !isMember && (
        <div className={`${cardClass} text-center`}>
          <p className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            Your join request is pending approval
          </p>
        </div>
      )}

      {/* PG owners contact */}
      {!isMember && group.status !== 'closed' && (
        <div className={cardClass}>
          <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Have a flat or PG for this group?
          </h2>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Contact the group creator directly.
          </p>
          {!contact ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRevealContact}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-60"
            >
              {isAuthenticated ? 'Show contact' : 'Login to contact'}
            </button>
          ) : (
            <div className="flex flex-wrap gap-3">
              {contact.contactPhone && buildTelHref(contact.contactPhone) && (
                <a
                  href={buildTelHref(contact.contactPhone)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold"
                >
                  <Phone className="w-4 h-4" aria-hidden />
                  {formatPhoneDisplay(contact.contactPhone)}
                </a>
              )}
              {buildWhatsAppHref(contact.whatsappNumber || contact.contactPhone) && (
                <a
                  href={buildWhatsAppHref(contact.whatsappNumber || contact.contactPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden />
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Member actions */}
      {isMember && !isCreator && (
        <button
          type="button"
          disabled={actionLoading}
          onClick={handleLeave}
          className="flex items-center gap-2 text-sm font-semibold text-red-600 disabled:opacity-60"
        >
          <LogOut className="w-4 h-4" aria-hidden />
          Leave group
        </button>
      )}

      {isCreator && group.status !== 'closed' && (
        <button
          type="button"
          disabled={actionLoading}
          onClick={handleCloseGroup}
          className="text-sm font-semibold text-red-600 disabled:opacity-60"
        >
          Close group
        </button>
      )}

      {message.text && (
        <p className={`text-sm font-medium ${message.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
          {message.text}
        </p>
      )}

      <div
        className={`flex gap-3 p-4 rounded-2xl border text-xs ${
          isDark ? 'border-amber-900/40 bg-amber-900/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-900'
        }`}
        role="note"
      >
        <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden />
        <p>
          Meet in public places, verify identities, and never pay large sums without seeing the property. JMI Quiz
          does not mediate roommate agreements.
        </p>
      </div>

      <Link to="/student-housing" className="inline-block text-sm font-semibold text-violet-600">
        ← Back to student housing
      </Link>
    </div>
  );
};

export default HousingGroupDetail;
