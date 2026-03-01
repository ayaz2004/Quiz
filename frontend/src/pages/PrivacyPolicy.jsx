import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
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
            Privacy Policy
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
            {/* Introduction */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Introduction
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Welcome to our Quiz Platform. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our platform and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            {/* 1. Information We Collect */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                1. Information We Collect
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                We collect several types of information for various purposes to provide and improve our service to you:
              </p>
              
              <h3 className={`text-xl font-semibold mb-3 mt-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Personal Data
              </h3>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Email address</li>
                <li>Name (if provided)</li>
                <li>Profile information</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h3 className={`text-xl font-semibold mb-3 mt-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Usage Data
              </h3>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Quiz attempts and scores</li>
                <li>Time spent on questions and quizzes</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on pages</li>
                <li>Device information</li>
                <li>IP address</li>
              </ul>
            </section>

            {/* 2. How We Use Your Information */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                2. How We Use Your Information
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                We use the collected data for various purposes:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To allow you to participate in interactive features</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
                <li>To provide you with quiz results and performance analytics</li>
                <li>To process payments for paid quizzes</li>
                <li>To send you educational content and updates (if you opted in)</li>
              </ul>
            </section>

            {/* 3. Data Storage and Security */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                3. Data Storage and Security
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                The security of your data is important to us. We use industry-standard security measures to protect your personal information:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Encrypted data transmission (HTTPS/SSL)</li>
                <li>Secure password storage using hashing algorithms</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data by authorized personnel only</li>
                <li>Secure database servers with regular backups</li>
              </ul>
              <p className={`mt-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
              </p>
            </section>

            {/* 4. Data Sharing and Disclosure */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                4. Data Sharing and Disclosure
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>With service providers who help us operate our platform (e.g., payment processors, hosting services)</li>
                <li>When required by law or to respond to legal process</li>
                <li>To protect our rights, property, or safety, or that of our users</li>
                <li>With your explicit consent</li>
                <li>In connection with a business transaction (merger, acquisition, etc.)</li>
              </ul>
            </section>

            {/* 5. Cookies and Tracking Technologies */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                5. Cookies and Tracking Technologies
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
              </p>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                We use cookies for:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Authentication and session management</li>
                <li>Remembering your preferences (e.g., theme selection)</li>
                <li>Analytics to understand how users interact with our platform</li>
                <li>Security purposes</li>
              </ul>
              <p className={`mt-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
              </p>
            </section>

            {/* 6. Your Data Rights */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                6. Your Data Rights
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                You have certain rights regarding your personal data:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li><strong>Right to Access:</strong> You can request copies of your personal data</li>
                <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
                <li><strong>Right to Erasure:</strong> You can request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing:</strong> You can request that we limit the processing of your data</li>
                <li><strong>Right to Data Portability:</strong> You can request transfer of your data to another service</li>
                <li><strong>Right to Object:</strong> You can object to our processing of your personal data</li>
              </ul>
              <p className={`mt-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                To exercise any of these rights, please contact us through the platform's support section.
              </p>
            </section>

            {/* 7. Children's Privacy */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                7. Children's Privacy
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Our platform is intended for users who are at least 13 years old. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal data, please contact us, and we will delete that information from our systems.
              </p>
            </section>

            {/* 8. Third-Party Links */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                8. Third-Party Links
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Our platform may contain links to third-party websites or services that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We strongly advise you to review the privacy policy of every site you visit.
              </p>
            </section>

            {/* 9. Data Retention */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                9. Data Retention
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                We will retain your personal data only for as long as is necessary for the purposes set out in this privacy policy. We will retain and use your data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies. Quiz results and performance data may be retained for educational and analytical purposes.
              </p>
            </section>

            {/* 10. Changes to This Privacy Policy */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                10. Changes to This Privacy Policy
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* 11. Contact Us */}
            <section className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                11. Contact Us
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                If you have any questions about this Privacy Policy, please contact us through the platform's support section or reach out to our data protection team.
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

export default PrivacyPolicy;
