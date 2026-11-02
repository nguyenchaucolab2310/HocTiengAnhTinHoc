import React, { useState } from 'react';
import { 
  FileEdit, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users2, 
  BookOpen, 
  X,
  Send
} from 'lucide-react';
import { Assignment, Classroom, TopicItem } from '../../types';
import { StorageService } from '../../services/storage';

interface AssignmentManagerProps {
  assignments: Assignment[];
  classrooms: Classroom[];
  topics: TopicItem[];
  onUpdateAssignments: (assignments: Assignment[]) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  assignments,
  classrooms,
  topics,
  onUpdateAssignments
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterClass, setFilterClass] = useState<string>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [targetClass, setTargetClass] = useState('12A1');
  const [taskType, setTaskType] = useState<'flashcard' | 'practice' | 'exam'>('flashcard');
  const [lessonName, setLessonName] = useState('Bài 7. HTML và cấu trúc trang web');
  const [dueDate, setDueDate] = useState('2025-01-25 23:59');
  const [attempts, setAttempts] = useState(3);
  const [instructions, setInstructions] = useState('');

  const filteredAssignments = assignments.filter(a => 
    filterClass === 'all' || a.className === filterClass
  );

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      title: title.trim(),
      className: targetClass,
      type: taskType,
      lessonName,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate,
      allowedAttempts: attempts,
      status: 'pending',
      instructions: instructions.trim()
    };

    const updated = [newAsg, ...assignments];
    onUpdateAssignments(updated);
    StorageService.saveAssignments(updated);

    // Reset & close
    setTitle('');
    setInstructions('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0866D9] to-[#DB2777] text-white flex items-center justify-center shadow-md">
            <FileEdit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Giao Bài Học & Kiểm Tra Đánh Giá
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Giáo viên giao Flashcard, bài luyện tập hoặc đề thi trắc nghiệm theo lớp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0866D9] hover:bg-[#073B86] text-white font-bold text-xs shadow-md shadow-[#0866D9]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo nhiệm vụ mới</span>
          </button>
        </div>
      </div>

      {/* Class filter pills */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#B6D9F9]/50 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 mr-2">Lọc theo lớp:</span>
        <button
          onClick={() => setFilterClass('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterClass === 'all' ? 'bg-[#0866D9] text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          Tất cả các lớp
        </button>
        {classrooms.map(c => (
          <button
            key={c.id}
            onClick={() => setFilterClass(c.name)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterClass === c.name ? 'bg-[#0866D9] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Lớp {c.name}
          </button>
        ))}
      </div>

      {/* Assignments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssignments.map(asg => (
          <div
            key={asg.id}
            className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md border border-slate-200 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                  asg.type === 'exam' ? 'bg-rose-100 text-rose-700' :
                  asg.type === 'flashcard' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {asg.type === 'exam' ? 'Bài kiểm tra' : asg.type === 'flashcard' ? 'Học Flashcard' : 'Luyện tập'}
                </span>

                <span className="text-xs font-bold text-[#0866D9] bg-[#EAF5FF] px-2.5 py-0.5 rounded-md">
                  Lớp {asg.className}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#073B86] leading-snug">
                  {asg.title}
                </h3>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>{asg.lessonName}</span>
                </div>
              </div>

              {asg.instructions && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {asg.instructions}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Hạn nộp:
                </span>
                <strong className="text-slate-800">{asg.dueDate}</strong>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Số lần làm tối đa:</span>
                <span className="font-bold text-[#0866D9]">{asg.allowedAttempts} lần</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Assignment */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#B6D9F9] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#073B86]">Tạo nhiệm vụ học tập mới</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề nhiệm vụ (*)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn tập từ vựng Bài 7 HTML & Cấu trúc Web"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giao cho lớp</label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.name}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hình thức học</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                  >
                    <option value="flashcard">Học Flashcard</option>
                    <option value="practice">Luyện tập trắc nghiệm & game</option>
                    <option value="exam">Bài kiểm tra 15 phút</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bài học SGK</label>
                <select
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                >
                  {topics.flatMap(t => t.lessons).map(l => (
                    <option key={l.id} value={l.name}>
                      [Lớp {l.grade}] {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hạn nộp bài</label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số lần làm tối đa</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={attempts}
                    onChange={(e) => setAttempts(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lời nhắn / Hướng dẫn của giáo viên</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Nhập ghi chú cho học sinh (ví dụ: Hãy nghe kỹ phát âm trước khi làm bài)..."
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0866D9] text-white font-bold hover:bg-[#073B86] shadow-md shadow-[#0866D9]/20"
                >
                  Giao bài cho lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
