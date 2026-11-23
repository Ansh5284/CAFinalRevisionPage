import type { SubjectId } from '../types/archive';
import type {
  ChapterScoreBreakdown,
  QuizDataset,
  QuizQuestion,
  QuizResultSummary,
} from '../types/quiz';

const VALID_SUBJECTS: Set<SubjectId> = new Set([
  'financial-reporting',
  'advanced-audit',
  'advanced-financial-management',
  'indirect-taxes',
  'direct-taxes',
]);

export function validateQuizJson(
  input: unknown
): { ok: true; quiz: QuizDataset } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'Quiz JSON must be an object.' };
  }

  const record = input as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  if (!title) {
    return { ok: false, error: 'Quiz JSON is missing a non-empty "title" field.' };
  }

  const rawSubject = typeof record.subjectId === 'string' ? record.subjectId : 'financial-reporting';
  const subjectId: SubjectId = VALID_SUBJECTS.has(rawSubject as SubjectId)
    ? (rawSubject as SubjectId)
    : 'financial-reporting';

  if (!Array.isArray(record.questions) || record.questions.length === 0) {
    return { ok: false, error: 'Quiz JSON must include a non-empty "questions" array.' };
  }

  const questions: QuizQuestion[] = [];
  for (let i = 0; i < record.questions.length; i++) {
    const q = record.questions[i] as Record<string, unknown>;
    if (!q || typeof q !== 'object') {
      return { ok: false, error: `Question #${i + 1} must be an object.` };
    }
    const questionText = typeof q.question === 'string' ? q.question.trim() : '';
    const options = Array.isArray(q.options)
      ? q.options.filter((opt): opt is string => typeof opt === 'string' && opt.trim().length > 0)
      : [];
    const correctIndex =
      typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : -1;
    const explanation = typeof q.explanation === 'string' ? q.explanation.trim() : '';

    if (!questionText) {
      return { ok: false, error: `Question #${i + 1} is missing "question" text.` };
    }
    if (options.length < 2) {
      return { ok: false, error: `Question #${i + 1} must provide at least 2 answer options.` };
    }
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      return {
        ok: false,
        error: `Question #${i + 1} has an out-of-range "correctOptionIndex".`,
      };
    }

    questions.push({
      id: typeof q.id === 'string' && q.id.trim() ? q.id.trim() : `q-${i + 1}`,
      chapter:
        typeof q.chapter === 'string' && q.chapter.trim()
          ? q.chapter.trim()
          : 'General Chapter',
      standardRef: typeof q.standardRef === 'string' ? q.standardRef.trim() : undefined,
      caseScenario: typeof q.caseScenario === 'string' ? q.caseScenario.trim() : undefined,
      question: questionText,
      options,
      correctOptionIndex: correctIndex,
      marks: typeof q.marks === 'number' && q.marks > 0 ? q.marks : 2,
      explanation: explanation || 'Refer to the applicable standard and module guidance.',
    });
  }

  const computedTotalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return {
    ok: true,
    quiz: {
      id:
        typeof record.id === 'string' && record.id.trim()
          ? record.id.trim()
          : `quiz-${Date.now()}`,
      title,
      subjectId,
      publishedDate:
        typeof record.publishedDate === 'string' && record.publishedDate.trim()
          ? record.publishedDate.trim()
          : new Date().toISOString().slice(0, 10),
      cadence:
        record.cadence === 'daily' ||
        record.cadence === 'weekly' ||
        record.cadence === 'chapter-drill'
          ? record.cadence
          : 'daily',
      totalMarks:
        typeof record.totalMarks === 'number' && record.totalMarks > 0
          ? record.totalMarks
          : computedTotalMarks,
      durationMinutes:
        typeof record.durationMinutes === 'number' && record.durationMinutes > 0
          ? record.durationMinutes
          : Math.max(10, Math.round(computedTotalMarks * 1.2)),
      negativeMarking:
        typeof record.negativeMarking === 'number' && record.negativeMarking >= 0
          ? record.negativeMarking
          : 0,
      generatedBy:
        typeof record.generatedBy === 'string' ? record.generatedBy : 'Gemini Tasks JSON',
      questions,
    },
  };
}

export function gradeQuiz(
  quiz: QuizDataset,
  answers: Record<string, number>
): QuizResultSummary {
  let earnedMarks = 0;
  let totalMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const chapterMap = new Map<string, ChapterScoreBreakdown>();
  const negativePenalty = quiz.negativeMarking ?? 0;

  for (const question of quiz.questions) {
    totalMarks += question.marks;
    const selected = answers[question.id];

    const chapterStats = chapterMap.get(question.chapter) ?? {
      chapter: question.chapter,
      earnedMarks: 0,
      totalMarks: 0,
      correctCount: 0,
      questionCount: 0,
    };
    chapterStats.totalMarks += question.marks;
    chapterStats.questionCount += 1;

    if (selected === undefined || selected === null) {
      unansweredCount += 1;
    } else if (selected === question.correctOptionIndex) {
      correctCount += 1;
      earnedMarks += question.marks;
      chapterStats.earnedMarks += question.marks;
      chapterStats.correctCount += 1;
    } else {
      incorrectCount += 1;
      if (negativePenalty > 0) {
        earnedMarks = Math.max(0, Number((earnedMarks - negativePenalty).toFixed(2)));
        chapterStats.earnedMarks = Math.max(
          0,
          Number((chapterStats.earnedMarks - negativePenalty).toFixed(2))
        );
      }
    }

    chapterMap.set(question.chapter, chapterStats);
  }

  const percentage =
    totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 1000) / 10 : 0;

  return {
    earnedMarks: Number(earnedMarks.toFixed(2)),
    totalMarks,
    percentage,
    correctCount,
    incorrectCount,
    unansweredCount,
    chapterBreakdown: Array.from(chapterMap.values()),
  };
}
