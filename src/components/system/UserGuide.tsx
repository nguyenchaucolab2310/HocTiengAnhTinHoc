import React from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Layers, 
  Gamepad2, 
  ClipboardCheck, 
  FileSpreadsheet, 
  Sparkles,
  School,
  CheckCircle2
} from 'lucide-react';

export const UserGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0866D9] to-[#16D8FF] text-white flex items-center justify-center shadow-md">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Hướng Dẫn Sử Dụng Hệ Thống IT English Learning
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Cẩm nang thao tác cho Học sinh và Giáo viên Tin học THPT
            </p>
          </div>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Student Section */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0866D9] flex items-center justify-center font-bold text-xs">
              HS
            </div>
            <h2 className="font-extrabold text-base text-[#073B86]">
              Dành cho Học sinh (Lớp 10, 11, 12)
            </h2>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-[#0866D9] block">1. Học từ vựng theo bài học:</strong>
              <p>Chọn Khối lớp &rarr; Chọn Bài học SGK (như Bài 7: HTML) &rarr; Nghe phát âm IPA chuẩn bản ngữ, xem nghĩa tiếng Việt và ví dụ Tin học.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-emerald-700 block">2. Ghi nhớ bằng Flashcard 3D:</strong>
              <p>Nhấp vào thẻ hoặc phím cách để lật mặt sau xem giải thích. Đánh giá mức độ &quot;Đã nhớ&quot;, &quot;Cần ôn tập&quot; hoặc &quot;Chưa thuộc&quot; để thuật toán lên lịch ôn tập ngắt quãng.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-purple-700 block">3. Luyện tập với 6 trò chơi tương tác:</strong>
              <p>Thử sức với Trắc nghiệm, Ghép cặp từ, Điền khuyết vào câu, Nghe phát âm đoán chữ, Sắp xếp chữ cái xáo trộn và Bài tập tình huống thực tế.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-pink-700 block">4. Làm bài kiểm tra 15 phút:</strong>
              <p>Hoàn thành 10 câu hỏi trong 15 phút. Hệ thống tự động chấm điểm thang 10, hiển thị giải thích chi tiết và lưu vào học bạ cá nhân.</p>
            </div>
          </div>
        </div>

        {/* Teacher Section */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              GV
            </div>
            <h2 className="font-extrabold text-base text-[#073B86]">
              Dành cho Giáo viên (Cô Nguyễn Thị Châu)
            </h2>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-[#0866D9] block">1. Quản lý lớp học & học sinh:</strong>
              <p>Xem danh sách học sinh theo từng lớp (12A1, 12A2, 11A1, 10A1), thêm học sinh mới, theo dõi số từ đã học, điểm trung bình và xuất danh sách Excel.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-emerald-700 block">2. Nhập từ vựng bằng Excel:</strong>
              <p>Tải file Excel mẫu chuẩn &rarr; Nhập dữ liệu &rarr; Hệ thống tự động quét lỗi, cảnh báo trùng từ &rarr; Xác nhận thêm hàng loạt vào ngân hàng.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-purple-700 block">3. Trợ lý AI Từ vựng Tin học:</strong>
              <p>Nhập văn bản bài học hoặc tải ảnh bài học &rarr; Gemini AI đề xuất thuật ngữ, IPA, giải thích và câu hỏi trắc nghiệm &rarr; Giáo viên duyệt trước khi xuất bản.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <strong className="text-pink-700 block">4. Thống kê & Xuất báo cáo chuyên nghiệp:</strong>
              <p>Biểu đồ Recharts theo dõi tiến độ theo lớp, phân tích tỷ lệ học sinh trả lời sai từng thuật ngữ để có kế hoạch phụ đạo kịp thời.</p>
            </div>
          </div>
        </div>

      </div>

      {/* School Information Card */}
      <div className="bg-gradient-to-r from-[#061D49] to-[#073B86] rounded-3xl p-6 text-white space-y-3">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
          <School className="w-5 h-5 text-amber-400" />
          <span>TRƯỜNG PT DTNT THPT BÌNH THUẬN</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
          Phần mềm học từ vựng tiếng Anh chuyên ngành Tin học được thiết kế bám sát chương trình Giáo dục phổ thông 2018 (SGK Kết nối tri thức với cuộc sống), phục vụ công tác giảng dạy của giáo viên <strong>Nguyễn Thị Châu</strong> và phong trào tự học của học sinh nhà trường.
        </p>
        <div className="text-[11px] text-[#16D8FF] font-medium pt-1">
          &bull; Khẩu hiệu: &quot;Learn IT English – Khám phá công nghệ, chinh phục tiếng Anh&quot;
        </div>
      </div>

    </div>
  );
};
