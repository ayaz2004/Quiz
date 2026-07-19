import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import { joinHousingGroupByInvite } from '../utils/housingApi';
import usePageSeo from '../hooks/usePageSeo';

const JoinGroup = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('joining');
  const [error, setError] = useState('');

  usePageSeo({
    title: 'Join Roommate Group | JMI Student Housing',
    description: 'Join a student roommate group near JMI via invite link.',
    path: `/student-housing/groups/join/${inviteCode}`,
  });

  useEffect(() => {
    let cancelled = false;
    const join = async () => {
      setStatus('joining');
      try {
        const res = await joinHousingGroupByInvite(inviteCode);
        if (!cancelled && res.success) {
          setStatus('success');
          setTimeout(() => {
            navigate(`/student-housing/groups/${res.data.groupId}`);
          }, 1200);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setError(err.message || 'Could not join group');
        }
      }
    };

    join();
    return () => {
      cancelled = true;
    };
  }, [inviteCode, navigate]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <Users className="w-12 h-12 mx-auto mb-4 text-violet-600 dark:text-violet-400" aria-hidden />

      {status === 'joining' && (
        <>
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-violet-600" aria-hidden />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Joining group…</p>
        </>
      )}

      {status === 'success' && (
        <p className="text-lg font-semibold text-emerald-600">Joined! Redirecting…</p>
      )}

      {status === 'error' && (
        <>
          <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Could not join</p>
          <p className="text-sm mb-6 text-gray-600 dark:text-gray-400">{error}</p>
          <Link to="/student-housing" className="text-violet-600 font-semibold text-sm">
            Back to housing →
          </Link>
        </>
      )}
    </div>
  );
};

export default JoinGroup;
