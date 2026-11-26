import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  getMonetization,
  updateFeatureLimit,
  setUserPlan,
  saveMonthlyCost,
  deleteMonthlyCost,
} from '../../utils/adminApi';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const money = (v) => (v === null || v === undefined ? '—' : inr.format(v));
const monthLabel = (m) =>
  new Date(`${m}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
const currentMonth = () => new Date().toISOString().slice(0, 7);

const card = 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6';
const input = 'px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm';
const button = 'px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50';
const th = 'text-left px-3 py-2 font-semibold text-gray-600 dark:text-gray-300';
const td = 'px-3 py-2 text-gray-800 dark:text-gray-200';

const errorText = (error) => error.response?.data?.message || error.message || 'Something went wrong';

const Stat = ({ label, value }) => (
  <div className={card}>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
  </div>
);

Stat.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node };

const FeatureLimitCard = ({ feature, onSaved, onError }) => {
  const [limit, setLimit] = useState(feature.freeLimit ?? '');
  const [enforced, setEnforced] = useState(feature.enforced);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      await updateFeatureLimit(feature.key, limit === '' ? null : parseInt(limit, 10), enforced);
      onSaved(`${feature.label}: saved`);
    } catch (error) {
      onError(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={card}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{feature.label}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {feature.enforced
          ? 'Enforced: free users are blocked once they reach the limit.'
          : 'Not enforced: everyone has unlimited use; the limit below is only measured.'}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="number"
          min="0"
          placeholder="Unlimited"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className={`${input} w-32`}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input type="checkbox" checked={enforced} onChange={(e) => setEnforced(e.target.checked)} />
          Enforce for free users
        </label>
        <button type="button" onClick={save} disabled={saving} className={button}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Of {feature.activeUsers} users active in the {feature.window}, how many would have reached each limit:
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr><th className={th}>Free limit</th><th className={th}>Users who reach it</th><th className={th}>Share</th></tr>
        </thead>
        <tbody>
          {feature.impact.map((row) => (
            <tr key={row.limit} className={row.limit === feature.freeLimit ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}>
              <td className={td}>{row.limit}{row.limit === feature.freeLimit ? ' (current)' : ''}</td>
              <td className={td}>{row.users}</td>
              <td className={td}>{row.percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

FeatureLimitCard.propTypes = {
  feature: PropTypes.object.isRequired,
  onSaved: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const Monetization = ({ onSuccess, onError }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cost, setCost] = useState({ month: currentMonth(), item: '', amount: '' });
  const [grant, setGrant] = useState({ email: '', expires: '' });

  const load = async () => {
    try {
      setLoading(true);
      setData((await getMonetization()).data);
    } catch (error) {
      onError(errorText(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /** Resolves to whether [action] succeeded. */
  const run = async (action, message) => {
    try {
      await action();
      onSuccess(message);
      load();
      return true;
    } catch (error) {
      onError(errorText(error));
      return false;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  if (!data) return null;

  const thisMonth = data.months[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Monetization</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Free-plan limits, who would hit them, and what running the app costs per active user.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label={`Active users, ${monthLabel(thisMonth.month)}`} value={thisMonth.activeUsers} />
        <Stat label="Revenue this month" value={money(thisMonth.revenue)} />
        <Stat label="Cost per active user" value={money(thisMonth.costPerActiveUser)} />
        <Stat label="Pro users / all users" value={`${data.proUsers.length} / ${data.totalUsers}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {data.features.map((f) => (
          <FeatureLimitCard
            key={`${f.key}-${f.freeLimit}-${f.enforced}`}
            feature={f}
            onSaved={(msg) => { onSuccess(msg); load(); }}
            onError={onError}
          />
        ))}
      </div>

      <div className={card}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">By month</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Month</th><th className={th}>Active users</th><th className={th}>New sign-ups</th>
                <th className={th}>Revenue</th><th className={th}>Cost</th><th className={th}>Cost / active user</th>
              </tr>
            </thead>
            <tbody>
              {data.months.map((m) => (
                <tr key={m.month} className="border-t border-gray-100 dark:border-gray-700">
                  <td className={td}>{monthLabel(m.month)}</td>
                  <td className={td}>{m.activeUsers}</td>
                  <td className={td}>{m.newUsers}</td>
                  <td className={td}>{money(m.revenue)}</td>
                  <td className={td}>{money(m.cost)}</td>
                  <td className={td}>{money(m.costPerActiveUser)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className={card}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Running costs</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Server, database, Cloudinary, email… Saving the same item and month again replaces the amount.
          </p>
          <form
            className="flex flex-wrap gap-2 mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => saveMonthlyCost(cost.month, cost.item, Number(cost.amount)), 'Cost saved')
                .then((ok) => ok && setCost((c) => ({ ...c, item: '', amount: '' })));
            }}
          >
            <input type="month" required value={cost.month} onChange={(e) => setCost({ ...cost, month: e.target.value })} className={input} />
            <input placeholder="Item, e.g. Server" required value={cost.item} onChange={(e) => setCost({ ...cost, item: e.target.value })} className={`${input} flex-1 min-w-32`} />
            <input type="number" min="0" step="any" placeholder="₹" required value={cost.amount} onChange={(e) => setCost({ ...cost, amount: e.target.value })} className={`${input} w-28`} />
            <button type="submit" className={button}>Save</button>
          </form>
          <table className="w-full text-sm">
            <tbody>
              {data.costs.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className={td}>{monthLabel(c.month)}</td>
                  <td className={td}>{c.item}</td>
                  <td className={td}>{money(c.amount)}</td>
                  <td className={`${td} text-right`}>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => run(() => deleteMonthlyCost(c.id), 'Cost deleted')}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={card}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Pro users</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Give someone Pro by email. Leave the end date empty for no end date.
          </p>
          <form
            className="flex flex-wrap gap-2 mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => setUserPlan(grant.email, 'pro', grant.expires || null), `${grant.email} is now Pro`)
                .then((ok) => ok && setGrant({ email: '', expires: '' }));
            }}
          >
            <input type="email" placeholder="user@email.com" required value={grant.email} onChange={(e) => setGrant({ ...grant, email: e.target.value })} className={`${input} flex-1 min-w-40`} />
            <input type="date" value={grant.expires} onChange={(e) => setGrant({ ...grant, expires: e.target.value })} className={input} />
            <button type="submit" className={button}>Give Pro</button>
          </form>
          <table className="w-full text-sm">
            <tbody>
              {data.proUsers.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className={td}>{u.email}</td>
                  <td className={td}>{u.planExpiresAt ? `until ${new Date(u.planExpiresAt).toLocaleDateString('en-IN')}` : 'no end date'}</td>
                  <td className={`${td} text-right`}>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => run(() => setUserPlan(u.email, 'free'), `${u.email} is back on Free`)}>
                      Remove Pro
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

Monetization.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default Monetization;
