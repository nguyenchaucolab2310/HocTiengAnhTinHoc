import { 
  VocabularyItem, 
  TopicItem, 
  GradeLevel,
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
import { STANDARD_EXCEL_DATA } from '../data/standardExcelData';

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
      const parsed: VocabularyItem[] = JSON.parse(raw);
      // Auto-heal if previously skewed due to Number("Lớp 10") bug (e.g. Grade 12 has > 100 while Grade 10 has <= 15)
      const g10 = parsed.filter(v => v.grade === 10).length;
      const g11 = parsed.filter(v => v.grade === 11).length;
      const g12 = parsed.filter(v => v.grade === 12).length;
      if (g12 > 100 && (g10 <= 15 || g11 <= 15)) {
        const { updatedVocab, updatedTopics } = this.reorganizeVocabularyByGradeAndLesson(parsed);
        this.saveVocabulary(updatedVocab);
        this.saveTopics(updatedTopics);
        return updatedVocab;
      }
      return parsed;
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

  // Helper to normalize strings for comparison
  normalizeText(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim();
  },

  // Parse grade level accurately from any format ("10", "Lớp 10", "Khối 10", or heuristics)
  parseGradeLevel(rawVal: any, lessonHint?: string, topicHint?: string, englishHint?: string): GradeLevel {
    // 1. Check standard excel database match by English term
    if (englishHint) {
      const normEn = this.normalizeText(englishHint);
      const stdMatch = STANDARD_EXCEL_DATA.find(s => this.normalizeText(s.english) === normEn);
      if (stdMatch) return stdMatch.grade;
      const initMatch = INITIAL_VOCABULARY.find(i => this.normalizeText(i.english) === normEn);
      if (initMatch) return initMatch.grade;
    }

    // 2. Direct string/lesson/topic hints with explicit grade indicators
    const combined = `${lessonHint || ''} ${topicHint || ''}`.toLowerCase();
    if (combined.includes('lớp 10') || combined.includes('khối 10') || combined.includes('tin 10') || combined.includes('grade 10') || combined.includes('top-10') || combined.includes('les-10')) {
      return 10;
    }
    if (combined.includes('lớp 11') || combined.includes('khối 11') || combined.includes('tin 11') || combined.includes('grade 11') || combined.includes('top-11') || combined.includes('les-11')) {
      return 11;
    }
    if (combined.includes('lớp 12') || combined.includes('khối 12') || combined.includes('tin 12') || combined.includes('grade 12') || combined.includes('top-12') || combined.includes('les-12')) {
      return 12;
    }

    // 3. String value check for rawVal ("Khối 10", "Lớp 11", "10", "11", "12")
    const str = String(rawVal || '').toLowerCase().trim();
    if (str.includes('10')) return 10;
    if (str.includes('11')) return 11;
    if (str.includes('12')) return 12;

    // 4. Strong syllabus keywords based on MOET 2018 Informatics Curriculum
    const fullText = `${combined} ${englishHint || ''}`.toLowerCase();
    
    // Grade 10: Python, Variables, Loops, Smart devices, Information processing, IoT, Logic
    const isGrade10 = 
      fullText.includes('python') ||
      fullText.includes('biến') ||
      fullText.includes('variable') ||
      fullText.includes('vòng lặp') ||
      fullText.includes('rẽ nhánh') ||
      fullText.includes('lệnh gán') ||
      fullText.includes('câu lệnh') ||
      fullText.includes('xâu kí tự') ||
      fullText.includes('string') ||
      fullText.includes('hàm trong python') ||
      fullText.includes('danh sách list') ||
      fullText.includes('thiết bị thông minh') ||
      fullText.includes('thông tin và xử lý') ||
      fullText.includes('xã hội số') ||
      fullText.includes('đồ họa vector') ||
      fullText.includes('inkscape') ||
      fullText.includes('điện toán đám mây') ||
      fullText.includes('internet vạn vật') ||
      fullText.includes('cổng logic') ||
      fullText.includes('dữ liệu số');

    // Grade 11: Database, CSDL, SQL, Tables, Primary key, Operating System, GIMP, Video editing
    const isGrade11 =
      fullText.includes('cơ sở dữ liệu') ||
      fullText.includes('csdl') ||
      fullText.includes('database') ||
      fullText.includes('hệ điều hành') ||
      fullText.includes('operating system') ||
      fullText.includes('sql') ||
      fullText.includes('khóa chính') ||
      fullText.includes('khóa ngoài') ||
      fullText.includes('primary key') ||
      fullText.includes('foreign key') ||
      fullText.includes('bảng, trường') ||
      fullText.includes('bản ghi') ||
      fullText.includes('truy vấn') ||
      fullText.includes('lớp ảnh') ||
      fullText.includes('xử lý ảnh') ||
      fullText.includes('gimp') ||
      fullText.includes('dựng video') ||
      fullText.includes('chuyển cảnh') ||
      fullText.includes('mã nguồn mở');

    // Grade 12: AI, Machine Learning, Web Design, HTML, CSS, TCP/IP, Router, Switch, Cybersecurity
    const isGrade12 =
      fullText.includes('trí tuệ nhân tạo') ||
      fullText.includes('ai') ||
      fullText.includes('học máy') ||
      fullText.includes('machine learning') ||
      fullText.includes('html') ||
      fullText.includes('css') ||
      fullText.includes('trang web') ||
      fullText.includes('website') ||
      fullText.includes('siêu văn bản') ||
      fullText.includes('mạng tcp') ||
      fullText.includes('tcp/ip') ||
      fullText.includes('giao thức') ||
      fullText.includes('router') ||
      fullText.includes('switch') ||
      fullText.includes('an toàn thông tin') ||
      fullText.includes('không gian mạng') ||
      fullText.includes('mã hóa');

    if (isGrade10 && !isGrade11 && !isGrade12) return 10;
    if (isGrade11 && !isGrade10 && !isGrade12) return 11;
    if (isGrade12 && !isGrade10 && !isGrade11) return 12;

    // 5. If rawVal was valid number 10 or 11
    if (rawVal === 10 || rawVal === 11) return rawVal;

    if (isGrade10) return 10;
    if (isGrade11) return 11;
    return 12;
  },

  // Match or find/create lesson and topic for a vocabulary row
  findOrCreateLessonForVocab(
    grade: GradeLevel,
    lessonName: string,
    topicName: string,
    currentTopics: TopicItem[]
  ): { lessonId: string; topicId: string; updatedTopics: TopicItem[] } {
    const normLesson = this.normalizeText(lessonName || 'Bài học Tin học');
    const normTopic = this.normalizeText(topicName || 'Chủ đề Tin học');

    const topicsClone: TopicItem[] = JSON.parse(JSON.stringify(currentTopics && currentTopics.length > 0 ? currentTopics : this.getTopics()));
    const gradeTopics = topicsClone.filter(t => t.grade === grade);

    // 1. Try to find exact or partial match in existing lessons for this grade
    for (const t of gradeTopics) {
      for (const l of t.lessons) {
        const lNorm = this.normalizeText(l.name);
        if (lNorm === normLesson || (normLesson && lNorm.includes(normLesson)) || (normLesson && normLesson.includes(lNorm))) {
          return { lessonId: l.id, topicId: t.id, updatedTopics: topicsClone };
        }
        // Match standard lesson numbering if present (e.g. "bai 7", "bai 1", "bai 3")
        const lessonNum = normLesson.match(/bai\s*(\d+)/);
        const curNum = lNorm.match(/bai\s*(\d+)/);
        if (lessonNum && curNum && lessonNum[1] === curNum[1]) {
          return { lessonId: l.id, topicId: t.id, updatedTopics: topicsClone };
        }
      }
    }

    // 2. Try to find existing topic for this grade
    let targetTopic = gradeTopics.find(t => {
      const tNorm = this.normalizeText(t.name);
      return tNorm === normTopic || (normTopic && tNorm.includes(normTopic)) || (normTopic && normTopic.includes(tNorm));
    });

    if (!targetTopic) {
      const newTopicId = `top-${grade}-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5)}`;
      targetTopic = {
        id: newTopicId,
        grade,
        name: topicName && topicName.trim() ? topicName.trim() : `Chủ đề Tin học Lớp ${grade} (Tệp Excel)`,
        order: gradeTopics.length + 1,
        lessons: []
      };
      topicsClone.push(targetTopic);
    }

    // 3. Create new lesson in that topic
    const lessonSlug = normLesson.replace(/\s+/g, '-').slice(0, 20) || 'excel';
    const newLessonId = `les-${grade}-${lessonSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const newLesson = {
      id: newLessonId,
      topicId: targetTopic.id,
      grade,
      name: lessonName && lessonName.trim() ? lessonName.trim() : 'Bài học tệp Excel',
      order: targetTopic.lessons.length + 1,
      wordCount: 1
    };
    targetTopic.lessons.push(newLesson);

    return { lessonId: newLessonId, topicId: targetTopic.id, updatedTopics: topicsClone };
  },

  // Reorganize and cleanly partition vocabulary list across Grade 10, 11, 12 and their lessons
  reorganizeVocabularyByGradeAndLesson(
    vocabList: VocabularyItem[],
    currentTopics?: TopicItem[]
  ): { updatedVocab: VocabularyItem[]; updatedTopics: TopicItem[] } {
    let topicsList = JSON.parse(JSON.stringify(currentTopics && currentTopics.length > 0 ? currentTopics : this.getTopics()));

    const updatedVocab = vocabList.map(item => {
      const normEn = this.normalizeText(item.english);
      const stdMatch = STANDARD_EXCEL_DATA.find(s => this.normalizeText(s.english) === normEn);
      const initMatch = INITIAL_VOCABULARY.find(i => this.normalizeText(i.english) === normEn);

      let correctGrade: GradeLevel = item.grade;
      let targetTopicName = item.topicName;
      let targetLessonName = item.lessonName;

      if (stdMatch) {
        correctGrade = stdMatch.grade;
        targetTopicName = stdMatch.topic;
        targetLessonName = stdMatch.lesson;
      } else if (initMatch) {
        correctGrade = initMatch.grade;
        targetTopicName = initMatch.topicName;
        targetLessonName = initMatch.lessonName;
      } else {
        // Evaluate without sticky 12 bias
        correctGrade = this.parseGradeLevel(
          (item.grade === 10 || item.grade === 11) ? item.grade : undefined,
          item.lessonName,
          item.topicName,
          item.english
        );

        // If lessonName is generic or missing, map to best SGK lesson for that grade
        if (!targetLessonName || targetLessonName === 'Bài học tệp Excel' || targetLessonName === 'Bài học Tin học') {
          const combined = `${item.topicName || ''} ${item.english} ${item.vietnamese}`.toLowerCase();
          if (correctGrade === 10) {
            if (combined.includes('python') || combined.includes('biến') || combined.includes('vòng lặp') || combined.includes('lệnh gán')) {
              targetTopicName = 'Chủ đề 4. Giải quyết vấn đề với Python';
              targetLessonName = 'Bài 6. Biến, biểu thức và câu lệnh gán';
            } else if (combined.includes('mạng') || combined.includes('đám mây') || combined.includes('iot')) {
              targetTopicName = 'Chủ đề 2. Mạng máy tính và Internet';
              targetLessonName = 'Bài 3. Mạng máy tính và các thiết bị kết nối';
            } else if (combined.includes('âm thanh') || combined.includes('hình ảnh') || combined.includes('đồ họa') || combined.includes('inkscape')) {
              targetTopicName = 'Chủ đề 3. Đa phương tiện và truyền thông';
              targetLessonName = 'Bài 5. Dữ liệu âm thanh và hình ảnh số';
            } else {
              targetTopicName = 'Chủ đề 1. Máy tính và xã hội số';
              targetLessonName = 'Bài 1. Thông tin và xử lý thông tin';
            }
          } else if (correctGrade === 11) {
            if (combined.includes('sql') || combined.includes('truy vấn')) {
              targetTopicName = 'Chủ đề 3. SQL và khai thác dữ liệu';
              targetLessonName = 'Bài 5. Truy vấn dữ liệu cơ bản với SQL';
            } else if (combined.includes('csdl') || combined.includes('database') || combined.includes('bảng') || combined.includes('khóa')) {
              targetTopicName = 'Chủ đề 2. Cơ sở dữ liệu';
              targetLessonName = 'Bài 3. Bảng, trường và bản ghi trong CSDL';
            } else if (combined.includes('ảnh') || combined.includes('gimp') || combined.includes('layer')) {
              targetTopicName = 'Chủ đề 4. Xử lý ảnh';
              targetLessonName = 'Bài 6. Lớp ảnh (Layers) và các công cụ chỉnh sửa';
            } else if (combined.includes('video') || combined.includes('chuyển cảnh')) {
              targetTopicName = 'Chủ đề 5. Xử lý video';
              targetLessonName = 'Bài 7. Dựng video và hiệu ứng chuyển cảnh';
            } else {
              targetTopicName = 'Chủ đề 1. Hệ điều hành';
              targetLessonName = 'Bài 1. Hệ điều hành và quản lý tệp tin';
            }
          } else {
            // Grade 12
            if (combined.includes('html') || combined.includes('css') || combined.includes('web') || combined.includes('thẻ')) {
              targetTopicName = 'Chủ đề 3. Thiết kế trang web (HTML)';
              targetLessonName = 'Bài 7. HTML và cấu trúc trang web';
            } else if (combined.includes('ai') || combined.includes('trí tuệ nhân tạo') || combined.includes('học máy')) {
              targetTopicName = 'Chủ đề 1. Trí tuệ nhân tạo';
              targetLessonName = 'Bài 1. Giới thiệu trí tuệ nhân tạo (AI)';
            } else {
              targetTopicName = 'Chủ đề 2. Mạng máy tính';
              targetLessonName = 'Bài 3. Giao thức truyền thông mạng TCP/IP';
            }
          }
        }
      }

      const { lessonId, topicId, updatedTopics } = this.findOrCreateLessonForVocab(
        correctGrade,
        targetLessonName,
        targetTopicName,
        topicsList
      );
      topicsList = updatedTopics;

      return {
        ...item,
        grade: correctGrade,
        topicId,
        topicName: targetTopicName,
        lessonId,
        lessonName: targetLessonName
      };
    });

    const finalTopics = this.syncTopicsWithVocabulary(updatedVocab, topicsList);
    return { updatedVocab, updatedTopics: finalTopics };
  },

  // Sync entire topic list wordCounts and missing lessons from vocabulary
  syncTopicsWithVocabulary(vocabulary: VocabularyItem[], existingTopics?: TopicItem[]): TopicItem[] {
    const topics: TopicItem[] = JSON.parse(JSON.stringify(existingTopics && existingTopics.length > 0 ? existingTopics : this.getTopics()));

    // Recalculate word counts
    topics.forEach(t => {
      t.lessons.forEach(l => {
        const count = vocabulary.filter(v => v.grade === t.grade && (v.lessonId === l.id || this.normalizeText(v.lessonName) === this.normalizeText(l.name))).length;
        l.wordCount = count;
      });
    });

    // Also check if any vocabulary item has a lessonName not present in topics
    vocabulary.forEach(v => {
      const grade = v.grade;
      const gTopics = topics.filter(t => t.grade === grade);
      const vNorm = this.normalizeText(v.lessonName);
      
      let found = false;
      for (const t of gTopics) {
        for (const l of t.lessons) {
          if (l.id === v.lessonId || this.normalizeText(l.name) === vNorm) {
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found && v.lessonName) {
        let topic = gTopics.find(t => this.normalizeText(t.name) === this.normalizeText(v.topicName));
        if (!topic) {
          topic = {
            id: v.topicId || `top-${grade}-${Math.random().toString(36).substring(2, 6)}`,
            grade,
            name: v.topicName || `Chủ đề Lớp ${grade}`,
            order: gTopics.length + 1,
            lessons: []
          };
          topics.push(topic);
        }
        topic.lessons.push({
          id: v.lessonId || `les-${grade}-${Math.random().toString(36).substring(2, 6)}`,
          topicId: topic.id,
          grade,
          name: v.lessonName,
          order: topic.lessons.length + 1,
          wordCount: 1
        });
      }
    });

    return topics;
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
