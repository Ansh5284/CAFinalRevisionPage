import type { SubjectConfig } from '../types/archive';

/**
 * ============================================================================
 * CHARTERED ARCHIVE — GOOGLE DRIVE & PRIVATE SHEET CONFIGURATION
 * ============================================================================
 *
 * HOW TO CONNECT YOUR GOOGLE DRIVE (100% FREE):
 * 1. Paste your Google Drive API v3 Key below OR set `VITE_GOOGLE_DRIVE_API_KEY`
 *    in your `.env` file / GitHub Actions Repository Variables.
 *    (In Google Cloud Console, restrict this key to your GitHub Pages domain
 *    and restrict API access exclusively to "Google Drive API".)
 *
 * 2. Paste ONLY the Folder IDs of the specific Modules and Revision folders
 *    you have set to "Anyone with the link -> Viewer" (with Download/Print/Copy
 *    disabled in Drive sharing settings).
 *    Folder ID is the string after `/folders/` in your Drive URL:
 *    https://drive.google.com/drive/folders/<FOLDER_ID_HERE>
 *
 * 3. SECURITY GUARANTEE:
 *    The app ONLY queries the exact folder IDs listed below. Your Drive root
 *    directory and any unshared/other folders are NEVER queried or exposed.
 *
 * 4. STRUCTURE RESILIENCE:
 *    You can supply:
 *      - `modulesFolderId` + `revisionsFolderId` (separate folders), OR
 *      - `combinedSubjectFolderId` (one subject folder containing chapter or
 *        module/revision subfolders), OR BOTH.
 *    Adding, renaming, or deleting files/subfolders will never break the site.
 */

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const GOOGLE_DRIVE_CONFIG = {
  /**
   * Put your Google Drive API key directly inside the quotes below,
   * OR leave empty here and provide VITE_GOOGLE_DRIVE_API_KEY in `.env` / GitHub Secrets.
   */
  apiKey: env.VITE_GOOGLE_DRIVE_API_KEY ?? '',

  /**
   * Maximum subfolder nesting depth to traverse inside each allowed folder.
   * Keeps API usage minimal and prevents runaway recursion.
   */
  maxFolderDepth: 4,
};

