import {
  Timestamp,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { courseCatalog, questionBank } from '../data/coursesData'

export interface CourseSubject {
  id: string
  name: string
  chapters: Chapter[]
  tests: CourseTest[]
}

export interface Chapter {
  id: string
  title: string
  videoTitle: string
  videoUrl: string
  pdfTitle: string
  pdfUrl: string
}

export interface CourseTest {
  id: string
  title: string
  chapterRange: string
  chapterIds: string[]
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  answer: string
}

export interface PreparedQuestion {
  id: string
  prompt: string
  options: string[]
}

export interface QuizAttemptAnswer {
  correctAnswer: string
  questionId: string
  selectedAnswer: string
}

export interface SubmitQuizAttemptValues {
  answers: Record<string, string>
  classId: string
  className: string
  courseId: string
  durationSeconds: number
  questions: QuizQuestion[]
  schoolId: string
  startedAt: Date
  studentId: string
  studentName: string
  subject: string
  teacherId: string
  testId: string
  testTitle: string
  attemptNumber?: number
}

const questionSeeds = [
  ['Which idea best matches this topic?', 'Core concept', 'Unrelated fact', 'Random example', 'Future topic'],
  ['What should a student check first?', 'Definition', 'Decoration', 'Page number only', 'File name'],
  ['Which option is most accurate?', 'Correct principle', 'Opposite principle', 'Incomplete claim', 'Guesswork'],
  ['What is the expected learning outcome?', 'Apply the concept', 'Skip the topic', 'Memorize only titles', 'Ignore examples'],
  ['Which method helps solve questions?', 'Use the rule carefully', 'Choose the longest option', 'Avoid diagrams', 'Change the topic'],
  ['What makes an answer complete?', 'Reason and result', 'Only the final word', 'A copied heading', 'No working'],
  ['Which is a reliable study habit?', 'Practice with feedback', 'Wait until exam day', 'Avoid revision', 'Use one example only'],
  ['What should be done after solving?', 'Review mistakes', 'Delete notes', 'Stop reading', 'Change subject'],
  ['Which resource supports this chapter?', 'Video and notes', 'Attendance only', 'Login screen', 'School code'],
  ['How should doubts be handled?', 'Revisit concepts', 'Ignore them', 'Submit blank', 'Guess every time'],
  ['What indicates progress?', 'Better accuracy', 'Fewer attempts only', 'Longer breaks', 'No submissions'],
  ['Which question type tests understanding?', 'Applied examples', 'Color choice', 'Button labels', 'Profile fields'],
]

const shuffle = <T,>(items: T[]) => {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }

  return copy
}

export const getCoursesForClass = (className?: string) => courseCatalog[className ?? ''] ?? []

export const getCourseById = (className: string | undefined, courseId: string) =>
  getCoursesForClass(className).find((course) => course.id === courseId) ?? null

export const getTestById = (course: CourseSubject | null, testId: string) =>
  course?.tests.find((test) => test.id === testId) ?? null

export const getQuestionsForTest = (course: CourseSubject, test: CourseTest): QuizQuestion[] => {
  const pool = questionBank[test.id] ?? []

  const questions: QuizQuestion[] = pool.length > 0
    ? pool.map((q, index) => ({
        id: `${course.id}_${test.id}_q${index + 1}`,
        prompt: q.prompt,
        options: [...q.options],
        answer: q.answer,
      }))
    : test.chapterIds.flatMap((chapterId) => {
        const chapter = course.chapters.find((record) => record.id === chapterId)
        const chapterTitle = chapter?.title.replace(/^Chapter \d+:\s*/, '') ?? chapterId

        return questionSeeds.map(([prompt, answer, second, third, fourth], index) => ({
          id: `${course.id}_${test.id}_${chapterId}_${index + 1}`,
          prompt: `${chapterTitle}: ${prompt}`,
          options: [answer, second, third, fourth],
          answer,
        }))
      })

  return shuffle(questions).slice(0, 10).map((question) => ({
    ...question,
    options: shuffle(question.options),
  }))
}

export const prepareQuestions = (questions: QuizQuestion[]): PreparedQuestion[] =>
  questions.map((question) => ({
    id: question.id,
    options: question.options,
    prompt: question.prompt,
  }))

export const submitQuizAttempt = async (values: SubmitQuizAttemptValues) => {
  const attemptedAnswers: QuizAttemptAnswer[] = values.questions.map((question) => ({
    correctAnswer: question.answer,
    questionId: question.id,
    selectedAnswer: values.answers[question.id] ?? '',
  }))
  const correct = attemptedAnswers.filter((answer) => answer.selectedAnswer === answer.correctAnswer).length
  const wrong = values.questions.length - correct
  const percentage = Math.round((correct / values.questions.length) * 100)
  const attemptNumber = values.attemptNumber ?? 1
  const attemptId = `${values.studentId}_${values.courseId}_${values.testId}_${Date.now()}`

  await setDoc(doc(db, 'quizAttempts', attemptId), {
    answers: attemptedAnswers.map((answer) => ({
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
    })),
    attemptNumber,
    classId: values.classId,
    className: values.className,
    correct,
    correctAnswers: attemptedAnswers.map(({ questionId, correctAnswer }) => ({ questionId, correctAnswer })),
    courseId: values.courseId,
    duration: values.durationSeconds,
    percentage,
    schoolId: values.schoolId,
    score: correct,
    startedAt: Timestamp.fromDate(values.startedAt),
    studentId: values.studentId,
    studentName: values.studentName,
    subject: values.subject,
    submittedAt: serverTimestamp(),
    teacherId: values.teacherId,
    testId: values.testId,
    testTitle: values.testTitle,
    totalQuestions: values.questions.length,
    wrong,
  })

  return { attemptNumber, correct, percentage, score: correct, wrong }
}
