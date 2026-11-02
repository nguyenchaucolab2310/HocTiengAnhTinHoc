import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BarChart3, 
  ArrowRight, 
  Award,
  BookOpen,
  Search,
  Sparkles,
  Volume2,
  Filter,
  Layers,
  Check,
  HelpCircle,
  FileSpreadsheet,
  Download,
  Calendar,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabularyItem, GradeLevel, TopicItem, UserProfile, ExamAttempt } from '../types';
import { StorageService } from '../services/storage';
import { TTSService } from '../services/tts';

interface ExamViewProps {
  vocabulary: VocabularyItem[];
  topics: TopicItem[];
  currentUser: UserProfile;
  selectedGrade: GradeLevel;
  selectedLessonId: string;
  onChangeGrade?: (grade: GradeLevel) => void;
  onChangeLesson?: (lessonId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export interface ExamQuestion {
  id: string;
  prompt: string;
  term: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  grade: GradeLevel;
  lessonName: string;
  sourceType: string;
  type: 'term-to-meaning' | 'meaning-to-term' | 'definition-match';
}

export const ExamView: React.FC<ExamViewProps> = ({
  vocabulary,
  topics,
  currentUser,
  selectedGrade: initialGrade,
  selectedLessonId: initialLessonId,
  onChangeGrade,
  onChangeLesson,
  onNavigateTab
}) => {
  // Local active filters for Exam and Question Bank
  const [activeGrade, setActiveGrade] = useState<GradeLevel | 'all'>(initialGrade || 12);
  const [activeLessonId, setActiveLessonId] = useState<string>(initialLessonId || 'all');
  const [activeTab, setActiveTab] = useState<'take-exam' | 'question-bank' | 'history'>('take-exam');

  // Exam configuration
  const [examQuestionCount, setExamQuestionCount] = useState<number>(10);
  const [examTimeMinutes, setExamTimeMinutes] = useState<number>(15);

  // Search & filter in Question Bank tab
  const [bankSearch, setBankSearch] = useState('');
  const [bankTypeFilter, setBankTypeFilter] = useState<string>('all');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Active pool of vocabulary based on activeGrade & activeLessonId
  const poolWords = useMemo(() => {
    return vocabulary.filter(v => {
      if (activeGrade !== 'all' && v.grade !== activeGrade) return false;
      if (activeLessonId && activeLessonId !== 'all') {
        const matchingLesson = topics
          .flatMap(t => t.lessons)
          .find(l => l.id === activeLessonId);
        const matchesId = v.lessonId === activeLessonId;
        const matchesName = matchingLesson && 
          StorageService.normalizeText(v.lessonName) === StorageService.normalizeText(matchingLesson.name);
        if (!matchesId && !matchesName) return false;
      }
      return true;
    });
  }, [vocabulary, activeGrade, activeLessonId, topics]);

  // Fallback pool to ensure at least 4 distractors are always available
  const fallbackPool = useMemo(() => {
    if (poolWords.length >= 4) return poolWords;
    if (activeGrade !== 'all') {
      const gPool = vocabulary.filter(v => v.grade === activeGrade);
      if (gPool.length >= 4) return gPool;
    }
    return vocabulary;
  }, [poolWords, vocabulary, activeGrade]);

  // Master Question Bank: generated dynamically from ALL pool words
  const fullQuestionBank = useMemo<ExamQuestion[]>(() => {
    const listToConvert = poolWords.length > 0 ? poolWords : fallbackPool;
    
    return listToConvert.map((word, idx) => {
      // Rotate 3 question types for diversity
      const typeNum = idx % 3;
      let prompt = '';
      let correctAnswer = '';
      let options: string[] = [];
      let qType: 'term-to-meaning' | 'meaning-to-term' | 'definition-match' = 'term-to-meaning';

      if (typeNum === 0) {
        // Term to Meaning
        qType = 'term-to-meaning';
        prompt = `Trong môn Tin học, thuật ngữ tiếng Anh "${word.english}" có nghĩa chính xác là gì?`;
        correctAnswer = word.vietnamese;
        const otherMeanings = fallbackPool
          .filter(w => w.id !== word.id && w.vietnamese !== word.vietnamese)
          .map(w => w.vietnamese);
        const distractors = [...new Set(otherMeanings)].slice(0, 3);
        options = [correctAnswer, ...distractors].sort();
      } else if (typeNum === 1) {
        // Meaning to Term
        qType = 'meaning-to-term';
        prompt = `Khái niệm "${word.vietnamese}" trong tiếng Anh chuyên ngành Tin học được gọi là gì?`;
        correctAnswer = word.english;
        const otherTerms = fallbackPool
          .filter(w => w.id !== word.id && w.english !== word.english)
          .map(w => w.english);
        const distractors = [...new Set(otherTerms)].slice(0, 3);
        options = [correctAnswer, ...distractors].sort();
      } else {
        // Definition match
        qType = 'definition-match';
        const cleanExplanation = word.explanation || 'Thuật ngữ môn Tin học THPT';
        prompt = `"${cleanExplanation}" là định nghĩa chính xác của thuật ngữ nào?`;
        correctAnswer = `${word.english} (${word.vietnamese})`;
        const otherItems = fallbackPool
          .filter(w => w.id !== word.id)
          .map(w => `${w.english} (${w.vietnamese})`);
        const distractors = [...new Set(otherItems)].slice(0, 3);
        options = [correctAnswer, ...distractors].sort();
      }

      // Ensure 4 options
      while (options.length < 4) {
        options.push(`Phương án mở rộng ${options.length + 1}`);
      }

      return {
        id: `qb-${word.id}-${idx}`,
        prompt,
        term: word.english,
        options,
        correctAnswer,
        explanation: word.explanation ? `${word.english}: ${word.explanation}` : `${word.english} nghĩa là ${word.vietnamese}`,
        grade: word.grade,
        lessonName: word.lessonName || 'Bài học Tin học',
        sourceType: word.sourceType || 'Trong SGK',
        type: qType
      };
    });
  }, [poolWords, fallbackPool]);

  // Exam runtime state
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(15 * 60);
  const [latestAttempt, setLatestAttempt] = useState<ExamAttempt | null>(null);

  // Past attempts
  const [pastAttempts, setPastAttempts] = useState<ExamAttempt[]>(() => {
    return StorageService.getExamAttempts(currentUser.id);
  });

  // Prepare questions for exam
  const prepareQuestions = () => {
    const shuffled = [...fullQuestionBank].sort(() => Math.random() - 0.5);
    const count = Math.min(examQuestionCount, shuffled.length);
    const selected = shuffled.slice(0, count);
    setExamQuestions(selected);
    setUserAnswers({});
    setCurrentIdx(0);
    setTimeLeftSeconds(examTimeMinutes * 60);
  };

  useEffect(() => {
    if (!isExamStarted) {
      prepareQuestions();
    }
  }, [fullQuestionBank, examQuestionCount, examTimeMinutes]);

  // Countdown timer
  useEffect(() => {
    if (!isExamStarted || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isExamStarted, isSubmitted, userAnswers, examQuestions]);

  const handleStartExam = () => {
    prepareQuestions();
    setIsExamStarted(true);
    setIsSubmitted(false);
  };

  const handleSelectAnswer = (qId: string, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const handleSubmitExam = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    let correctCount = 0;
    examQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Number(((correctCount / (examQuestions.length || 1)) * 10).toFixed(1));

    const gradeLabel = activeGrade === 'all' ? 'Toàn trường (Lớp 10, 11, 12)' : `Lớp ${activeGrade}`;
    const attempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      examId: `exam-${activeGrade}-${activeLessonId}`,
      examTitle: `Kiểm tra trắc nghiệm: Tin học ${gradeLabel}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userClass: currentUser.className || '12A1',
      score: calculatedScore,
      correctCount,
      totalQuestions: examQuestions.length,
      startedAt: new Date(Date.now() - (examTimeMinutes * 60 - timeLeftSeconds) * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds: examTimeMinutes * 60 - timeLeftSeconds,
      answers: userAnswers
    };

    StorageService.recordExamAttempt(attempt);
    setLatestAttempt(attempt);
    setPastAttempts(StorageService.getExamAttempts(currentUser.id));

    if (calculatedScore >= 8.0) {
      try {
        confetti({ particleCount: 120, spread: 80 });
      } catch {
        // ignore
      }
    }
  };

  const handlePlayTTS = async (text: string) => {
    setPlayingAudio(text);
    await TTSService.speak(text);
    setPlayingAudio(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Grade word counts
  const countG10 = vocabulary.filter(v => v.grade === 10).length;
  const countG11 = vocabulary.filter(v => v.grade === 11).length;
  const countG12 = vocabulary.filter(v => v.grade === 12).length;

  // Filtered Question Bank for tab 2
  const displayedBankQuestions = useMemo(() => {
    return fullQuestionBank.filter(q => {
      if (bankTypeFilter !== 'all' && q.type !== bankTypeFilter) return false;
      if (bankSearch.trim()) {
        const query = bankSearch.toLowerCase();
        return (
          q.prompt.toLowerCase().includes(query) ||
          q.term.toLowerCase().includes(query) ||
          q.correctAnswer.toLowerCase().includes(query) ||
          q.lessonName.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [fullQuestionBank, bankTypeFilter, bankSearch]);

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DB2777] via-[#9333EA] to-[#0866D9] text-white flex items-center justify-center shadow-md shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
                Ngân Hàng Đề Thi & Kiểm Tra Đánh Giá
              </h1>
              <span className="bg-emerald-100 text-emerald-700 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Tự động đồng bộ Excel
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Tổng hợp {vocabulary.length} câu hỏi trắc nghiệm tự động tạo từ cơ sở dữ liệu từ vựng & tệp Excel tải lên
            </p>
          </div>
        </div>

        {/* Status / Timer */}
        {isExamStarted && !isSubmitted ? (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-2xl border border-rose-200 font-mono font-bold text-sm shadow-xs animate-pulse">
            <Clock className="w-4 h-4 text-rose-600" />
            <span>Thời gian còn: {formatTime(timeLeftSeconds)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('teacher-excel')}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-[#0866D9] hover:bg-blue-100 text-xs font-bold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Nạp thêm từ file Excel</span>
            </button>
            <button
              onClick={() => onNavigateTab('vocabulary')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Vào học từ vựng</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Top Grade & Lesson Synchronizer Controls */}
      <div className="bg-white rounded-3xl p-5 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          
          {/* Grade Selector Pills */}
          <div className="space-y-1.5 w-full lg:w-auto">
            <label className="text-[11px] font-bold text-slate-600 block">
              Chọn khối lớp ({vocabulary.length} câu hỏi khả dụng):
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setActiveGrade('all');
                  setActiveLessonId('all');
                  if (onChangeGrade) onChangeGrade(12);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeGrade === 'all'
                    ? 'bg-[#0866D9] text-white shadow-md shadow-[#0866D9]/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Tất cả các khối</span>
                <span className="text-[10px] opacity-80">({vocabulary.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveGrade(10);
                  setActiveLessonId('all');
                  if (onChangeGrade) onChangeGrade(10);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeGrade === 10
                    ? 'bg-[#0866D9] text-white shadow-md shadow-[#0866D9]/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Lớp 10</span>
                <span className="text-[10px] opacity-80">({countG10} câu)</span>
              </button>

              <button
                onClick={() => {
                  setActiveGrade(11);
                  setActiveLessonId('all');
                  if (onChangeGrade) onChangeGrade(11);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeGrade === 11
                    ? 'bg-[#0866D9] text-white shadow-md shadow-[#0866D9]/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Lớp 11</span>
                <span className="text-[10px] opacity-80">({countG11} câu)</span>
              </button>

              <button
                onClick={() => {
                  setActiveGrade(12);
                  setActiveLessonId('all');
                  if (onChangeGrade) onChangeGrade(12);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeGrade === 12
                    ? 'bg-[#0866D9] text-white shadow-md shadow-[#0866D9]/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Lớp 12</span>
                <span className="text-[10px] opacity-80">({countG12} câu)</span>
              </button>
            </div>
          </div>

          {/* Lesson Scope Dropdown */}
          <div className="w-full lg:w-72 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 block">
              Phạm vi bài học:
            </label>
            <select
              value={activeLessonId}
              onChange={(e) => setActiveLessonId(e.target.value)}
              className="w-full bg-[#EAF5FF] border border-[#1388F5]/30 text-[#061D49] text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#0866D9] cursor-pointer"
            >
              <option value="all">
                📚 Toàn bộ ngân hàng đề (gồm từ file Excel) - {poolWords.length} câu
              </option>
              {topics
                .filter(t => activeGrade === 'all' || t.grade === activeGrade)
                .map(topic => (
                  <optgroup key={topic.id} label={topic.name}>
                    {topic.lessons.map(lesson => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
            </select>
          </div>

        </div>

        {/* Navigation Tabs between Exam, Question Bank Browser, and History */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('take-exam')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'take-exam'
                  ? 'bg-white text-[#073B86] shadow-md shadow-black/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-[#0866D9]" />
              <span>Làm bài kiểm tra</span>
            </button>

            <button
              onClick={() => setActiveTab('question-bank')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'question-bank'
                  ? 'bg-white text-[#073B86] shadow-md shadow-black/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Duyệt Ngân Hàng Đề ({poolWords.length} câu)</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-[#073B86] shadow-md shadow-black/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Lịch sử thi ({pastAttempts.length})</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã đồng bộ {poolWords.length} câu hỏi trắc nghiệm</span>
          </div>
        </div>
      </div>

      {/* 3. TAB 1: TAKE EXAM (ONLINE TEST) */}
      {activeTab === 'take-exam' && (
        <>
          {/* Screen 1: Exam Setup & Intro */}
          {!isExamStarted && !isSubmitted && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#B6D9F9]/50 max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-[#0866D9] bg-[#EAF5FF] px-3.5 py-1 rounded-full border border-[#1388F5]/30 inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Đề thi chuẩn Bộ GD&ĐT &bull; Tự động đồng bộ từ file Excel
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#073B86]">
                  Bài Kiểm Tra Trắc Nghiệm Tin Học {activeGrade === 'all' ? 'THPT' : `Lớp ${activeGrade}`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Giáo viên: <strong>Nguyễn Thị Châu</strong> &bull; Trường PT DTNT THPT Bình Thuận
                </p>
              </div>

              {/* Customizer: Select Question Count and Time */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Số lượng câu hỏi trong đề:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 15, 20].map(cnt => (
                      <button
                        key={cnt}
                        onClick={() => setExamQuestionCount(cnt)}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          examQuestionCount === cnt
                            ? 'bg-[#0866D9] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {cnt} câu
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Thời gian làm bài:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[5, 10, 15].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setExamTimeMinutes(mins)}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          examTimeMinutes === mins
                            ? 'bg-[#0866D9] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {mins} phút
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Statistics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#EAF5FF] p-4 rounded-2xl border border-[#B6D9F9] text-center">
                <div>
                  <div className="text-slate-500 text-[11px] font-bold">Số câu thi</div>
                  <div className="text-base font-black text-[#073B86]">{examQuestionCount} câu</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px] font-bold">Thời gian</div>
                  <div className="text-base font-black text-[#073B86]">{examTimeMinutes} phút</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px] font-bold">Ngân hàng đề</div>
                  <div className="text-base font-black text-[#0866D9]">{poolWords.length} câu</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px] font-bold">Hình thức</div>
                  <div className="text-base font-black text-emerald-700">Trắc nghiệm</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Quy định làm bài thi:</span>
                </div>
                <p>1. Câu hỏi được trích ngẫu nhiên từ {poolWords.length} câu hỏi trong ngân hàng dữ liệu & tệp Excel.</p>
                <p>2. Khi bấm bắt đầu, đồng hồ đếm ngược sẽ chạy và tự động nộp bài khi hết giờ.</p>
                <p>3. Điểm số sẽ được chấm ngay lập tức và lưu vào học bạ học sinh.</p>
              </div>

              <button
                onClick={handleStartExam}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#DB2777] via-[#9333EA] to-[#0866D9] hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-pink-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>BẮT ĐẦU LÀM BÀI THI NGAY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Screen 2: Exam In Progress */}
          {isExamStarted && !isSubmitted && examQuestions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Question card (Col 8) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#B6D9F9]/50 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#0866D9] uppercase tracking-wider">
                      Câu hỏi {currentIdx + 1} / {examQuestions.length}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      Lớp {examQuestions[currentIdx]?.grade}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Đã chọn: {answeredCount} / {examQuestions.length} câu
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                    {examQuestions[currentIdx]?.prompt}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="p-3 rounded-xl bg-[#EAF5FF] border border-[#1388F5]/30 inline-block font-mono text-xl font-black text-[#073B86]">
                      {examQuestions[currentIdx]?.term}
                    </div>
                    <button
                      onClick={() => handlePlayTTS(examQuestions[currentIdx]?.term)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#0866D9] hover:text-white text-slate-600 transition-colors cursor-pointer"
                      title="Nghe phát âm chuẩn"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4 Choices */}
                <div className="space-y-3 pt-2">
                  {examQuestions[currentIdx]?.options.map((opt, i) => {
                    const isSelected = userAnswers[examQuestions[currentIdx].id] === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectAnswer(examQuestions[currentIdx].id, opt)}
                        className={`w-full p-4 rounded-2xl border text-xs sm:text-sm font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#0866D9] text-white border-[#0866D9] shadow-md shadow-[#0866D9]/30'
                            : 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Stepper buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Câu trước
                  </button>

                  <button
                    disabled={currentIdx >= examQuestions.length - 1}
                    onClick={() => setCurrentIdx(prev => Math.min(examQuestions.length - 1, prev + 1))}
                    className="px-4 py-2 rounded-xl bg-[#0866D9] text-white text-xs font-bold hover:bg-[#073B86] disabled:opacity-40 cursor-pointer"
                  >
                    Câu tiếp theo
                  </button>
                </div>
              </div>

              {/* Palette Sidebar & Submit (Col 4) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-3xl p-5 shadow-md border border-[#B6D9F9]/50 space-y-4">
                  <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Bảng câu hỏi ({answeredCount}/{examQuestions.length})</span>
                    <span className="text-[#0866D9] font-mono">{formatTime(timeLeftSeconds)}</span>
                  </h3>

                  <div className="grid grid-cols-5 gap-2">
                    {examQuestions.map((q, idx) => {
                      const isCurrent = idx === currentIdx;
                      const isAnswered = !!userAnswers[q.id];
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIdx(idx)}
                          className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isCurrent
                              ? 'ring-2 ring-[#0866D9] font-black'
                              : ''
                          } ${
                            isAnswered
                              ? 'bg-[#12B981] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-[#12B981]" /> Đã chọn
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-slate-200" /> Chưa chọn
                    </span>
                  </div>

                  <button
                    onClick={handleSubmitExam}
                    className="w-full mt-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>NỘP BÀI THI ({answeredCount}/{examQuestions.length})</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Screen 3: Exam Results Breakdown */}
          {isSubmitted && latestAttempt && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#B6D9F9]/50 space-y-8 max-w-4xl mx-auto">
              
              <div className="text-center space-y-3 pb-4 border-b border-slate-100">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner ${
                  latestAttempt.score >= 8.0 ? 'bg-emerald-100 text-emerald-600' :
                  latestAttempt.score >= 5.0 ? 'bg-blue-100 text-[#0866D9]' : 'bg-rose-100 text-rose-600'
                }`}>
                  <Award className="w-10 h-10" />
                </div>

                <h2 className="text-3xl font-black text-[#073B86]">
                  Điểm số: <span className="text-[#0866D9]">{latestAttempt.score}</span> / 10
                </h2>

                <p className="text-xs sm:text-sm text-slate-600">
                  Học sinh: <strong>{latestAttempt.userName}</strong> ({latestAttempt.userClass}) &bull; Trả lời đúng:{' '}
                  <strong className="text-emerald-700">{latestAttempt.correctCount} / {latestAttempt.totalQuestions} câu</strong>
                </p>

                <div className="inline-block bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
                  ✔ Đã ghi nhận kết quả vào cơ sở dữ liệu học tập
                </div>
              </div>

              {/* Detailed Question Review */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-[#073B86] flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[#0866D9]" />
                  <span>Chi tiết câu hỏi và đáp án giải thích</span>
                </h3>

                <div className="space-y-3">
                  {examQuestions.map((q, idx) => {
                    const userAns = latestAttempt.answers[q.id];
                    const isRight = userAns === q.correctAnswer;

                    return (
                      <div 
                        key={q.id}
                        className={`p-4 rounded-2xl border text-xs space-y-2 ${
                          isRight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-slate-800">
                            Câu {idx + 1}: {q.prompt}
                          </div>
                          <div className={`shrink-0 flex items-center gap-1 font-bold ${
                            isRight ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {isRight ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>{isRight ? 'Đúng' : 'Sai'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div>
                            <span className="text-slate-500">Câu trả lời của bạn: </span>
                            <strong className={isRight ? 'text-emerald-700' : 'text-rose-700'}>
                              {userAns || '(Chưa chọn)'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Đáp án chuẩn: </span>
                            <strong className="text-emerald-800">{q.correctAnswer}</strong>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200">
                          <strong>Giải thích:</strong> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsExamStarted(false);
                    setIsSubmitted(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Làm lại bài kiểm tra
                </button>
                <button
                  onClick={() => onNavigateTab('results')}
                  className="px-5 py-2.5 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Xem bảng kết quả tổng thể</span>
                </button>
              </div>

            </div>
          )}
        </>
      )}

      {/* 4. TAB 2: QUESTION BANK BROWSER */}
      {activeTab === 'question-bank' && (
        <div className="space-y-5">
          {/* Bank Search & Filters */}
          <div className="bg-white rounded-3xl p-5 shadow-md border border-[#B6D9F9]/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi theo từ tiếng Anh, nghĩa tiếng Việt, bài học..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0866D9] bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bankTypeFilter}
                onChange={(e) => setBankTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả dạng câu hỏi</option>
                <option value="term-to-meaning">Thuật ngữ &rarr; Nghĩa tiếng Việt</option>
                <option value="meaning-to-term">Nghĩa tiếng Việt &rarr; Thuật ngữ</option>
                <option value="definition-match">Khớp định nghĩa ngữ cảnh</option>
              </select>

              <button
                onClick={() => {
                  setActiveTab('take-exam');
                  handleStartExam();
                }}
                className="px-4 py-2 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#0866D9]/20"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Tạo đề từ ngân hàng</span>
              </button>
            </div>
          </div>

          {/* Question List Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-600">
              <span>Hiển thị {displayedBankQuestions.length} câu hỏi trong ngân hàng:</span>
              <span className="text-[#0866D9]">Lớp {activeGrade === 'all' ? '10, 11, 12' : activeGrade}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedBankQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white rounded-3xl p-5 shadow-md border border-[#B6D9F9]/50 space-y-3 relative hover:border-[#0866D9] transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#0866D9] text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-[#0866D9] bg-blue-50 px-2 py-0.5 rounded-md">
                        Lớp {q.grade}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {q.lessonName}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePlayTTS(q.term)}
                      className={`p-1.5 rounded-lg text-slate-400 hover:text-[#0866D9] hover:bg-blue-50 transition-colors cursor-pointer ${
                        playingAudio === q.term ? 'text-[#0866D9] animate-pulse' : ''
                      }`}
                      title="Phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-slate-800 leading-snug">
                    {q.prompt}
                  </h4>

                  {/* Choices list */}
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = opt === q.correctAnswer;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation note */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                    <strong>Giải thích:</strong> {q.explanation}
                  </div>
                </div>
              ))}
            </div>

            {displayedBankQuestions.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center text-slate-400 text-xs font-semibold">
                Không tìm thấy câu hỏi nào phù hợp với bộ lọc tìm kiếm.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 3: EXAM HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#073B86]">
              Lịch Sử Bài Thi & Học Bạ Cá Nhân ({pastAttempts.length} lượt thi)
            </h3>
          </div>

          {pastAttempts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              Chưa có lượt làm bài nào. Hãy bấm "Làm bài kiểm tra" để thử sức ngay!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Thời gian thi</th>
                    <th className="py-2.5 px-3">Tên bài kiểm tra</th>
                    <th className="py-2.5 px-3">Số câu đúng</th>
                    <th className="py-2.5 px-3">Thời gian làm</th>
                    <th className="py-2.5 px-3">Điểm số</th>
                    <th className="py-2.5 px-3">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500 font-mono">
                        {new Date(att.completedAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#073B86]">
                        {att.examTitle}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {att.correctCount} / {att.totalQuestions} câu
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {Math.floor(att.durationSeconds / 60)}m {att.durationSeconds % 60}s
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                          att.score >= 8.0 ? 'bg-emerald-100 text-emerald-800' :
                          att.score >= 5.0 ? 'bg-blue-100 text-[#0866D9]' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {att.score} / 10
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {att.score >= 9.0 ? 'Xuất sắc' :
                         att.score >= 8.0 ? 'Giỏi' :
                         att.score >= 6.5 ? 'Khá' :
                         att.score >= 5.0 ? 'Trung bình' : 'Cần ôn lại'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
