import type {
  ArtifactCategory,
  ArtifactFormat,
  ChapterGroup,
  StudyArtifact,
  SubjectId,
} from '../types/archive';

export interface RawDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string | number;
  modifiedTime?: string;
  /** Relative folder path strictly inside the allowed root folder (never includes Drive root) */
  folderPath: string[];
  /** Explicit hint when fetched from a dedicated Modules or Revisions allowlisted folder */
  sourceBucket?: 'module' | 'revision';
}

const GENERIC_FOLDER_NAMES = new Set([
  'modules',
  'module',
  'study modules',
  'study material',
  'study materials',
  'icai modules',
  'revisions',
  'revision',
  'revision slides',
  'revision slides and infographics',
  'revision slides and charts',
  'revision slides & infographics',
  'revision slides & charts',
  'slides',
  'slides and infographics',
  'slides & charts',
  'infographics',
  'charts',
  'notes',
  'handouts',
  'pdfs',
  'files',
  'financial reporting',
  'advanced audit',
  'advanced financial management',
  'indirect taxes',
  'direct taxes',
]);

const STANDARD_PATTERNS: RegExp[] = [
  /\bInd[\s.-]*AS[\s.-]*\d+[A-Z]?\b/gi,
  /\b(?:SA|SQC|SRE|SAE|SRS)[\s.-]*\d+[A-Z]?\b/gi,
  /(?<!Ind[\s.-]?)\bAS[\s.-]*\d+[A-Z]?\b/gi,
  /\bCARO[\s.-]*\d{4}\b/gi,
  /\bICDS[\s.-]*[IVX0-9]+\b/gi,
  /\bSec(?:tion|\.)?[\s.-]*\d+[A-Z]{0,3}(?:\(\d+\))?/gi,
];

/**
 * Builds a view-only Google Drive embed URL that streams files of any size
 * without exposing download links.
 */
export function buildProtectedPreviewUrl(driveFileId: string): string {
  const safeId = encodeURIComponent(driveFileId.trim());
  return `https://drive.google.com/file/d/${safeId}/preview`;
}

export function stripFileExtension(fileName: string): string {
  return fileName.replace(/\.(pdf|pptx?|docx?|png|jpe?g|webp|svg|gif|json)$/i, '').trim();
}

export function formatFileSize(size?: string | number): string {
  if (size === undefined || size === null || size === '') {
    return 'Streamed view';
  }
  const bytes = typeof size === 'string' ? Number(size) : size;
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return 'Streamed view';
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function inferArtifactFormat(mimeType: string, fileName: string): ArtifactFormat {
  const lowerMime = (mimeType || '').toLowerCase();
  const lowerName = (fileName || '').toLowerCase();

  if (
    lowerMime.includes('presentation') ||
    lowerName.endsWith('.ppt') ||
    lowerName.endsWith('.pptx') ||
    lowerName.includes('slide')
  ) {
    return 'slides';
  }
  if (
    lowerMime.startsWith('image/') ||
    /\.(png|jpe?g|webp|svg|gif)$/i.test(lowerName)
  ) {
    return 'image';
  }
  if (lowerMime.includes('pdf') || lowerName.endsWith('.pdf')) {
    return 'pdf';
  }
  return 'document';
}

export function extractStandardCodes(text: string): string[] {
  const found = new Map<string, string>();
  for (const regex of STANDARD_PATTERNS) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const raw = match[0]
        .replace(/[\s.-]+/g, ' ')
        .replace(/\bSec(?:tion|\.)?\s+/i, 'Sec ')
        .replace(/\bind\s*as\s*/i, 'Ind AS ')
        .replace(/\bsa\b/i, 'SA')
        .replace(/\bsqc\b/i, 'SQC')
        .replace(/\bsre\b/i, 'SRE')
        .replace(/\bsae\b/i, 'SAE')
        .replace(/\bsrs\b/i, 'SRS')
        .replace(/\bcaro\b/i, 'CARO')
        .replace(/\bicds\b/i, 'ICDS')
        .replace(/\s+/g, ' ')
        .trim();
      const dedupeKey = raw.toLowerCase().replace(/\s+/g, '');
      if (!found.has(dedupeKey)) {
        found.set(dedupeKey, raw);
      }
    }
  }
  return Array.from(found.values());
}

