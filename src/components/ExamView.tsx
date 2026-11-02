import React, { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabularyItem, GradeLevel, TopicItem, UserProfile, ExamAttempt } from '../types';
import { StorageService } from '../services/storage';

interface ExamViewProps {
  vocabulary: VocabularyItem[];
  topics: TopicItem[];
  currentUser: UserProfile;
  selectedGrade: GradeLevel;
  selectedLessonId: string;
  onNavigateTab: (tab: string) => void;
}

interface Question {
  id: string;
  prompt: string;
  term: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const ExamView: React.FC<ExamViewProps> = ({
  vocabulary,
  topics,
  currentUser,
  selectedGrade,
  selectedLessonId,
  onNavigateTab
}) => {
  const currentGradeWords = vocabulary.filter(v => v.grade === selectedGrade && (!selectedLessonId || v.lessonId === selectedLessonId));
  const activePool = currentGradeWords.length >= 5 ? currentGradeWords : vocabulary.filter(v => v.grade === selectedGrade);

  // Build 10 exam questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(15 * 60); // 15 mins
  const [latestAttempt, setLatestAttempt] = useState<ExamAttempt | null>(null);

  // Initialize questions
  const prepareQuestions = () => {
    const shuffled = [...activePool].sort(() => Math.random() - 0.5).slice(0, 10);
    const generated: Question[] = shuffled.map((w, idx) => {
      const distractors = activePool
        .filter(item => item.id !== w.id)
        .map(item => item.vietnamese)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const opts = [w.vietnamese, ...distractors].sort(() => Math.random() - 0.5);

      return {
        id: `q-${idx}-${w.id}`,
        prompt: `Trong môn Tin học, thuật ngữ tiếng Anh "${w.english}" có nghĩa chính xác là gì?`,
        term: w.english,
        options: opts,
        correctAnswer: w.vietnamese,
        explanation: w.explanation
      };
    });
    setQuestions(generated);
    setUserAnswers({});
    setCurrentIdx(0);
    setTimeLeftSeconds(15 * 60);
  };

  useEffect(() => {
    prepareQuestions();
  }, [selectedGrade, selectedLessonId, vocabulary]);

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
  }, [isExamStarted, isSubmitted, userAnswers, questions]);

  const handleStart = () => {
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
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Number(((correctCount / (questions.length || 1)) * 10).toFixed(1));

    const attempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      examId: `exam-${selectedGrade}-${selectedLessonId || 'general'}`,
      examTitle: `Kiểm tra 15 phút: Tin học Lớp ${selectedGrade}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userClass: currentUser.className || '12A1',
      score: calculatedScore,
      correctCount,
      totalQuestions: questions.length,
      startedAt: new Date(Date.now() - (15 * 60 - timeLeftSeconds) * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds: 15 * 60 - timeLeftSeconds,
      answers: userAnswers
    };

    StorageService.recordExamAttempt(attempt);
    setLatestAttempt(attempt);

    if (calculatedScore >= 8.0) {
      confetti({ particleCount: 120, spread: 80 });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DB2777] to-[#16D8FF] text-white flex items-center justify-center shadow-md">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Kiểm Tra Đánh Giá – Tin Học THPT
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Đánh giá định kỳ, thang điểm 10 chuẩn Bộ GD&ĐT, lưu vết tự động vào học bạ
            </p>
          </div>
        </div>

        {/* Status / Timer */}
        {isExamStarted && !isSubmitted && (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-2xl border border-rose-200 font-mono font-bold text-sm shadow-xs">
            <Clock className="w-4 h-4 animate-spin text-rose-600" />
            <span>Thời gian còn: {formatTime(timeLeftSeconds)}</span>
          </div>
        )}
      </div>

      {/* Screen 1: Exam Intro */}
      {!isExamStarted && !isSubmitted && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#B6D9F9]/50 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#0866D9] bg-[#EAF5FF] px-3 py-1 rounded-full border border-[#1388F5]/30">
              Đề thi chính thức
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#073B86]">
              Bài Kiểm Tra 15 Phút Từ Vựng Tin Học (Lớp {selectedGrade})
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Giáo viên ra đề: <strong>Nguyễn Thị Châu</strong> &bull; Trường PT DTNT THPT Bình Thuận
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
            <div>
              <div className="text-slate-400 text-[11px] font-bold">Số câu hỏi</div>
              <div className="text-base font-black text-[#073B86]">10 câu</div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px] font-bold">Thời gian</div>
              <div className="text-base font-black text-[#073B86]">15 phút</div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px] font-bold">Thang điểm</div>
              <div className="text-base font-black text-[#073B86]">Thang 10</div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px] font-bold">Hình thức</div>
              <div className="text-base font-black text-[#073B86]">Trắc nghiệm</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Quy định làm bài thi:</span>
            </div>
            <p>1. Kết quả sẽ được lưu trực tiếp vào cơ sở dữ liệu học tập của học sinh.</p>
            <p>2. Khi bấm bắt đầu, đồng hồ 15 phút sẽ chạy và tự động nộp bài khi hết giờ.</p>
            <p>3. Không chuyển tab hoặc tải lại trình duyệt trong quá trình thi.</p>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#DB2777] to-[#0866D9] hover:from-[#9D174D] hover:to-[#073B86] text-white font-extrabold text-sm shadow-xl shadow-pink-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>BẮT ĐẦU LÀM BÀI THI NGAY</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Screen 2: Exam In Progress */}
      {isExamStarted && !isSubmitted && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Question card (Col 8) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#B6D9F9]/50 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-extrabold text-xs text-[#0866D9] uppercase tracking-wider">
                Câu hỏi {currentIdx + 1} / {questions.length}
              </span>
              <span className="text-xs text-slate-400">
                Đã chọn: {answeredCount} / {questions.length} câu
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                {questions[currentIdx]?.prompt}
              </h2>
              <div className="p-3 rounded-xl bg-[#EAF5FF] border border-[#1388F5]/30 inline-block font-mono text-xl font-black text-[#073B86]">
                {questions[currentIdx]?.term}
              </div>
            </div>

            {/* 4 Choices */}
            <div className="space-y-3 pt-2">
              {questions[currentIdx]?.options.map((opt, i) => {
                const isSelected = userAnswers[questions[currentIdx].id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(questions[currentIdx].id, opt)}
                    className={`w-full p-4 rounded-2xl border text-xs sm:text-sm font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#0866D9] text-white border-[#0866D9] shadow-md shadow-[#0866D9]/30'
                        : 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono ${
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
                disabled={currentIdx >= questions.length - 1}
                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-[#0866D9] text-white text-xs font-bold hover:bg-[#073B86] disabled:opacity-40 cursor-pointer"
              >
                Câu tiếp theo
              </button>
            </div>
          </div>

          {/* Palette Sidebar & Submit (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-md border border-[#B6D9F9]/50 space-y-4">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Bảng câu hỏi ({answeredCount}/{questions.length})
              </h3>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
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
                className="w-full mt-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>NỘP BÀI THI</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Screen 3: Exam Results Breakdown */}
      {isSubmitted && latestAttempt && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#B6D9F9]/50 space-y-8 max-w-4xl mx-auto">
          
          {/* Big Score Trophy Banner */}
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
              Học sinh: <strong>{latestAttempt.userName}</strong> ({latestAttempt.userClass}) &bull; Trả lời đúng: <strong>{latestAttempt.correctCount} / {latestAttempt.totalQuestions} câu</strong>
            </p>

            <div className="inline-block bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
              Đã ghi nhận kết quả vào cơ sở dữ liệu học tập
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-[#073B86] flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#0866D9]" />
              <span>Chi tiết bài làm và đáp án giải thích</span>
            </h3>

            <div className="space-y-3">
              {questions.map((q, idx) => {
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

    </div>
  );
};
