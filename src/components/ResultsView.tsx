import React from 'react';
import { 
  BarChart3, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { StudentProgress, ExamAttempt, VocabularyItem, UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface ResultsViewProps {
  currentUser: UserProfile;
  progress: StudentProgress;
  vocabulary: VocabularyItem[];
  onNavigateTab: (tab: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  currentUser,
  progress,
  vocabulary,
  onNavigateTab
}) => {
  const attempts = StorageService.getExamAttempts(currentUser.id);
  const learnedWords = vocabulary.filter(v => v.isLearned);
  const needReviewWords = vocabulary.filter(v => !v.isLearned && v.masteryLevel === 1);

  const badges = [
    { id: 'b1', title: 'Người học tích cực', desc: 'Đã hoàn thành trên 10 bài học', earned: progress.completedLessons >= 10, icon: '🌟' },
    { id: 'b2', title: 'Chinh phục HTML', desc: 'Học trọn vẹn từ vựng Bài 7 HTML Lớp 12', earned: true, icon: '💻' },
    { id: 'b3', title: 'Chăm chỉ', desc: 'Duy trì chuỗi học 5 ngày liên tiếp', earned: progress.studyStreakDays >= 5, icon: '🔥' },
    { id: 'b4', title: 'Chuyên gia CSDL', desc: 'Nắm vững thuật ngữ Database & Khóa chính', earned: true, icon: '🗄️' },
    { id: 'b5', title: 'Vượt mốc 150 từ', desc: 'Tích lũy vốn từ tiếng Anh Tin học phong phú', earned: progress.totalWordsLearned >= 150, icon: '🎯' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0866D9] to-[#12B981] text-white flex items-center justify-center shadow-md">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Kết Quả Học Tập Cá Nhân
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Học sinh: <strong className="text-slate-800">{currentUser.name}</strong> &bull; Lớp: <strong>{currentUser.className || '12A1'}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('practice')}
          className="px-4 py-2.5 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#0866D9]/20"
        >
          <span>Luyện tập từ còn yếu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-md border border-[#B6D9F9]/50 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#0866D9]" /> Tổng từ đã học
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#073B86]">
            {progress.totalWordsLearned}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            +{progress.masteredWords} từ đã thuộc vững
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-[#B6D9F9]/50 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Bài hoàn thành
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {progress.completedLessons}
          </div>
          <div className="text-[10px] text-slate-500">
            Đạt 76% kế hoạch học kỳ
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-[#B6D9F9]/50 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Điểm trung bình
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {progress.averageScore}
          </div>
          <div className="text-[10px] text-slate-500">
            Thang điểm 10 hệ số 1
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-[#B6D9F9]/50 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" /> Chuỗi học tập
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700">
            {progress.studyStreakDays} ngày
          </div>
          <div className="text-[10px] text-purple-600 font-bold">
            Duy trì đều đặn
          </div>
        </div>
      </div>

      {/* Badges / Achievements */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <h2 className="font-extrabold text-base text-[#073B86] flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Huy hiệu & Thành tích học tập</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {badges.map(b => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                b.earned 
                  ? 'bg-amber-50/50 border-amber-200 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <div>
                <div className="font-bold text-xs text-slate-800">{b.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{b.desc}</div>
              </div>
              <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                b.earned ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'
              }`}>
                {b.earned ? 'Đã đạt' : 'Đang phấn đấu'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Exam History Table */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <h2 className="font-extrabold text-base text-[#073B86] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0866D9]" />
          <span>Lịch sử các lần kiểm tra đánh giá</span>
        </h2>

        {attempts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Chưa có lượt kiểm tra nào được ghi nhận. Hãy làm bài kiểm tra để xem kết quả!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">STT</th>
                  <th className="py-3 px-3">Tên bài kiểm tra</th>
                  <th className="py-3 px-3">Thời gian nộp</th>
                  <th className="py-3 px-3">Số câu đúng</th>
                  <th className="py-3 px-3 text-center">Điểm số</th>
                  <th className="py-3 px-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att, idx) => (
                  <tr key={att.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{att.examTitle}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {new Date(att.completedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <strong>{att.correctCount}</strong> / {att.totalQuestions} câu
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block font-black text-sm px-2.5 py-0.5 rounded-lg ${
                        att.score >= 8.0 ? 'bg-emerald-100 text-emerald-800' :
                        att.score >= 5.0 ? 'bg-blue-100 text-[#0866D9]' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.score}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Đã chấm
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
