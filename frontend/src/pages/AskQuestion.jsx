import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, Send, ChevronLeft, MessageCircle, Mail } from 'lucide-react';
import { askQuestion } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const AskQuestion = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    question: '',
    category: 'general',
    guestEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    { value: 'JMI', label: 'JMI (Jamia Millia Islamia)', icon: '🎓' },
    { value: 'AMU', label: 'AMU (Aligarh Muslim University)', icon: '🏛️' },
    { value: 'general', label: 'General Question', icon: '❓' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim()) {
      setMessage({ type: 'error', text: 'Please enter your question' });
      return;
    }

    if (formData.question.length > 2000) {
      setMessage({ type: 'error', text: 'Question must be less than 2000 characters' });
      return;
    }

    // Validate email for guest users
    if (!isAuthenticated && (!formData.guestEmail || !formData.guestEmail.trim())) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!isAuthenticated && !emailRegex.test(formData.guestEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        question: formData.question.trim(),
        category: formData.category
      };
      
      // Add email for guest users
      if (!isAuthenticated) {
        payload.guestEmail = formData.guestEmail.trim();
      }
      
      await askQuestion(payload);
      
      if (isAuthenticated) {
        setMessage({ 
          type: 'success', 
          text: 'Your question has been submitted successfully! We will answer it soon.' 
        });
        setFormData({ question: '', category: 'general', guestEmail: '' });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/my-questions');
        }, 2000);
      } else {
        setMessage({ 
          type: 'success', 
          text: `Question submitted! Please sign up with ${formData.guestEmail} to view the answer.` 
        });
        
        // Redirect to signup after 3 seconds for guests
        setTimeout(() => {
          navigate('/signup', {
            state: {
              message: `Sign up with ${formData.guestEmail} to view your question and answer.`,
              email: formData.guestEmail
            }
          });
        }, 3000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit question. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(isAuthenticated ? '/my-questions' : '/')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {isAuthenticated ? 'Back to My Questions' : 'Back to Home'}
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ask a Question
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Get answers about JMI, AMU, or general queries
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl shadow-sm border overflow-hidden ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Message */}
          {message.text && (
            <div className={`px-6 py-4 border-b ${
              message.type === 'success' 
                ? isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
                : isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm ${
                message.type === 'success'
                  ? isDark ? 'text-green-400' : 'text-green-700'
                  : isDark ? 'text-red-400' : 'text-red-700'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category Selection */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Select Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <label
                    key={cat.value}
                    className={`cursor-pointer relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      formData.category === cat.value
                        ? isDark 
                          ? 'border-blue-500 bg-blue-900/20' 
                          : 'border-blue-500 bg-blue-50'
                        : isDark
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={formData.category === cat.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-2">{cat.icon}</span>
                    <span className={`text-sm font-medium text-center ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {cat.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Guest Email Input - Only show for non-authenticated users */}
            {!isAuthenticated && (
              <div>
                <label 
                  htmlFor="guestEmail"
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Your Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    id="guestEmail"
                    name="guestEmail"
                    value={formData.guestEmail}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    required={!isAuthenticated}
                  />
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  <strong>Important:</strong> You must sign up with this same email to view the answer.
                </p>
              </div>
            )}

            {/* Question Input */}
            <div>
              <label 
                htmlFor="question"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Your Question
              </label>
              <div className="relative">
                <MessageCircle className={`absolute top-3 left-3 w-5 h-5 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <textarea
                  id="question"
                  name="question"
                  rows={6}
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="Type your question here... Be as specific as possible so we can give you the best answer."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border resize-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  maxLength={2000}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Maximum 2000 characters
                </p>
                <p className={`text-xs ${
                  formData.question.length > 1800 
                    ? 'text-amber-500' 
                    : isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {formData.question.length}/2000
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/my-questions' : '/')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.question.trim() || (!isAuthenticated && !formData.guestEmail.trim())}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Question
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info Note for Guests */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`mt-6 p-4 rounded-xl border ${
              isDark ? 'bg-blue-900/20 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            <p className="text-sm">
              <strong>How it works:</strong> Enter your email and question above. After submitting, 
              <strong> sign up with the same email address</strong> to view the answer once it's ready. 
              We'll typically respond within 24-48 hours.
            </p>
          </motion.div>
        )}

        {/* Info Note for Authenticated Users */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`mt-6 p-4 rounded-xl ${
              isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-600'
            }`}
          >
            <p className="text-sm">
              <strong>Note:</strong> Only you will be able to see the answer to your question. 
              Our team typically responds within 24-48 hours. You can check the status of your 
              questions in the <span className="font-medium">My Questions</span> section.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AskQuestion;
