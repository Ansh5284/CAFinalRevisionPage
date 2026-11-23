import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Lock,
  Presentation,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { StudyArtifact } from '../types/archive';
import { InfographicPlate } from './InfographicPlate';

interface ArtifactViewerModalProps {
  artifact: StudyArtifact | null;
  chapterSiblings: StudyArtifact[];
  onSelectArtifact: (artifact: StudyArtifact) => void;
  onClose: () => void;
}

function getCategoryLabel(category: StudyArtifact['category']): string {
  if (category === 'module') return 'Study Module';
  if (category === 'infographic') return 'Infographic';
  return 'Revision Slides';
}

export function ArtifactViewerModal({
  artifact,
  chapterSiblings,
  onSelectArtifact,
  onClose,
}: ArtifactViewerModalProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    setSlideIndex(0);
    setZoomPercent(100);
    setIframeLoaded(false);
  }, [artifact?.id]);

  // Deter Save/Print keyboard shortcuts & support Escape to close
  useEffect(() => {
    if (!artifact) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && ['s', 'p', 'u'].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [artifact, onClose]);

  if (!artifact) return null;

  const isLiveDriveFile = Boolean(artifact.previewUrl && artifact.driveFileId);
  const slides = artifact.previewSlides ?? [];
  const currentSlide = slides[slideIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`View-only reader: ${artifact.title}`}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 protected-artifact-surface no-select-artifact"
    >
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Viewer Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900 truncate">
              {artifact.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
              <span>{artifact.chapterTitle}</span>
              <span aria-hidden="true">·</span>
              <span>{getCategoryLabel(artifact.category)}</span>
              {artifact.standards.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-700">{artifact.standards.join(', ')}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                <Lock className="w-3 h-3" aria-hidden="true" />
                View-only (downloads disabled)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isLiveDriveFile && (
              <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setZoomPercent((z) => Math.max(80, z - 10))}
                  aria-label="Zoom out"
                  className="p-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs text-slate-700 tabular-nums px-1.5">
                  {zoomPercent}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomPercent((z) => Math.min(130, z + 10))}
                  aria-label="Zoom in"
                  className="p-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close document viewer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Viewer Body: Protected Stage + Sibling Chapter Switcher */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row bg-[#F8F9FA]">
          {/* Main Protected Viewing Canvas */}
          <div className="flex-1 min-w-0 min-h-0 relative flex flex-col overflow-hidden">
            {isLiveDriveFile ? (
              <div className="relative flex-1 w-full h-full bg-slate-900">
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-sm text-slate-600">
                    Streaming document directly from Google Drive (no file size limit)...
                  </div>
                )}

                {/*
                  VIEW-ONLY GOOGLE DRIVE STREAM:
                  - Uses `/preview` endpoint (streams multi-hundred-MB PDFs/slides/images directly)
                  - Never exposes download or export links
                  - Paired with Drive folder setting "Disable options to download, print, and copy"
                */}
                <iframe
                  title={artifact.title}
                  src={artifact.previewUrl}
                  onLoad={() => setIframeLoaded(true)}
                  sandbox="allow-scripts allow-same-origin"
                  allow="autoplay"
                  className="w-full h-full border-0"
                />

                {/*
                  Protective shield over Google Drive's top-right pop-out toolbar button
                  so visitors remain inside the view-only portal frame.
                */}
                <div
                  aria-hidden="true"
                  title="Pop-out and download are disabled"
                  className="absolute top-0 right-0 w-16 h-14 bg-slate-900/95 pointer-events-auto cursor-not-allowed flex items-center justify-center"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                <div
                  className="max-w-3xl mx-auto transition-transform origin-top"
                  style={{ transform: `scale(${zoomPercent / 100})` }}
                >
                  {artifact.previewDiagram ? (
                    <InfographicPlate
                      diagram={artifact.previewDiagram}
                      title={artifact.title}
                    />
                  ) : currentSlide ? (
                    <article className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 space-y-6">
                      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                        <div>
                          {currentSlide.standardRef && (
                            <p className="font-mono text-xs text-blue-700">
                              {currentSlide.standardRef}
                            </p>
                          )}
                          <h3 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 mt-1">
                            {currentSlide.heading}
                          </h3>
                        </div>
                        <span className="font-mono text-xs text-slate-500 tabular-nums shrink-0">
                          Page {slideIndex + 1} / {slides.length}
                        </span>
                      </div>

                      <ul className="space-y-3.5 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                        {currentSlide.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="font-mono text-xs font-medium text-blue-700 tabular-nums mt-1 shrink-0">
                              0{idx + 1}.
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>

                      {currentSlide.examTip && (
                        <div className="bg-[#F8F9FA] border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
                          <p className="font-semibold text-slate-900 text-xs mb-1">
                            Exam Application Pointer
                          </p>
                          <p>{currentSlide.examTip}</p>
                        </div>
                      )}
                    </article>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
                      Protected view-only preview ready. Connect your Google Drive API key to stream the full file directly from Drive.
                    </div>
                  )}

                  {slides.length > 1 && (
                    <div className="mt-5 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={slideIndex === 0}
                        onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        Previous Page
                      </button>

                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {slideIndex + 1} of {slides.length}
                      </span>

                      <button
                        type="button"
                        disabled={slideIndex >= slides.length - 1}
                        onClick={() => setSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next Page
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Companion Sidebar: Quick Switch Between All Files in This Chapter */}
          {chapterSiblings.length > 1 && (
            <aside
              aria-label="Other files in this chapter"
              className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-4 overflow-y-auto shrink-0 max-h-44 lg:max-h-none"
            >
              <p className="text-xs font-semibold text-slate-900 mb-1">
                Chapter Files ({chapterSiblings.length})
              </p>
              <p className="text-xs text-slate-500 mb-3 truncate">{artifact.chapterTitle}</p>

              <div className="space-y-1.5">
                {chapterSiblings.map((item) => {
                  const active = item.id === artifact.id;
                  const Icon =
                    item.category === 'module'
                      ? BookOpen
                      : item.category === 'infographic'
                        ? ImageIcon
                        : item.format === 'slides'
                          ? Presentation
                          : FileText;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={`View ${item.title}`}
                      onClick={() => onSelectArtifact(item)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-50 border-blue-200 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            active ? 'text-blue-700' : 'text-slate-400'
                          }`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium leading-snug line-clamp-2">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {getCategoryLabel(item.category)} · {item.sizeLabel}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
