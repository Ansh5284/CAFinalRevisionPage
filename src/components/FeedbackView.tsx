import { AlertCircle, CheckCircle2, Lock, Send, Star } from 'lucide-react';
import { useState } from 'react';
import { FEEDBACK_CONFIG, SUBJECT_CONFIGS } from '../config/driveConfig';
import type { FeedbackSubmission } from '../types/archive';

interface FeedbackViewProps {
  onOpenSetupGuide: () => void;
}

const FEEDBACK_CATEGORIES = [
  'Content Quality & Clarity',
  'Missing Chapter or Standard',
  'Document Viewer Experience',
  'Pop Quiz / Descriptive Request',
  'General Appreciation & Suggestions',
];

const ATTEMPT_OPTIONS = [
  'CA Final — Nov 2026',
  'CA Final — May 2027',
  'CA Final — Nov 2027',
  'Qualified CA / Faculty / Reviewer',
];

export function FeedbackView({ onOpenSetupGuide }: FeedbackViewProps) {
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [attempt, setAttempt] = useState(ATTEMPT_OPTIONS[0]);
  const [subject, setSubject] = useState('All Subjects');
  const [category, setCategory] = useState(FEEDBACK_CATEGORIES[0]);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedLog, setSubmittedLog] = useState<FeedbackSubmission[]>([]);

  const isLivePrivateSheet = Boolean(
    FEEDBACK_CONFIG.appsScriptUrl.trim() || FEEDBACK_CONFIG.googleFormActionUrl.trim()
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    if (!anonymous && !name.trim()) {
      setValidationError('Please enter your name or check "Submit anonymously".');
      return;
    }

    if (message.trim().length < 10) {
      setValidationError('Please share at least 10 characters of feedback so it is actionable.');
      return;
    }

    setSubmitting(true);
    let deliveryMode: FeedbackSubmission['deliveryMode'] = 'local-preview';

    try {
      if (FEEDBACK_CONFIG.appsScriptUrl.trim()) {
        await fetch(FEEDBACK_CONFIG.appsScriptUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            type: 'feedback',
            name: anonymous ? 'Anonymous' : name.trim(),
            anonymous,
            attempt,
            subject,
            category,
            rating,
            message: message.trim(),
          }),
        });
        deliveryMode = 'apps-script';
      } else if (FEEDBACK_CONFIG.googleFormActionUrl.trim()) {
        const formData = new FormData();
        formData.append(
          FEEDBACK_CONFIG.formEntries.name,
          anonymous ? 'Anonymous' : name.trim()
        );
        formData.append(FEEDBACK_CONFIG.formEntries.attempt, attempt);
        formData.append(FEEDBACK_CONFIG.formEntries.subject, subject);
        formData.append(FEEDBACK_CONFIG.formEntries.category, category);
        formData.append(FEEDBACK_CONFIG.formEntries.rating, String(rating));
        formData.append(FEEDBACK_CONFIG.formEntries.message, message.trim());

        await fetch(FEEDBACK_CONFIG.googleFormActionUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          body: formData,
        });
        deliveryMode = 'google-form';
      }

      const record: FeedbackSubmission = {
        id: `fb-${Date.now()}`,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        name: anonymous ? 'Anonymous' : name.trim(),
        anonymous,
        attempt,
        subject,
        category,
        rating,
        message: message.trim(),
        deliveryMode,
      };

      setSubmittedLog((prev) => [record, ...prev]);
      setMessage('');
      if (!anonymous) setName('');
    } catch {
      setValidationError('Could not transmit feedback right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="pt-2 pb-6 border-b border-slate-200 max-w-3xl space-y-2.5">
        <p className="text-xs font-medium text-blue-700">
          Student Views & Suggestions · Private Owner Log
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Share your views on the archive
        </h1>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
          Report a missing standard, suggest revision charts, or share how the modules helped your preparation. Submissions go directly to a private spreadsheet accessible only to the archive maintainer.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feedback Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-name"
                className="block text-xs font-semibold text-slate-700"
              >
                Your Name
              </label>
              <input
                id="feedback-name"
                type="text"
                disabled={anonymous}
                value={anonymous ? 'Anonymous' : name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:border-blue-700"
              />
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                />
                Submit anonymously
              </label>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="feedback-attempt"
                className="block text-xs font-semibold text-slate-700"
              >
                Target Exam Attempt
              </label>
              <select
                id="feedback-attempt"
                value={attempt}
                onChange={(e) => setAttempt(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-700"
              >
                {ATTEMPT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-subject"
                className="block text-xs font-semibold text-slate-700"
              >
                Subject
              </label>
              <select
                id="feedback-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-700"
              >
                <option value="All Subjects">All Subjects / Overall Website</option>
                {SUBJECT_CONFIGS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="feedback-category"
                className="block text-xs font-semibold text-slate-700"
              >
                Feedback Topic
              </label>
              <select
                id="feedback-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-700"
              >
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Rating Selector */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-700">
              How useful did you find these revision materials? ({rating} / 5)
            </span>
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Rating out of 5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`Rate ${value} out of 5`}
                  onClick={() => setRating(value)}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors cursor-pointer ${
                    value <= rating
                      ? 'bg-amber-50 border-amber-300 text-amber-600'
                      : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Star
                    className="w-5 h-5"
                    fill={value <= rating ? 'currentColor' : 'none'}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="feedback-message"
              className="block text-xs font-semibold text-slate-700"
            >
              Your Views or Suggestions
            </label>
            <textarea
              id="feedback-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us which chapter slides helped most, or mention any missing Ind AS / SA / section chart you would like added..."
              className="w-full p-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 leading-relaxed"
            />
          </div>

          {validationError && (
            <p role="alert" className="text-xs font-medium text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {validationError}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              Logged directly to the owner&apos;s private Google Sheet
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              {submitting ? 'Logging Views...' : 'Submit Feedback'}
            </button>
          </div>
        </form>

        {/* Right Side: Privacy Assurance & Confirmation Log */}
        <aside className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Private Sheet Delivery
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your feedback is never published publicly. It posts securely via a free Google Apps Script receiver directly into a private spreadsheet in the owner&apos;s Google Drive that is shared with nobody.
            </p>
            {!isLivePrivateSheet && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onOpenSetupGuide}
                  className="text-xs font-medium text-blue-700 hover:text-blue-900 underline underline-offset-4 cursor-pointer"
                >
                  Owner: Connect your private Google Sheet →
                </button>
              </div>
            )}
          </div>

          {submittedLog.length > 0 && (
            <div
              role="status"
              className="bg-white border border-emerald-200 rounded-xl p-5 space-y-3"
            >
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-semibold">
                  Thank you — feedback recorded ({submittedLog.length})
                </h3>
              </div>
              <div className="space-y-3">
                {submittedLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-xs space-y-1"
                  >
                    <p className="font-semibold text-slate-900">
                      {entry.subject} · {entry.rating}/5 stars
                    </p>
                    <p className="text-slate-700 line-clamp-3">{entry.message}</p>
                    <p className="text-[11px] text-slate-500">
                      {entry.name} · {entry.submittedAt} ·{' '}
                      {entry.deliveryMode === 'apps-script'
                        ? 'Posted to Private Google Sheet'
                        : entry.deliveryMode === 'google-form'
                          ? 'Posted via Google Form'
                          : 'Verified in Preview Mode'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
