import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Sparkles, 
  BookOpen,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabularyItem, GradeLevel, TopicItem } from '../types';
import { TTSService } from '../services/tts';

interface FlashcardViewProps {
  vocabulary: VocabularyItem[];
  topics: TopicItem[];
  selectedGrade: GradeLevel;
  selectedLessonId: string;
  onChangeGrade: (grade: GradeLevel) => void;
  onChangeLesson: (lessonId: string) => void;
  onToggleLearned: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  vocabulary,
  topics,
  selectedGrade,
  selectedLessonId,
  onChangeGrade,
  onChangeLesson,
  onToggleLearned,
  onNavigateTab
}) => {
  const currentGradeTopics = topics.filter(t => t.grade === selectedGrade);

  // Deck of words for this lesson
  const deckWords = vocabulary.filter(v => v.grade === selectedGrade && (!selectedLessonId || v.lessonId === selectedLessonId));
  
  const [cards, setCards] = useState<VocabularyItem[]>(deckWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [unlearnedCount, setUnlearnedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setCards(deckWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  }, [selectedGrade, selectedLessonId, vocabulary]);

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCard) {
      TTSService.speak(currentCard.english);
    }
  };

  const handleRate = (rating: 'mastered' | 'review' | 'unlearned') => {
    if (!currentCard) return;

    if (rating === 'mastered') {
      setKnownCount(prev => prev + 1);
      onToggleLearned(currentCard.id);
    } else if (rating === 'review') {
      setReviewCount(prev => prev + 1);
    } else {
      setUnlearnedCount(prev => prev + 1);
    }

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed deck!
      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setKnownCount(0);
    setReviewCount(0);
    setUnlearnedCount(0);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#12B981] to-[#16D8FF] text-white flex items-center justify-center shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Flashcard 3D – Ghi Nhớ Từ Vựng
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Lật thẻ thông minh, nghe phát âm và ôn tập ngắt quãng (Spaced Repetition)
            </p>
          </div>
        </div>

        {/* Lesson selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedLessonId}
            onChange={(e) => onChangeLesson(e.target.value)}
            className="w-full md:w-72 bg-[#EAF5FF] border border-[#1388F5]/30 text-[#061D49] text-xs rounded-xl px-3 py-2.5 font-bold focus:outline-none"
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

          <button
            onClick={handleShuffle}
            title="Xáo trộn thẻ"
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Counter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#B6D9F9]/50 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#073B86]">
            Thẻ: {cards.length > 0 ? currentIndex + 1 : 0} / {cards.length}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-600 font-bold">Đã nhớ: {knownCount}</span>
          <span className="text-amber-500 font-bold">Cần ôn: {reviewCount}</span>
          <span className="text-rose-500 font-bold">Chưa thuộc: {unlearnedCount}</span>
        </div>

        {/* Linear progress */}
        <div className="w-36 sm:w-56 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#0866D9] to-[#12B981] transition-all duration-300"
            style={{ width: `${cards.length > 0 ? ((currentIndex + (isCompleted ? 1 : 0)) / cards.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard Container */}
      {isCompleted ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border-2 border-[#12B981] space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#073B86]">
            Xuất sắc! Bạn đã hoàn thành bộ thẻ!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Ghi nhận kết quả: <strong className="text-emerald-600">{knownCount}</strong> từ đã nhớ, <strong className="text-amber-500">{reviewCount}</strong> từ cần ôn tập lại.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] transition-colors cursor-pointer flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              <span>Học lại bộ này</span>
            </button>
            <button
              onClick={() => onNavigateTab('practice')}
              className="px-5 py-2.5 rounded-xl bg-[#12B981] text-white font-bold text-xs hover:bg-[#065F46] transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Luyện tập trắc nghiệm & trò chơi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500">
          Chưa có thẻ từ vựng nào trong bài học này.
        </div>
      ) : (
        <div className="space-y-6">
          {/* 3D Flip Card Container */}
          <div 
            onClick={handleFlip}
            className="perspective-1000 w-full min-h-[360px] sm:min-h-[400px] cursor-pointer select-none"
          >
            <div 
              className={`relative w-full h-full min-h-[360px] sm:min-h-[400px] transform-style-3d transition-transform duration-500 ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-[#B6D9F9] flex flex-col justify-between items-center text-center">
                <div className="w-full flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-[#0866D9] bg-[#EAF5FF] px-2.5 py-1 rounded-lg">
                    {currentCard?.lessonName}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <RotateCw className="w-3.5 h-3.5" /> Bấm để lật xem nghĩa
                  </span>
                </div>

                <div className="my-auto space-y-3">
                  <div className="text-4xl sm:text-5xl font-black text-[#073B86] font-mono tracking-tight">
                    {currentCard?.english}
                  </div>
                  <div className="text-base sm:text-lg text-slate-500 font-mono">
                    {currentCard?.ipa}
                  </div>
                  <div className="inline-block text-xs uppercase font-extrabold text-[#0866D9] bg-[#EAF5FF] px-3 py-1 rounded-md">
                    {currentCard?.partOfSpeech}
                  </div>
                </div>

                <div className="w-full flex items-center justify-center gap-3">
                  <button
                    onClick={handleSpeak}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#0866D9] hover:text-white text-[#0866D9] font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Nghe phát âm</span>
                  </button>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-white to-[#F0F8FF] rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-[#1388F5] flex flex-col justify-between text-left">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <span className="font-bold text-[#073B86] uppercase tracking-wider">
                    Thuật ngữ Tin học: {currentCard?.english}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {currentCard?.sourceType}
                  </span>
                </div>

                <div className="space-y-4 my-auto">
                  {/* Tiếng Việt */}
                  <div>
                    <span className="text-xs font-bold text-[#0866D9] uppercase tracking-wider block mb-1">
                      Nghĩa tiếng Việt:
                    </span>
                    <h3 className="text-2xl font-black text-[#061D49]">
                      {currentCard?.vietnamese}
                    </h3>
                  </div>

                  {/* Giải thích theo Tin học */}
                  <div className="p-3.5 bg-white/80 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Giải thích ngữ cảnh Tin học:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {currentCard?.explanation}
                    </p>
                  </div>

                  {/* Ví dụ */}
                  <div className="text-xs sm:text-sm italic font-mono text-slate-800 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                    &ldquo;{currentCard?.example}&rdquo;
                    <div className="text-xs text-slate-600 not-italic font-sans mt-1">
                      &rarr; {currentCard?.exampleTranslation}
                    </div>
                  </div>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  Nhấp vào thẻ để quay lại mặt trước
                </div>
              </div>
            </div>
          </div>

          {/* Spaced Repetition Rating Buttons */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border border-[#B6D9F9]/50 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleRate('unlearned')}
              className="flex-1 min-w-[120px] py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-rose-200 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Chưa thuộc</span>
            </button>

            <button
              onClick={() => handleRate('review')}
              className="flex-1 min-w-[120px] py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-amber-200 cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Cần ôn tập</span>
            </button>

            <button
              onClick={() => handleRate('mastered')}
              className="flex-1 min-w-[120px] py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã nhớ</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <button
              disabled={currentIndex === 0}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(prev => Math.max(0, prev - 1));
              }}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Thẻ trước</span>
            </button>

            <span>Nhấn vào thẻ để lật (hoặc phím cách)</span>

            <button
              disabled={currentIndex >= cards.length - 1}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(prev => Math.min(cards.length - 1, prev + 1));
              }}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>Thẻ tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