export const SUBJECT_CONFIGS: SubjectConfig[] = [
  {
    id: 'financial-reporting',
    paperCode: 'Paper 1',
    name: 'Financial Reporting',
    shortName: 'FR',
    description: 'Ind AS accounting standards, consolidation, financial instruments, and corporate reporting frameworks.',
    availability: 'complete',
    folders: {
      modulesFolderId: env.VITE_DRIVE_FR_MODULES_FOLDER_ID ?? '',
      revisionsFolderId: env.VITE_DRIVE_FR_REVISIONS_FOLDER_ID ?? '',
      combinedSubjectFolderId: env.VITE_DRIVE_FR_COMBINED_FOLDER_ID ?? '',
      quizFolderId: env.VITE_DRIVE_FR_QUIZ_FOLDER_ID ?? '',
    },
  },
  {
    id: 'advanced-audit',
    paperCode: 'Paper 3',
    name: 'Advanced Audit',
    shortName: 'Audit',
    description: 'Standards on Auditing (SAs), SQC 1, CARO 2020, special audits, and professional ethics.',
    availability: 'complete',
    folders: {
      modulesFolderId: env.VITE_DRIVE_AA_MODULES_FOLDER_ID ?? '',
      revisionsFolderId: env.VITE_DRIVE_AA_REVISIONS_FOLDER_ID ?? '',
      combinedSubjectFolderId: env.VITE_DRIVE_AA_COMBINED_FOLDER_ID ?? '',
      quizFolderId: env.VITE_DRIVE_AA_QUIZ_FOLDER_ID ?? '',
    },
  },
  {
    id: 'advanced-financial-management',
    paperCode: 'Paper 2',
    name: 'Advanced Financial Management',
    shortName: 'AFM',
    description: 'Forex exposure, derivatives, security valuation, portfolio management, and corporate restructuring.',
    availability: 'complete',
    folders: {
      modulesFolderId: env.VITE_DRIVE_AFM_MODULES_FOLDER_ID ?? '',
      revisionsFolderId: env.VITE_DRIVE_AFM_REVISIONS_FOLDER_ID ?? '',
      combinedSubjectFolderId: env.VITE_DRIVE_AFM_COMBINED_FOLDER_ID ?? '',
      quizFolderId: env.VITE_DRIVE_AFM_QUIZ_FOLDER_ID ?? '',
    },
  },
  {
    id: 'indirect-taxes',
    paperCode: 'Paper 5',
    name: 'Indirect Taxes',
    shortName: 'IDT',
    description: 'GST legislation, supply & levy, input tax credit, exemptions, customs law, and foreign trade policy.',
    availability: 'in-progress',
    folders: {
      modulesFolderId: env.VITE_DRIVE_IDT_MODULES_FOLDER_ID ?? '',
      revisionsFolderId: env.VITE_DRIVE_IDT_REVISIONS_FOLDER_ID ?? '',
      combinedSubjectFolderId: env.VITE_DRIVE_IDT_COMBINED_FOLDER_ID ?? '',
      quizFolderId: env.VITE_DRIVE_IDT_QUIZ_FOLDER_ID ?? '',
    },
  },
  {
    id: 'direct-taxes',
    paperCode: 'Paper 4',
    name: 'Direct Taxes',
    shortName: 'DT',
    description: 'Income-tax Act provisions, PGBP, capital gains, assessment procedures, and international taxation.',
    availability: 'in-progress',
    folders: {
      modulesFolderId: env.VITE_DRIVE_DT_MODULES_FOLDER_ID ?? '',
      revisionsFolderId: env.VITE_DRIVE_DT_REVISIONS_FOLDER_ID ?? '',
      combinedSubjectFolderId: env.VITE_DRIVE_DT_COMBINED_FOLDER_ID ?? '',
      quizFolderId: env.VITE_DRIVE_DT_QUIZ_FOLDER_ID ?? '',
    },
  },
];

/**
 * PRIVATE GOOGLE SHEET FEEDBACK CONFIGURATION (100% FREE)
 *
 * Recommended: Deploy `docs/google-apps-script/Code.gs` from your private Google Sheet
 * as a Web App ("Execute as: Me", "Who has access: Anyone") and paste the URL below.
 * Your Google Sheet stays strictly PRIVATE (shared with nobody).
 *
 * Optional Alternative: Link a Google Form to your private Sheet and supply
 * `googleFormActionUrl` + `formEntries`.
 */
export const FEEDBACK_CONFIG = {
  appsScriptUrl: env.VITE_FEEDBACK_APPS_SCRIPT_URL ?? '',
  googleFormActionUrl: '',
  formEntries: {
    name: 'entry.1000001',
    attempt: 'entry.1000002',
    subject: 'entry.1000003',
    category: 'entry.1000004',
    rating: 'entry.1000005',
    message: 'entry.1000006',
  },
};

/**
 * FUTURE DESCRIPTIVE ANSWER UPLOAD & EVALUATION LOOKUP (100% FREE)
 *
 * Uses the same Google Apps Script Web App (`docs/google-apps-script/Code.gs`)
 * to save typed answers or PDF uploads directly into a PRIVATE Drive folder
 * where your Gemini Argon tasks pick them up and write back evaluation JSON.
 */
export const DESCRIPTIVE_CONFIG = {
  appsScriptUrl: env.VITE_DESCRIPTIVE_APPS_SCRIPT_URL ?? '',
};

export function isDriveConfiguredForSubject(subject: SubjectConfig): boolean {
  if (!GOOGLE_DRIVE_CONFIG.apiKey.trim()) {
    return false;
  }
  const { modulesFolderId, revisionsFolderId, combinedSubjectFolderId } = subject.folders;
  return Boolean(
    modulesFolderId.trim() || revisionsFolderId.trim() || combinedSubjectFolderId.trim()
  );
}

export function hasAnyDriveConfiguration(): boolean {
  return SUBJECT_CONFIGS.some(isDriveConfiguredForSubject);
}
