import test from 'node:test';
import assert from 'node:assert/strict';
import { searchArchive } from './searchEngine';
import { buildSeedCatalogs } from '../data/seedCatalog';

const catalogs = buildSeedCatalogs();

test('searching by a specific file name returns the matched file AND all other sibling files in that chapter', () => {
  const results = searchArchive(catalogs, 'Contract Modification Flowchart');
  assert.ok(results.length >= 1, 'Expected at least one matching chapter group');

  const topGroup = results[0];
  assert.equal(topGroup.subjectId, 'financial-reporting');
  assert.ok(
    topGroup.directMatches.some((f) => f.title.includes('Contract Modification')),
    'Direct match should include the searched infographic'
  );
  assert.ok(
    topGroup.relatedFiles.length >= 2,
    'Other files belonging to the same Ind AS 115 chapter must appear as relatedFiles'
  );
  assert.ok(
    topGroup.relatedFiles.some((f) => f.category === 'module'),
    'Companion study module from the same chapter must be included in relatedFiles'
  );
});

test('searching by standard code with flexible spacing (indas116 / SA 315) finds matching chapters', () => {
  const indAsResults = searchArchive(catalogs, 'indas116');
  assert.ok(indAsResults.length >= 1);
  assert.ok(indAsResults[0].standards.includes('Ind AS 116'));

  const auditResults = searchArchive(catalogs, 'SA 315');
  assert.ok(auditResults.length >= 1);
  assert.equal(auditResults[0].subjectId, 'advanced-audit');
});

test('subject filter restricts search results to the chosen subject', () => {
  const allResults = searchArchive(catalogs, 'Revision');
  const afmOnly = searchArchive(catalogs, 'Revision', 'advanced-financial-management');

  assert.ok(allResults.length > afmOnly.length);
  assert.ok(afmOnly.every((g) => g.subjectId === 'advanced-financial-management'));
});

test('empty or whitespace-only queries return empty results cleanly', () => {
  assert.deepEqual(searchArchive(catalogs, '   '), []);
});
