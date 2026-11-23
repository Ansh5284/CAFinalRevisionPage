import { useCallback, useEffect, useRef, useState } from 'react';
import { ArtifactViewerModal } from './components/ArtifactViewerModal';
import { DescriptiveView } from './components/DescriptiveView';
import { FeedbackView } from './components/FeedbackView';
import { Footer } from './components/Footer';
import { Header, type ActiveTab } from './components/Header';
import { LibraryView } from './components/LibraryView';
import { QuizView } from './components/QuizView';
import { SetupGuideModal } from './components/SetupGuideModal';
import {
  hasAnyDriveConfiguration,
  isDriveConfiguredForSubject,
  SUBJECT_CONFIGS,
} from './config/driveConfig';
import { buildSeedCatalogs } from './data/seedCatalog';
import type { StudyArtifact, SubjectCatalog } from './types/archive';
import type { QuizDataset } from './types/quiz';
import { fetchQuizzesFromDrive, fetchSubjectFromDrive } from './utils/driveService';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('library');
  const [catalogs, setCatalogs] = useState<SubjectCatalog[]>(() => buildSeedCatalogs());
  const [driveQuizzes, setDriveQuizzes] = useState<QuizDataset[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeViewer, setActiveViewer] = useState<{
    artifact: StudyArtifact;
    siblings: StudyArtifact[];
  } | null>(null);
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const syncGoogleDrive = useCallback(async () => {
    if (!hasAnyDriveConfiguration()) {
      setCatalogs(buildSeedCatalogs());
      setDriveQuizzes([]);
      setSyncError(null);
      return;
    }

    setLoadingDrive(true);
    setSyncError(null);
    const seedFallback = buildSeedCatalogs();

    try {
      const updatedCatalogs = await Promise.all(
        SUBJECT_CONFIGS.map(async (subjectConfig, index) => {
          if (!isDriveConfiguredForSubject(subjectConfig)) {
            return seedFallback[index];
          }
          try {
            return await fetchSubjectFromDrive(subjectConfig);
          } catch {
            return {
              ...seedFallback[index],
              syncNotice:
                'Could not read this Drive folder. Verify sharing permissions ("Anyone with the link -> Viewer") and API key restrictions.',
            };
          }
        })
      );

      setCatalogs(updatedCatalogs);

      // Future expansion: auto-load any daily/weekly MCQ JSON quizzes from Drive quiz folders
      const quizBatches = await Promise.all(
        SUBJECT_CONFIGS.map((subjectConfig) => fetchQuizzesFromDrive(subjectConfig))
      );
      setDriveQuizzes(quizBatches.flat());
    } catch {
      setSyncError(
        'Unable to reach Google Drive API right now. Showing local preview catalog until connection recovers.'
      );
    } finally {
      setLoadingDrive(false);
    }
  }, []);

  useEffect(() => {
    void syncGoogleDrive();
  }, [syncGoogleDrive]);

  // Global keyboard shortcut (Ctrl/Cmd + K) to jump straight into archive search
  useEffect(() => {
    const handleGlobalKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setActiveTab('library');
        setTimeout(() => searchInputRef.current?.focus(), 40);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const handleOpenSearch = () => {
    setActiveTab('library');
    setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 40);
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };

  const isLiveDrive = catalogs.some((c) => c.source === 'google-drive');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900">
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenSearch={handleOpenSearch}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'library' && (
          <LibraryView
            catalogs={catalogs}
            loading={loadingDrive}
            syncError={syncError}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            searchInputRef={searchInputRef}
            onOpenArtifact={(artifact, siblings) =>
              setActiveViewer({ artifact, siblings })
            }
            onRefreshDrive={() => void syncGoogleDrive()}
            onOpenSetupGuide={() => setSetupGuideOpen(true)}
          />
        )}

        {activeTab === 'quiz' && <QuizView driveQuizzes={driveQuizzes} />}

        {activeTab === 'descriptive' && <DescriptiveView />}

        {activeTab === 'feedback' && (
          <FeedbackView onOpenSetupGuide={() => setSetupGuideOpen(true)} />
        )}
      </main>

      <Footer
        isLiveDrive={isLiveDrive}
        onSelectTab={handleSelectTab}
        onOpenSetupGuide={() => setSetupGuideOpen(true)}
      />

      <ArtifactViewerModal
        artifact={activeViewer?.artifact ?? null}
        chapterSiblings={activeViewer?.siblings ?? []}
        onSelectArtifact={(nextArtifact) =>
          setActiveViewer((prev) =>
            prev ? { ...prev, artifact: nextArtifact } : null
          )
        }
        onClose={() => setActiveViewer(null)}
      />

      <SetupGuideModal
        open={setupGuideOpen}
        isLiveDrive={isLiveDrive}
        onClose={() => setSetupGuideOpen(false)}
      />
    </div>
  );
}
