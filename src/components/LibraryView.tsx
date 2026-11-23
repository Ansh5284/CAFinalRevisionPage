import {
  BookOpen,
  Eye,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  Presentation,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { type RefObject, useEffect, useMemo, useState } from 'react';
import type {
  ChapterGroup,
  StudyArtifact,
  SubjectCatalog,
  SubjectId,
} from '../types/archive';
import { searchArchive } from '../utils/searchEngine';

interface LibraryViewProps {
  catalogs: SubjectCatalog[];
  loading: boolean;
  syncError: string | null;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onOpenArtifact: (artifact: StudyArtifact, chapterSiblings: StudyArtifact[]) => void;
  onRefreshDrive: () => void;
  onOpenSetupGuide: () => void;
}

function getArtifactIcon(artifact: StudyArtifact) {
  if (artifact.category === 'module') return BookOpen;
  if (artifact.category === 'infographic') return ImageIcon;
  if (artifact.format === 'slides') return Presentation;
  return FileText;
}

function getCategoryLabel(category: StudyArtifact['category']): string {
  if (category === 'module') return 'Study Module';
  if (category === 'infographic') return 'Infographic';
  return 'Revision Slides';
}

export function LibraryView({
  catalogs,
  loading,
  syncError,
  searchQuery,
  onSearchQueryChange,
  searchInputRef,
  onOpenArtifact,
  onRefreshDrive,
  onOpenSetupGuide,
}: LibraryViewProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('financial-reporting');
  const [searchScope, setSearchScope] = useState<SubjectId | 'all'>('all');
  const [selectedChapterKey, setSelectedChapterKey] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'module' | 'revision'>('all');

  const activeCatalog = useMemo(
    () => catalogs.find((c) => c.config.id === selectedSubjectId) ?? catalogs[0],
    [catalogs, selectedSubjectId]
  );

  // Keep selectedChapterKey valid whenever switching subjects or refreshing Drive
  useEffect(() => {
    if (!activeCatalog || activeCatalog.chapters.length === 0) {
      setSelectedChapterKey(null);
      return;
    }
    const stillExists = activeCatalog.chapters.some(
      (ch) => ch.chapterKey === selectedChapterKey
    );
    if (!stillExists) {
      setSelectedChapterKey(activeCatalog.chapters[0].chapterKey);
    }
  }, [activeCatalog, selectedChapterKey]);

  const activeChapter: ChapterGroup | null = useMemo(() => {
    if (!activeCatalog || activeCatalog.chapters.length === 0) return null;
    return (
      activeCatalog.chapters.find((c) => c.chapterKey === selectedChapterKey) ??
      activeCatalog.chapters[0]
    );
  }, [activeCatalog, selectedChapterKey]);

  const isSearching = searchQuery.trim().length > 0;

  const searchResults = useMemo(
    () => (isSearching ? searchArchive(catalogs, searchQuery, searchScope) : []),
    [catalogs, searchQuery, searchScope, isSearching]
  );

  const isLiveDrive = catalogs.some((c) => c.source === 'google-drive');

  const totalChaptersAcrossAll = catalogs.reduce((acc, c) => acc + c.chapters.length, 0);
  const totalFilesAcrossAll = catalogs.reduce(
    (acc, c) => acc + c.totalModules + c.totalRevisions,
    0
  );

  const quickSearchHints = ['Ind AS 115', 'Contract Modification', 'SA 315', 'Forex Hedging', 'Sec 16'];

  return (
    <div className="space-y-8">
      {/* Editorial Hero & Chapter-Aware Search Bar */}
      <section className="pt-2 pb-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-xs font-medium text-blue-700">
              CA Final Revision Portal · View-Only Reading Room
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
              Chapter-wise modules, revision slides, and infographics
            </h1>
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
              Browse all five subjects organized seamlessly by chapter—even across separate Drive folders. Searching any file name automatically surfaces every related module and revision chart from the same chapter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 tabular-nums shrink-0">
            <span>5 subjects</span>
            <span aria-hidden="true">·</span>
            <span>{totalChaptersAcrossAll} chapters</span>
            <span aria-hidden="true">·</span>
            <span>{totalFilesAcrossAll} view-only artifacts</span>
            {isLiveDrive && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={onRefreshDrive}
                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  Refresh Drive
                </button>
              </>
            )}
          </div>
        </div>

        {/* Unified Chapter & Standard Search Control */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="archive-search-input" className="sr-only">
              Search by chapter name, standard code, or file name
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="archive-search-input"
              type="text"
              role="searchbox"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search by chapter, standard (Ind AS 115, SA 315, Sec 16), or file name..."
              className="w-full h-12 pl-11 pr-10 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15 transition-colors"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isSearching && (
            <div className="sm:w-56 shrink-0">
              <label htmlFor="search-subject-scope" className="sr-only">
                Filter search results by subject
              </label>
              <select
                id="search-subject-scope"
                value={searchScope}
                onChange={(e) => setSearchScope(e.target.value as SubjectId | 'all')}
                className="w-full h-12 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-700"
              >
                <option value="all">All 5 Subjects</option>
                {catalogs.map((cat) => (
                  <option key={cat.config.id} value={cat.config.id}>
                    {cat.config.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Quick Search Hints (unboxed inline links) */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>Try searching:</span>
          {quickSearchHints.map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => onSearchQueryChange(hint)}
              className="font-mono text-slate-700 hover:text-blue-700 underline decoration-slate-300 underline-offset-4 transition-colors cursor-pointer"
            >
              {hint}
            </button>
          ))}
        </div>
      </section>

      {syncError && (
        <div
          role="alert"
          className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <span>{syncError}</span>
          <button
            type="button"
            onClick={onOpenSetupGuide}
            className="text-xs font-semibold text-amber-950 underline underline-offset-4 shrink-0 cursor-pointer"
          >
            Check Drive Setup Guide
          </button>
        </div>
      )}

      {/* MODE A: CHAPTER-AWARE SEARCH RESULTS */}
      {isSearching ? (
        <section aria-label="Search Results" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                Search Results for &ldquo;{searchQuery.trim()}&rdquo;
              </h2>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                {searchResults.length}{' '}
                {searchResults.length === 1 ? 'chapter matched' : 'chapters matched'} · Companion chapter files expanded automatically
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSearchQueryChange('')}
              className="text-sm font-medium text-blue-700 hover:text-blue-900 self-start sm:self-auto cursor-pointer"
            >
              Return to Subject Library
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
              <p className="font-display text-lg font-semibold text-slate-900">
                No matching chapters, standards, or files found
              </p>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Try searching a standard code like <span className="font-mono">Ind AS 116</span>, <span className="font-mono">SA 705</span>, or a broader chapter keyword.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {searchResults.map((group) => {
                const chapterAllFiles = [...group.directMatches, ...group.relatedFiles];
                return (
                  <article
                    key={`${group.subjectId}-${group.chapterKey}`}
                    className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          {group.subjectName}
                          {group.standards.length > 0 && (
                            <>
                              {' '}
                              · <span className="font-mono text-slate-700">{group.standards.join(', ')}</span>
                            </>
                          )}
                        </p>
                        <h3 className="font-display text-xl font-semibold text-slate-900 mt-0.5">
                          {group.chapterTitle}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(group.subjectId);
                          setSelectedChapterKey(group.chapterKey);
                          onSearchQueryChange('');
                        }}
                        className="text-xs font-medium text-blue-700 hover:text-blue-900 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Open full chapter →
                      </button>
                    </div>

                    {/* Direct Matches */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-900">
                        Direct Matches ({group.directMatches.length})
                      </p>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                        {group.directMatches.map((file) => {
                          const Icon = getArtifactIcon(file);
                          return (
                            <div
                              key={file.id}
                              className="px-4 py-3.5 bg-blue-50/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <Icon
                                  className="w-4 h-4 text-blue-700 mt-1 shrink-0"
                                  aria-hidden="true"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate">
                                    {file.title}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                                    {getCategoryLabel(file.category)} · {file.sizeLabel} · Updated {file.modifiedAt}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => onOpenArtifact(file, chapterAllFiles)}
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                View File
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Automatically Expanded Sibling Files in the Same Chapter */}
                    {group.relatedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-700">
                          Other files in this chapter ({group.relatedFiles.length})
                        </p>
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                          {group.relatedFiles.map((file) => {
                            const Icon = getArtifactIcon(file);
                            return (
                              <div
                                key={file.id}
                                className="px-4 py-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <Icon
                                    className="w-4 h-4 text-slate-400 mt-0.5 shrink-0"
                                    aria-hidden="true"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                      {file.title}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                                      {getCategoryLabel(file.category)} · {file.sizeLabel}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onOpenArtifact(file, chapterAllFiles)}
                                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                  View File
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        /* MODE B: SUBJECT & CHAPTER-WISE BROWSER */
        <section aria-label="Subject Library" className="space-y-6">
          {/* 5 Subject Tabs (All 5 subjects always available; 3 complete + 2 in-progress cleanly noted) */}
          <div
            role="tablist"
            aria-label="CA Final Subjects"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
          >
            {catalogs.map((cat) => {
              const active = cat.config.id === selectedSubjectId;
              const fileCount = cat.totalModules + cat.totalRevisions;
              return (
                <button
                  key={cat.config.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSelectedSubjectId(cat.config.id);
                    setCategoryFilter('all');
                  }}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    active
                      ? 'bg-white border-blue-700 ring-1 ring-blue-700/15 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-mono">{cat.config.paperCode}</span>
                    {cat.config.availability === 'in-progress' && (
                      <span className="text-amber-700 font-medium">In Progress</span>
                    )}
                  </div>
                  <p
                    className={`font-semibold text-sm mt-1.5 leading-snug ${
                      active ? 'text-blue-800' : 'text-slate-900'
                    }`}
                  >
                    {cat.config.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 tabular-nums">
                    {cat.chapters.length} {cat.chapters.length === 1 ? 'chapter' : 'chapters'} ·{' '}
                    {fileCount} {fileCount === 1 ? 'file' : 'files'}
                  </p>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-sm text-slate-600">
              Syncing allowlisted subject folders from Google Drive...
            </div>
          ) : activeCatalog ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Chapter Index Sidebar */}
              <aside
                aria-label={`${activeCatalog.config.name} chapters`}
                className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-slate-200">
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    {activeCatalog.config.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {activeCatalog.config.description}
                  </p>
                </div>

                {activeCatalog.chapters.length === 0 ? (
                  <div className="p-6 text-sm text-slate-600 space-y-2">
                    <p className="font-medium text-slate-900">No files uploaded yet</p>
                    <p className="text-xs leading-relaxed">
                      This subject folder is ready. Any modules, revision slides, or infographics added to Drive will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activeCatalog.chapters.map((chapter, idx) => {
                      const isSelected = activeChapter?.chapterKey === chapter.chapterKey;
                      const numLabel =
                        chapter.chapterNumber !== null
                          ? String(chapter.chapterNumber).padStart(2, '0')
                          : String(idx + 1).padStart(2, '0');
                      return (
                        <button
                          key={chapter.chapterKey}
                          type="button"
                          onClick={() => setSelectedChapterKey(chapter.chapterKey)}
                          className={`w-full text-left px-5 py-4 transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`font-mono text-xs font-medium tabular-nums mt-0.5 shrink-0 ${
                                isSelected ? 'text-blue-700' : 'text-slate-400'
                              }`}
                            >
                              {numLabel}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm font-semibold leading-snug ${
                                  isSelected ? 'text-blue-900' : 'text-slate-900'
                                }`}
                              >
                                {chapter.chapterTitle}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 tabular-nums">
                                {chapter.standards.length > 0 && (
                                  <>
                                    <span className="font-mono text-slate-700">
                                      {chapter.standards.slice(0, 2).join(', ')}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                  </>
                                )}
                                <span>
                                  {chapter.modules.length} mod · {chapter.revisions.length} rev
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeCatalog.config.availability === 'in-progress' && (
                  <div className="px-5 py-3.5 bg-[#F8F9FA] border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
                    Additional {activeCatalog.config.shortName} chapters are being compiled and will sync automatically as files are added to Drive.
                  </div>
                )}
              </aside>

              {/* Right Column: Active Chapter Modules & Revision Slides / Infographics */}
              <div className="lg:col-span-8 space-y-6">
                {activeChapter ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
                      <div>
                        <p className="text-xs text-slate-500">
                          {activeCatalog.config.name}
                          {activeChapter.standards.length > 0 && (
                            <>
                              {' '}
                              ·{' '}
                              <span className="font-mono text-blue-700">
                                {activeChapter.standards.join(' / ')}
                              </span>
                            </>
                          )}
                        </p>
                        <h3 className="font-display text-2xl font-semibold text-slate-900 mt-1">
                          {activeChapter.chapterTitle}
                        </h3>
                      </div>

                      {/* Interactive Filter Segmented Control */}
                      <div
                        role="group"
                        aria-label="Filter artifact type"
                        className="inline-flex items-center p-1 bg-slate-100 rounded-lg self-start shrink-0"
                      >
                        {(
                          [
                            { id: 'all', label: 'All' },
                            { id: 'module', label: 'Modules' },
                            { id: 'revision', label: 'Revisions' },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setCategoryFilter(opt.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              categoryFilter === opt.id
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section 1: Study Modules */}
                    {(categoryFilter === 'all' || categoryFilter === 'module') && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-slate-500" aria-hidden="true" />
                            Study Modules
                          </h4>
                          <span className="text-xs text-slate-500 tabular-nums">
                            {activeChapter.modules.length}{' '}
                            {activeChapter.modules.length === 1 ? 'file' : 'files'}
                          </span>
                        </div>

                        {activeChapter.modules.length === 0 ? (
                          <p className="text-xs text-slate-500 py-3 px-4 bg-[#F8F9FA] rounded-lg border border-slate-200">
                            No module uploaded in this chapter yet.
                          </p>
                        ) : (
                          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                            {activeChapter.modules.map((mod) => (
                              <div
                                key={mod.id}
                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                              >
                                <div className="min-w-0 space-y-1">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {mod.title}
                                  </p>
                                  <p className="text-xs text-slate-500 tabular-nums">
                                    PDF Module · {mod.sizeLabel} · Updated {mod.modifiedAt} · View-only
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenArtifact(mod, activeChapter.allArtifacts)
                                  }
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                  Open Module
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section 2: Revision Slides & Infographics */}
                    {(categoryFilter === 'all' || categoryFilter === 'revision') && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-slate-500" aria-hidden="true" />
                            Revision Slides & Infographics
                          </h4>
                          <span className="text-xs text-slate-500 tabular-nums">
                            {activeChapter.revisions.length}{' '}
                            {activeChapter.revisions.length === 1 ? 'file' : 'files'}
                          </span>
                        </div>

                        {activeChapter.revisions.length === 0 ? (
                          <p className="text-xs text-slate-500 py-3 px-4 bg-[#F8F9FA] rounded-lg border border-slate-200">
                            Revision slides and visual infographics for this chapter will appear here automatically once uploaded to Drive.
                          </p>
                        ) : (
                          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                            {activeChapter.revisions.map((rev) => {
                              const Icon = getArtifactIcon(rev);
                              return (
                                <div
                                  key={rev.id}
                                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                                >
                                  <div className="flex items-start gap-3 min-w-0">
                                    <Icon
                                      className="w-4 h-4 text-slate-500 mt-1 shrink-0"
                                      aria-hidden="true"
                                    />
                                    <div className="min-w-0 space-y-1">
                                      <p className="text-sm font-semibold text-slate-900">
                                        {rev.title}
                                      </p>
                                      <p className="text-xs text-slate-500 tabular-nums">
                                        {getCategoryLabel(rev.category)} · {rev.sizeLabel} · Updated {rev.modifiedAt} · View-only
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenArtifact(rev, activeChapter.allArtifacts)
                                    }
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                    View Artifact
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
                    <FolderOpen
                      className="w-8 h-8 text-slate-400 mx-auto"
                      aria-hidden="true"
                    />
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      {activeCatalog.config.name} folder is ready for uploads
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      {activeCatalog.syncNotice ??
                        'Add module PDFs, revision slides, or infographics to this subject folder in Google Drive and refresh.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
