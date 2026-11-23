import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeQuiz, validateQuizJson } from './quizEngine';
import { SAMPLE_QUIZZES } from '../data/sampleQuizzes';

test('validateQuizJson accepts valid Gemini Tasks 100-mark quiz JSON schema', () => {
  const sample = SAMPLE_QUIZZES[0];
  const result = validateQuizJson(sample);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.quiz.title, sample.title);
    assert.equal(result.quiz.questions.length, sample.questions.length);
  }
});

test('validateQuizJson rejects invalid quiz JSON with actionable error messages', () => {
  const missingQuestions = validateQuizJson({ title: 'Broken Quiz', questions: [] });
  assert.equal(missingQuestions.ok, false);

  const badIndex = validateQuizJson({
    title: 'Bad Option Index',
    questions: [
      {
        id: 'q1',
        chapter: 'Ind AS 115',
        question: 'Which step allocates transaction price?',
        options: ['Step 1', 'Step 4'],
        correctOptionIndex: 5,
        marks: 2,
        explanation: 'Step 4 allocates transaction price.',
      },
    ],
  });
  assert.equal(badIndex.ok, false);
});

test('gradeQuiz computes earned marks, negative marking, and chapter-wise breakdown accurately', () => {
  const quiz = {
    id: 'test-q',
    title: 'Test Quiz',
    subjectId: 'financial-reporting' as const,
    publishedDate: '2026-11-23',
    cadence: 'daily' as const,
    totalMarks: 6,
    durationMinutes: 10,
    negativeMarking: 0.5,
    questions: [
      {
        id: 'q1',
        chapter: 'Ind AS 115',
        question: 'Q1',
        options: ['A', 'B', 'C', 'D'],
        correctOptionIndex: 1,
        marks: 2,
        explanation: 'B is right',
      },
      {
        id: 'q2',
        chapter: 'Ind AS 115',
        question: 'Q2',
        options: ['A', 'B', 'C', 'D'],
        correctOptionIndex: 0,
        marks: 2,
        explanation: 'A is right',
      },
      {
        id: 'q3',
        chapter: 'Ind AS 116',
        question: 'Q3',
        options: ['A', 'B', 'C', 'D'],
        correctOptionIndex: 2,
        marks: 2,
        explanation: 'C is right',
      },
    ],
  };

  // q1 correct (+2), q2 wrong (-0.5), q3 unanswered (0) => 1.5 / 6 = 25%
  const summary = gradeQuiz(quiz, { q1: 1, q2: 3 });
  assert.equal(summary.earnedMarks, 1.5);
  assert.equal(summary.totalMarks, 6);
  assert.equal(summary.percentage, 25);
  assert.equal(summary.correctCount, 1);
  assert.equal(summary.incorrectCount, 1);
  assert.equal(summary.unansweredCount, 1);
  assert.equal(summary.chapterBreakdown.length, 2);
});
