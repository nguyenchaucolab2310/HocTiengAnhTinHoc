import React, { useState } from 'react';
import { 
  TrendingUp, 
  Download, 
  BarChart3, 
  PieChart as PieIcon, 
  Users2, 
  CheckCircle2, 
  BookOpen, 
  AlertCircle,
  Calendar,
  School
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import * as XLSX from 'xlsx';
import { Classroom, VocabularyItem } from '../../types';
import { StorageService } from '../../services/storage';

interface AnalyticsReportProps {
  classrooms: Classroom[];
  vocabulary: VocabularyItem[];
}

export const AnalyticsReport: React.FC<AnalyticsReportProps> = ({
  classrooms,
  vocabulary
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const attempts = StorageService.getExamAttempts();

  // Aggregate stats from real classroom records
  const allStudents = classrooms.flatMap(c => c.students);
  const activeStudents = allStudents.filter(s => s.status === 'active');
  const totalWordsLearnedCount = allStudents.reduce((acc, s) => acc + s.wordsLearned, 0);
  const avgOverallScore = allStudents.length > 0 
    ? Number((allStudents.reduce((acc, s) => acc + s.avgScore, 0) / allStudents.length).toFixed(1))
    : 0;

  // Chart 1: Average scores by class (BarChart)
  const classScoreData = classrooms.map(c => {
    const avg = c.students.length > 0
      ? Number((c.students.reduce((acc, s) => acc + s.avgScore, 0) / c.students.length).toFixed(1))
      : 0;
    return {
      className: `Lớp ${c.name}`,
      avgScore: avg,
      studentCount: c.studentCount
    };
  });

  // Chart 2: Completion rate (PieChart)
  const completionData = [
    { name: 'Đã hoàn thành tốt (>= 8đ)', value: allStudents.filter(s => s.avgScore >= 8.0).length, color: '#12B981' },
    { name: 'Khá (6.5 - 7.9đ)', value: allStudents.filter(s => s.avgScore >= 6.5 && s.avgScore < 8.0).length, color: '#0866D9' },
    { name: 'Cần cố gắng (< 6.5đ)', value: allStudents.filter(s => s.avgScore < 6.5).length, color: '#F5B827' }
  ];

  // Chart 3: Weekly progress progression (LineChart)
  const progressHistoryData = [
    { week: 'Tuần 1', wordsLearned: 35, avgScore: 7.2 },
    { week: 'Tuần 2', wordsLearned: 68, avgScore: 7.6 },
    { week: 'Tuần 3', wordsLearned: 104, avgScore: 8.0 },
    { week: 'Tuần 4', wordsLearned: 152, avgScore: 8.6 }
  ];

  // Chart 4: Top challenging vocabulary terms (BarChart)
  const difficultWordsData = [
    { term: 'Attribute', incorrectPercent: 38 },
    { term: 'Primary Key', incorrectPercent: 32 },
    { term: 'Semantic Tag', incorrectPercent: 28 },
    { term: 'Bandwidth', incorrectPercent: 25 },
    { term: 'Source Code', incorrectPercent: 19 }
  ];

  const handleExportFullExcel = () => {
    const dataRows = allStudents.map((s, idx) => ({
      'STT': idx + 1,
      'Mã học sinh': s.studentCode,
      'Họ và tên': s.name,
      'Lớp': s.className,
      'Số từ đã học': s.wordsLearned,
      'Số bài hoàn thành': s.completedLessons,
      'Điểm trung bình': s.avgScore,
      'Hoạt động gần nhất': s.lastActive,
      'Đánh giá': s.avgScore >= 8.0 ? 'Giỏi' : s.avgScore >= 6.5 ? 'Khá' : 'Trung bình'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Add Official School Header
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['TRƯỜNG PT DTNT THPT BÌNH THUẬN'],
      ['BÁO CÁO TỔNG HỢP KẾT QUẢ HỌC TẬP TỪ VỰNG TIẾNG ANH TIN HỌC THPT'],
      [`Giáo viên bộ môn: NGUYỄN THỊ CHÂU - Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
      [`Tổng số học sinh: ${allStudents.length} - Điểm trung bình toàn khối: ${avgOverallScore}`],
      []
    ], { origin: 'A1' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo tổng hợp');
    XLSX.writeFile(workbook, `Bao_Cao_Tin_Hoc_THPT_Binh_Thuan_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#12B981] to-[#0866D9] text-white flex items-center justify-center shadow-md">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Thống Kê & Báo Cáo Kết Quả Học Tập
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Biểu đồ trực quan hóa số liệu học tập từ vựng Tin học của học sinh các lớp
            </p>
          </div>
        </div>

        <button
          onClick={handleExportFullExcel}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>XUẤT BÁO CÁO EXCEL</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-md border border-[#B6D9F9]/50">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Users2 className="w-3.5 h-3.5 text-[#0866D9]" /> Tổng số học sinh
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#073B86] mt-1">
            {allStudents.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">
            {activeStudents.length} học sinh đang học tích cực
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-[#B6D9F9]/50">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tỷ lệ hoàn thành
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            {allStudents.length > 0 ? Math.round((activeStudents.length / allStudents.length) * 100) : 0}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Duy trì tiến độ chuẩn SGK
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-[#B6D9F9]/50">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" /> Điểm TB toàn trường
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
            {avgOverallScore}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Thang điểm 10 hệ số 1
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-[#B6D9F9]/50">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-purple-600" /> Từ vựng đã tích lũy
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 mt-1">
            {totalWordsLearnedCount}
          </div>
          <div className="text-[10px] text-purple-600 font-bold mt-1">
            Lượt học và ghi nhớ từ
          </div>
        </div>
      </div>

      {/* 2 Recharts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: BarChart Điểm TB theo lớp */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-extrabold text-sm text-[#073B86]">
              Điểm trung bình học tập theo từng lớp
            </h2>
            <span className="text-[11px] font-bold text-[#0866D9] bg-[#EAF5FF] px-2 py-0.5 rounded">
              Thang 10
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classScoreData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="className" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avgScore" name="Điểm TB" fill="#0866D9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: PieChart Tỷ lệ hoàn thành */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-extrabold text-sm text-[#073B86]">
              Phân loại kết quả học tập học sinh
            </h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Tổng quan
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: LineChart Tiến bộ theo tuần */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-extrabold text-sm text-[#073B86]">
              Tiến độ học tập và tích lũy từ vựng theo tuần
            </h2>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              Lớp 12A1
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressHistoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="wordsLearned" name="Số từ đã học" stroke="#0866D9" strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" name="Điểm TB" stroke="#12B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top Từ học sinh hay nhầm lẫn */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-extrabold text-sm text-[#073B86]">
              Những thuật ngữ học sinh trả lời sai nhiều nhất
            </h2>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              Cần ôn thêm
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={difficultWordsData}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" unit="%" tick={{ fontSize: 11 }} domain={[0, 50]} />
                <YAxis dataKey="term" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="incorrectPercent" name="Tỷ lệ sai (%)" fill="#F43F5E" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
