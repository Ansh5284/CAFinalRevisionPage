import { GOOGLE_DRIVE_CONFIG } from '../config/driveConfig';
import type { SubjectCatalog, SubjectConfig } from '../types/archive';
import type { QuizDataset } from '../types/quiz';
import { normalizeDriveFilesToChapters, type RawDriveFile } from './driveNormalizer';
import { validateQuizJson } from './quizEngine';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

interface DriveApiFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

interface DriveApiListResponse {
  nextPageToken?: string;
  files?: DriveApiFileItem[];
}

/**
 * Queries ONLY the immediate children of an explicitly allowlisted folder ID.
 * Never requests 'root', never exposes webContentLink / downloadUrl.
 */
async function listFolderChildren(
  folderId: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<DriveApiFileItem[]> {
  const trimmedId = folderId.trim();
  if (!trimmedId || trimmedId.toLowerCase() === 'root') {
    return [];
  }

  const results: DriveApiFileItem[] = [];
  let pageToken: string | undefined;

  do {
    const query = `'${trimmedId.replace(/'/g, "\\'")}' in parents and trashed = false`;
    const params = new URLSearchParams({
      q: query,
      key: apiKey,
      pageSize: '200',
      fields: 'nextPageToken,files(id,name,mimeType,size,modifiedTime)',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    const response = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
      signal,
    });
    if (!response.ok) {
      throw new Error(`Drive folder fetch failed (${response.status})`);
    }
    const data = (await response.json()) as DriveApiListResponse;
    if (Array.isArray(data.files)) {
      results.push(...data.files);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return results;
}

async function crawlAllowedFolder(
  folderId: string,
  apiKey: string,
  sourceBucket: 'module' | 'revision' | undefined,
  folderPath: string[],
  depth: number,
  visitedFolders: Set<string>,
  signal?: AbortSignal
): Promise<RawDriveFile[]> {
  const safeId = folderId.trim();
  if (!safeId || safeId.toLowerCase() === 'root') return [];
  if (depth > GOOGLE_DRIVE_CONFIG.maxFolderDepth) return [];
  if (visitedFolders.has(safeId)) return [];
  visitedFolders.add(safeId);

  let children: DriveApiFileItem[] = [];
  try {
    children = await listFolderChildren(safeId, apiKey, signal);
  } catch {
    // Resilience: if a single subfolder is deleted or unshared, skip it without crashing the portal
    return [];
  }

  const collected: RawDriveFile[] = [];
  const subFolderTasks: Promise<RawDriveFile[]>[] = [];

  for (const item of children) {
    if (item.mimeType === FOLDER_MIME) {
      subFolderTasks.push(
        crawlAllowedFolder(
          item.id,
          apiKey,
          sourceBucket,
          [...folderPath, item.name],
          depth + 1,
          visitedFolders,
          signal
        )
      );
    } else {
      collected.push({
        id: item.id,
        name: item.name,
        mimeType: item.mimeType,
        size: item.size,
        modifiedTime: item.modifiedTime,
        folderPath,
        sourceBucket,
      });
    }
  }

  if (subFolderTasks.length > 0) {
    const nested = await Promise.all(subFolderTasks);
    for (const batch of nested) {
      collected.push(...batch);
    }
  }

  return collected;
}

/**
 * Fetches all study artifacts for one subject exclusively from its allowlisted
 * Drive folders (`modulesFolderId`, `revisionsFolderId`, and/or `combinedSubjectFolderId`).
 */
export async function fetchSubjectFromDrive(
  subject: SubjectConfig,
  signal?: AbortSignal
): Promise<SubjectCatalog> {
  const apiKey = GOOGLE_DRIVE_CONFIG.apiKey.trim();
  const visited = new Set<string>();
  const tasks: Promise<RawDriveFile[]>[] = [];

  if (subject.folders.modulesFolderId.trim()) {
    tasks.push(
      crawlAllowedFolder(
        subject.folders.modulesFolderId,
        apiKey,
        'module',
        ['Modules'],
        0,
        visited,
        signal
      )
    );
  }

  if (subject.folders.revisionsFolderId.trim()) {
    tasks.push(
      crawlAllowedFolder(
        subject.folders.revisionsFolderId,
        apiKey,
        'revision',
        ['Revision Slides & Infographics'],
        0,
        visited,
        signal
      )
    );
  }

  if (subject.folders.combinedSubjectFolderId.trim()) {
    tasks.push(
      crawlAllowedFolder(
        subject.folders.combinedSubjectFolderId,
        apiKey,
        undefined,
        [],
        0,
        visited,
        signal
      )
    );
  }

  const batches = await Promise.all(tasks);
  const allRawFiles = batches.flat();
  const chapters = normalizeDriveFilesToChapters(subject.id, allRawFiles);

  const totalModules = chapters.reduce((sum, ch) => sum + ch.modules.length, 0);
  const totalRevisions = chapters.reduce((sum, ch) => sum + ch.revisions.length, 0);

  return {
    config: subject,
    chapters,
    totalModules,
    totalRevisions,
    source: 'google-drive',
    syncNotice:
      chapters.length === 0
        ? 'Connected to Google Drive. Files uploaded into the shared subject folders will appear here automatically.'
        : undefined,
  };
}

/**
 * Future expansion: automatically discovers daily/weekly 100-mark MCQ JSON quizzes
 * uploaded by Gemini Tasks into each subject's allowlisted `quizFolderId`.
 */
export async function fetchQuizzesFromDrive(
  subject: SubjectConfig,
  signal?: AbortSignal
): Promise<QuizDataset[]> {
  const apiKey = GOOGLE_DRIVE_CONFIG.apiKey.trim();
  const quizFolderId = subject.folders.quizFolderId.trim();
  if (!apiKey || !quizFolderId || quizFolderId.toLowerCase() === 'root') {
    return [];
  }

  try {
    const items = await listFolderChildren(quizFolderId, apiKey, signal);
    const jsonFiles = items.filter(
      (file) =>
        file.mimeType === 'application/json' || file.name.toLowerCase().endsWith('.json')
    );

    const loaded: QuizDataset[] = [];
    for (const file of jsonFiles) {
      try {
        const res = await fetch(
          `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}?alt=media&key=${encodeURIComponent(apiKey)}`,
          { signal }
        );
        if (!res.ok) continue;
        const parsed = await res.json();
        const validated = validateQuizJson({ ...parsed, subjectId: parsed?.subjectId ?? subject.id });
        if (validated.ok) {
          loaded.push(validated.quiz);
        }
      } catch {
        // Ignore malformed or unreadable JSON file so other quizzes still load
      }
    }
    return loaded;
  } catch {
    return [];
  }
}
