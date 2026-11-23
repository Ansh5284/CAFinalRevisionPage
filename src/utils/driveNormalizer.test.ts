import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildProtectedPreviewUrl,
  extractStandardCodes,
  normalizeDriveFilesToChapters,
  type RawDriveFile,
} from './driveNormalizer';

test('extractStandardCodes recognizes Ind AS, SA, SQC, CARO, ICDS, and Sections', () => {
  const codes = extractStandardCodes(
    'Ch 04 Ind AS 115 & IndAS-116 plus SA 315, SQC 1, CARO 2020 and Section 16(2)'
  );
  assert.deepEqual(codes, ['Ind AS 115', 'Ind AS 116', 'SA 315', 'SQC 1', 'CARO 2020', 'Sec 16(2)']);
});

test('Pattern B: merges separate Modules folder and chapter-wise Revision folder into one ChapterGroup', () => {
  const rawFiles: RawDriveFile[] = [
    {
      id: 'mod-115',
      name: 'Ind AS 115 - Revenue Recognition Study Module.pdf',
      mimeType: 'application/pdf',
      size: '18450000',
      folderPath: ['Modules'],
      sourceBucket: 'module',
    },
    {
      id: 'rev-115-slide',
      name: '5-Step Revenue Model Revision Slides.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: '4200000',
      folderPath: ['Revision Slides and Charts', 'Chapter 3 - Ind AS 115 Revenue from Contracts'],
      sourceBucket: 'revision',
    },
    {
      id: 'rev-115-chart',
      name: 'Contract Modification Flowchart Infographic.png',
      mimeType: 'image/png',
      size: '1600000',
      folderPath: ['Revision Slides and Charts', 'Chapter 3 - Ind AS 115 Revenue from Contracts'],
      sourceBucket: 'revision',
    },
  ];

  const chapters = normalizeDriveFilesToChapters('financial-reporting', rawFiles);
  assert.equal(chapters.length, 1);
  assert.equal(chapters[0].chapterNumber, 3);
  assert.equal(chapters[0].modules.length, 1);
  assert.equal(chapters[0].revisions.length, 2);
  assert.ok(chapters[0].standards.includes('Ind AS 115'));
  assert.equal(chapters[0].revisions[0].previewUrl, buildProtectedPreviewUrl(chapters[0].revisions[0].driveFileId!));
});

test('Pattern A: groups chapter-first folders containing both Modules and Revision Slides', () => {
  const rawFiles: RawDriveFile[] = [
    {
      id: 'sa315-mod',
      name: 'SA 315 Risk Assessment Complete Text.pdf',
      mimeType: 'application/pdf',
      folderPath: ['Chapter 2 - Risk Assessment (SA 315)', 'Modules'],
    },
    {
      id: 'sa315-info',
      name: 'Audit Risk Matrix Infographic.png',
      mimeType: 'image/png',
      folderPath: ['Chapter 2 - Risk Assessment (SA 315)', 'Revision Slides and Infographics'],
    },
  ];

  const chapters = normalizeDriveFilesToChapters('advanced-audit', rawFiles);
  assert.equal(chapters.length, 1);
  assert.equal(chapters[0].modules.length, 1);
  assert.equal(chapters[0].revisions.length, 1);
  assert.equal(chapters[0].revisions[0].category, 'infographic');
});

test('Resilience: safely handles empty arrays, folder stubs, JSON quiz files, and arbitrary filenames', () => {
  assert.deepEqual(normalizeDriveFilesToChapters('direct-taxes', []), []);

  const messyFiles: RawDriveFile[] = [
    {
      id: 'folder-1',
      name: 'Empty Subfolder',
      mimeType: 'application/vnd.google-apps.folder',
      folderPath: [],
    },
    {
      id: 'quiz-1',
      name: '2026-11-23-daily-quiz.json',
      mimeType: 'application/json',
      folderPath: ['Quizzes'],
    },
    {
      id: 'misc-pdf',
      name: 'Uncategorized_Amendment_Notes_Nov26.pdf',
      mimeType: 'application/pdf',
      folderPath: [],
    },
  ];

  const chapters = normalizeDriveFilesToChapters('direct-taxes', messyFiles);
  assert.equal(chapters.length, 1);
  assert.equal(chapters[0].allArtifacts.length, 1);
  assert.equal(chapters[0].allArtifacts[0].title, 'Uncategorized Amendment Notes Nov26');
});

test('buildProtectedPreviewUrl strictly outputs view-only /preview URL with no download parameter', () => {
  const url = buildProtectedPreviewUrl('1AbCdEfGhIjKlMnOp');
  assert.equal(url, 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/preview');
  assert.equal(url.includes('export=download'), false);
});
