import {
  CheckCircle2,
  FileUp,
  Search,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { DESCRIPTIVE_CONFIG, SUBJECT_CONFIGS } from '../config/driveConfig';
import {
  SAMPLE_DESCRIPTIVE_QUESTIONS,
  SAMPLE_EVALUATIONS,
} from '../data/sampleQuizzes';
import type {
  DescriptiveEvaluationResult,
  DescriptiveSubmissionRecord,
} from '../types/quiz';

export function DescriptiveView() {
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    SAMPLE_DESCRIPTIVE_QUESTIONS[0].id
  );
  const [submissionMode, setSubmissionMode] = useState<'typed' | 'pdf'>('typed');
  const [studentName, setStudentName] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState<DescriptiveSubmissionRecord[]>([]);

  // Results lookup state
  const [lookupId, setLookupId] = useState('CA-2026-DEMO1');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [foundEvaluation, setFoundEvaluation] = useState<DescriptiveEvaluationResult | null>(
    SAMPLE_EVALUATIONS['CA-2026-DEMO1']
  );

  const activeQuestion =
    SAMPLE_DESCRIPTIVE_QUESTIONS.find((q) => q.id === selectedQuestionId) ??
    SAMPLE_DESCRIPTIVE_QUESTIONS[0];

  const getSubjectName = (subjectId: string) =>
    SUBJECT_CONFIGS.find((s) => s.id === subjectId)?.name ?? subjectId;

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        resolve(result.includes(',') ? result.split(',')[1] : result);
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file.'));
      reader.readAsDataURL(file);
    });

  const handleSubmitAnswer = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!studentName.trim()) {
      setFormError('Please enter your name or roll reference so you can identify your evaluation.');
      return;
    }

    if (submissionMode === 'typed' && typedAnswer.trim().length < 30) {
      setFormError('Please write at least 30 characters for your descriptive answer.');
      return;
    }

    if (submissionMode === 'pdf') {
      if (!pdfFile) {
        setFormError('Please attach a PDF scan of your handwritten answer sheet.');
        return;
      }
      if (pdfFile.type !== 'application/pdf' && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
        setFormError('Only PDF files are accepted for handwritten answer sheet uploads.');
        return;
      }
      if (pdfFile.size > 15 * 1024 * 1024) {
        setFormError('Please keep answer sheet PDFs under 15 MB for smooth Apps Script transfer.');
        return;
      }
    }

    setSubmitting(true);
    const trackingId = `CA-${new Date().getFullYear()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`;

    let deliveryMode: 'apps-script' | 'local-preview' = 'local-preview';

    try {
      if (DESCRIPTIVE_CONFIG.appsScriptUrl.trim()) {
        const payload: Record<string, unknown> = {
          type: 'descriptive_submission',
          trackingId,
          questionId: activeQuestion.id,
          subjectId: activeQuestion.subjectId,
          studentName: studentName.trim(),
          mode: submissionMode,
        };

        if (submissionMode === 'typed') {
          payload.typedAnswer = typedAnswer.trim();
        } else if (pdfFile) {
          payload.pdfFileName = pdfFile.name;
          payload.pdfBase64 = await fileToBase64(pdfFile);
        }

        await fetch(DESCRIPTIVE_CONFIG.appsScriptUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        deliveryMode = 'apps-script';
      }

      const record: DescriptiveSubmissionRecord = {
        trackingId,
        questionId: activeQuestion.id,
        questionTitle: activeQuestion.chapter,
        subjectId: activeQuestion.subjectId,
        studentName: studentName.trim(),
        mode: submissionMode,
        typedAnswer: submissionMode === 'typed' ? typedAnswer.trim() : undefined,
        pdfFileName: submissionMode === 'pdf' ? pdfFile?.name : undefined,
        pdfSizeBytes: submissionMode === 'pdf' ? pdfFile?.size : undefined,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'queued-for-analysis',
        deliveryMode,
      };

      setRecentSubmissions((prev) => [record, ...prev]);
      setLookupId(trackingId);
      setTypedAnswer('');
      setPdfFile(null);
    } catch {
      setFormError('Could not upload submission right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupResult = async (event: React.FormEvent) => {
    event.preventDefault();
    setLookupError(null);
    const queryId = lookupId.trim().toUpperCase();
    if (!queryId) {
      setLookupError('Enter a Tracking ID (e.g., CA-2026-DEMO1) to view evaluation results.');
      return;
    }

    if (SAMPLE_EVALUATIONS[queryId]) {
      setFoundEvaluation(SAMPLE_EVALUATIONS[queryId]);
      return;
    }

    const localPending = recentSubmissions.find((s) => s.trackingId === queryId);
    if (localPending && !DESCRIPTIVE_CONFIG.appsScriptUrl.trim()) {
      setFoundEvaluation(null);
      setLookupError(
        `Submission ${queryId} is queued for Gemini Argon analysis. Connect DESCRIPTIVE_CONFIG.appsScriptUrl to sync live evaluation JSON from your private Drive.`
      );
      return;
    }

    if (DESCRIPTIVE_CONFIG.appsScriptUrl.trim()) {
      setLookupLoading(true);
      try {
        const url = `${DESCRIPTIVE_CONFIG.appsScriptUrl.trim()}?action=lookup&trackingId=${encodeURIComponent(queryId)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.ok && data.evaluation) {
          setFoundEvaluation(data.evaluation as DescriptiveEvaluationResult);
        } else if (data?.ok && data.status === 'queued-for-analysis') {
          setFoundEvaluation(null);
          setLookupError(`Submission ${queryId} was received and is awaiting Gemini Argon evaluation.`);
        } else {
          setFoundEvaluation(null);
          setLookupError(`No evaluated answer found for Tracking ID "${queryId}".`);
        }
      } catch {
        setLookupError('Unable to reach the evaluation lookup endpoint.');
      } finally {
        setLookupLoading(false);
      }
      return;
    }

    setFoundEvaluation(null);
    setLookupError(`No evaluated record found for "${queryId}". Try CA-2026-DEMO1 to inspect a sample analysis report.`);
  };

  return (
    <div className="space-y-8">
      <section className="pt-2 pb-6 border-b border-slate-200 max-w-3xl space-y-2.5">
        <p className="text-xs font-medium text-blue-700">
          Future Expansion Ready · Typed & PDF Answer Sheet Evaluation Pipeline
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Descriptive Answer Analysis
        </h1>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
          Attempt CA Final case-study questions by typing directly or uploading a scanned PDF answer sheet. Submissions route into the owner&apos;s private Drive folder for Gemini Argon evaluation, and students check line-by-line feedback using their Tracking ID.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Practice Question & Submission Form */}
        <section
          aria-label="Submit Descriptive Answer"
          className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-7 space-y-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="descriptive-question-select"
              className="block text-xs font-semibold text-slate-700"
            >
              Select Practice Question
            </label>
            <select
              id="descriptive-question-select"
              value={selectedQuestionId}
              onChange={(e) => setSelectedQuestionId(e.target.value)}
              className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-700"
            >
              {SAMPLE_DESCRIPTIVE_QUESTIONS.map((q) => (
                <option key={q.id} value={q.id}>
                  {getSubjectName(q.subjectId)} — {q.chapter} ({q.marks} Marks)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#F8F9FA] border border-slate-200 rounded-lg p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-mono text-blue-700">{activeQuestion.standardRef}</span>
              <span className="font-mono tabular-nums">{activeQuestion.marks} Marks</span>
            </div>
            <p className="text-sm text-slate-900 leading-relaxed font-medium">
              {activeQuestion.prompt}
            </p>
          </div>

          <form onSubmit={handleSubmitAnswer} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="descriptive-student-name"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Your Name or Student ID
              </label>
              <input
                id="descriptive-student-name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g., Rohan Mehta / SRO0654321"
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>

            {/* Mode Switcher: Type Answer vs Upload PDF */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-700">
                Answer Submission Format
              </span>
              <div
                role="group"
                aria-label="Choose submission format"
                className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionMode('typed');
                    setFormError(null);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    submissionMode === 'typed'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Type Answer Online
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionMode('pdf');
                    setFormError(null);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    submissionMode === 'pdf'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload Handwritten PDF
                </button>
              </div>
            </div>

            {submissionMode === 'typed' ? (
              <div>
                <label
                  htmlFor="descriptive-typed-answer"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Your Answer (include standard references & working notes)
                </label>
                <textarea
                  id="descriptive-typed-answer"
                  rows={8}
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="1. Statutory Provision (Ind AS / SA / Section)...&#10;2. Working Notes & Calculations...&#10;3. Conclusion & Journal Entries..."
                  className="w-full p-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 leading-relaxed"
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="descriptive-pdf-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Upload Answer Sheet PDF (Max 15 MB)
                </label>
                <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center bg-[#F8F9FA]">
                  <FileUp className="w-6 h-6 text-slate-400 mx-auto mb-2" aria-hidden="true" />
                  <input
                    id="descriptive-pdf-input"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                    className="block mx-auto text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {pdfFile && (
                    <p className="mt-2.5 text-xs font-medium text-slate-800">
                      Attached: {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
            )}

            {formError && (
              <p role="alert" className="text-xs font-medium text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              {submitting ? 'Submitting Answer...' : 'Submit for Analysis'}
            </button>
          </form>

          {recentSubmissions.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-900">
                Your Session Submissions
              </p>
              {recentSubmissions.map((sub) => (
                <div
                  key={sub.trackingId}
                  className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-semibold">
                      Saved · Tracking ID:{' '}
                      <span className="font-mono">{sub.trackingId}</span>
                    </p>
                    <p className="text-emerald-800 mt-0.5">
                      {sub.questionTitle} · {sub.mode === 'pdf' ? `PDF (${sub.pdfFileName})` : 'Typed Answer'} ·{' '}
                      {sub.deliveryMode === 'apps-script'
                        ? 'Sent to Private Drive'
                        : 'Queued in Preview Mode'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right: Evaluation Results Checker (Gemini Argon Output Viewer) */}
        <section
          aria-label="Check Evaluation Result"
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
        >
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Check Evaluation Results
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your Submission Tracking ID to inspect what you got right and missed provisions. Try <span className="font-mono text-slate-800">CA-2026-DEMO1</span> for a sample report.
            </p>
          </div>

          <form onSubmit={handleLookupResult} className="flex gap-2">
            <label htmlFor="tracking-id-input" className="sr-only">
              Submission Tracking ID
            </label>
            <input
              id="tracking-id-input"
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="CA-2026-DEMO1"
              className="flex-1 h-10 px-3 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-700"
            />
            <button
              type="submit"
              disabled={lookupLoading}
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              {lookupLoading ? 'Checking...' : 'Check'}
            </button>
          </form>

          {lookupError && (
            <p role="alert" className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {lookupError}
            </p>
          )}

          {foundEvaluation && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-blue-700">
                    {foundEvaluation.trackingId}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluated {foundEvaluation.evaluatedAt}
                  </p>
                </div>
                <p className="font-display text-2xl font-semibold text-slate-900 tabular-nums">
                  {foundEvaluation.awardedMarks} / {foundEvaluation.maxMarks}
                </p>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-[#F8F9FA] border border-slate-200 rounded-lg p-3.5">
                {foundEvaluation.summaryVerdict}
              </p>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  What You Got Right
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4 leading-relaxed">
                  {foundEvaluation.correctPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Missing or Needs Correction
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4 leading-relaxed">
                  {foundEvaluation.missingOrIncorrectPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-900 mb-1">
                  Examiner Improvement Guidance
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {foundEvaluation.improvementGuidance}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
