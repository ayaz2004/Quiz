import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addQuiz, updateQuiz, getAllUsers, deleteUser, getAllQuizzes, deleteQuiz, getQuizById } from '../utils/adminApi';
import MessageAlert from '../components/admin/MessageAlert';
import DashSidebar from '../components/admin/DashSidebar';
import DashProfile from '../components/admin/DashProfile';
import DashOverview from '../components/admin/DashOverview';
import QuizForm from '../components/admin/QuizForm';
import QuizList from '../components/admin/QuizList';
import UserList from '../components/admin/UserList';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('');
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Update tab based on URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    setTab(tabFromUrl || '');
  }, [location.search]);

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
    if (tab === 'users') {
      fetchUsers();
    } else if (tab === 'viewQuizzes') {
      fetchQuizzes();
    }
  }, [tab, currentPage]);

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

  const handleAddQuestion = useCallback(() => {
    setQuizForm(prevForm => ({
      ...prevForm,
      questions: [
        ...prevForm.questions,
        {
          id: Date.now() + Math.random(), // Unique ID for React key
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
    }));
  }, []);

  const handleQuestionChange = useCallback((index, field, value) => {
    setQuizForm(prevForm => {
      const updatedQuestions = [...prevForm.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
      return { ...prevForm, questions: updatedQuestions };
    });
  }, []);

  const handleImageUpload = useCallback((index, file) => {
    setQuizForm(prevForm => {
      const updatedQuestions = [...prevForm.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], imageFile: file };
      return { ...prevForm, questions: updatedQuestions };
    });
  }, []);

  const handleRemoveQuestion = useCallback((index) => {
    setQuizForm(prevForm => ({
      ...prevForm,
      questions: prevForm.questions.filter((_, i) => i !== index)
    }));
  }, []);

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
        description: quiz.description || '',
        subject: quiz.subject,
        examYear: quiz.examYear,
        createdBy: 1,
        isActive: quiz.isActive !== undefined ? quiz.isActive : true,
        isPaid: quiz.isPaid,
        price: quiz.price || 0,
        questions: quiz.questions.map((q, idx) => ({
          id: q.id || Date.now() + idx, // Use existing ID or generate one
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
      navigate('/admin?tab=quizzes');
      showMessage('success', 'Quiz loaded for editing');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="md:w-64 flex-shrink-0">
        <DashSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Message Alert */}
        {message.text && (
          <div className="p-4 md:p-6">
            <MessageAlert message={message} />
          </div>
        )}

        {/* Tab Content */}
        {/* Overview/Dashboard */}
        {(!tab || tab === '') && <DashOverview />}

        {/* Profile */}
        {tab === 'profile' && <DashProfile />}

        {/* Quiz Management Tab */}
        {tab === 'quizzes' && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Add/Edit Quiz
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Create new quizzes or edit existing ones
                </p>
              </div>
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
            </div>
          </div>
        )}

        {/* View All Quizzes Tab */}
        {tab === 'viewQuizzes' && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  All Quizzes
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage all quizzes in the platform
                </p>
              </div>
              <QuizList
                quizzes={quizzes}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                onEdit={handleEditQuiz}
                onDelete={handleDeleteQuiz}
              />
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {tab === 'users' && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Manage Users
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage user accounts
                </p>
              </div>
              <UserList
                users={users}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                onDelete={handleDeleteUser}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
