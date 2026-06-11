import { useEffect, useMemo, useState } from 'react';
import { addCutoff, deleteCutoff, getAllCutoffs, getAllQuizzes, updateCutoff } from '../../utils/adminApi';

const cutoffFields = [
  { key: 'general', label: 'General' },
  { key: 'muslim', label: 'Muslim' },
  { key: 'muslimObcSt', label: 'Muslim OBC/ST' },
  { key: 'muslimWomen', label: 'Muslim Women' },
  { key: 'jk', label: 'JK' },
  { key: 'km', label: 'KM' },
  { key: 'pwd', label: 'PWD' },
  { key: 'pwdLocomoter', label: 'PWD - Locomotor' },
  { key: 'pwdBlindVision', label: 'PWD - Blind/Vision' },
  { key: 'pwdHearing', label: 'PWD - Hearing' },
  { key: 'jamiaInternal', label: 'Jamia Internal' },
];

const createEmptyForm = () => ({
  quizId: '',
  year: new Date().getFullYear(),
  general: '',
  muslim: '',
  muslimObcSt: '',
  muslimWomen: '',
  jk: '',
  km: '',
  pwd: '',
  pwdLocomoter: '',
  pwdBlindVision: '',
  pwdHearing: '',
  jamiaInternal: '',
});

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return value;
};

const CutoffManager = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [cutoffs, setCutoffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(createEmptyForm());

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [quizzesRes, cutoffsRes] = await Promise.all([
        getAllQuizzes(1, 500),
        getAllCutoffs(),
      ]);

      setQuizzes(quizzesRes.data?.quizzes || []);
      setCutoffs(cutoffsRes.data?.cutoffs || []);
    } catch (err) {
      setError(err.message || 'Failed to load cutoffs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCutoffs = useMemo(() => {
    return cutoffs.filter((item) => {
      const matchesQuiz = selectedQuizId ? String(item.quizId) === String(selectedQuizId) : true;
      const searchText = search.trim().toLowerCase();
      const matchesSearch = !searchText
        ? true
        : [item.quiz?.title, item.quiz?.subject, String(item.year)]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(searchText));
      return matchesQuiz && matchesSearch;
    });
  }, [cutoffs, selectedQuizId, search]);

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (cutoff) => {
    setEditingId(cutoff.id);
    setForm({
      quizId: cutoff.quizId,
      year: cutoff.year,
      general: cutoff.general ?? '',
      muslim: cutoff.muslim ?? '',
      muslimObcSt: cutoff.muslimObcSt ?? '',
      muslimWomen: cutoff.muslimWomen ?? '',
      jk: cutoff.jk ?? '',
      km: cutoff.km ?? '',
      pwd: cutoff.pwd ?? '',
      pwdLocomoter: cutoff.pwdLocomoter ?? '',
      pwdBlindVision: cutoff.pwdBlindVision ?? '',
      pwdHearing: cutoff.pwdHearing ?? '',
      jamiaInternal: cutoff.jamiaInternal ?? '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.quizId || !form.year) {
      setError('Please select a quiz and year.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        ...form,
        quizId: Number(form.quizId),
        year: Number(form.year),
      };

      if (editingId) {
        await updateCutoff(editingId, payload);
      } else {
        await addCutoff(payload);
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to save cutoff');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cutoffId) => {
    if (!window.confirm('Delete this cutoff row?')) return;

    try {
      setSaving(true);
      await deleteCutoff(cutoffId);
      await loadData();
      if (editingId === cutoffId) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete cutoff');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Loading cutoffs...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Cutoffs</h2>
          <p className="text-gray-600 dark:text-gray-400">Add, edit, and review syllabus/result cutoffs for each quiz and year.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Quiz *</label>
              <select
                value={form.quizId}
                onChange={(e) => handleChange('quizId', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select quiz</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title} ({quiz.subject}, {quiz.examYear})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Year *</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 xl:col-span-1 flex items-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Cutoff' : 'Add Cutoff'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cutoffFields.map((field) => (
              <div key={field.key}>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                <input
                  type="number"
                  step="0.25"
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder="N/A"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            ))}
          </div>
        </form>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by quiz title, subject, or year"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white md:w-96"
            />
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All quizzes</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCutoffs.length} cutoff rows
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Quiz</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Year</th>
                  {cutoffFields.map((field) => (
                    <th key={field.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">{field.label}</th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCutoffs.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-400" colSpan={cutoffFields.length + 3}>
                      No cutoff rows found.
                    </td>
                  </tr>
                ) : (
                  filteredCutoffs.map((cutoff) => (
                    <tr key={cutoff.id} className="align-top">
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="font-medium">{cutoff.quiz?.title || 'Unknown Quiz'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{cutoff.quiz?.subject} · {cutoff.quiz?.examYear}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{cutoff.year}</td>
                      {cutoffFields.map((field) => (
                        <td key={field.key} className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                          {formatValue(cutoff[field.key])}
                        </td>
                      ))}
                      <td className="px-4 py-4 text-sm whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(cutoff)}
                          className="mr-3 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cutoff.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CutoffManager;
