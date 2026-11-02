import React, { useState } from 'react';
import { 
  Users2, 
  Search, 
  UserPlus, 
  Download, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Filter, 
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Classroom, StudentInClass } from '../../types';
import { StorageService } from '../../services/storage';

interface ClassroomManagerProps {
  classrooms: Classroom[];
  onUpdateClassrooms: (classes: Classroom[]) => void;
}

export const ClassroomManager: React.FC<ClassroomManagerProps> = ({
  classrooms,
  onUpdateClassrooms
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || 'cls-12a1');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentInClass | null>(null);

  // New Student form state
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('12A1');

  const currentClass = classrooms.find(c => c.id === selectedClassId) || classrooms[0];

  const filteredStudents = (currentClass?.students || []).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentCode.trim() || !newStudentName.trim()) return;

    const newStudent: StudentInClass = {
      id: `hs-${Date.now()}`,
      studentCode: newStudentCode.trim(),
      name: newStudentName.trim(),
      className: newStudentClass,
      wordsLearned: 0,
      completedLessons: 0,
      avgScore: 0,
      lastActive: 'Vừa tạo tài khoản',
      status: 'active'
    };

    const updatedClasses = classrooms.map(cls => {
      if (cls.name === newStudentClass) {
        return {
          ...cls,
          studentCount: cls.studentCount + 1,
          students: [newStudent, ...cls.students]
        };
      }
      return cls;
    });

    onUpdateClassrooms(updatedClasses);
    StorageService.saveClassrooms(updatedClasses);

    // Reset form
    setNewStudentCode('');
    setNewStudentName('');
    setShowAddModal(false);
  };

  const handleExportExcel = () => {
    if (!currentClass) return;

    const dataToExport = currentClass.students.map((s, idx) => ({
      'STT': idx + 1,
      'Mã học sinh': s.studentCode,
      'Họ và tên': s.name,
      'Lớp': s.className,
      'Số từ đã học': s.wordsLearned,
      'Số bài hoàn thành': s.completedLessons,
      'Điểm trung bình': s.avgScore,
      'Hoạt động cuối': s.lastActive,
      'Trạng thái': s.status === 'active' ? 'Đang học' : 'Chưa hoạt động'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Add Title metadata header
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['TRƯỜNG PT DTNT THPT BÌNH THUẬN - NĂM HỌC 2025-2026'],
      [`DANH SÁCH HỌC SINH VÀ TIẾN ĐỘ HỌC TẬP - LỚP ${currentClass.name}`],
      [`Giáo viên phụ trách: NGUYỄN THỊ CHÂU - Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
      []
    ], { origin: 'A1' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Lớp ${currentClass.name}`);
    XLSX.writeFile(workbook, `Danh_Sach_Lop_${currentClass.name}_IT_English.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Teacher Role Top Banner */}
      <div className="bg-gradient-to-r from-[#061D49] via-[#073B86] to-[#0866D9] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#16D8FF]/30">
        <div>
          <span className="text-[11px] font-extrabold text-[#16D8FF] uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/15">
            DÀNH CHO GIÁO VIÊN
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-2">
            HỆ THỐNG QUẢN LÝ HỌC TẬP – GIÁO VIÊN NGUYỄN THỊ CHÂU
          </h1>
          <p className="text-xs text-[#EAF5FF]/80 mt-1">
            Trường PT DTNT THPT Bình Thuận &bull; Quản lý lớp học, theo dõi tiến độ và đánh giá năng lực học sinh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#12B981] hover:bg-[#065F46] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Class Selection Tabs & Search */}
      <div className="bg-white rounded-3xl p-5 shadow-md border border-[#B6D9F9]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Class Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {classrooms.map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedClassId === cls.id
                  ? 'bg-[#0866D9] text-white shadow-md shadow-[#0866D9]/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Lớp {cls.name} ({cls.studentCount} HS)
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên hoặc mã học sinh..."
            className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
          />
        </div>
      </div>

      {/* Main Student List Table */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-extrabold text-base text-[#073B86] flex items-center gap-2">
            <Users2 className="w-5 h-5 text-[#0866D9]" />
            <span>Danh sách học sinh lớp {currentClass?.name} ({filteredStudents.length} học sinh)</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Năm học: {currentClass?.academicYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">STT</th>
                <th className="py-3 px-3">Mã học sinh</th>
                <th className="py-3 px-3">Họ và tên</th>
                <th className="py-3 px-3">Lớp</th>
                <th className="py-3 px-3 text-center">Số từ đã học</th>
                <th className="py-3 px-3 text-center">Số bài hoàn thành</th>
                <th className="py-3 px-3 text-center">Điểm TB</th>
                <th className="py-3 px-3">Hoạt động cuối</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#0866D9]">{s.studentCode}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{s.name}</td>
                  <td className="py-3 px-3 text-slate-600">{s.className}</td>
                  <td className="py-3 px-3 text-center font-bold text-[#073B86]">
                    {s.wordsLearned} từ
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-emerald-700">
                    {s.completedLessons} bài
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block font-black px-2 py-0.5 rounded-lg text-xs ${
                      s.avgScore >= 8.0 ? 'bg-emerald-100 text-emerald-800' :
                      s.avgScore >= 6.5 ? 'bg-blue-100 text-[#0866D9]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.avgScore}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">{s.lastActive}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.status === 'active' ? 'Đang học' : 'Chưa học'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0866D9] hover:text-white text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Chi tiết</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Student */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#B6D9F9] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#073B86]">Thêm học sinh mới vào lớp</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã học sinh (*)</label>
                <input
                  type="text"
                  required
                  value={newStudentCode}
                  onChange={(e) => setNewStudentCode(e.target.value)}
                  placeholder="Ví dụ: HS12038"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên học sinh (*)</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Thị Mai"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chọn lớp học</label>
                <select
                  value={newStudentClass}
                  onChange={(e) => setNewStudentClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                >
                  {classrooms.map(cls => (
                    <option key={cls.id} value={cls.name}>Lớp {cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0866D9] text-white font-bold hover:bg-[#073B86] shadow-md shadow-[#0866D9]/20"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Student Profile */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#B6D9F9] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0866D9] font-bold flex items-center justify-center text-sm">
                  {selectedStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#073B86]">{selectedStudent.name}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Mã HS: {selectedStudent.studentCode} &bull; Lớp {selectedStudent.className}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-400 text-[10px]">Đã học</div>
                <div className="text-base font-black text-[#0866D9]">{selectedStudent.wordsLearned} từ</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-400 text-[10px]">Bài xong</div>
                <div className="text-base font-black text-emerald-600">{selectedStudent.completedLessons} bài</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-400 text-[10px]">Điểm TB</div>
                <div className="text-base font-black text-amber-600">{selectedStudent.avgScore}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-700">Đánh giá quá trình:</div>
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-700 leading-relaxed">
                Học sinh tham gia học tập tích cực, hoàn thành tốt các bài tập Flashcard và kiểm tra 15 phút. Nắm vững các thuật ngữ HTML, CSS và Mạng máy tính.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-[#0866D9] text-white text-xs font-bold hover:bg-[#073B86]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
