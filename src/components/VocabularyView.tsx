import React, { useState, useMemo, useEffect } from 'react';
import { 
  Volume2, 
  Star, 
  CheckCircle2, 
  Search, 
  Filter, 
  Layers, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Info,
  Check,
  RotateCcw,
  UploadCloud,
  ClipboardCheck,
  Zap,
  FolderOpen,
  LayoutGrid,
  ListFilter,
  CheckCircle,
  GraduationCap,
  ArrowRight,
  BookMarked,
  RefreshCw
} from 'lucide-react';
import { VocabularyItem, GradeLevel, TopicItem } from '../types';
import { TTSService } from '../services/tts';
import { StorageService } from '../services/storage';

interface VocabularyViewProps {
  vocabulary: VocabularyItem[];
  topics: TopicItem[];
  selectedGrade: GradeLevel;
  selectedLessonId: string;
  onChangeGrade: (grade: GradeLevel) => void;
  onChangeLesson: (lessonId: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleLearned: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onUpdateVocabulary?: (vocab: VocabularyItem[]) => void;
  onUpdateTopics?: (topics: TopicItem[]) => void;
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  vocabulary,
  topics,
  selectedGrade,
  selectedLessonId,
  onChangeGrade,
  onChangeLesson,
  onToggleFavorite,
  onToggleLearned,
  onNavigateTab,
  onUpdateVocabulary,
  onUpdateTopics
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isLessonDirectoryOpen, setIsLessonDirectoryOpen] = useState(true);
  const [reorganizeSuccessMsg, setReorganizeSuccessMsg] = useState<string | null>(null);

  // Dynamic word counts for all grades
  const countGrade10 = vocabulary.filter(v => v.grade === 10).length;
  const countGrade11 = vocabulary.filter(v => v.grade === 11).length;
  const countGrade12 = vocabulary.filter(v => v.grade === 12).length;

  // Detect if database was previously skewed (e.g. 506 words in Grade 12 while 10 & 11 have <= 15 words)
  const isSkewed = countGrade12 > 100 && (countGrade10 <= 15 || countGrade11 <= 15);

  // Auto-heal on initial mount if skewed
  useEffect(() => {
    if (isSkewed && onUpdateVocabulary && onUpdateTopics) {
      const { updatedVocab, updatedTopics } = StorageService.reorganizeVocabularyByGradeAndLesson(vocabulary, topics);
      StorageService.saveVocabulary(updatedVocab);
      StorageService.saveTopics(updatedTopics);
      onUpdateVocabulary(updatedVocab);
      onUpdateTopics(updatedTopics);
      setReorganizeSuccessMsg('Đã tự động phân chia lại 524 từ vựng vào đúng Khối 10, Khối 11, Khối 12 và từng bài học chuẩn SGK!');
    }
  }, [isSkewed]);

  const handleManualReorganize = () => {
    const { updatedVocab, updatedTopics } = StorageService.reorganizeVocabularyByGradeAndLesson(vocabulary, topics);
    StorageService.saveVocabulary(updatedVocab);
    StorageService.saveTopics(updatedTopics);
    if (onUpdateVocabulary) onUpdateVocabulary(updatedVocab);
    if (onUpdateTopics) onUpdateTopics(updatedTopics);
    
    const g10 = updatedVocab.filter(v => v.grade === 10).length;
    const g11 = updatedVocab.filter(v => v.grade === 11).length;
    const g12 = updatedVocab.filter(v => v.grade === 12).length;
    setReorganizeSuccessMsg(`Đã phân chia hoàn tất: Lớp 10 (${g10} từ), Lớp 11 (${g11} từ), Lớp 12 (${g12} từ) theo từng bài học SGK!`);
    setTimeout(() => setReorganizeSuccessMsg(null), 6000);
  };

  // Filter lessons for selected grade
  const currentGradeTopics = useMemo(() => {
    return topics.filter(t => t.grade === selectedGrade);
  }, [topics, selectedGrade]);

  const currentGradeAllWords = useMemo(() => {
    return vocabulary.filter(v => v.grade === selectedGrade);
  }, [vocabulary, selectedGrade]);

