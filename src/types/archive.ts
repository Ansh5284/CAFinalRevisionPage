export type SubjectId =
  | 'financial-reporting'
  | 'advanced-audit'
  | 'advanced-financial-management'
  | 'indirect-taxes'
  | 'direct-taxes';

export type ArtifactCategory = 'module' | 'revision-slide' | 'infographic';

export type ArtifactFormat = 'pdf' | 'slides' | 'image' | 'document';

export type PreviewDiagramKey =
  | 'accounting-cycle-image'
  | 'ind-as-115-five-step'
  | 'audit-risk-model'
  | 'forex-hedging-tree'
  | 'gst-itc-flow';

export interface PreviewSlide {
  heading: string;
  keyPoints: string[];
  standardRef?: string;
  examTip?: string;
}

export interface StudyArtifact {
  id: string;
  subjectId: SubjectId;
  chapterKey: string;
  chapterTitle: string;
  title: string;
  fileName: string;
  category: ArtifactCategory;
  format: ArtifactFormat;
  standards: string[];
  mimeType: string;
  sizeLabel: string;
  modifiedAt: string;
  folderPath: string[];
  /** Present when loaded live from Google Drive API v3 */
  driveFileId?: string;
  /** View-only Google Drive /preview embed URL (never a download link) */
  previewUrl?: string;
  /** Structured preview content used in Demo Catalog mode before Drive keys are added */
  previewSlides?: PreviewSlide[];
  previewDiagram?: PreviewDiagramKey;
}

export interface ChapterGroup {
  chapterKey: string;
  chapterNumber: number | null;
  chapterTitle: string;
  subjectId: SubjectId;
  standards: string[];
  modules: StudyArtifact[];
  revisions: StudyArtifact[];
  allArtifacts: StudyArtifact[];
}

export interface SubjectConfig {
  id: SubjectId;
  paperCode: string;
  name: string;
  shortName: string;
  description: string;
  availability: 'complete' | 'in-progress';
  /**
   * STRICT ALLOWLIST: Only these explicitly listed folder IDs are queried.
   * Root Drive files and parent directories are NEVER queried or exposed.
   */
  folders: {
    /** Folder containing Study Modules (can be flat files or chapter subfolders) */
    modulesFolderId: string;
    /** Folder containing Revision Slides & Infographics (can be sub-organized chapter-wise) */
    revisionsFolderId: string;
    /** Optional single shared subject folder if Modules & Revisions live inside one subject folder */
    combinedSubjectFolderId: string;
    /** Optional future folder where Gemini Tasks uploads daily/weekly 100-mark MCQ JSON quizzes */
    quizFolderId: string;
  };
}

export interface SubjectCatalog {
  config: SubjectConfig;
  chapters: ChapterGroup[];
  totalModules: number;
  totalRevisions: number;
  source: 'google-drive' | 'preview-catalog';
  syncNotice?: string;
}

export interface SearchResultGroup {
  subjectId: SubjectId;
  subjectName: string;
  subjectShortName: string;
  chapterKey: string;
  chapterTitle: string;
  standards: string[];
  /** Files whose own name, standard, or chapter directly matched the search query */
  directMatches: StudyArtifact[];
  /** All other companion files (modules, slides, infographics) belonging to the exact same chapter */
  relatedFiles: StudyArtifact[];
  relevanceScore: number;
}

export interface FeedbackSubmission {
  id: string;
  submittedAt: string;
  name: string;
  anonymous: boolean;
  attempt: string;
  subject: string;
  category: string;
  rating: number;
  message: string;
  deliveryMode: 'apps-script' | 'google-form' | 'local-preview';
}
