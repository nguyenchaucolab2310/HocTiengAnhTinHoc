import { 
  VocabularyItem, 
  TopicItem, 
  Classroom, 
  Assignment, 
  NotificationItem, 
  UserProfile, 
  StudentProgress, 
  ExamAttempt,
  PracticeQuestion
} from '../types';
import { 
  INITIAL_VOCABULARY, 
  INITIAL_TOPICS, 
  INITIAL_CLASSROOMS, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_USERS 
} from '../data/mockData';

const STORAGE_KEYS = {
  VOCABULARY: 'it_english_vocabulary_v1',
  TOPICS: 'it_english_topics_v1',
  CLASSROOMS: 'it_english_classrooms_v1',
  ASSIGNMENTS: 'it_english_assignments_v1',
  NOTIFICATIONS: 'it_english_notifications_v1',
  CURRENT_USER: 'it_english_current_user_v1',
  STUDENT_PROGRESS: 'it_english_student_progress_v1',
  EXAM_ATTEMPTS: 'it_english_exam_attempts_v1',
  FAVORITES: 'it_english_favorites_v1'
};

export const StorageService = {
  // Vocabulary
  getVocabulary(): VocabularyItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
    if (!raw) {
      this.saveVocabulary(INITIAL_VOCABULARY);
      return INITIAL_VOCABULARY;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_VOCABULARY;
    }
  },

  saveVocabulary(items: VocabularyItem[]): void {
    localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(items));
  },

  addVocabulary(item: VocabularyItem): void {
    const list = this.getVocabulary();
    list.unshift(item);
    this.saveVocabulary(list);
  },

  updateVocabulary(updatedItem: VocabularyItem): void {
    const list = this.getVocabulary().map(item => item.id === updatedItem.id ? updatedItem : item);
    this.saveVocabulary(list);
  },

  deleteVocabulary(id: string): void {
    const list = this.getVocabulary().filter(item => item.id !== id);
    this.saveVocabulary(list);
  },

  toggleFavorite(id: string): boolean {
    const list = this.getVocabulary();
    let isFav = false;
    const updated = list.map(item => {
      if (item.id === id) {
        isFav = !item.isFavorite;
        return { ...item, isFavorite: isFav };
      }
      return item;
    });
    this.saveVocabulary(updated);
    return isFav;
  },

  toggleLearned(id: string): boolean {
    const list = this.getVocabulary();
    let isL = false;
    const updated = list.map(item => {
      if (item.id === id) {
        isL = !item.isLearned;
        return { ...item, isLearned: isL, masteryLevel: isL ? 3 : 1 };
      }
      return item;
    });
    this.saveVocabulary(updated);
    return isL;
  },

  // Topics
  getTopics(): TopicItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TOPICS);
    if (!raw) {
      this.saveTopics(INITIAL_TOPICS);
      return INITIAL_TOPICS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TOPICS;
    }
  },

  saveTopics(topics: TopicItem[]): void {
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  },

  // Classrooms
  getClassrooms(): Classroom[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
    if (!raw) {
      this.saveClassrooms(INITIAL_CLASSROOMS);
      return INITIAL_CLASSROOMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLASSROOMS;
    }
  },

  saveClassrooms(classes: Classroom[]): void {
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classes));
  },

  addClassroom(cls: Classroom): void {
    const list = this.getClassrooms();
    list.push(cls);
    this.saveClassrooms(list);
  },

  // Assignments
  getAssignments(): Assignment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    if (!raw) {
      this.saveAssignments(INITIAL_ASSIGNMENTS);
      return INITIAL_ASSIGNMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  },

  saveAssignments(assignments: Assignment[]): void {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  },

  addAssignment(asg: Assignment): void {
    const list = this.getAssignments();
    list.unshift(asg);
    this.saveAssignments(list);
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      this.saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifs: NotificationItem[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  markNotificationRead(id: string): void {
    const list = this.getNotifications().map(n => n.id === id ? { ...n, isRead: true } : n);
    this.saveNotifications(list);
  },

  // Current User
  getCurrentUser(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      const defaultUser = INITIAL_USERS[0]; // Student Nguyen Van An
      this.saveCurrentUser(defaultUser);
      return defaultUser;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS[0];
    }
  },

  saveCurrentUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // Student Progress
  getStudentProgress(userId: string): StudentProgress {
    const raw = localStorage.getItem(`${STORAGE_KEYS.STUDENT_PROGRESS}_${userId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error(e);
      }
    }
    const defaultProgress: StudentProgress = {
      userId,
      totalWordsLearned: 152,
      masteredWords: 118,
      needReviewWords: 34,
      completedLessons: 12,
      averageScore: 8.6,
      studyStreakDays: 6,
      lastActive: new Date().toISOString(),
      favorites: ['voc-12-7-01', 'voc-12-7-03', 'voc-12-7-07'],
      learnedWordIds: ['voc-12-7-01', 'voc-12-7-02', 'voc-12-7-03', 'voc-12-7-04', 'voc-12-7-05', 'voc-12-7-06']
    };
    this.saveStudentProgress(defaultProgress);
    return defaultProgress;
  },

  saveStudentProgress(progress: StudentProgress): void {
    localStorage.setItem(`${STORAGE_KEYS.STUDENT_PROGRESS}_${progress.userId}`, JSON.stringify(progress));
  },

  // Exam attempts
  getExamAttempts(userId?: string): ExamAttempt[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_ATTEMPTS);
    let attempts: ExamAttempt[] = [];
    if (!raw) {
      attempts = [
        {
          id: 'att-1',
          examId: 'exam-12-html',
          examTitle: 'Kiểm tra 15 phút: HTML và cấu trúc trang web',
          userId: 'user-student-1',
          userName: 'Nguyễn Văn An',
          userClass: '12A1',
          score: 9.0,
          correctCount: 9,
          totalQuestions: 10,
          startedAt: '2025-01-15T08:00:00Z',
          completedAt: '2025-01-15T08:14:20Z',
          durationSeconds: 860,
          answers: {}
        },
        {
          id: 'att-2',
          examId: 'exam-11-db',
          examTitle: 'Kiểm tra 15 phút: Cơ sở dữ liệu và Khóa chính',
          userId: 'user-student-1',
          userName: 'Nguyễn Văn An',
          userClass: '12A1',
          score: 8.2,
          correctCount: 8,
          totalQuestions: 10,
          startedAt: '2025-01-10T14:30:00Z',
          completedAt: '2025-01-10T14:43:10Z',
          durationSeconds: 790,
          answers: {}
        }
      ];
      this.saveExamAttempts(attempts);
    } else {
      try {
        attempts = JSON.parse(raw);
      } catch {
        attempts = [];
      }
    }

    if (userId) {
      return attempts.filter(a => a.userId === userId);
    }
    return attempts;
  },

  saveExamAttempts(attempts: ExamAttempt[]): void {
    localStorage.setItem(STORAGE_KEYS.EXAM_ATTEMPTS, JSON.stringify(attempts));
  },

  recordExamAttempt(attempt: ExamAttempt): void {
    const list = this.getExamAttempts();
    list.unshift(attempt);
    this.saveExamAttempts(list);

    // Update student progress average
    const userAttempts = list.filter(a => a.userId === attempt.userId);
    const sum = userAttempts.reduce((acc, curr) => acc + curr.score, 0);
    const avg = Number((sum / userAttempts.length).toFixed(1));

    const progress = this.getStudentProgress(attempt.userId);
    progress.averageScore = avg;
    progress.lastActive = new Date().toISOString();
    this.saveStudentProgress(progress);
  },

  // Reset to Demo Data
  resetToDefault(): void {
    localStorage.clear();
    this.saveVocabulary(INITIAL_VOCABULARY);
    this.saveTopics(INITIAL_TOPICS);
    this.saveClassrooms(INITIAL_CLASSROOMS);
    this.saveAssignments(INITIAL_ASSIGNMENTS);
    this.saveNotifications(INITIAL_NOTIFICATIONS);
    this.saveCurrentUser(INITIAL_USERS[0]);
  }
};