  // All lessons in selected grade flattened for easy navigation
  const allGradeLessons = useMemo(() => {
    return currentGradeTopics.flatMap(t => t.lessons.map(l => ({ ...l, topicName: t.name })));
  }, [currentGradeTopics]);

  // Active lesson object
  const activeLesson = useMemo(() => {
    if (!selectedLessonId || selectedLessonId === 'all') return null;
    return allGradeLessons.find(l => l.id === selectedLessonId) || null;
  }, [allGradeLessons, selectedLessonId]);

  // Find index of current lesson for prev/next lesson navigation
  const activeLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return allGradeLessons.findIndex(l => l.id === activeLesson.id);
  }, [allGradeLessons, activeLesson]);

  // Filtered list
  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter(item => {
      // Grade filter
      if (item.grade !== selectedGrade) return false;
      
      // Lesson filter: 'all' or empty shows all words in this grade
      if (selectedLessonId && selectedLessonId !== 'all') {
        const matchingLesson = allGradeLessons.find(l => l.id === selectedLessonId);
        const matchesId = item.lessonId === selectedLessonId;
        const matchesName = matchingLesson && 
          StorageService.normalizeText(item.lessonName) === StorageService.normalizeText(matchingLesson.name);

        if (!matchesId && !matchesName) return false;
      }

      // Level filter
      if (filterLevel !== 'all' && item.level !== filterLevel) return false;

      // Source filter
      if (filterSource !== 'all' && item.sourceType !== filterSource) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          item.english.toLowerCase().includes(query) ||
          item.vietnamese.toLowerCase().includes(query) ||
          item.explanation.toLowerCase().includes(query) ||
          item.ipa.toLowerCase().includes(query) ||
          (item.lessonName && item.lessonName.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [vocabulary, selectedGrade, selectedLessonId, allGradeLessons, filterLevel, filterSource, searchTerm]);

  const handlePlayAudio = async (text: string, id: string) => {
    setIsPlayingAudio(id);
    await TTSService.speak(text);
    setIsPlayingAudio(null);
  };

  const currentWord = filteredVocabulary[currentIndex] || filteredVocabulary[0];

  const handleGoNextLesson = () => {
    if (activeLessonIndex >= 0 && activeLessonIndex < allGradeLessons.length - 1) {
      onChangeLesson(allGradeLessons[activeLessonIndex + 1].id);
      setCurrentIndex(0);
    }
  };

  const handleGoPrevLesson = () => {
    if (activeLessonIndex > 0) {
      onChangeLesson(allGradeLessons[activeLessonIndex - 1].id);
      setCurrentIndex(0);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0866D9] to-[#16D8FF] text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
                Học Từ Vựng Tin Học THPT
              </h1>
              <span className="bg-blue-100 text-[#0866D9] text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                <Zap className="w-3 h-3 fill-[#0866D9]" /> Đã chia theo Khối & Bài học SGK
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Phát âm chuẩn IPA, giải nghĩa ngữ cảnh công nghệ & ví dụ thực tế môn Tin học THPT
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('exam')}
            className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-all flex items-center gap-1.5 border border-purple-200 cursor-pointer"
            title="Vào làm bài kiểm tra hoặc xem ngân hàng câu hỏi"
          >
            <ClipboardCheck className="w-4 h-4 text-purple-600" />
            <span>Ngân hàng đề thi ({currentGradeAllWords.length} câu)</span>
          </button>

          <button
            onClick={() => onNavigateTab('flashcard')}
            className="px-3.5 py-2 rounded-xl bg-[#EDFAF5] text-[#065F46] hover:bg-[#DCF6EB] text-xs font-bold transition-all flex items-center gap-1.5 border border-[#A7E8D0] cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#12B981]" />
            <span>Học Flashcard</span>
          </button>
        </div>
      </div>

      {/* Success Notification after Reorganize */}
      {reorganizeSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-4 flex items-center justify-between text-xs font-bold shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{reorganizeSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setReorganizeSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Skew Warning & Quick Fix Banner */}
      {isSkewed && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="text-amber-900">
            <strong className="block text-sm font-black text-amber-950 mb-0.5">
              ⚠️ Phát hiện từ vựng đang dồn vào Lớp 12 ({countGrade12} từ) do file tải lên trước đó
            </strong>
            Hệ thống đã chuẩn bị công cụ phân chia thông minh để tách đều các thuật ngữ vào đúng Lớp 10, Lớp 11 và Lớp 12 kèm bài học SGK tương ứng.
          </div>
          <button
            onClick={handleManualReorganize}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Phân chia lại ngay</span>
          </button>
        </div>
      )}

      {/* STEP 1: CHỌN KHỐI LỚP (GRADE SELECTOR) */}
      <div className="bg-white rounded-3xl p-5 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#073B86] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#0866D9]" />
              <span>Bước 1: Chọn Khối lớp Tin học</span>
              <span className="text-xs font-semibold text-slate-500">
                (Toàn trường: {vocabulary.length} thuật ngữ)
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn khối lớp để xem danh mục các bài học và thuật ngữ tiếng Anh theo chuẩn chương trình GDPT 2018
            </p>
          </div>

          <button
            onClick={handleManualReorganize}
            className="text-xs font-bold text-[#0866D9] hover:text-[#073B86] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Đồng bộ và phân loại lại tất cả từ vựng theo đúng khối 10, 11, 12"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Phân chia lại theo Khối & Bài</span>
          </button>
        </div>

        {/* 3 Large Grade Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { 
              grade: 10 as GradeLevel, 
              title: 'Tin học Lớp 10', 
              count: countGrade10, 
              desc: 'Python, Thiết bị thông minh, Mạng, IoT, Xã hội số' 
            },
            { 
              grade: 11 as GradeLevel, 
              title: 'Tin học Lớp 11', 
              count: countGrade11, 
              desc: 'Cơ sở dữ liệu, SQL, Hệ điều hành, GIMP, Dựng video' 
            },
            { 
              grade: 12 as GradeLevel, 
              title: 'Tin học Lớp 12', 
              count: countGrade12, 
              desc: 'Trí tuệ nhân tạo (AI), Thiết kế web HTML/CSS, Mạng TCP/IP' 
            }
          ].map(({ grade: g, title, count, desc }) => {
            const isSelected = selectedGrade === g;
            return (
              <button
                key={g}
                onClick={() => {
                  onChangeGrade(g);
                  onChangeLesson('all'); // Show all words of that grade by default
                  setCurrentIndex(0);
                }}
                className={`p-4 rounded-2xl text-left transition-all cursor-pointer relative overflow-hidden border-2 ${
                  isSelected
                    ? 'border-[#0866D9] bg-gradient-to-br from-[#0866D9] to-[#073B86] text-white shadow-lg shadow-[#0866D9]/25 ring-2 ring-[#0866D9]/30'
                    : 'border-slate-200 hover:border-[#B6D9F9] bg-slate-50/60 hover:bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-[#073B86]'}`}>
                    {title}
                  </span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#EAF5FF] text-[#0866D9]'
                  }`}>
                    {count} từ
                  </span>
                </div>
                <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                  isSelected ? 'text-blue-100 font-medium' : 'text-slate-500'
                }`}>
                  {desc}
                </p>
                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-[#16D8FF]">
                    <span>Đang xem khối này</span>
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: DANH MỤC TỪNG BÀI HỌC TRỰC QUAN (VISUAL LESSON DIRECTORY) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#073B86] flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#0866D9]" />
              <span>Bước 2: Chọn Bài học môn Tin học Lớp {selectedGrade}</span>
              <span className="text-xs font-semibold text-slate-500">
                ({currentGradeTopics.length} chủ đề, {allGradeLessons.length} bài học)
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Học sinh bấm vào từng bài học cụ thể bên dưới để luyện từ vựng theo đúng tiến độ bài học trên lớp
            </p>
          </div>

          {/* Toggle between Visual Grid and Compact Dropdown */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setIsLessonDirectoryOpen(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isLessonDirectoryOpen
                  ? 'bg-white text-[#0866D9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lưới thẻ bài học</span>
            </button>
            <button
              onClick={() => setIsLessonDirectoryOpen(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                !isLessonDirectoryOpen
                  ? 'bg-white text-[#0866D9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Thực đơn chọn nhanh</span>
            </button>
          </div>
        </div>

        {/* Option A: Visual Lesson Directory Grid */}
        {isLessonDirectoryOpen ? (
          <div className="space-y-4 pt-1">
            
            {/* Quick Button: "Tất cả bài học Lớp X" */}
            <button
              onClick={() => {
                onChangeLesson('all');
                setCurrentIndex(0);
              }}
              className={`w-full p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between text-left ${
                selectedLessonId === 'all' || !selectedLessonId
                  ? 'border-[#0866D9] bg-[#EAF5FF] shadow-sm ring-2 ring-[#0866D9]/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  selectedLessonId === 'all' || !selectedLessonId
                    ? 'bg-[#0866D9] text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  📚
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-[#073B86]">
                    Toàn bộ bài học Khối Lớp {selectedGrade}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Xem và học liên tục tất cả thuật ngữ môn Tin học của khối {selectedGrade}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#0866D9] bg-white px-3 py-1 rounded-xl border border-blue-200">
                  {currentGradeAllWords.length} thuật ngữ
                </span>
                {(selectedLessonId === 'all' || !selectedLessonId) && (
                  <Check className="w-4 h-4 text-[#0866D9]" />
                )}
              </div>
            </button>

            {/* Topics with their individual Lessons */}
            <div className="space-y-4">
              {currentGradeTopics.map((topic, topicIdx) => (
                <div key={topic.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-lg bg-[#0866D9]/10 text-[#0866D9] font-black text-xs flex items-center justify-center">
                      {topicIdx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-800">
                      {topic.name}
                    </h3>
                  </div>

                  {/* Lesson Cards under this topic */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {topic.lessons.map(lesson => {
                      const isSelected = selectedLessonId === lesson.id;
                      const lessonWords = vocabulary.filter(v => 
                        v.grade === selectedGrade && (
                          v.lessonId === lesson.id || 
                          StorageService.normalizeText(v.lessonName) === StorageService.normalizeText(lesson.name)
                        )
                      );
                      const learnedInLesson = lessonWords.filter(v => v.isLearned).length;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            onChangeLesson(lesson.id);
                            setCurrentIndex(0);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-white border-[#0866D9] ring-2 ring-[#0866D9]/25 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-[#B6D9F9] hover:bg-blue-50/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-xs font-bold leading-snug ${
                              isSelected ? 'text-[#0866D9]' : 'text-slate-800'
                            }`}>
                              {lesson.name}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#0866D9] shrink-0 mt-0.5" />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                            <span className="font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {lessonWords.length} từ vựng
                            </span>
                            {learnedInLesson > 0 && (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>{learnedInLesson} đã thuộc</span>
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* Option B: Compact Dropdown Menu */
          <div className="pt-2">
            <label className="text-xs font-bold text-slate-600 block mb-1.5">
              Chọn nhanh Chủ đề & Bài học Lớp {selectedGrade}:
            </label>
            <select
              value={selectedLessonId || 'all'}
              onChange={(e) => {
                onChangeLesson(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full bg-[#EAF5FF] border-2 border-[#1388F5]/40 text-[#061D49] text-xs sm:text-sm rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0866D9] cursor-pointer"
            >
              <option value="all">
                📚 Tất cả bài học (Toàn bộ {currentGradeAllWords.length} từ vựng Lớp {selectedGrade})
              </option>
              {currentGradeTopics.map(topic => (
                <optgroup key={topic.id} label={topic.name}>
                  {topic.lessons.map(lesson => {
                    const lessonCount = vocabulary.filter(v => 
                      v.grade === selectedGrade && (
                        v.lessonId === lesson.id || 
                        StorageService.normalizeText(v.lessonName) === StorageService.normalizeText(lesson.name)
                      )
                    ).length;
                    return (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.name} ({lessonCount} từ)
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentIndex(0);
            }}
            placeholder="Tìm kiếm thuật ngữ tiếng Anh, nghĩa tiếng Việt, giải thích, bài học..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9] focus:bg-white text-slate-800"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2">
          {/* Difficulty filter */}
          <select
            value={filterLevel}
            onChange={(e) => {
              setFilterLevel(e.target.value);
              setCurrentIndex(0);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">Mọi cấp độ</option>
            <option value="dễ">Dễ</option>
            <option value="trung bình">Trung bình</option>
            <option value="nâng cao">Nâng cao</option>
          </select>

          {/* Source filter */}
          <select
            value={filterSource}
            onChange={(e) => {
              setFilterSource(e.target.value);
              setCurrentIndex(0);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none cursor-pointer max-w-[170px]"
          >
            <option value="all">Tất cả nguồn</option>
            <option value="Trong SGK (Đã xác minh)">Trong SGK</option>
            <option value="Từ gợi ý - cần đối chiếu">Từ gợi ý</option>
            <option value="Từ mở rộng chuyên ngành">Mở rộng</option>
          </select>
        </div>
      </div>

      {/* ACTIVE LESSON BREADCRUMB & STEPPER */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 rounded-2xl p-4 border border-[#B6D9F9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <BookMarked className="w-4 h-4 text-[#0866D9] shrink-0" />
          <span className="text-slate-600 font-medium">Đang học:</span>
          <span className="font-extrabold text-[#0866D9] bg-white px-2.5 py-0.5 rounded-lg border border-blue-200">
            Lớp {selectedGrade}
          </span>
          <span className="text-slate-400">&gt;</span>
          <span className="font-black text-[#073B86]">
            {activeLesson ? activeLesson.name : `Toàn bộ ${currentGradeAllWords.length} từ vựng`}
          </span>
          <span className="text-slate-500 font-medium">
            ({filteredVocabulary.length} từ phù hợp bộ lọc)
          </span>
        </div>

        {/* Stepper Buttons for Lessons */}
        {activeLesson && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGoPrevLesson}
              disabled={activeLessonIndex <= 0}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-[11px] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Bài trước</span>
            </button>
            <button
              onClick={handleGoNextLesson}
              disabled={activeLessonIndex >= allGradeLessons.length - 1}
              className="px-2.5 py-1 rounded-lg border border-blue-300 bg-[#0866D9] text-white font-bold text-[11px] hover:bg-[#073B86] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>Bài tiếp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                onChangeLesson('all');
                setCurrentIndex(0);
              }}
              className="text-[11px] font-bold text-[#0866D9] hover:underline px-1 cursor-pointer"
            >
              Xem tất cả bài
            </button>
          </div>
        )}
      </div>

      {/* Main Learning Card Area */}
      {filteredVocabulary.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-md border border-[#B6D9F9]/50 space-y-3">
          <Info className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Chưa tìm thấy từ vựng phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Không có từ vựng nào khớp với bộ lọc hiện tại. Thử chọn bài học khác hoặc nhập từ khóa tìm kiếm mới.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterLevel('all');
              setFilterSource('all');
              onChangeLesson('all');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-[#0866D9] text-white text-xs font-bold hover:bg-[#073B86] transition-colors cursor-pointer"
          >
            Xem toàn bộ từ vựng Lớp {selectedGrade}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Active Detailed Word Showcase */}
          {currentWord && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-[#B6D9F9] relative overflow-hidden transition-all duration-300">
              
              {/* Top Meta Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-white bg-[#0866D9] px-2.5 py-1 rounded-lg">
                    Lớp {currentWord.grade}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {currentWord.lessonName}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    currentWord.level === 'dễ' ? 'bg-emerald-100 text-emerald-700' :
                    currentWord.level === 'trung bình' ? 'bg-amber-100 text-amber-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    Độ khó: {currentWord.level}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    currentWord.sourceType === 'Trong SGK (Đã xác minh)'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {currentWord.sourceType} {currentWord.sourcePage ? `(Trang ${currentWord.sourcePage})` : ''}
                  </span>
                </div>

                {/* Favorite & Learned quick toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleFavorite(currentWord.id)}
                    title={currentWord.isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      currentWord.isFavorite
                        ? 'bg-amber-50 text-amber-500 border-amber-300 shadow-xs'
                        : 'bg-slate-50 text-slate-400 hover:text-amber-500 border-slate-200'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${currentWord.isFavorite ? 'fill-amber-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => onToggleLearned(currentWord.id)}
                    title={currentWord.isLearned ? 'Đã thuộc (Bấm để ôn lại)' : 'Đánh dấu đã thuộc'}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentWord.isLearned
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{currentWord.isLearned ? 'Đã thuộc' : 'Chưa thuộc'}</span>
                  </button>
                </div>
              </div>

              {/* Main Term & Pronunciation */}
              <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h2 className="text-3xl sm:text-4xl font-black text-[#073B86] tracking-tight font-mono">
                      {currentWord.english}
                    </h2>
                    <span className="text-xs uppercase font-extrabold text-[#0866D9] bg-[#EAF5FF] px-2 py-0.5 rounded-md border border-[#1388F5]/30">
                      {currentWord.partOfSpeech}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-500 font-mono mt-1">
                    {currentWord.ipa}
                  </div>
                </div>

                {/* Pronounce Button */}
                <button
                  onClick={() => handlePlayAudio(currentWord.english, currentWord.id)}
                  disabled={isPlayingAudio === currentWord.id}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0866D9] to-[#1388F5] hover:from-[#073B86] hover:to-[#0866D9] text-white font-bold text-sm shadow-lg shadow-[#0866D9]/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Volume2 className={`w-5 h-5 ${isPlayingAudio === currentWord.id ? 'animate-bounce text-[#16D8FF]' : ''}`} />
                  <span>{isPlayingAudio === currentWord.id ? 'Đang đọc...' : 'Nghe phát âm'}</span>
                </button>
              </div>

              {/* Meaning & Explanation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Nghĩa tiếng Việt */}
                <div className="p-4 rounded-2xl bg-[#EAF5FF] border border-[#B6D9F9]">
                  <div className="text-xs font-bold text-[#0866D9] uppercase tracking-wider mb-1">
                    Nghĩa tiếng Việt (Thuật ngữ Tin học)
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#061D49]">
                    {currentWord.vietnamese}
                  </div>
                </div>

                {/* Giải thích theo ngữ cảnh Tin học */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#0866D9]" />
                    <span>Giải thích trong môn Tin học</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {currentWord.explanation}
                  </p>
                </div>

              </div>

              {/* Bilingual Example Box */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#061D49]/5 to-[#0866D9]/5 border border-[#1388F5]/20">
                <div className="text-xs font-bold text-[#073B86] mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0866D9]" />
                  <span>Câu ví dụ thực tế trong môn Tin học:</span>
                </div>
                <div className="text-sm sm:text-base font-semibold text-slate-900 italic font-mono">
                  &ldquo;{currentWord.example}&rdquo;
                </div>
                <div className="text-xs sm:text-sm text-slate-600 mt-1">
                  &rarr; {currentWord.exampleTranslation}
                </div>
              </div>

              {/* Bottom Pagination & Stepper */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Từ trước</span>
                </button>

                <div className="text-xs font-bold text-slate-500">
                  Từ {currentIndex + 1} / {filteredVocabulary.length}
                </div>

                <button
                  disabled={currentIndex >= filteredVocabulary.length - 1}
                  onClick={() => setCurrentIndex(prev => Math.min(filteredVocabulary.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-[#0866D9] text-white text-xs font-bold hover:bg-[#073B86] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <span>Từ tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* Grid List of All Words in this Lesson */}
          <div className="bg-white rounded-3xl p-5 shadow-md border border-[#B6D9F9]/50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-sm sm:text-base text-[#073B86] flex items-center gap-2">
                <span>Danh sách thuật ngữ bài học ({activeLesson ? activeLesson.name : `Lớp ${selectedGrade}`})</span>
                <span className="bg-[#EAF5FF] text-[#0866D9] text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {filteredVocabulary.length} từ
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredVocabulary.map((item, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'border-[#0866D9] bg-[#EAF5FF] shadow-sm ring-2 ring-[#0866D9]/20'
                        : 'border-slate-200 hover:border-[#1388F5] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#073B86] font-mono">{item.english}</span>
                        <span className="text-[10px] text-slate-400">({item.partOfSpeech})</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5">{item.vietnamese}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.ipa}</div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(item.english, item.id);
                        }}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-[#0866D9] hover:text-white text-slate-600 transition-colors cursor-pointer"
                        title="Nghe"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      {item.isFavorite && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      )}
                      {item.isLearned && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