export function inferArtifactCategory(
  fileName: string,
  folderPath: string[],
  mimeType: string,
  sourceBucket?: 'module' | 'revision'
): ArtifactCategory {
  const lowerName = fileName.toLowerCase();
  const lowerPath = folderPath.map((seg) => seg.toLowerCase()).join(' / ');
  const lowerMime = (mimeType || '').toLowerCase();

  const looksInfographic =
    lowerMime.startsWith('image/') ||
    /\.(png|jpe?g|webp|svg)$/i.test(lowerName) ||
    /\b(infographic|chart|flowchart|mind[\s-]?map|cheat[\s-]?sheet|poster|diagram|visual)\b/i.test(
      lowerName
    );

  const looksSlide =
    lowerMime.includes('presentation') ||
    /\.(pptx?)$/i.test(lowerName) ||
    /\b(slide|slides|deck|revision|summary|quick[\s-]?rev|recap)\b/i.test(lowerName);

  const pathIndicatesModule = /\b(module|modules|study material|textbook|icai)\b/i.test(
    lowerPath
  );
  const pathIndicatesRevision =
    /\b(revision|slide|slides|infographic|infographics|chart|charts|summary)\b/i.test(
      lowerPath
    );

  if (sourceBucket === 'module' && !looksInfographic && !looksSlide) {
    return 'module';
  }
  if (sourceBucket === 'revision') {
    return looksInfographic ? 'infographic' : 'revision-slide';
  }
  if (looksInfographic) {
    return 'infographic';
  }
  if (looksSlide) {
    return 'revision-slide';
  }
  if (pathIndicatesRevision && !pathIndicatesModule) {
    return 'revision-slide';
  }
  if (pathIndicatesModule || /\b(module|ch(?:apter)?\s*\d+.*text|comprehensive)\b/i.test(lowerName)) {
    return 'module';
  }
  return 'module';
}

