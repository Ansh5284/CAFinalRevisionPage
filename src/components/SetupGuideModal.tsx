import { Check, Copy, Lock, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { GEMINI_QUIZ_JSON_TEMPLATE } from '../data/sampleQuizzes';

interface SetupGuideModalProps {
  open: boolean;
  isLiveDrive: boolean;
  onClose: () => void;
}

const APPS_SCRIPT_SNIPPET = `function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Feedback') || ss.insertSheet('Feedback');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp','Name','Anonymous','Attempt','Subject','Category','Rating','Message']);
  }
  sheet.appendRow([
    new Date().toISOString(),
    payload.anonymous ? 'Anonymous' : payload.name,
    Boolean(payload.anonymous),
    payload.attempt, payload.subject, payload.category, payload.rating, payload.message
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export function SetupGuideModal({ open, isLiveDrive, onClose }: SetupGuideModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!open) return null;

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Clipboard may be blocked in restricted iframes
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Owner Setup and Free APIs Guide"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Owner Setup, Drive Allowlist & Free APIs Guide
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current mode: {isLiveDrive ? 'Connected to live Google Drive folders' : 'Preview Catalog (ready for your Drive API key & folder IDs)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close setup guide"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-7 text-sm text-slate-700">
          {/* 1. Free APIs Summary */}
          <section className="space-y-3">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              1. 100% Free APIs & Services Used (Zero Paid Dependencies)
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Service / API</th>
                    <th className="py-2.5 px-4 font-semibold">Purpose</th>
                    <th className="py-2.5 px-4 font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-900">Google Drive API v3</td>
                    <td className="py-2.5 px-4">Lists files & subfolders strictly inside your allowlisted subject folders</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-700">Free (1B queries/day)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-900">Google Drive /preview Embed</td>
                    <td className="py-2.5 px-4">Streams huge PDFs, PPTX slides, and infographics with no file size limit</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-700">Free</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-900">Google Apps Script Web App</td>
                    <td className="py-2.5 px-4">Writes student feedback to your PRIVATE Google Sheet & saves future descriptive PDFs to your PRIVATE Drive</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-700">Free (built into Google)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-900">GitHub Pages</td>
                    <td className="py-2.5 px-4">Hosts this single-domain static website directly from your GitHub profile</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-700">Free</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Where to Put Drive API Key & Folder IDs */}
          <section className="space-y-2.5">
            <h3 className="font-display text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-700" aria-hidden="true" />
              2. Connect Your Drive API Key & Strictly Allowlisted Folders
            </h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs leading-relaxed">
              <li>
                Open <span className="font-mono text-slate-900">src/config/driveConfig.ts</span> (or set environment variables from <span className="font-mono text-slate-900">.env.example</span> in GitHub Actions).
              </li>
              <li>
                Insert your Google Drive API Key in <span className="font-mono text-slate-900">GOOGLE_DRIVE_CONFIG.apiKey</span>. In Google Cloud Console, restrict that API key by HTTP referrer (your GitHub Pages domain) and restrict APIs strictly to <strong>Google Drive API</strong>.
              </li>
              <li>
                For each of the 5 subjects, paste ONLY the folder IDs of your shared <span className="font-mono">Modules</span> and <span className="font-mono">Revision Slides & Infographics</span> folders (or <span className="font-mono">combinedSubjectFolderId</span>). Root Drive files are never queried.
              </li>
              <li>
                Renaming, adding, or deleting files/chapters in Drive updates automatically without breaking the website.
              </li>
            </ol>
          </section>

          {/* 3. Mandatory No-Download Drive Setting */}
          <section className="bg-[#F8F9FA] border border-slate-200 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" aria-hidden="true" />
              3. Server-Side No-Download Protection (Important Drive Setting)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The website already disables download buttons, right-click saving, printing, and Drive pop-out icons. To enforce true server-side download blocking across every browser: in Google Drive, right-click each shared folder → <strong>Share</strong> → click the gear icon (Settings) → <strong>UNCHECK &ldquo;Viewers and commenters can see the option to download, print, and copy&rdquo;</strong>.
            </p>
          </section>

          {/* 4. Private Google Sheet Feedback Receiver */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                4. Private Google Sheet Feedback & Descriptive Upload Script
              </h3>
              <button
                type="button"
                onClick={() => copyText('gas', APPS_SCRIPT_SNIPPET)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                {copiedKey === 'gas' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Starter Script
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The full dual-route script (Feedback + Descriptive PDF/Text upload + Evaluation Lookup) is included at <span className="font-mono text-slate-900">docs/google-apps-script/Code.gs</span>. Paste it inside your private Google Sheet (Extensions → Apps Script), deploy as Web App (<strong>Execute as: Me</strong>, <strong>Who has access: Anyone</strong>), and paste the URL in <span className="font-mono">driveConfig.ts</span>. Your Sheet stays 100% private.
            </p>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed">
              {APPS_SCRIPT_SNIPPET}
            </pre>
          </section>

          {/* 5. Future Gemini Tasks 100-Mark MCQ JSON Format */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                5. Future Daily 100-Mark MCQ Quiz JSON Schema (Gemini Tasks)
              </h3>
              <button
                type="button"
                onClick={() => copyText('quiz', GEMINI_QUIZ_JSON_TEMPLATE)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                {copiedKey === 'quiz' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy JSON Schema
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instruct Gemini Tasks to output daily/weekly 100-mark MCQ quizzes in this JSON structure and drop them into each subject&apos;s <span className="font-mono">quizFolderId</span> on Drive. The Pop Quiz tab discovers and renders them automatically.
            </p>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed">
              {GEMINI_QUIZ_JSON_TEMPLATE}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
