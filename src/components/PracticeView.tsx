import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  Trophy, 
  HelpCircle, 
  ArrowRight,
  Flame,
  Check,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabularyItem, GradeLevel, TopicItem } from '../types';
import { TTSService } from '../services/tts';

type PracticeMode = 'multiple-choice' | 'matching' | 'fill-blank' | 'listening' | 'scramble' | 'scenario';

interface PracticeViewProps {
  vocabulary: VocabularyItem[];
  topics: TopicItem[];
  selectedGrade: GradeLevel;
  selectedLessonId: string;
  onChangeGrade: (grade: GradeLevel) => void;
  onChangeLesson: (lessonId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  vocabulary,
  topics,
  selectedGrade,
  selectedLessonId,
  onChangeGrade,
  onChangeLesson,
  onNavigateTab
}) => {
  const currentGradeTopics = topics.filter(t => t.grade === selectedGrade);
  const wordsForLesson = vocabulary.filter(v => v.grade === selectedGrade && (!selectedLessonId || v.lessonId === selectedLessonId));
  const activePool = wordsForLesson.length >= 4 ? wordsForLesson : vocabulary.filter(v => v.grade === selectedGrade);

  const [activeMode, setActiveMode] = useState<PracticeMode>('multiple-choice');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [fillInput, setFillInput] = useState('');
  const [scrambleLetters, setScrambleLetters] = useState<string[]>([]);
  const [assembledLetters, setAssembledLetters] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Matching game state
  const [matchEnglish, setMatchEnglish] = useState<{ id: string; word: string; matched: boolean }[]>([]);
  const [matchVietnamese, setMatchVietnamese] = useState<{ id: string; meaning: string; matched: boolean }[]>([]);
  const [selectedEnId, setSelectedEnId] = useState<string | null>(null);
  const [selectedViId, setSelectedViId] = useState<string | null>(null);

  const currentWord = activePool[questionIndex % activePool.length];

  // Generate 4 options for multiple choice & listening
  const options = React.useMemo(() => {
    if (!currentWord) return [];
    const others = activePool
      .filter(w => w.id !== currentWord.id)
      .map(w => w.vietnamese)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const all = [currentWord.vietnamese, ...others].sort(() => Math.random() - 0.5);
    return all;
  }, [currentWord, activePool]);

  // Scramble initialization
  useEffect(() => {
    if (activeMode === 'scramble' && currentWord) {
      const letters = currentWord.english.toUpperCase().split('').sort(() => Math.random() - 0.5);
      setScrambleLetters(letters);
      setAssembledLetters([]);
    }
  }, [activeMode, currentWord]);

  // Matching initialization
  useEffect(() => {
    if (activeMode === 'matching') {
      const sample = [...activePool].sort(() => Math.random() - 0.5).slice(0, 5);
      setMatchEnglish(sample.map(w => ({ id: w.id, word: w.english, matched: false })));
      setMatchVietnamese(
        sample.map(w => ({ id: w.id, meaning: w.vietnamese, matched: false })).sort(() => Math.random() - 0.5)
      );
      setSelectedEnId(null);
      setSelectedViId(null);
    }
  }, [activeMode, activePool]);

  // Handle Multiple Choice or Listening answer
  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const correct = opt === currentWord.vietnamese;
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Handle Fill-in-the-blank answer
  const handleCheckFill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !fillInput.trim()) return;
    setIsAnswered(true);
    const correct = fillInput.trim().toLowerCase() === currentWord.english.toLowerCase();
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Handle Scramble check
  const handleCheckScramble = () => {
    if (isAnswered) return;
    const answer = assembledLetters.join('').toLowerCase();
    const correct = answer === currentWord.english.toLowerCase().replace(/\s/g, '');
    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Handle Matching click
  const handleMatchSelect = (type: 'en' | 'vi', id: string) => {
    if (type === 'en') {
      setSelectedEnId(id);
      if (selectedViId) {
        checkPair(id, selectedViId);
      }
    } else {
      setSelectedViId(id);
      if (selectedEnId) {
        checkPair(selectedEnId, id);
      }
    }
  };

  const checkPair = (enId: string, viId: string) => {
    if (enId === viId) {
      // Correct match!
      setMatchEnglish(prev => prev.map(item => item.id === enId ? { ...item, matched: true } : item));
      setMatchVietnamese(prev => prev.map(item => item.id === viId ? { ...item, matched: true } : item));
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      setSelectedEnId(null);
      setSelectedViId(null);

      // Check if all matched
      const remaining = matchEnglish.filter(m => m.id !== enId && !m.matched);
      if (remaining.length === 0) {
        confetti({ particleCount: 100, spread: 70 });
        setIsFinished(true);
      }
    } else {
      // Wrong match
      setStreak(0);
      setTimeout(() => {
        setSelectedEnId(null);
        setSelectedViId(null);
      }, 500);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex >= Math.min(activePool.length - 1, 9)) {
      setIsFinished(true);
      confetti({ particleCount: 120, spread: 80 });
      return;
    }
    setQuestionIndex(prev => prev + 1);
    setIsAnswered(false);
    setSelectedOption(null);
    setFillInput('');
    setIsCorrect(false);
  };

  const handleRestart = () => {
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setFillInput('');
    setIsFinished(false);
    if (activeMode === 'matching') {
      const sample = [...activePool].sort(() => Math.random() - 0.5).slice(0, 5);
      setMatchEnglish(sample.map(w => ({ id: w.id, word: w.english, matched: false })));
      setMatchVietnamese(
        sample.map(w => ({ id: w.id, meaning: w.vietnamese, matched: false })).sort(() => Math.random() - 0.5)
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Modes Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7957E8] to-[#16D8FF] text-white flex items-center justify-center shadow-md">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Luyện Tập Từ Vựng Tin Học
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              6 chế độ học tương tác: Trắc nghiệm, ghép từ, điền khuyết, nghe hiểu, sắp xếp & ngữ cảnh
            </p>
          </div>
        </div>

        {/* Lesson selector */}
        <div className="w-full md:w-auto">
          <select
            value={selectedLessonId}
            onChange={(e) => {
              onChangeLesson(e.target.value);
              handleRestart();
            }}
            className="w-full md:w-64 bg-[#EAF5FF] border border-[#1388F5]/30 text-[#061D49] text-xs rounded-xl px-3 py-2 font-bold focus:outline-none"
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
      </div>

      {/* 6 Mode Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { id: 'multiple-choice', label: '1. Trắc nghiệm' },
          { id: 'matching', label: '2. Ghép cặp' },
          { id: 'fill-blank', label: '3. Điền khuyết' },
          { id: 'listening', label: '4. Nghe & Chọn' },
          { id: 'scramble', label: '5. Sắp xếp chữ' },
          { id: 'scenario', label: '6. Ngữ cảnh Tin học' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => {
              setActiveMode(m.id as PracticeMode);
              handleRestart();
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
              activeMode === m.id
                ? 'bg-[#0866D9] text-white shadow-md shadow-[#0866D9]/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Score & Streak Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#B6D9F9]/50 flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-3">
          <span className="text-[#073B86]">
            Câu hỏi: {questionIndex + 1} / {Math.min(activePool.length, 10)}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[#0866D9] flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Điểm: {score}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {streak > 1 && (
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-amber-500" /> {streak} chuỗi đúng!
            </span>
          )}
          <button
            onClick={handleRestart}
            title="Làm lại từ đầu"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      {isFinished ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border-2 border-[#12B981] space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-[#073B86]">
            Hoàn thành xuất sắc phần luyện tập!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Tổng điểm đạt được: <strong className="text-[#0866D9] text-base">{score} điểm</strong>
          </p>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] transition-colors cursor-pointer"
            >
              Luyện tập lại
            </button>
            <button
              onClick={() => onNavigateTab('exam')}
              className="px-5 py-2.5 rounded-xl bg-[#DB2777] text-white font-bold text-xs hover:bg-[#831843] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Thử sức bài Kiểm tra 15 phút</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : activeMode === 'matching' ? (
        /* MODE 2: MATCHING PAIRS */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#B6D9F9]/50 space-y-6">
          <div className="text-center">
            <h3 className="font-extrabold text-base text-[#073B86]">
              Ghép thuật ngữ tiếng Anh với nghĩa tiếng Việt tương ứng
            </h3>
            <p className="text-xs text-slate-500">
              Nhấp chọn 1 từ tiếng Anh và 1 nghĩa tiếng Việt để tạo thành cặp đúng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* English Column */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-[#0866D9] text-center pb-1 border-b border-blue-100">
                Thuật ngữ tiếng Anh
              </div>
              {matchEnglish.map(item => (
                <button
                  key={item.id}
                  disabled={item.matched}
                  onClick={() => handleMatchSelect('en', item.id)}
                  className={`w-full p-3 rounded-xl text-xs font-bold transition-all text-left font-mono border cursor-pointer ${
                    item.matched
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 line-through opacity-50 cursor-not-allowed'
                      : selectedEnId === item.id
                      ? 'bg-[#0866D9] text-white border-[#0866D9] shadow-md scale-102'
                      : 'bg-slate-50 hover:bg-blue-50 text-slate-800 border-slate-200'
                  }`}
                >
                  {item.word}
                </button>
              ))}
            </div>

            {/* Vietnamese Column */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-emerald-700 text-center pb-1 border-b border-emerald-100">
                Nghĩa tiếng Việt
              </div>
              {matchVietnamese.map(item => (
                <button
                  key={item.id}
                  disabled={item.matched}
                  onClick={() => handleMatchSelect('vi', item.id)}
                  className={`w-full p-3 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                    item.matched
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 line-through opacity-50 cursor-not-allowed'
                      : selectedViId === item.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                      : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200'
                  }`}
                >
                  {item.meaning}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeMode === 'fill-blank' ? (
        /* MODE 3: FILL-IN-THE-BLANK */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#B6D9F9]/50 space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#0866D9] bg-[#EAF5FF] px-2.5 py-1 rounded-lg">
              Điền từ tiếng Anh còn thiếu
            </span>
            <div className="text-sm font-semibold text-slate-700 pt-2">
              Nghĩa tiếng Việt: <strong className="text-[#073B86]">{currentWord?.vietnamese}</strong>
            </div>
            <p className="text-xs text-slate-500 italic">
              Gợi ý ngữ cảnh: {currentWord?.explanation}
            </p>
          </div>

          <form onSubmit={handleCheckFill} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                disabled={isAnswered}
                value={fillInput}
                onChange={(e) => setFillInput(e.target.value)}
                placeholder="Nhập từ tiếng Anh chính xác..."
                className="w-full text-center text-lg font-mono font-bold tracking-wider py-3 px-4 rounded-xl border-2 border-slate-200 focus:border-[#0866D9] focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                {currentWord?.english.length} ký tự
              </span>
            </div>

            {!isAnswered ? (
              <button
                type="submit"
                disabled={!fillInput.trim()}
                className="w-full py-3 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] disabled:opacity-40 transition-colors cursor-pointer"
              >
                Kiểm tra kết quả
              </button>
            ) : (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
                  isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
                    <span>{isCorrect ? 'Chính xác! +10 điểm' : `Chưa đúng! Đáp án đúng là: ${currentWord.english}`}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full py-3 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Câu hỏi tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </div>
      ) : activeMode === 'scramble' ? (
        /* MODE 5: WORD SCRAMBLE */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#B6D9F9]/50 space-y-6 max-w-2xl mx-auto text-center">
          <div>
            <span className="text-xs font-bold text-[#7957E8] bg-purple-50 px-2.5 py-1 rounded-lg">
              Sắp xếp lại chữ cái
            </span>
            <div className="text-sm font-bold text-[#073B86] mt-3">
              Nghĩa: {currentWord?.vietnamese}
            </div>
            <p className="text-xs text-slate-500 mt-1">{currentWord?.explanation}</p>
          </div>

          {/* Assembled slots */}
          <div className="min-h-14 p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center gap-1.5 flex-wrap">
            {assembledLetters.length === 0 ? (
              <span className="text-xs text-slate-400">Bấm các chữ cái bên dưới để ghép từ</span>
            ) : (
              assembledLetters.map((l, i) => (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => {
                    const letter = assembledLetters[i];
                    setAssembledLetters(prev => prev.filter((_, idx) => idx !== i));
                    setScrambleLetters(prev => [...prev, letter]);
                  }}
                  className="w-10 h-10 rounded-xl bg-[#0866D9] text-white font-mono font-bold text-base shadow-sm hover:bg-rose-500 transition-colors"
                >
                  {l}
                </button>
              ))
            )}
          </div>

          {/* Available letters */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {scrambleLetters.map((l, i) => (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => {
                  setAssembledLetters(prev => [...prev, l]);
                  setScrambleLetters(prev => prev.filter((_, idx) => idx !== i));
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-[#EAF5FF] hover:border-[#0866D9] text-[#061D49] font-mono font-bold text-base border border-slate-300 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                {l}
              </button>
            ))}
          </div>

          {!isAnswered ? (
            <button
              onClick={handleCheckScramble}
              disabled={scrambleLetters.length > 0}
              className="w-full py-3 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] disabled:opacity-40 transition-colors cursor-pointer"
            >
              Kiểm tra ghép từ
            </button>
          ) : (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl text-xs font-bold ${
                isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {isCorrect ? 'Chính xác! Ghép từ hoàn hảo!' : `Chưa đúng! Từ chuẩn: ${currentWord.english}`}
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full py-3 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Từ tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* MODES 1, 4, 6: MULTIPLE CHOICE, LISTENING, SCENARIO */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#B6D9F9]/50 space-y-6 max-w-2xl mx-auto">
          
          {/* Question Prompt */}
          <div className="text-center space-y-3 pb-2">
            {activeMode === 'listening' ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#0866D9] bg-[#EAF5FF] px-3 py-1 rounded-full">
                  Nghe phát âm và chọn nghĩa tiếng Việt đúng
                </span>
                <div className="pt-2">
                  <button
                    onClick={() => TTSService.speak(currentWord?.english || '')}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0866D9] to-[#16D8FF] text-white shadow-lg shadow-[#0866D9]/30 flex items-center justify-center mx-auto hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Volume2 className="w-8 h-8" />
                  </button>
                </div>
                <div className="text-xs text-slate-400">Bấm loa để nghe lại</div>
              </div>
            ) : activeMode === 'scenario' ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                  Tình huống thực tế trong môn Tin học
                </span>
                <p className="text-sm font-medium text-slate-700 pt-2 leading-relaxed">
                  {currentWord?.explanation}
                </p>
                <div className="text-xs font-bold text-[#073B86]">
                  Thuật ngữ nào mô tả chính xác tình huống trên?
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#0866D9] bg-[#EAF5FF] px-3 py-1 rounded-full">
                  Chọn nghĩa tiếng Việt chính xác
                </span>
                <h2 className="text-3xl font-black text-[#073B86] font-mono tracking-tight pt-1">
                  {currentWord?.english}
                </h2>
                <div className="text-xs text-slate-400 font-mono">{currentWord?.ipa}</div>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isOptionCorrect = opt === currentWord?.vietnamese;

              let btnStyle = 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 text-slate-800';
              if (isAnswered) {
                if (isOptionCorrect) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-500 text-white border-rose-600';
                } else {
                  btnStyle = 'bg-slate-50 text-slate-400 opacity-60 border-slate-200';
                }
              }

              return (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-bold text-left transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs shrink-0 font-mono">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswered && isOptionCorrect && <Check className="w-5 h-5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next Step */}
          {isAnswered && (
            <div className="space-y-4 pt-2">
              <div className={`p-4 rounded-2xl text-xs space-y-1 ${
                isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                  <span>{isCorrect ? 'Chính xác! (+10 điểm)' : 'Chưa chính xác!'}</span>
                </div>
                <p className="text-slate-600 leading-relaxed pt-1">
                  <strong>Giải thích:</strong> {currentWord?.explanation}
                </p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-2xl bg-[#0866D9] text-white font-extrabold text-xs sm:text-sm hover:bg-[#073B86] shadow-lg shadow-[#0866D9]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
