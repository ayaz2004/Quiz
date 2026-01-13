import { useState, useEffect } from 'react';
import { addQuiz, updateQuiz, getAllUsers, deleteUser, getAllQuizzes, deleteQuiz, getQuizById } from '../utils/adminApi';
import MessageAlert from '../components/admin/MessageAlert';
import TabNavigation from '../components/admin/TabNavigation';
import QuizForm from '../components/admin/QuizForm';
import QuizList from '../components/admin/QuizList';
import UserList from '../components/admin/UserList';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('quizzes');
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    subject: '',
    examYear: new Date().getFullYear(),
    createdBy: 1, // Adjust based on logged-in admin
    isActive: true,
    isPaid: false,
    price: 0,
    questions: []
  });

  const [editingQuizId, setEditingQuizId] = useState(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'viewQuizzes') {
      fetchQuizzes();
    }
  }, [activeTab, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await getAllUsers(currentPage, 10);

      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);

    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getAllQuizzes(currentPage, 10);
      setQuizzes(response.data.quizzes);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };


  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAddQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        {
          questionText: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          isCorrect: 1,
          explanation: '',
          imageUrl: null,
          imageFile: null
        }
      ]
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[index][field] = value;
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const handleImageUpload = (index, file) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[index].imageFile = file;
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = quizForm.questions.filter((_, i) => i !== index);
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    
    if (quizForm.questions.length === 0) {
      showMessage('error', 'Please add at least one question');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Add quiz data as JSON
      const quizData = {
        ...quizForm,
        questions: quizForm.questions.map(q => ({
          questionText: q.questionText,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          isCorrect: q.isCorrect,
          explanation: q.explanation,
          imageUrl: q.imageUrl
        }))
      };
      
      formData.append('quizData', JSON.stringify(quizData));
      
      // Add image files
      quizForm.questions.forEach((q, index) => {
        if (q.imageFile) {
          formData.append(`image_${index}`, q.imageFile);
        }
      });

      if (editingQuizId) {
        await updateQuiz(editingQuizId, formData);
        showMessage('success', 'Quiz updated successfully!');
      } else {
        await addQuiz(formData);
        showMessage('success', 'Quiz added successfully!');
      }
      
      // Reset form
      setQuizForm({
        title: '',
        description: '',
        subject: '',
        examYear: new Date().getFullYear(),
        createdBy: 1,
        isActive: true,
        isPaid: false,
        price: 0,
        questions: []
      });
      setEditingQuizId(null);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteUser(userId);
      showMessage('success', 'User deleted successfully!');
      fetchUsers();
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await deleteQuiz(quizId);
      showMessage('success', 'Quiz deleted successfully!');
      fetchQuizzes();
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = async (quizId) => {
    try {
      setLoading(true);
      const response = await getQuizById(quizId);
      const quiz = response.data;
      
      // Populate form with quiz data
      setQuizForm({
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        examYear: quiz.examYear,
        createdBy: 1,
        isActive: true,
        isPaid: quiz.isPaid,
        price: quiz.price || 0,
        questions: quiz.questions.map(q => ({
          questionText: q.questionText,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          isCorrect: q.isCorrect || 1,
          explanation: q.explanation || '',
          imageUrl: q.imageUrl,
          imageFile: null
        }))
      });
      
      setEditingQuizId(quizId);
      setActiveTab('quizzes');
      showMessage('success', 'Quiz loaded for editing');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage quizzes and users
          </p>
        </div>

        {/* Message Alert */}
        <MessageAlert message={message} />

        {/* Tabs */}
        <TabNavigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setCurrentPage={setCurrentPage}
        />

        {/* Quiz Management Tab */}
        {activeTab === 'quizzes' && (
          <QuizForm
            quizForm={quizForm}
            setQuizForm={setQuizForm}
            editingQuizId={editingQuizId}
            setEditingQuizId={setEditingQuizId}
            loading={loading}
            onSubmit={handleSubmitQuiz}
            onAddQuestion={handleAddQuestion}
            onQuestionChange={handleQuestionChange}
            onImageUpload={handleImageUpload}
            onRemoveQuestion={handleRemoveQuestion}
          />
        )}

        {/* View All Quizzes Tab */}
        {activeTab === 'viewQuizzes' && (
          <QuizList
            quizzes={quizzes}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            onEdit={handleEditQuiz}
            onDelete={handleDeleteQuiz}
          />
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <UserList
            users={users}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            onDelete={handleDeleteUser}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
