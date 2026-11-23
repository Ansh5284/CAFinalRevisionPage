import type {
  SearchResultGroup,
  StudyArtifact,
  SubjectCatalog,
  SubjectId,
} from '../types/archive';

function normalizeToken(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function compactToken(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function matchesText(haystack: string, normalizedQuery: string, compactQuery: string): boolean {
  if (!haystack) return false;
  const normHay = normalizeToken(haystack);
  if (normHay.includes(normalizedQuery)) return true;
  if (compactQuery.length >= 2 && compactToken(haystack).includes(compactQuery)) return true;

  // Support multi-word queries where every token appears in any order
  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words.every((w) => normHay.includes(w) || compactToken(haystack).includes(w));
  }
  return false;
}

/**
 * Chapter-aware search across chapters, standard codes (e.g. Ind AS 115, SA 315, Sec 16),
 * and file names.
 *
 * KEY REQUIREMENT: Whenever a file matches by name (or standard/chapter), ALL other
 * sibling artifacts belonging to that same chapter are returned in `relatedFiles`
 * alongside `directMatches` so students can view every module, slide, and infographic
 * for that chapter from a single search.
 */
export function searchArchive(
  catalogs: SubjectCatalog[],
  rawQuery: string,
  subjectFilter: SubjectId | 'all' = 'all'
): SearchResultGroup[] {
  const normalizedQuery = normalizeToken(rawQuery);
  const compactQuery = compactToken(rawQuery);

  if (!normalizedQuery) {
    return [];
  }

  const results: SearchResultGroup[] = [];

  for (const catalog of catalogs) {
    if (subjectFilter !== 'all' && catalog.config.id !== subjectFilter) {
      continue;
    }

    const subjectMatched =
      matchesText(catalog.config.name, normalizedQuery, compactQuery) ||
      matchesText(catalog.config.shortName, normalizedQuery, compactQuery);

    for (const chapter of catalog.chapters) {
      const chapterTitleMatched = matchesText(
        chapter.chapterTitle,
        normalizedQuery,
        compactQuery
      );

      const chapterStandardMatched = chapter.standards.some((std) =>
        matchesText(std, normalizedQuery, compactQuery)
      );

      const directMatches: StudyArtifact[] = [];
      const relatedFiles: StudyArtifact[] = [];

      for (const artifact of chapter.allArtifacts) {
        const fileMatched =
          matchesText(artifact.title, normalizedQuery, compactQuery) ||
          matchesText(artifact.fileName, normalizedQuery, compactQuery) ||
          artifact.standards.some((std) => matchesText(std, normalizedQuery, compactQuery));

        if (fileMatched) {
          directMatches.push(artifact);
        } else {
          relatedFiles.push(artifact);
        }
      }

      if (directMatches.length > 0 || chapterTitleMatched || chapterStandardMatched || subjectMatched) {
        // If the chapter name/standard matched but no individual file name contained the exact phrase,
        // promote all chapter files as directMatches so the student sees the full chapter immediately.
        const finalDirect =
          directMatches.length > 0 ? directMatches : [...chapter.allArtifacts];
        const finalRelated =
          directMatches.length > 0 ? relatedFiles : [];

        let relevanceScore = 0;
        if (chapterStandardMatched) relevanceScore += 60;
        if (chapterTitleMatched) relevanceScore += 50;
        if (directMatches.length > 0) relevanceScore += 40 + directMatches.length * 5;
        if (subjectMatched) relevanceScore += 15;

        results.push({
          subjectId: catalog.config.id,
          subjectName: catalog.config.name,
          subjectShortName: catalog.config.shortName,
          chapterKey: chapter.chapterKey,
          chapterTitle: chapter.chapterTitle,
          standards: chapter.standards,
          directMatches: finalDirect,
          relatedFiles: finalRelated,
          relevanceScore,
        });
      }
    }
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
