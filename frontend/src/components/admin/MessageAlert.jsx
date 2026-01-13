const MessageAlert = ({ message }) => {
  if (!message.text) return null;

  return (
    <div className={`mb-6 p-4 rounded-lg ${
      message.type === 'success' 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }`}>
      {message.text}
    </div>
  );
};

export default MessageAlert;
