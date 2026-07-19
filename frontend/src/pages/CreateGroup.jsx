import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { createHousingGroup } from '../utils/housingApi';
import usePageSeo from '../hooks/usePageSeo';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Boys only' },
  { value: 'female', label: 'Girls only' },
  { value: 'any', label: 'Boys & Girls (co-ed)' },
];

const initialForm = {
  name: '',
  description: '',
  preferredArea: 'Jamia Nagar',
  targetSize: '3',
  budgetPerPerson: '',
  moveInDate: '',
  genderPreference: '',
  contactPhone: '',
  whatsappNumber: '',
  whatsappGroupLink: '',
};

const CreateGroup = () => {
  usePageSeo({
    title: 'Create Roommate Group | JMI Student Housing',
    description: 'Form a group with friends to find shared accommodation near JMI.',
    path: '/student-housing/groups/create',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Student Housing', path: '/student-housing' },
      { name: 'Create Group', path: '/student-housing/groups/create' },
    ],
  });

  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const inputClass = `w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 focus:ring-violet-500 ${
    isDark
      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
  }`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await createHousingGroup({
        ...form,
        targetSize: parseInt(form.targetSize, 10),
        budgetPerPerson: form.budgetPerPerson || undefined,
        moveInDate: form.moveInDate || undefined,
        whatsappNumber: form.whatsappNumber || undefined,
        whatsappGroupLink: form.whatsappGroupLink || undefined,
      });
      if (res.success) {
        navigate(`/student-housing/groups/${res.data.id}`);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to create group' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create group' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-violet-900/30' : 'bg-violet-100'}`}>
            <Users className={`w-6 h-6 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} aria-hidden />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create roommate group
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Team up to find a flat or PG near JMI
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Group name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={100}
              placeholder='e.g. "3 B.Tech students near JMI"'
              className={inputClass}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={2000}
              placeholder="What kind of place are you looking for?"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Group size *
              </label>
              <select name="targetSize" value={form.targetSize} onChange={handleChange} required className={inputClass}>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} students
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                For *
              </label>
              <select
                name="genderPreference"
                value={form.genderPreference}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select…</option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Preferred area
              </label>
              <input
                name="preferredArea"
                value={form.preferredArea}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Budget per person (Rs./month)
              </label>
              <input
                name="budgetPerPerson"
                type="number"
                min="0"
                value={form.budgetPerPerson}
                onChange={handleChange}
                placeholder="e.g. 5000"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Target move-in date
            </label>
            <input
              name="moveInDate"
              type="date"
              value={form.moveInDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Your phone *
              </label>
              <input
                name="contactPhone"
                type="tel"
                value={form.contactPhone}
                onChange={handleChange}
                required
                placeholder="10-digit mobile"
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                WhatsApp (optional)
              </label>
              <input
                name="whatsappNumber"
                type="tel"
                value={form.whatsappNumber}
                onChange={handleChange}
                placeholder="Same as phone if blank"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              WhatsApp group link (optional, shown to members)
            </label>
            <input
              name="whatsappGroupLink"
              type="url"
              value={form.whatsappGroupLink}
              onChange={handleChange}
              placeholder="https://chat.whatsapp.com/..."
              className={inputClass}
            />
          </div>

          {message.text && (
            <p
              className={`text-sm font-medium ${
                message.type === 'error' ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg disabled:opacity-60"
            >
              <Send className="w-4 h-4" aria-hidden />
              {loading ? 'Creating…' : 'Create group'}
            </button>
            <Link
              to="/student-housing"
              className="flex items-center justify-center px-6 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGroup;
