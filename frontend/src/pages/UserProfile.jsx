import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateProfile, changePassword } from '../utils/api';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profilePhoto || null);

  const qualificationOptions = [
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9',
    'Class 10', 'Class 11', 'Class 12', 'Bachelors', 'Masters'
  ];

  const [formData, setFormData] = useState({
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    location: user?.location || '',
    qualification: user?.qualification || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        qualification: user.qualification || ''
      }));
      setImagePreview(user.profilePhoto);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should not exceed 2MB' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {};
      
      // Only include fields that have changed
      if (formData.email !== user?.email) {
        updateData.email = formData.email;
      }
      if (formData.phoneNumber !== (user?.phoneNumber || '')) {
        updateData.phoneNumber = formData.phoneNumber || null;
      }
      if (formData.location !== (user?.location || '')) {
        updateData.location = formData.location || null;
      }
      if (formData.qualification !== (user?.qualification || '')) {
        updateData.qualification = formData.qualification || null;
      }

      // Check if anything changed
      if (Object.keys(updateData).length === 0 && !profileImage) {
        setMessage({ type: 'error', text: 'No changes to save' });
        setLoading(false);
        return;
      }

      // Handle profile image upload if changed
      if (profileImage) {
        // TODO: Upload image to cloudinary and get URL
        // For now, we'll just include the data URL
        updateData.profilePhoto = imagePreview;
      }

      const response = await updateProfile(updateData);
      if (response.data.success) {
        await refreshUser();
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setProfileImage(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setFormData(prev => ({ 
          ...prev, 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '' 
        }));
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent`}>
            My Profile
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your account settings and personal information
          </p>
        </motion.div>

        {/* Message Alert */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}

        {/* Profile Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className={`px-6 py-5 border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Profile Information
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative group">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-emerald-500/20"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg ring-4 ring-emerald-500/20">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {user?.email?.split('@')[0]}
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.email}
                  </p>
                  {isEditing && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                      Max image size: 2MB • Recommended: 400x400px
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isEditing
                        ? isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : isDark
                        ? 'bg-gray-900 border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+1 234 567 8900"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isEditing
                        ? isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : isDark
                        ? 'bg-gray-900 border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Location Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Current Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="City, Country"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isEditing
                        ? isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : isDark
                        ? 'bg-gray-900 border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Qualification Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Highest Qualification
                  </label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isEditing
                        ? isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : isDark
                        ? 'bg-gray-900 border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <option value="">Select Qualification</option>
                    {qualificationOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                  >
                    Edit Profile
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(prev => ({
                          ...prev,
                          email: user?.email || '',
                          phoneNumber: user?.phoneNumber || '',
                          location: user?.location || '',
                          qualification: user?.qualification || ''
                        }));
                        setImagePreview(user?.profilePhoto);
                        setProfileImage(null);
                      }}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      Cancel
                    </motion.button>
                  </>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className={`px-6 py-5 border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Security Settings
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
