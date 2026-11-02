export type Role = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  studentCode?: string;
  className?: string;
  grade?: 10 | 11 | 12;
  school: string;
  teacherName?: string;
}

export type GradeLevel = 10 | 11 | 12;

export type TextbookSeries = 'Kết nối tri thức với cuộc sống' | 'Cánh diều' | 'Chân trời sáng tạo';

export type WordLevel = 'dễ' | 'trung bình' | 'nâng cao';

export type WordSourceType = 'Trong SGK (Đã xác minh)' | 'Từ gợi ý - cần đối chiếu' | 'Từ mở rộng chuyên ngành';

export interface VocabularyItem {
  id: string;
  grade: GradeLevel;
  textbook: TextbookSeries;
  orientation?: string; // e.g. "Tin học ứng dụng", "Khoa học máy tính"
  topicId: string;
  topicName: string;
  lessonId: string;
  lessonName: string;
  english: string;
  ipa: string;
  partOfSpeech: 'n' | 'v' | 'adj' | 'adv' | 'phrase' | 'abbr';
  vietnamese: string;
  explanation: string;
  example: string;
  exampleTranslation: string;
  level: WordLevel;
  sourceType: WordSourceType;
  sourcePage?: number | string;
  isFavorite?: boolean;
  isLearned?: boolean;
  masteryLevel?: number; // 0 to 3
  audioUrl?: string;
  imageUrl?: string;
}

export interface TopicItem {
  id: string;
  grade: GradeLevel;
  name: string;
  order: number;
  description?: string;
  lessons: LessonItem[];
}

export interface LessonItem {
  id: string;
  topicId: string;
  grade: GradeLevel;
  name: string;
  order: number;
  wordCount: number;
}

export interface StudentProgress {
  userId: string;
  totalWordsLearned: number;
  masteredWords: number;
  needReviewWords: number;
  completedLessons: number;
  averageScore: number;
  studyStreakDays: number;
  lastActive: string;
  favorites: string[]; // vocabulary IDs
  learnedWordIds: string[];
}

export interface PracticeQuestion {
  id: string;
  type: 'multiple-choice' | 'matching' | 'fill-blank' | 'listening' | 'scramble' | 'scenario';
  prompt: string;
  vocabularyId?: string;
  targetWord?: string;
  ipa?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  audioPrompt?: string;
  contextSentence?: string;
}

export interface Exam {
  id: string;
  title: string;
  grade: GradeLevel;
  lessonId?: string;
  topicId?: string;
  durationMinutes: number;
  questionCount: number;
  maxScore: number;
  deadline?: string;
  assignedClasses: string[];
  questions: PracticeQuestion[];
  isPublished: boolean;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  userId: string;
  userName: string;
  userClass: string;
  score: number; // Scale 10
  correctCount: number;
  totalQuestions: number;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  answers: Record<string, string>;
}

export interface Classroom {
  id: string;
  name: string;
  grade: GradeLevel;
  academicYear: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  students: StudentInClass[];
}

export interface StudentInClass {
  id: string;
  studentCode: string;
  name: string;
  className: string;
  wordsLearned: number;
  completedLessons: number;
  avgScore: number;
  lastActive: string;
  status: 'active' | 'inactive';
}

export interface Assignment {
  id: string;
  title: string;
  className: string;
  type: 'flashcard' | 'practice' | 'exam';
  lessonName: string;
  assignedDate: string;
  dueDate: string;
  allowedAttempts: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  instructions?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'lesson' | 'exam' | 'reminder' | 'system';
  isRead: boolean;
  badge?: string;
}
