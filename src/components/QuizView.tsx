import {
  CheckCircle2,
  ChevronRight,
  Code2,
  Play,
  RotateCcw,
  Upload,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { SUBJECT_CONFIGS } from '../config/driveConfig';
import { GEMINI_QUIZ_JSON_TEMPLATE, SAMPLE_QUIZZES } from '../data/sampleQuizzes';
import type { SubjectId } from '../types/archive';
import type { QuizDataset, QuizResultSummary } from '../types/quiz';
import { gradeQuiz, validateQuizJson } from '../utils/quizEngine';

interface QuizViewProps {
  driveQuizzes: QuizDataset[];
}

export function QuizView({ driveQuizzes }: QuizViewProps) {
  const [customQuizzes, setCustomQuizzes] = useState<QuizDataset[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [activeQuiz, setActiveQuiz] = useState<QuizDataset | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submittedResult, setSubmittedResult] = useState<QuizResultSummary | null>(null);
  const [showJsonPanel, setShowJsonPanel] = useState(false);
  const [jsonInput, setJsonInput] = useState(GEMINI_QUIZ_JSON_TEMPLATE);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const allQuizzes = useMemo(
    () => [...customQuizzes, ...driveQuizzes, ...SAMPLE_QUIZZES],
    [customQuizzes, driveQuizzes]
  );

  const filteredQuizzes = useMemo(() => {
    if (subjectFilter === 'all') return allQuizzes;
    return allQuizzes.filter((q) => q.subjectId === subjectFilter);
  }, [allQuizzes, subjectFilter]);

  const startQuiz = (quiz: QuizDataset) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setSubmittedResult(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submittedResult) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    const summary = gradeQuiz(activeQuiz, answers);
    setSubmittedResult(summary);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      const validation = validateQuizJson(parsed);
      if (!validation.ok) {
        setJsonError(validation.error);
        return;
      }
      setCustomQuizzes((prev) => [validation.quiz, ...prev.filter((q) => q.id !== validation.quiz.id)]);
      setShowJsonPanel(false);
      startQuiz(validation.quiz);
    } catch {
      setJsonError('Invalid JSON syntax. Please check commas, quotes, and brackets.');
    }
  };

  const getSubjectName = (subjectId: SubjectId) =>
    SUBJECT_CONFIGS.find((s) => s.id === subjectId)?.name ?? subjectId;

  // ACTIVE QUIZ ATTEMPT & EXPLANATION REVIEW
  if (activeQuiz) {
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs text-slate-500">
              {getSubjectName(activeQuiz.subjectId)} · {activeQuiz.publishedDate} ·{' '}
              <span className="tabular-nums">{activeQuiz.totalMarks} Marks</span>
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 mt-1">
              {activeQuiz.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {submittedResult && (
              <button
                type="button"
                onClick={() => startQuiz(activeQuiz)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Retake
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setActiveQuiz(null);
                setSubmittedResult(null);
              }}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white cursor-pointer"
            >
              All Quizzes
            </button>
          </div>
        </div>

        {/* Score Summary Banner after submission */}
        {submittedResult && (
          <section
            aria-label="Quiz Score Summary"
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-medium text-blue-700">Assessment Complete</p>
                <h2 className="font-display text-2xl font-semibold text-slate-900 mt-0.5 tabular-nums">
                  Score: {submittedResult.earnedMarks} / {submittedResult.totalMarks} ({submittedResult.percentage}%)
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 tabular-nums">
                <span className="text-emerald-700 font-medium">
                  {submittedResult.correctCount} correct
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-rose-700 font-medium">
                  {submittedResult.incorrectCount} incorrect
                </span>
                <span aria-hidden="true">·</span>
                <span>{submittedResult.unansweredCount} unanswered</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {submittedResult.chapterBreakdown.map((item) => (
                <div
                  key={item.chapter}
                  className="bg-[#F8F9FA] border border-slate-200 rounded-lg p-3.5"
                >
                  <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                    {item.chapter}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 tabular-nums">
                    {item.earnedMarks} / {item.totalMarks} marks · {item.correctCount} of{' '}
                    {item.questionCount} correct
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Questions List */}
        <div className="space-y-5">
          {activeQuiz.questions.map((q, index) => {
            const selectedIdx = answers[q.id];
            const isCorrect = submittedResult && selectedIdx === q.correctOptionIndex;
            const isWrong =
              submittedResult &&
              selectedIdx !== undefined &&
              selectedIdx !== q.correctOptionIndex;

            return (
              <article
                key={q.id}
                className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    <span className="font-mono font-medium text-slate-900 tabular-nums">
                      Q{index + 1}.
                    </span>{' '}
                    {q.chapter}
                    {q.standardRef && (
                      <>
                        {' '}
                        · <span className="font-mono text-blue-700">{q.standardRef}</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono tabular-nums">{q.marks} Marks</span>
                </div>

                {q.caseScenario && (
                  <div className="bg-[#F8F9FA] border border-slate-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed">
                    <p className="text-xs font-semibold text-slate-900 mb-1">Case Scenario</p>
                    <p>{q.caseScenario}</p>
                  </div>
                )}

                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {q.question}
                </h3>

                <div className="space-y-2.5" role="radiogroup" aria-label={`Question ${index + 1} options`}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedIdx === optIdx;
                    const isAnswerKey = submittedResult && optIdx === q.correctOptionIndex;
                    const isWrongSelection =
                      submittedResult && isSelected && optIdx !== q.correctOptionIndex;

                    let styleClass =
                      'border-slate-200 bg-white text-slate-800 hover:border-slate-300';
                    if (isAnswerKey) {
                      styleClass = 'border-emerald-600 bg-emerald-50/70 text-emerald-950';
                    } else if (isWrongSelection) {
                      styleClass = 'border-rose-500 bg-rose-50/70 text-rose-950';
                    } else if (isSelected) {
                      styleClass = 'border-blue-700 bg-blue-50/60 text-blue-950';
                    }

                    const letter = String.fromCharCode(65 + optIdx);

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={Boolean(submittedResult)}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-start gap-3 ${styleClass} ${
                          submittedResult ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <span className="font-mono text-xs font-semibold mt-0.5 shrink-0">
                          {letter}.
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                        {isAnswerKey && (
                          <CheckCircle2
                            className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0"
                            aria-label="Correct option"
                          />
                        )}
                        {isWrongSelection && (
                          <XCircle
                            className="w-4 h-4 text-rose-700 mt-0.5 shrink-0"
                            aria-label="Incorrect selection"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Reasoning & Standard Explanation */}
                {submittedResult && (
                  <div className="pt-3 border-t border-slate-100 text-sm space-y-1.5">
                    <p className="text-xs font-semibold text-slate-900">
                      {isCorrect
                        ? 'Correct — Conceptual Reasoning'
                        : isWrong
                          ? 'Incorrect — Conceptual Reasoning'
                          : 'Unanswered — Conceptual Reasoning'}
                    </p>
                    <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Sticky Bottom Submit Bar while taking quiz */}
        {!submittedResult && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-600 tabular-nums">
              Answered <span className="font-semibold text-slate-900">{answeredCount}</span> of{' '}
              <span className="font-semibold text-slate-900">{activeQuiz.questions.length}</span>{' '}
              questions
            </p>
            <button
              type="button"
              onClick={handleSubmitQuiz}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors cursor-pointer"
            >
              Submit & View Reasoning
            </button>
          </div>
        )}
      </div>
    );
  }

  // QUIZ DIRECTORY & GEMINI JSON LOADER
  return (
    <div className="space-y-8">
      <section className="pt-2 pb-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-2xl space-y-2.5">
          <p className="text-xs font-medium text-blue-700">
            Future Expansion Ready · Daily & Weekly 100-Mark MCQ Engine
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Concept Pop Quizzes
          </h1>
          <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
            Built to automatically load daily or weekly 100-mark MCQ JSON files uploaded by Gemini Tasks into each subject&apos;s Google Drive quiz folder, complete with standard-referenced explanations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowJsonPanel((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors self-start lg:self-auto whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Code2 className="w-4 h-4 text-slate-500" aria-hidden="true" />
          {showJsonPanel ? 'Hide JSON Loader' : 'Test Custom Quiz JSON'}
        </button>
      </section>

      {/* Interactive Gemini JSON Quiz Previewer / Validator */}
      {showJsonPanel && (
        <section
          aria-label="Test Gemini Quiz JSON"
          className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Preview Any Gemini Tasks Quiz JSON
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste a daily/weekly 100-mark quiz JSON matching the Drive folder schema to validate and launch it immediately.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="quiz-json-textarea" className="sr-only">
              Quiz JSON payload
            </label>
            <textarea
              id="quiz-json-textarea"
              rows={11}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full p-4 rounded-lg border border-slate-300 bg-[#F8F9FA] font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-700"
            />
          </div>

          {jsonError && (
            <p role="alert" className="text-xs font-medium text-rose-700">
              {jsonError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setJsonInput(GEMINI_QUIZ_JSON_TEMPLATE)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Reset Template
            </button>
            <button
              type="button"
              onClick={handleLoadJson}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 cursor-pointer"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              Validate & Start Quiz
            </button>
          </div>
        </section>
      )}

      {/* Subject Filter Bar */}
      <div
        role="group"
        aria-label="Filter quizzes by subject"
        className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit"
      >
        <button
          type="button"
          onClick={() => setSubjectFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            subjectFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Subjects
        </button>
        {SUBJECT_CONFIGS.map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => setSubjectFilter(sub.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              subjectFilter === sub.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {sub.shortName}
          </button>
        ))}
      </div>

      {/* Quiz Cards */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
          <p className="font-display text-lg font-semibold text-slate-900">
            No quizzes published for this subject yet
          </p>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Once daily or weekly JSON quizzes are dropped into this subject&apos;s Google Drive quiz folder, they will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuizzes.map((quiz) => (
            <article
              key={quiz.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-2">
                <p className="text-xs text-slate-500 tabular-nums">
                  {getSubjectName(quiz.subjectId)} · {quiz.publishedDate} ·{' '}
                  {quiz.cadence === 'daily' ? 'Daily Quiz' : 'Weekly Quiz'}
                </p>
                <h2 className="font-display text-xl font-semibold text-slate-900 leading-snug">
                  {quiz.title}
                </h2>
                <p className="text-xs text-slate-600 tabular-nums">
                  {quiz.questions.length} questions · {quiz.totalMarks} marks ·{' '}
                  {quiz.durationMinutes} mins · Detailed answer reasoning included
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{quiz.generatedBy}</span>
                <button
                  type="button"
                  onClick={() => startQuiz(quiz)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  Start Quiz
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
