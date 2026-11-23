import type { ActiveTab } from './Header';

interface FooterProps {
  isLiveDrive: boolean;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSetupGuide: () => void;
}

export function Footer({ isLiveDrive, onSelectTab, onOpenSetupGuide }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-slate-600">
        <div className="space-y-1">
          <p className="font-display font-semibold text-slate-900">Chartered Archive</p>
          <p className="text-xs text-slate-500">
            View-only CA Final revision archive · Strictly scoped to shared subject folders ·{' '}
            {isLiveDrive ? 'Synced with Google Drive' : 'Preview Catalog active'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onSelectTab('library')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Subject Library
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('quiz')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            MCQ Pop Quiz
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('descriptive')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Descriptive Practice
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('feedback')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Log Feedback
          </button>
          <button
            type="button"
            onClick={onOpenSetupGuide}
            className="text-blue-700 hover:text-blue-900 underline underline-offset-4 transition-colors cursor-pointer"
          >
            Owner Setup & Free APIs Guide
          </button>
        </div>
      </div>
    </footer>
  );
}
