import {
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

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
}

const classNineSubjects: CourseSubject[] = [
  {
    id: 'class-9-science',
    name: 'Science',
    chapters: [
      {
        id: 'science-chapter-1',
        title: 'Chapter 1: Matter in Our Surroundings',
        videoTitle: 'Matter and Particle Nature',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+matter+in+our+surroundings',
        pdfTitle: 'Matter Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=1-12',
      },
      {
        id: 'science-chapter-2',
        title: 'Chapter 2: Is Matter Around Us Pure',
        videoTitle: 'Mixtures and Solutions',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+is+matter+around+us+pure',
        pdfTitle: 'Matter Around Us Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=2-12',
      },
      {
        id: 'science-chapter-3',
        title: 'Chapter 3: Atoms and Molecules',
        videoTitle: 'Atoms, Molecules, and Formulae',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+atoms+and+molecules',
        pdfTitle: 'Atoms Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=3-12',
      },
      {
        id: 'science-chapter-4',
        title: 'Chapter 4: Structure of the Atom',
        videoTitle: 'Atomic Structure Basics',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+structure+of+atom',
        pdfTitle: 'Atom Structure Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=4-12',
      },
      {
        id: 'science-chapter-5',
        title: 'Chapter 5: The Fundamental Unit of Life',
        videoTitle: 'Cells and Organelles',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+fundamental+unit+of+life',
        pdfTitle: 'Cell Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=5-12',
      },
      {
        id: 'science-chapter-6',
        title: 'Chapter 6: Tissues',
        videoTitle: 'Plant and Animal Tissues',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+science+tissues',
        pdfTitle: 'Tissues Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iesc1=6-12',
      },
    ],
    tests: [
      { id: 'science-test-1', title: 'Test 1', chapterRange: 'Chapters 1-2', chapterIds: ['science-chapter-1', 'science-chapter-2'] },
      { id: 'science-test-2', title: 'Test 2', chapterRange: 'Chapters 3-4', chapterIds: ['science-chapter-3', 'science-chapter-4'] },
      { id: 'science-test-3', title: 'Test 3', chapterRange: 'Chapters 5-6', chapterIds: ['science-chapter-5', 'science-chapter-6'] },
    ],
  },
  {
    id: 'class-9-mathematics',
    name: 'Mathematics',
    chapters: [
      {
        id: 'math-chapter-1',
        title: 'Chapter 1: Number Systems',
        videoTitle: 'Rational and Irrational Numbers',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+number+systems',
        pdfTitle: 'Number Systems Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=1-12',
      },
      {
        id: 'math-chapter-2',
        title: 'Chapter 2: Polynomials',
        videoTitle: 'Polynomial Identities',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+polynomials',
        pdfTitle: 'Polynomials Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=2-12',
      },
      {
        id: 'math-chapter-3',
        title: 'Chapter 3: Coordinate Geometry',
        videoTitle: 'Plotting Points',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+coordinate+geometry',
        pdfTitle: 'Coordinate Geometry Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=3-12',
      },
      {
        id: 'math-chapter-4',
        title: 'Chapter 4: Linear Equations in Two Variables',
        videoTitle: 'Linear Equation Graphs',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+linear+equations+two+variables',
        pdfTitle: 'Linear Equations Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=4-12',
      },
      {
        id: 'math-chapter-5',
        title: 'Chapter 5: Introduction to Euclid Geometry',
        videoTitle: 'Euclid Axioms',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+euclid+geometry',
        pdfTitle: 'Euclid Geometry Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=5-12',
      },
      {
        id: 'math-chapter-6',
        title: 'Chapter 6: Lines and Angles',
        videoTitle: 'Angles and Parallel Lines',
        videoUrl: 'https://www.youtube.com/results?search_query=class+9+maths+lines+and+angles',
        pdfTitle: 'Lines and Angles Notes',
        pdfUrl: 'https://ncert.nic.in/textbook.php?iemh1=6-12',
      },
    ],
    tests: [
      { id: 'math-test-1', title: 'Test 1', chapterRange: 'Chapters 1-2', chapterIds: ['math-chapter-1', 'math-chapter-2'] },
      { id: 'math-test-2', title: 'Test 2', chapterRange: 'Chapters 3-4', chapterIds: ['math-chapter-3', 'math-chapter-4'] },
      { id: 'math-test-3', title: 'Test 3', chapterRange: 'Chapters 5-6', chapterIds: ['math-chapter-5', 'math-chapter-6'] },
    ],
  },
]

const courseCatalog: Record<string, CourseSubject[]> = {
  'Class 8': [],
  'Class 9': classNineSubjects,
  'Class 10': [],
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
  const questions = test.chapterIds.flatMap((chapterId) => {
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
  const countSnapshot = await getCountFromServer(
    query(
      collection(db, 'quizAttempts'),
      where('studentId', '==', values.studentId),
      where('courseId', '==', values.courseId),
      where('testId', '==', values.testId),
    ),
  )
  const attemptNumber = countSnapshot.data().count + 1
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
