import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Terms = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className={`rounded-3xl shadow-xl p-8 md:p-12 mb-8 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h1 className={`text-4xl md:text-5xl font-black mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Terms and Conditions
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: March 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className={`rounded-3xl shadow-xl p-8 md:p-12 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className={`prose prose-lg max-w-none ${
            isDark ? 'prose-invert' : ''
          }`}>
            {/* 1. Acceptance of Terms */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                1. Acceptance of Terms
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                By accessing and using this quiz platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            {/* 2. Use License */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                2. Use License
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Permission is granted to temporarily access the quiz materials (information or content) on this platform for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            {/* 3. User Accounts */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                3. User Accounts
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>

            {/* 4. Prohibited Uses */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                4. Prohibited Uses
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                You may not use our platform:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>In any way that violates any applicable national or international law or regulation</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
                <li>To impersonate or attempt to impersonate the Company, an employee, another user, or any other person or entity</li>
                <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the platform</li>
                <li>To use automated systems or software to extract data from the platform for commercial purposes</li>
              </ul>
            </section>

            {/* 5. Quiz Participation */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                5. Quiz Participation
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                By participating in quizzes on this platform, you agree that:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>All answers submitted are your own work</li>
                <li>You will not share quiz content or answers with others</li>
                <li>You will not use unfair means or cheat during quiz attempts</li>
                <li>Quiz results may be used for educational and analytical purposes</li>
                <li>Prize money, if applicable, will be distributed according to platform rules</li>
              </ul>
            </section>

            {/* 6. Paid Content */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                6. Paid Content and Refunds
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Some quizzes on our platform are paid and require purchase before access. Payment transactions are processed securely through third-party payment gateways. All sales are final and non-refundable unless otherwise stated. Once you purchase access to a quiz, you cannot transfer that access to another user.
              </p>
            </section>

            {/* 7. Intellectual Property */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                7. Intellectual Property
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                The platform and its original content, features, and functionality are owned by the platform and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            {/* 8. Termination */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                8. Termination
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                We may terminate or suspend your account and bar access to the platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            {/* 9. Limitation of Liability */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                9. Limitation of Liability
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                In no event shall the platform, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the platform.
              </p>
            </section>

            {/* 10. Changes to Terms */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                10. Changes to Terms
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            {/* 11. Contact Information */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                11. Contact Us
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                If you have any questions about these Terms and Conditions, please contact us through the platform's support section.
              </p>
            </section>
          </div>

          {/* Back to Sign Up Button */}
          <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
            <Link 
              to="/signup"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Terms;