function cleanChapterLabel(raw: string): {
  title: string;
  chapterNumber: number | null;
} {
  let text = stripFileExtension(raw)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract optional leading chapter number like "Ch 04 - ..." or "Chapter 3: ..." or "02. ..."
  let chapterNumber: number | null = null;
  const chMatch = text.match(/^(?:chapter|chap|ch|unit|topic)[\s.#-]*(\d{1,2})\b[\s:.\-–—]*/i);
  if (chMatch) {
    chapterNumber = Number(chMatch[1]);
    text = text.slice(chMatch[0].length).trim();
  } else {
    const numPrefix = text.match(/^(\d{1,2})[\s.)\-–—]+(.+)$/);
    if (numPrefix && !/^(19|20)\d{2}/.test(numPrefix[1])) {
      chapterNumber = Number(numPrefix[1]);
      text = numPrefix[2].trim();
    }
  }

  // Remove trailing artifact type descriptors so "Ind AS 115 - Revenue Module" and
  // "Ind AS 115 - Revenue Revision Slides" resolve to the same chapter title.
  text = text
    .replace(
      /[\s\-–—:|]+(?:study\s+module|module(?:\s*\d+)?|revision\s+slides?|slides?|infographic|chart|flowchart|mind\s*map|summary|notes|deck|part\s*\d+|v\d+)$/gi,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    text = chapterNumber !== null ? `Chapter ${chapterNumber}` : 'General Revision Resources';
  }

  return { title: text, chapterNumber };
}

export function extractChapterMeta(
  fileName: string,
  folderPath: string[]
): {
  chapterKey: string;
  chapterTitle: string;
  chapterNumber: number | null;
  standards: string[];
} {
  const combinedText = `${folderPath.join(' ')} ${fileName}`;
  const standards = extractStandardCodes(combinedText);

  // Pick the most specific non-generic subfolder as chapter folder (supports Pattern A & Pattern B)
  const meaningfulFolders = folderPath.filter((seg) => {
    const normalized = seg.trim().toLowerCase().replace(/\s+/g, ' ');
    return normalized.length > 0 && !GENERIC_FOLDER_NAMES.has(normalized);
  });

  const chapterSource =
    meaningfulFolders.length > 0
      ? meaningfulFolders[meaningfulFolders.length - 1]
      : stripFileExtension(fileName);

  const { title, chapterNumber } = cleanChapterLabel(chapterSource);

  // Build a stable merge key so files from separate `Modules/` and `Revision Slides/` folders
  // unify into the same chapter group when they share a primary standard or normalized title.
  const primaryStandard = standards[0];
  let chapterKey: string;
  if (primaryStandard && meaningfulFolders.length === 0) {
    // Flat file with a standard code (e.g. "Ind AS 115 Revenue Module.pdf") merges cleanly
    // with any folder or file centered on that primary standard.
    chapterKey = primaryStandard.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  } else if (primaryStandard && title.toLowerCase().includes(primaryStandard.toLowerCase())) {
    chapterKey = primaryStandard.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  } else {
    chapterKey = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  if (!chapterKey) {
    chapterKey = 'general-resources';
  }

  return {
    chapterKey,
    chapterTitle: title,
    chapterNumber,
    standards,
  };
}

/**
 * Resiliently normalizes an arbitrary flat list of Drive files (from any mix of
 * Pattern A, Pattern B, or flat folder layouts) into clean, sorted ChapterGroups.
 * Never throws on empty, malformed, renamed, or missing files.
 */
export function normalizeDriveFilesToChapters(
  subjectId: SubjectId,
  rawFiles: RawDriveFile[]
): ChapterGroup[] {
  if (!Array.isArray(rawFiles) || rawFiles.length === 0) {
    return [];
  }

  const chapterMap = new Map<
    string,
    {
      chapterKey: string;
      chapterNumber: number | null;
      chapterTitle: string;
      standards: Set<string>;
      modules: StudyArtifact[];
      revisions: StudyArtifact[];
    }
  >();

  // Skip Drive folder stubs and JSON quiz files from the study library
  const validFiles = rawFiles.filter((file) => {
    if (!file || !file.id || !file.name) return false;
    if (file.mimeType === 'application/vnd.google-apps.folder') return false;
    if (file.name.toLowerCase().endsWith('.json')) return false;
    return true;
  });

  for (const file of validFiles) {
    const folderPath = Array.isArray(file.folderPath) ? file.folderPath : [];
    const category = inferArtifactCategory(
      file.name,
      folderPath,
      file.mimeType,
      file.sourceBucket
    );
    const meta = extractChapterMeta(file.name, folderPath);

    const artifact: StudyArtifact = {
      id: `${subjectId}-${file.id}`,
      subjectId,
      chapterKey: meta.chapterKey,
      chapterTitle: meta.chapterTitle,
      title: stripFileExtension(file.name).replace(/_/g, ' '),
      fileName: file.name,
      category,
      format: inferArtifactFormat(file.mimeType, file.name),
      standards: meta.standards,
      mimeType: file.mimeType || 'application/pdf',
      sizeLabel: formatFileSize(file.size),
      modifiedAt: file.modifiedTime
        ? file.modifiedTime.slice(0, 10)
        : 'Recently updated',
      folderPath,
      driveFileId: file.id,
      previewUrl: buildProtectedPreviewUrl(file.id),
    };

    let existing = chapterMap.get(meta.chapterKey);
    if (!existing) {
      existing = {
        chapterKey: meta.chapterKey,
        chapterNumber: meta.chapterNumber,
        chapterTitle: meta.chapterTitle,
        standards: new Set(meta.standards),
        modules: [],
        revisions: [],
      };
      chapterMap.set(meta.chapterKey, existing);
    } else {
      // Prefer a numbered chapter title or a richer descriptive title if discovered later
      if (existing.chapterNumber === null && meta.chapterNumber !== null) {
        existing.chapterNumber = meta.chapterNumber;
      }
      if (meta.chapterTitle.length > existing.chapterTitle.length && meta.chapterTitle.length <= 72) {
        existing.chapterTitle = meta.chapterTitle;
      }
      for (const std of meta.standards) {
        existing.standards.add(std);
      }
    }

    if (category === 'module') {
      existing.modules.push(artifact);
    } else {
      existing.revisions.push(artifact);
    }
  }

  const chapters: ChapterGroup[] = Array.from(chapterMap.values()).map((entry) => {
    const sortedModules = [...entry.modules].sort((a, b) => a.title.localeCompare(b.title));
    const sortedRevisions = [...entry.revisions].sort((a, b) => a.title.localeCompare(b.title));
    const allArtifacts = [...sortedModules, ...sortedRevisions].map((art) => ({
      ...art,
      chapterTitle: entry.chapterTitle,
    }));

    return {
      chapterKey: entry.chapterKey,
      chapterNumber: entry.chapterNumber,
      chapterTitle: entry.chapterTitle,
      subjectId,
      standards: Array.from(entry.standards),
      modules: sortedModules.map((art) => ({ ...art, chapterTitle: entry.chapterTitle })),
      revisions: sortedRevisions.map((art) => ({ ...art, chapterTitle: entry.chapterTitle })),
      allArtifacts,
    };
  });

  chapters.sort((a, b) => {
    if (a.chapterNumber !== null && b.chapterNumber !== null) {
      return a.chapterNumber - b.chapterNumber;
    }
    if (a.chapterNumber !== null) return -1;
    if (b.chapterNumber !== null) return 1;
    return a.chapterTitle.localeCompare(b.chapterTitle);
  });

  return chapters;
}
