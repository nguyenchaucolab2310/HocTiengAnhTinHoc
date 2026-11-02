import React from 'react';
import { 
  BookOpen, 
  Layers, 
  Gamepad2, 
  ClipboardCheck, 
  BarChart2, 
  Star, 
  Play, 
  Target, 
  CheckCircle2, 
  Bell, 
  Calendar, 
  Trophy, 
  Code, 
  Laptop, 
  Check, 
  Users, 
  Megaphone,
  Book,
  Monitor
} from 'lucide-react';
import { GradeLevel, TopicItem, VocabularyItem, StudentProgress, NotificationItem } from '../types';

interface HomeDashboardProps {
  topics: TopicItem[];
  vocabulary: VocabularyItem[];
  progress: StudentProgress;
  notifications: NotificationItem[];
  selectedGrade: GradeLevel;
  selectedLessonId: string;
  onChangeGrade: (grade: GradeLevel) => void;
  onChangeLesson: (lessonId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  topics,
  progress,
  notifications,
  selectedGrade,
  selectedLessonId,
  onChangeGrade,
  onChangeLesson,
  onNavigateTab
}) => {
  const currentGradeTopics = topics.filter(t => t.grade === selectedGrade);

  const handleStartLearning = () => {
    onNavigateTab('vocabulary');
  };

  const handleSelectTopicFromCard = (grade: GradeLevel, lessonId?: string) => {
    onChangeGrade(grade);
    if (lessonId) {
      onChangeLesson(lessonId);
    }
    onNavigateTab('vocabulary');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* 1. TOP HERO TECH BANNER (Faithfully matching reference image) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#033682] via-[#0866D9] to-[#0447a8] text-white shadow-lg border border-[#16D8FF]/30 p-5 sm:p-7">
        
        {/* Subtle Tech Circuit / Glow Accents */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#16D8FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#073B86]/60 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left Text Content */}
          <div className="text-center lg:text-left space-y-2.5 max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-white font-sans drop-shadow-md uppercase leading-none">
              IT ENGLISH LEARNING
            </h1>

            {/* Glowing Cyan Pill Badge */}
            <div className="inline-block bg-[#16D8FF] text-[#061D49] font-black text-sm sm:text-base px-5 py-1.5 rounded-full shadow-md shadow-[#16D8FF]/25">
              Học từ vựng tiếng Anh chuyên ngành Tin học THPT
            </div>

            {/* Subtitle Slogan */}
            <p className="text-white/95 italic text-sm sm:text-base font-normal tracking-wide">
              Learn IT English – Khám phá công nghệ, chinh phục tiếng Anh
            </p>
          </div>

          {/* Right 3D Tech Illustration Art (Matches reference image: Laptop, AI chip, Wi-Fi, Headphones, Books) */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="relative w-72 sm:w-80 h-36 flex items-center justify-center">
              
              {/* Stacked ICT & CS Books */}
              <div className="absolute bottom-2 left-6 z-10 flex flex-col space-y-1">
                <div className="w-16 h-4 bg-[#0866D9] text-[9px] font-black text-white px-1.5 rounded-sm shadow-md border-l-2 border-white/60 flex items-center justify-between">
                  <span>ICT</span>
                  <span className="w-1 h-1 rounded-full bg-cyan-300"></span>
                </div>
                <div className="w-18 h-4 bg-[#061D49] text-[9px] font-black text-[#16D8FF] px-1.5 rounded-sm shadow-md border-l-2 border-[#16D8FF] flex items-center justify-between">
                  <span>CS</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                </div>
              </div>

              {/* Floating AI Chip Cube */}
              <div className="absolute top-2 left-4 z-10 bg-[#061D49]/90 border border-[#16D8FF] rounded-lg px-2 py-1 shadow-lg shadow-[#16D8FF]/30 flex items-center gap-1">
                <div className="w-2 h-2 rounded-xs bg-[#16D8FF] animate-pulse" />
                <span className="text-xs font-black text-[#16D8FF] tracking-wider">AI</span>
              </div>

              {/* Glowing Wi-Fi Arcs */}
              <div className="absolute top-2 right-12 z-10 text-[#16D8FF]">
                <svg width="34" height="26" viewBox="0 0 34 26" fill="none" className="drop-shadow-[0_0_8px_rgba(22,216,255,0.8)]">
                  <path d="M2 5C9 0 25 0 32 5" stroke="#16D8FF" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M6 11C11 7 23 7 28 11" stroke="#16D8FF" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M11 17C14 14 20 14 23 17" stroke="#16D8FF" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="17" cy="22" r="2.5" fill="#16D8FF" />
                </svg>
              </div>

              {/* Center Tech Laptop Graphic */}
              <div className="relative z-20 flex flex-col items-center">
                {/* Laptop Screen */}
                <div className="w-48 h-28 bg-[#061D49] rounded-t-xl border-2 border-slate-300 p-2 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0866D9]/30 to-transparent pointer-events-none" />
                  {/* Top Bar */}
                  <div className="flex items-center justify-between text-[8px] text-[#16D8FF] border-b border-white/10 pb-1">
                    <span className="font-mono">IT ENGLISH</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                  {/* Screen Content */}
                  <div className="text-center my-auto">
                    <div className="text-sm font-black text-white tracking-wide">IT Vocabulary</div>
                    <div className="flex items-center justify-center gap-1 text-[9px] text-[#16D8FF] mt-0.5">
                      <BookOpen className="w-3 h-3" />
                      <span>Learn &bull; Code &bull; Practice</span>
                    </div>
                  </div>
                  {/* Screen bottom bar */}
                  <div className="w-full bg-white/10 h-1 rounded-full">
                    <div className="w-3/4 h-full bg-[#16D8FF] rounded-full"></div>
                  </div>
                </div>
                {/* Laptop Base */}
                <div className="w-56 h-3 bg-slate-300 rounded-b-lg shadow-lg border-t border-slate-400 flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-400 rounded-full"></div>
                </div>
              </div>

              {/* Glowing Blue 3D Headphones on the Right */}
              <div className="absolute -right-2 top-3 z-30">
                <svg width="54" height="64" viewBox="0 0 60 70" fill="none" className="drop-shadow-[0_0_12px_rgba(22,216,255,0.7)]">
                  {/* Headband */}
                  <path d="M12 36 C 12 12, 48 12, 48 36" stroke="#0866D9" strokeWidth="6" strokeLinecap="round" />
                  <path d="M12 36 C 12 14, 48 14, 48 36" stroke="#16D8FF" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Left Ear Cushion */}
                  <rect x="6" y="32" width="10" height="22" rx="5" fill="#061D49" stroke="#16D8FF" strokeWidth="2.5" />
                  {/* Right Ear Cushion */}
                  <rect x="44" y="32" width="10" height="22" rx="5" fill="#061D49" stroke="#16D8FF" strokeWidth="2.5" />
                </svg>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* 2. THREE CENTRAL ZONES (16:9 Desktop Proportions: Zone 1 (Left), Zone 2 (3x2 Center), Zone 3 (Right)) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ZONE 1 (LEFT, col-span-3): Chọn nội dung học */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-[#B6D9F9] overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header Bar */}
            <div className="bg-[#0866D9] text-white px-4 py-2.5 font-bold text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-white" />
              <span>Chọn nội dung học</span>
            </div>

            <div className="p-4 space-y-4">
              {/* Khối lớp */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5 text-[#0866D9]" />
                  <span>Khối lớp</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([10, 11, 12] as GradeLevel[]).map((g) => {
                    const isSelected = selectedGrade === g;
                    return (
                      <button
                        key={g}
                        onClick={() => {
                          onChangeGrade(g);
                          onChangeLesson('all');
                        }}
                        className={`py-2 px-1 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0866D9] text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Lớp {g}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bộ sách */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0866D9]" />
                  <span>Bộ sách</span>
                </label>
                <div className="relative">
                  <select
                    disabled
                    value="Kết nối tri thức với cuộc sống"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium appearance-none cursor-default focus:outline-none"
                  >
                    <option>Kết nối tri thức với cuộc sống</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
                    ▾
                  </div>
                </div>
              </div>

              {/* Chủ đề / Bài học */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Monitor className="w-3.5 h-3.5 text-[#0866D9]" />
                  <span>Chủ đề / Bài học</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedLessonId || 'all'}
                    onChange={(e) => onChangeLesson(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                  >
                    <option value="all">
                      📚 Tất cả bài học (Toàn bộ từ vựng Lớp {selectedGrade})
                    </option>
                    {currentGradeTopics.map((topic) => (
                      <optgroup key={topic.id} label={topic.name}>
                        {topic.lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
                    ▾
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Centered Start Learning Pill Button */}
          <div className="p-4 pt-0 text-center">
            <button
              onClick={handleStartLearning}
              className="w-full py-2.5 px-4 rounded-full font-extrabold text-xs text-white bg-gradient-to-r from-[#0866D9] to-[#1388F5] hover:from-[#073B86] hover:to-[#0866D9] shadow-md shadow-[#0866D9]/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Bắt đầu học</span>
            </button>
          </div>
        </div>

        {/* ZONE 2 (CENTER, col-span-6): Lưới 6 thẻ chức năng (3 columns x 2 rows exactly as reference image) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          
          {/* Card 1: Học từ vựng (Pale blue/cyan) */}
          <div
            onClick={() => onNavigateTab('vocabulary')}
            className="p-3.5 rounded-2xl bg-[#EAF5FF] hover:bg-[#DDF0FD] border border-[#B6D9F9] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between group"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#0866D9] group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-[#0866D9]" />
            </div>
            <div className="mt-2.5">
              <h3 className="font-extrabold text-sm text-[#073B86]">Học từ vựng</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Từ mới, nghĩa, phát âm, ví dụ minh họa
              </p>
            </div>
          </div>

          {/* Card 2: Flashcard (Pale emerald/mint) */}
          <div
            onClick={() => onNavigateTab('flashcard')}
            className="p-3.5 rounded-2xl bg-[#E8FAF0] hover:bg-[#DBF6E7] border border-[#A7E8D0] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between group"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#12B981] group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6 text-[#12B981]" />
            </div>
            <div className="mt-2.5">
              <h3 className="font-extrabold text-sm text-[#065F46]">Flashcard</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Ghi nhớ từ vựng hiệu quả
              </p>
            </div>
          </div>

          {/* Card 3: Luyện tập (Pale lavender/purple) */}
          <div
            onClick={() => onNavigateTab('practice')}
            className="p-3.5 rounded-2xl bg-[#F2ECFD] hover:bg-[#E7DDFA] border border-[#D5C2F8] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between group"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#7957E8] group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6 text-[#7957E8]" />
            </div>
            <div className="mt-2.5">
              <h3 className="font-extrabold text-sm text-[#4C1D95]">Luyện tập</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Trắc nghiệm, ghép từ, điền khuyết, nghe hiểu
              </p>
            </div>
          </div>

          {/* Card 4: Kiểm tra (Pale pink/magenta) */}
          <div
            onClick={() => onNavigateTab('exam')}
            className="p-3.5 rounded-2xl bg-[#FCEEF6] hover:bg-[#FADEEF] border border-[#F3BCE3] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between group"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#DB2777] group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-6 h-6 text-[#DB2777]" />
            </div>
            <div className="mt-2.5">
              <h3 className="font-extrabold text-sm text-[#831843]">Kiểm tra</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Đánh giá kết quả theo bài học
              </p>
            </div>
          </div>

          {/* Card 5: Kết quả học tập (Pale sky blue) */}
          <div
            onClick={() => onNavigateTab('results')}
            className="p-3.5 rounded-2xl bg-[#E3F2FE] hover:bg-[#D0E8FD] border border-[#B6D9F9] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between group"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#0866D9] group-hover:scale-105 transition-transform">
              <BarChart2 className="w-6 h-6 text-[#0866D9]" />
            </div>
            <div className="mt-2.5">
              <h3 className="font-extrabold text-sm text-[#073B86]">Kết quả học tập</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Xem điểm, tiến độ, những từ cần ôn
              </p>
            </div>
          </div>

          {/* Card 6: Kho từ yêu thích (Pale warm amber) */}
          <div
            onClick={() => onNavigateTab('favorites')}
            className="p-3.5 rounded-2xl bg-[#FEF6E4] hover:bg-[#FDECCE] border border-[#FDE096] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between group"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#F5B827] group-hover:scale-105 transition-transform">
              <Star className="w-6 h-6 text-[#F5B827] fill-[#F5B827]" />
            </div>
            <div className="mt-2.5">
              <h3 className="font-extrabold text-sm text-[#92400E]">Kho từ yêu thích</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Lưu và ôn tập các từ quan trọng
              </p>
            </div>
          </div>

        </div>

        {/* ZONE 3 (RIGHT, col-span-3): 2 Stacked Widgets */}
        <div className="lg:col-span-3 space-y-3 flex flex-col">
          
          {/* Widget 1: Tiến độ học tập của bạn */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#B6D9F9] overflow-hidden flex flex-col justify-between">
            <div className="bg-[#0866D9] text-white px-4 py-2 font-bold text-xs sm:text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-white" />
              <span>Tiến độ học tập của bạn</span>
            </div>

            <div className="p-3.5">
              <div className="flex items-center gap-3.5">
                {/* Donut percentage ring (76% as shown in reference image) */}
                <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="36"
                      cy="36"
                      r="28"
                      stroke="#E2E8F0"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="36"
                      cy="36"
                      r="28"
                      stroke="#12B981"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={175}
                      strokeDashoffset={175 - (175 * 76) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-base text-[#073B86]">
                    76%
                  </div>
                </div>

                {/* Metrics list */}
                <div className="space-y-1 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#0866D9] shrink-0" />
                    <span>Đã học: <strong>152 từ</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#12B981] shrink-0" />
                    <span>Đã hoàn thành: <strong>12 bài</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    <span>Điểm TB: <strong>8,6</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button: Light Cyan Pill */}
              <button
                onClick={() => onNavigateTab('results')}
                className="mt-3 w-full py-1.5 px-3 rounded-full bg-[#EAF5FF] hover:bg-[#DDF0FD] border border-[#0866D9]/40 text-[#0866D9] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Xem chi tiết kết quả</span>
              </button>
            </div>
          </div>

          {/* Widget 2: Thông báo */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#B6D9F9] overflow-hidden">
            <div className="bg-[#0866D9] text-white px-4 py-2 font-bold text-xs sm:text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-white" />
              <span>Thông báo</span>
            </div>

            <div className="p-3 space-y-2 text-xs">
              {/* Item 1 */}
              <div className="flex items-start gap-2">
                <Megaphone className="w-4 h-4 text-[#0866D9] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <div className="text-slate-800 font-medium">
                    Có bài học mới: <strong>Bài 12 – HTML</strong> (Lớp 12){' '}
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block ml-1">
                      Mới
                    </span>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                <Calendar className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <div className="text-slate-700">Hạn nộp bài kiểm tra:</div>
                  <div className="font-bold text-slate-800">Đến 23:59 ngày 20/01/2025</div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <div className="text-slate-700">Thử thách tuần: Ôn tập 20 từ vựng chủ đề Mạng máy tính</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM SECTION: CẤU TRÚC NỘI DUNG THEO SGK (Exactly matching reference image) */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#B6D9F9] overflow-hidden">
        
        {/* Blue Header Banner with Leaves Emblem & Desk Computer */}
        <div className="bg-gradient-to-r from-[#034ea2] via-[#0866D9] to-[#0447a8] text-white px-5 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Book Stack Icon + Titles */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-wide leading-tight">
                Cấu trúc nội dung theo SGK
              </div>
              <div className="text-xs text-white/90 font-medium">
                Kết nối tri thức với cuộc sống
              </div>
            </div>
          </div>

          {/* Center: Publisher Pill Emblem (Green/Orange Leaves) */}
          <div className="bg-white px-4 py-1.5 rounded-full shadow-md flex items-center gap-2 border border-slate-200">
            {/* Double leaf SVG */}
            <svg width="22" height="18" viewBox="0 0 30 24" fill="none">
              <path d="M 2 22 C 2 8, 14 2, 28 2 C 28 16, 16 22, 2 22 Z" fill="#78B828" />
              <path d="M 12 22 C 12 12, 20 6, 29 6 C 29 16, 21 22, 12 22 Z" fill="#E8821E" />
            </svg>
            <div className="text-[10px] font-black tracking-wider text-slate-800 leading-tight">
              KẾT NỐI TRI THỨC<br />
              <span className="text-[9px] font-bold text-slate-600">VỚI CUỘC SỐNG</span>
            </div>
          </div>

          {/* Right: Coding Screen & Potted Plant Illustration */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Little plant */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 text-emerald-300">
                🌱
              </div>
              <div className="w-4 h-2.5 bg-amber-100 rounded-b-sm border border-amber-300"></div>
            </div>

            {/* Desktop Monitor with </> */}
            <div className="relative">
              <div className="w-14 h-9 bg-[#061D49] rounded-sm border-2 border-white/40 flex items-center justify-center text-[#16D8FF] font-mono text-xs font-black shadow-inner">
                &lt;/&gt;
              </div>
              <div className="w-4 h-2 bg-slate-300 mx-auto"></div>
              <div className="w-8 h-1 bg-slate-400 mx-auto rounded-full"></div>
            </div>

            {/* Mini stack of books */}
            <div className="flex flex-col space-y-0.5">
              <div className="w-8 h-1.5 bg-rose-400 rounded-xs"></div>
              <div className="w-9 h-1.5 bg-cyan-400 rounded-xs"></div>
              <div className="w-10 h-1.5 bg-amber-400 rounded-xs"></div>
            </div>
          </div>

        </div>

        {/* 3 Large Textbook Cards: Lớp 10, Lớp 11, Lớp 12 */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* CARD 1: LỚP 10 */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              {/* Header Tab */}
              <div className="bg-[#0866D9] text-white px-3 py-1.5 font-bold text-xs flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                <span>Lớp 10</span>
              </div>

              <div className="p-3 flex gap-3">
                {/* Book Cover (Green Tin Học 10) */}
                <div 
                  onClick={() => handleSelectTopicFromCard(10)}
                  className="w-20 h-28 bg-gradient-to-br from-emerald-600 via-teal-700 to-[#064e3b] rounded-md p-1.5 text-white shadow-md shrink-0 flex flex-col justify-between cursor-pointer hover:scale-102 transition-transform"
                >
                  <div className="text-[7px] font-black uppercase tracking-tight text-emerald-200">
                    BỘ GIÁO DỤC VÀ ĐÀO TẠO
                  </div>
                  <div className="text-center my-auto">
                    <div className="text-[9px] font-extrabold uppercase tracking-wide">TIN HỌC</div>
                    <div className="text-xl font-black text-white leading-none">10</div>
                  </div>
                  <div className="text-[6.5px] text-center text-emerald-200 font-semibold border-t border-white/20 pt-0.5">
                    KẾT NỐI TRI THỨC
                  </div>
                </div>

                {/* Topics list with blue checkmarks */}
                <div className="space-y-1 text-[11px] text-slate-700 flex-1 leading-snug">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#0866D9] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 1. Máy tính và xã hội số</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#0866D9] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 2. Mạng máy tính và Internet</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#0866D9] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 3. Đa phương tiện</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#0866D9] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 4. Giải quyết vấn đề với Python</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#0866D9] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 5. Hướng nghiệp với Tin học</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#0866D9] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 6. Thực hành và dự án</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3">
              <button
                onClick={() => handleSelectTopicFromCard(10)}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-[#0866D9] hover:text-white text-[#0866D9] font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Học từ vựng Lớp 10
              </button>
            </div>
          </div>

          {/* CARD 2: LỚP 11 */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              {/* Header Tab */}
              <div className="bg-[#7957E8] text-white px-3 py-1.5 font-bold text-xs flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                <span>Lớp 11</span>
              </div>

              <div className="p-3 flex gap-3">
                {/* Book Cover (Purple Tin Học 11) */}
                <div 
                  onClick={() => handleSelectTopicFromCard(11)}
                  className="w-20 h-28 bg-gradient-to-br from-[#6d28d9] via-[#4f46e5] to-[#312e81] rounded-md p-1.5 text-white shadow-md shrink-0 flex flex-col justify-between cursor-pointer hover:scale-102 transition-transform"
                >
                  <div className="text-[7px] font-black uppercase tracking-tight text-purple-200">
                    BỘ GIÁO DỤC VÀ ĐÀO TẠO
                  </div>
                  <div className="text-center my-auto">
                    <div className="text-[9px] font-extrabold uppercase tracking-wide">TIN HỌC</div>
                    <div className="text-xl font-black text-white leading-none">11</div>
                  </div>
                  <div className="text-[6.5px] text-center text-purple-200 font-semibold border-t border-white/20 pt-0.5">
                    ĐỊNH HƯỚNG ỨNG DỤNG
                  </div>
                </div>

                {/* Topics list with purple checkmarks */}
                <div className="space-y-1 text-[11px] text-slate-700 flex-1 leading-snug">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7957E8] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 1. Hệ điều hành</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7957E8] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 2. Cơ sở dữ liệu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7957E8] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 3. SQL và khai thác dữ liệu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7957E8] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 4. Xử lý ảnh</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7957E8] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 5. Xử lý video</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7957E8] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 6. Thực hành và dự án</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3">
              <button
                onClick={() => handleSelectTopicFromCard(11)}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-[#7957E8] hover:text-white text-[#7957E8] font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Học từ vựng Lớp 11
              </button>
            </div>
          </div>

          {/* CARD 3: LỚP 12 */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              {/* Header Tab */}
              <div className="bg-[#12B981] text-white px-3 py-1.5 font-bold text-xs flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                <span>Lớp 12</span>
              </div>

              <div className="p-3 flex gap-3">
                {/* Book Cover (Cyan/Blue Tin Học 12) */}
                <div 
                  onClick={() => handleSelectTopicFromCard(12, 'les-12-3-1')}
                  className="w-20 h-28 bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0c4a6e] rounded-md p-1.5 text-white shadow-md shrink-0 flex flex-col justify-between cursor-pointer hover:scale-102 transition-transform"
                >
                  <div className="text-[7px] font-black uppercase tracking-tight text-sky-200">
                    BỘ GIÁO DỤC VÀ ĐÀO TẠO
                  </div>
                  <div className="text-center my-auto">
                    <div className="text-[9px] font-extrabold uppercase tracking-wide">TIN HỌC</div>
                    <div className="text-xl font-black text-white leading-none">12</div>
                  </div>
                  <div className="text-[6.5px] text-center text-sky-200 font-semibold border-t border-white/20 pt-0.5">
                    THIẾT KẾ WEB (HTML)
                  </div>
                </div>

                {/* Topics list with green checkmarks */}
                <div className="space-y-1 text-[11px] text-slate-700 flex-1 leading-snug">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#12B981] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 1. Trí tuệ nhân tạo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#12B981] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 2. Mạng máy tính</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-[#0866D9]">
                    <Check className="w-3.5 h-3.5 text-[#12B981] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 3. Thiết kế trang web (HTML)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#12B981] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 4. Định dạng trang web (CSS)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#12B981] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 5. Ứng dụng và phát triển</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#12B981] shrink-0 font-bold" />
                    <span className="truncate">Chủ đề 6. Thực hành và dự án</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3">
              <button
                onClick={() => handleSelectTopicFromCard(12, 'les-12-3-1')}
                className="w-full py-1.5 px-3 rounded-lg bg-[#0866D9] hover:bg-[#073B86] text-white font-bold text-xs transition-colors cursor-pointer text-center shadow-xs"
              >
                Học Bài 7: HTML (Lớp 12)
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

