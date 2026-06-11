import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, FileText, Search, ShieldCheck, Sparkles, Target } from 'lucide-react';
import usePageSeo from '../hooks/usePageSeo';
import { useTheme } from '../context/ThemeContext';
import { getJmiProgramNames, getJmiProgramTypes, searchJmiResults } from '../utils/jmiResultApi';

const emptySelection = { id: '', name: '' };

const JmiResult = () => {
  usePageSeo({
    title: 'JMI Results & Syllabus | Jamia Millia Islamia',
    description: 'Find JMI entrance exam results and course syllabi easily',
    path: '/jmi-result',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Results & Syllabus', path: '/jmi-result' },
    ],
  });

  const { isDark } = useTheme();
  const [programTypes, setProgramTypes] = useState([]);
  const [programNames, setProgramNames] = useState([]);
  const [selectedType, setSelectedType] = useState(emptySelection);
  const [selectedProgram, setSelectedProgram] = useState(emptySelection);
  const [programNameQuery, setProgramNameQuery] = useState('');
  const [showProgramList, setShowProgramList] = useState(false);
  const [phdDisciplineId, setPhdDisciplineId] = useState('');
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const programDropdownRef = useRef(null);

  const isPhdFlow = useMemo(() => {
    const typeLabel = selectedType.name.toLowerCase();
    return typeLabel.includes('phd') || typeLabel.includes('ph.d') || selectedType.id.toLowerCase().startsWith('phd');
  }, [selectedType]);

  const filteredProgramNames = useMemo(() => {
    const q = (programNameQuery || '').trim().toLowerCase();
    if (!q) return programNames;
    return programNames.filter((p) => p.name.toLowerCase().includes(q));
  }, [programNames, programNameQuery]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (programDropdownRef.current && !programDropdownRef.current.contains(event.target)) {
        setShowProgramList(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    const loadProgramTypes = async () => {
      try {
        setLoadingTypes(true);
        const response = await getJmiProgramTypes();
        if (response.success) {
          setProgramTypes(response.data.programTypes || []);
        } else {
          throw new Error(response.message || 'Unable to load program types');
        }
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load JMI program types.');
      } finally {
        setLoadingTypes(false);
      }
    };

    loadProgramTypes();
  }, []);

  useEffect(() => {
    const loadProgramNames = async () => {
      if (!selectedType.id) {
        setProgramNames([]);
        return;
      }

      try {
        setLoadingPrograms(true);
        const response = await getJmiProgramNames(selectedType.id);
        if (response.success) {
          setProgramNames(response.data.programs || []);
        } else {
          throw new Error(response.message || 'Unable to load program names');
        }
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load JMI program names.');
        setProgramNames([]);
      } finally {
        setLoadingPrograms(false);
      }
    };

    setSelectedProgram(emptySelection);
    setResults([]);
    loadProgramNames();
  }, [selectedType]);

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!selectedType.id || !selectedProgram.id) {
      setError('Please choose a program type and program name first.');
      return;
    }

    try {
      setSearching(true);
      setError('');
      const response = await searchJmiResults({
        courseTypeId: selectedType.id,
        courseNameId: selectedProgram.id,
        phdDisciplineId: isPhdFlow ? phdDisciplineId.trim() : '',
      });

      if (!response.success) {
        throw new Error(response.message || 'Unable to fetch results.');
      }

      const nextResults = response.data.results || [];
      setResults(nextResults);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to search JMI results.');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="relative w-full space-y-12 overflow-x-hidden pb-20 md:space-y-16">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 w-full overflow-hidden rounded-[2rem] p-5 shadow-2xl sm:p-6 lg:p-12"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(59, 130, 246, 0.12) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.97) 0%, rgba(236, 253, 245, 0.97) 100%)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(16,185,129,0.16)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.15, 1, 1.15], rotate: [360, 180, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 blur-3xl"
          />
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(16,185,129,0.22)' }}>
              <Sparkles className={`h-4 w-4 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>JMI Portal</span>
            </div>

            <h1 className={`mt-6 text-4xl font-black leading-tight md:text-5xl lg:text-6xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Find JMI Results & Syllabus
            </h1>

            <p className={`mt-5 max-w-2xl text-sm leading-7 sm:text-base md:text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Select your course and program to view official JMI entrance results and syllabus information.
            </p>

            <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
              {[
                { icon: BookOpen, label: 'Course Type' },
                { icon: Target, label: 'Program' },
                { icon: ShieldCheck, label: 'Results & Syllabus' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="inline-flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold shadow-lg sm:px-4"
                  style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(148, 163, 184, 0.18)' }}
                >
                  <item.icon className={`h-4 w-4 ${isDark ? 'text-cyan-300' : 'text-emerald-600'}`} />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative rounded-[2rem] border p-4 shadow-2xl sm:p-6"
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16,185,129,0.18)',
            }}
          >
            <div className="space-y-3 sm:space-y-4">
              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Select Course Type</span>
                <select
                  value={selectedType.id}
                  onChange={(e) => {
                    const next = programTypes.find((item) => item.id === e.target.value) || emptySelection;
                    setSelectedType(next);
                  }}
                  className="w-full rounded-2xl border px-3 py-3 text-sm outline-none transition focus:border-emerald-500 sm:px-4 sm:text-base"
                  style={{ background: isDark ? '#0f172a' : '#fff', color: isDark ? '#fff' : '#111827', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.28)' }}
                  disabled={loadingTypes}
                >
                  <option value="">{loadingTypes ? 'Loading program types...' : 'Select program type'}</option>
                  {programTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Select Program</span>
                <div className="relative" ref={programDropdownRef}>
                  <input
                    value={selectedProgram.name}
                    onChange={(e) => {
                      const q = e.target.value;
                      setSelectedProgram({ id: '', name: q });
                      setProgramNameQuery(q);
                      setShowProgramList(true);
                    }}
                    onFocus={() => setShowProgramList(true)}
                    onClick={() => setShowProgramList(true)}
                    placeholder={loadingPrograms ? 'Loading program names...' : 'Select program name'}
                    readOnly={loadingPrograms || !selectedType.id}
                    className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-500"
                    style={{ background: isDark ? '#0f172a' : '#fff', color: isDark ? '#fff' : '#111827', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.28)' }}
                    disabled={loadingPrograms || !selectedType.id}
                  />

                  {showProgramList && !loadingPrograms && selectedType.id && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-auto rounded-2xl border bg-white dark:bg-gray-900" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(203,213,225,0.5)' }}>
                      {filteredProgramNames.length === 0 ? (
                        <div className={`p-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No programs found</div>
                      ) : (
                        filteredProgramNames.map((program) => (
                          <button
                            key={program.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSelectedProgram(program);
                              setShowProgramList(false);
                              setProgramNameQuery('');
                            }}
                            className={`w-full text-left px-3 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 sm:px-4 sm:text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {program.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </label>

              {isPhdFlow && (
                <label className="block">
                  <span className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Discipline Code (if applicable)</span>
                  <input
                    value={phdDisciplineId}
                    onChange={(e) => setPhdDisciplineId(e.target.value)}
                    placeholder="Enter code for PhD programs"
                    className="w-full rounded-2xl border px-3 py-3 text-sm outline-none transition focus:border-emerald-500 sm:px-4 sm:text-base"
                    style={{ background: isDark ? '#0f172a' : '#fff', color: isDark ? '#fff' : '#111827', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.28)' }}
                  />
                </label>
              )}

              <button
                type="submit"
                disabled={searching || !selectedType.id || !selectedProgram.id}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 sm:px-5 sm:py-4 sm:text-base"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
              >
                {searching ? 'Searching...' : 'Search'}
                <Search className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </motion.form>
        </div>
      </motion.section>

      <section className="relative z-10 grid w-full gap-6 lg:grid-cols-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full overflow-hidden rounded-[2rem] border shadow-xl min-w-0"
          style={{ background: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255,255,255,0.95)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(148,163,184,0.18)' }}
        >
          <div className="border-b px-4 py-4 sm:px-6 sm:py-5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.18)' }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className={`text-xl font-black sm:text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Search Results</h2>
                <p className={`mt-1 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Official information from JMI portal</p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                <div className={`rounded-2xl border px-3 py-3 sm:px-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
                  <p className={`text-[11px] uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Entries</p>
                  <p className={`mt-1 text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{results.length}</p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 sm:block ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
                  <p className={`text-[11px] uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                  <p className={`mt-1 text-sm font-semibold ${searching ? 'text-emerald-400' : isDark ? 'text-white' : 'text-gray-900'}`}>{searching ? 'Searching' : 'Ready'}</p>
                </div>
              </div>
            </div>

          </div>

          <div className="px-4 py-4 sm:px-6 sm:py-5">
            {error && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="mt-6">
              <div className={`hidden grid-cols-[2fr_1fr_1.4fr_0.8fr] gap-4 rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] lg:grid ${isDark ? 'border-white/10 bg-white/5 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                <span>Course</span>
                <span>Date</span>
                <span>Remark</span>
                <span>Source</span>
              </div>

              {results.length === 0 ? (
                <div className={`mt-4 rounded-[1.5rem] border border-dashed p-6 text-center sm:p-8 ${isDark ? 'border-white/10 text-gray-300' : 'border-gray-200 text-gray-600'}`}>
                  <FileText className="mx-auto mb-3 h-10 w-10 opacity-70" />
                  No results found. Try searching with different criteria.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {results.map((item) => (
                    <div key={`${item.courseName}-${item.date}-${item.remark}`} className={`rounded-[1.5rem] border p-4 transition-transform hover:-translate-y-0.5 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
                      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1.4fr_0.8fr] lg:items-center">
                        <div className="space-y-1">
                          <h3 className={`break-words text-base font-bold leading-6 sm:text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.courseName}</h3>
                        </div>

                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-500'} lg:hidden`}>Date</p>
                          <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{item.date || '—'}</p>
                        </div>

                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-500'} lg:hidden`}>Remark</p>
                          <p className={`break-words text-sm leading-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.remark || '—'}</p>
                        </div>

                        <div className="flex lg:justify-end">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white lg:w-auto"
                              style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
                            >
                              Open source
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No link</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </section>
    </div>
  );
};

export default JmiResult;
