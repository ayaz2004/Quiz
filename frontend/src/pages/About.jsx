const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
        About JMI Quiz Platform
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Our Mission
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          JMI Quiz Platform is dedicated to helping students prepare for their exams through 
          comprehensive and well-structured quizzes. We believe in making quality education 
          accessible to everyone.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Features
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-6">
          <li>Wide range of subjects and topics</li>
          <li>Real-time score tracking and analytics</li>
          <li>Competitive leaderboards</li>
          <li>Detailed performance insights</li>
          <li>Free and premium quiz options</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Contact Us
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Have questions or feedback? Reach out to us at{' '}
          <a href="mailto:jmi123quiz@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
            jmi123quiz@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default About;
