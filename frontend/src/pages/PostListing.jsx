import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Upload, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { createHousingListing } from '../utils/housingApi';
import usePageSeo from '../hooks/usePageSeo';

const LISTING_TYPES = [
  { value: 'pg', label: 'PG' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'room', label: 'Room' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Boys only' },
  { value: 'female', label: 'Girls only' },
  { value: 'any', label: 'Boys & Girls (co-ed)' },
];

const initialForm = {
  title: '',
  listingType: 'pg',
  genderPreference: '',
  address: '',
  area: '',
  rentMonthly: '',
  feeNotes: '',
  description: '',
  entryTiming: '',
  meals: '',
  visitors: '',
  amenities: '',
  contactPhone: '',
  whatsappNumber: '',
  mapsUrl: '',
  availability: 'Available',
};

const PostListing = () => {
  usePageSeo({
    title: 'Post PG / Hostel Listing | JMI Student Housing',
    description: 'List your PG or hostel near JMI for students on JMI Quiz.',
    path: '/student-housing/post',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Student Housing', path: '/student-housing' },
      { name: 'Post Listing', path: '/student-housing/post' },
    ],
  });

  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const inputClass = `w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 focus:ring-emerald-500 ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!form.genderPreference) {
      setMessage({ type: 'error', text: 'Please select who this listing is for (boys, girls, or co-ed)' });
      setLoading(false);
      return;
    }

    try {
      const amenities = form.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const listingData = {
        ...form,
        rentMonthly: form.rentMonthly === '' ? null : Number(form.rentMonthly),
        amenities,
      };

      const formData = new FormData();
      formData.append('listingData', JSON.stringify(listingData));
      images.forEach((file) => formData.append('images', file));

      const res = await createHousingListing(formData);
      setMessage({
        type: 'success',
        text: res.message || 'Listing submitted! It will appear after admin approval.',
      });
      setForm(initialForm);
      setImages([]);
      setTimeout(() => navigate('/student-housing/my-listings'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit listing' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
            <Building2 className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} aria-hidden />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Post a Listing</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              JMI · Jamia Nagar · Reviewed by admin before publishing
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl shadow-sm border overflow-hidden ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        {message.text && (
          <div
            className={`px-6 py-4 border-b text-sm ${
              message.type === 'success'
                ? isDark
                  ? 'bg-green-900/30 border-green-800 text-green-400'
                  : 'bg-green-50 border-green-200 text-green-700'
                : isDark
                  ? 'bg-red-900/30 border-red-800 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="title" className={labelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <input id="title" name="title" required maxLength={150} value={form.title} onChange={handleChange} className={inputClass} placeholder="e.g. Girls PG near Batla House" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="listingType" className={labelClass}>Type</label>
              <select id="listingType" name="listingType" value={form.listingType} onChange={handleChange} className={inputClass}>
                {LISTING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="genderPreference" className={labelClass}>
                For <span className="text-red-500">*</span>
              </label>
              <select
                id="genderPreference"
                name="genderPreference"
                required
                value={form.genderPreference}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select — boys, girls, or co-ed</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="address" className={labelClass}>Full address <span className="text-red-500">*</span></label>
            <textarea id="address" name="address" required rows={2} maxLength={500} value={form.address} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="area" className={labelClass}>Area</label>
              <input id="area" name="area" value={form.area} onChange={handleChange} className={inputClass} placeholder="Okhla Vihar, Batla House…" />
            </div>
            <div>
              <label htmlFor="rentMonthly" className={labelClass}>Monthly rent (₹)</label>
              <input id="rentMonthly" name="rentMonthly" type="number" min="0" value={form.rentMonthly} onChange={handleChange} className={inputClass} placeholder="3500" />
            </div>
          </div>

          <div>
            <label htmlFor="feeNotes" className={labelClass}>Fee details</label>
            <input id="feeNotes" name="feeNotes" value={form.feeNotes} onChange={handleChange} className={inputClass} placeholder="Rs. 3,500 two-seater; meals extra" />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea id="description" name="description" rows={3} maxLength={2000} value={form.description} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="entryTiming" className={labelClass}>Entry timing</label>
              <input id="entryTiming" name="entryTiming" value={form.entryTiming} onChange={handleChange} className={inputClass} placeholder="Till 10 p.m." />
            </div>
            <div>
              <label htmlFor="availability" className={labelClass}>Availability</label>
              <input id="availability" name="availability" value={form.availability} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="meals" className={labelClass}>Meals</label>
              <input id="meals" name="meals" value={form.meals} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="visitors" className={labelClass}>Visitors</label>
              <input id="visitors" name="visitors" value={form.visitors} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="amenities" className={labelClass}>Facilities (comma-separated)</label>
            <input id="amenities" name="amenities" value={form.amenities} onChange={handleChange} className={inputClass} placeholder="Wi-Fi, RO, AC, Cooler" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactPhone" className={labelClass}>Contact phone <span className="text-red-500">*</span></label>
              <input id="contactPhone" name="contactPhone" required value={form.contactPhone} onChange={handleChange} className={inputClass} placeholder="9876543210" />
            </div>
            <div>
              <label htmlFor="whatsappNumber" className={labelClass}>WhatsApp (optional)</label>
              <input id="whatsappNumber" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="mapsUrl" className={labelClass}>Google Maps link (optional)</label>
            <input id="mapsUrl" name="mapsUrl" type="url" value={form.mapsUrl} onChange={handleChange} className={inputClass} placeholder="https://maps.google.com/…" />
          </div>

          <div>
            <label htmlFor="images" className={labelClass}>Photos (max 3)</label>
            <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer ${
              isDark ? 'border-gray-600 hover:border-emerald-500' : 'border-gray-300 hover:border-emerald-500'
            }`}>
              <Upload className="w-5 h-5 text-emerald-600" aria-hidden />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {images.length ? `${images.length} file(s) selected` : 'Choose images'}
              </span>
              <input id="images" type="file" accept="image/*" multiple onChange={handleImages} className="sr-only" />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg disabled:opacity-60"
          >
            <Send className="w-4 h-4" aria-hidden />
            {loading ? 'Submitting…' : 'Submit for review'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PostListing;
