import React, { useState, useMemo } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { VocabularyItem, GradeLevel, TopicItem } from '../types';
import { TTSService } from '../services/tts';

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
  onNavigateTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  // Filter lessons for selected grade
  const currentGradeTopics = topics.filter(t => t.grade === selectedGrade);
  
  // Filtered list
  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter(item => {
      // Grade filter
      if (item.grade !== selectedGrade) return false;
      
      // Lesson filter
      if (selectedLessonId && item.lessonId !== selectedLessonId) return false;

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
          item.ipa.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [vocabulary, selectedGrade, selectedLessonId, filterLevel, filterSource, searchTerm]);

  const handlePlayAudio = async (text: string, id: string) => {
    setIsPlayingAudio(id);
    await TTSService.speak(text);
    setIsPlayingAudio(null);
  };

  const currentWord = filteredVocabulary[currentIndex] || filteredVocabulary[0];

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0866D9] to-[#16D8FF] text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Học Từ Vựng Tin Học THPT
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Phát âm chuẩn IPA, ngữ cảnh công nghệ & ví dụ thực tế môn Tin học
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('flashcard')}
            className="px-3.5 py-2 rounded-xl bg-[#EDFAF5] text-[#065F46] hover:bg-[#DCF6EB] text-xs font-bold transition-all flex items-center gap-1.5 border border-[#A7E8D0] cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#12B981]" />
            <span>Chuyển sang Flashcard</span>
          </button>
        </div>
      </div>

      {/* Filter and Selection Row */}
      <div className="bg-white rounded-3xl p-5 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Grade selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Khối lớp:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {([10, 11, 12] as GradeLevel[]).map(g => (
                <button
                  key={g}
                  onClick={() => {
                    onChangeGrade(g);
                    setCurrentIndex(0);
                    const firstTopic = topics.find(t => t.grade === g);
                    if (firstTopic && firstTopic.lessons.length > 0) {
                      onChangeLesson(firstTopic.lessons[0].id);
                    }
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedGrade === g
                      ? 'bg-[#0866D9] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Lớp {g}
                </button>
              ))}
            </div>
          </div>

          {/* Lesson selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Chủ đề & Bài học:</label>
            <select
              value={selectedLessonId}
              onChange={(e) => {
                onChangeLesson(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full bg-[#EAF5FF] border border-[#1388F5]/30 text-[#061D49] text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
            >
              {currentGradeTopics.map(topic => (
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

          {/* Difficulty filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Độ khó:</label>
            <select
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none"
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="dễ">Dễ (Cơ bản)</option>
              <option value="trung bình">Trung bình (Phổ biến)</option>
              <option value="nâng cao">Nâng cao (Chuyên sâu)</option>
            </select>
          </div>

          {/* Source classification */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Nguồn SGK:</label>
            <select
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none"
            >
              <option value="all">Tất cả nguồn từ</option>
              <option value="Trong SGK (Đã xác minh)">Trong SGK (Đã xác minh)</option>
              <option value="Từ gợi ý - cần đối chiếu">Từ gợi ý - cần đối chiếu</option>
              <option value="Từ mở rộng chuyên ngành">Từ mở rộng chuyên ngành</option>
            </select>
          </div>

        </div>

        {/* Real-time search box */}
        <div className="relative pt-2">
          <Search className="w-4 h-4 absolute left-3.5 top-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentIndex(0);
            }}
            placeholder="Tìm kiếm nhanh thuật ngữ tiếng Anh, nghĩa tiếng Việt, giải thích..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9] focus:bg-white text-slate-800"
          />
        </div>
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
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-[#0866D9] text-white text-xs font-bold hover:bg-[#073B86] transition-colors"
          >
            Đặt lại bộ lọc
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
                <span>Danh sách từ vựng bài học</span>
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
