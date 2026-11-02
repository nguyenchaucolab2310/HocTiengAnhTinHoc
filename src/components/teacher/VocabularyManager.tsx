import React, { useState } from 'react';
import { 
  BookMarked, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  Download, 
  X,
  Volume2,
  Sparkles,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { VocabularyItem, GradeLevel, TopicItem, WordLevel, WordSourceType } from '../../types';
import { StorageService } from '../../services/storage';
import { TTSService } from '../../services/tts';

interface VocabularyManagerProps {
  vocabulary: VocabularyItem[];
  topics: TopicItem[];
  onUpdateVocabulary: (vocab: VocabularyItem[]) => void;
}

export const VocabularyManager: React.FC<VocabularyManagerProps> = ({
  vocabulary,
  topics,
  onUpdateVocabulary
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(12);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);

  // Form states
  const [formGrade, setFormGrade] = useState<GradeLevel>(12);
  const [formLessonName, setFormLessonName] = useState('Bài 7. HTML và cấu trúc trang web');
  const [formEnglish, setFormEnglish] = useState('');
  const [formIpa, setFormIpa] = useState('');
  const [formPartOfSpeech, setFormPartOfSpeech] = useState<'n' | 'v' | 'adj' | 'adv' | 'phrase' | 'abbr'>('n');
  const [formVietnamese, setFormVietnamese] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formExample, setFormExample] = useState('');
  const [formExampleTrans, setFormExampleTrans] = useState('');
  const [formLevel, setFormLevel] = useState<WordLevel>('dễ');
  const [formSourceType, setFormSourceType] = useState<WordSourceType>('Trong SGK (Đã xác minh)');
  const [formSourcePage, setFormSourcePage] = useState<string>('38');

  const filteredVocab = vocabulary.filter(v => {
    if (v.grade !== selectedGrade) return false;
    if (selectedTopic !== 'all' && v.topicId !== selectedTopic) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        v.english.toLowerCase().includes(q) ||
        v.vietnamese.toLowerCase().includes(q) ||
        v.explanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormEnglish('');
    setFormIpa('');
    setFormVietnamese('');
    setFormExplanation('');
    setFormExample('');
    setFormExampleTrans('');
    setFormGrade(selectedGrade);
    setShowModal(true);
  };

  const handleOpenEdit = (item: VocabularyItem) => {
    setEditingItem(item);
    setFormGrade(item.grade);
    setFormLessonName(item.lessonName);
    setFormEnglish(item.english);
    setFormIpa(item.ipa);
    setFormPartOfSpeech(item.partOfSpeech);
    setFormVietnamese(item.vietnamese);
    setFormExplanation(item.explanation);
    setFormExample(item.example);
    setFormExampleTrans(item.exampleTranslation);
    setFormLevel(item.level);
    setFormSourceType(item.sourceType);
    setFormSourcePage(String(item.sourcePage || ''));
    setShowModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Thầy/Cô có chắc chắn muốn xóa từ vựng "${name}" khỏi ngân hàng không?`)) {
      const updated = vocabulary.filter(v => v.id !== id);
      onUpdateVocabulary(updated);
      StorageService.saveVocabulary(updated);
    }
  };

  const handleDuplicate = (item: VocabularyItem) => {
    const duplicated: VocabularyItem = {
      ...item,
      id: `voc-${Date.now()}`,
      english: `${item.english} (Sao chép)`
    };
    const updated = [duplicated, ...vocabulary];
    onUpdateVocabulary(updated);
    StorageService.saveVocabulary(updated);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEnglish.trim() || !formVietnamese.trim()) return;

    // Check duplicate english word
    if (!editingItem) {
      const exists = vocabulary.some(v => v.english.toLowerCase() === formEnglish.trim().toLowerCase());
      if (exists) {
        if (!confirm(`Thuật ngữ "${formEnglish}" đã tồn tại trong ngân hàng từ. Thầy/Cô có muốn tiếp tục lưu?`)) {
          return;
        }
      }
    }

    if (editingItem) {
      // Update
      const updated: VocabularyItem = {
        ...editingItem,
        grade: formGrade,
        lessonName: formLessonName,
        english: formEnglish.trim(),
        ipa: formIpa.trim(),
        partOfSpeech: formPartOfSpeech,
        vietnamese: formVietnamese.trim(),
        explanation: formExplanation.trim(),
        example: formExample.trim(),
        exampleTranslation: formExampleTrans.trim(),
        level: formLevel,
        sourceType: formSourceType,
        sourcePage: formSourcePage.trim() ? Number(formSourcePage) || formSourcePage : undefined
      };
      const list = vocabulary.map(v => v.id === editingItem.id ? updated : v);
      onUpdateVocabulary(list);
      StorageService.saveVocabulary(list);
    } else {
      // Create new
      const newItem: VocabularyItem = {
        id: `voc-${Date.now()}`,
        grade: formGrade,
        textbook: 'Kết nối tri thức với cuộc sống',
        topicId: `top-${formGrade}-1`,
        topicName: `Chủ đề Tin học Lớp ${formGrade}`,
        lessonId: `les-${formGrade}-custom`,
        lessonName: formLessonName,
        english: formEnglish.trim(),
        ipa: formIpa.trim() || '/.../',
        partOfSpeech: formPartOfSpeech,
        vietnamese: formVietnamese.trim(),
        explanation: formExplanation.trim(),
        example: formExample.trim(),
        exampleTranslation: formExampleTrans.trim(),
        level: formLevel,
        sourceType: formSourceType,
        sourcePage: formSourcePage.trim() ? Number(formSourcePage) || formSourcePage : undefined
      };
      const list = [newItem, ...vocabulary];
      onUpdateVocabulary(list);
      StorageService.saveVocabulary(list);
    }

    setShowModal(false);
  };

  const handleExportVocabExcel = () => {
    const data = filteredVocab.map((v, i) => ({
      'STT': i + 1,
      'Khối lớp': v.grade,
      'Bộ sách': v.textbook,
      'Bài học': v.lessonName,
      'Từ tiếng Anh': v.english,
      'Phiên âm IPA': v.ipa,
      'Từ loại': v.partOfSpeech,
      'Nghĩa tiếng Việt': v.vietnamese,
      'Giải thích Tin học': v.explanation,
      'Ví dụ tiếng Anh': v.example,
      'Dịch ví dụ': v.exampleTranslation,
      'Độ khó': v.level,
      'Nguồn': v.sourceType,
      'Trang SGK': v.sourcePage || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Từ vựng Lớp ${selectedGrade}`);
    XLSX.writeFile(workbook, `Ngan_Hang_Tu_Vung_Tin_Hoc_Lop_${selectedGrade}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0866D9] to-[#12B981] text-white flex items-center justify-center shadow-md">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Quản Lý Ngân Hàng Từ Vựng SGK Tin Học
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Thêm, sửa, duyệt đối chiếu SGK Kết nối tri thức và xuất dữ liệu Excel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#0866D9] hover:bg-[#073B86] text-white font-bold text-xs shadow-md shadow-[#0866D9]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm từ vựng mới</span>
          </button>
          <button
            onClick={handleExportVocabExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Grade Selector & Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-md border border-[#B6D9F9]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {([10, 11, 12] as GradeLevel[]).map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGrade === g
                  ? 'bg-[#0866D9] text-white shadow-md shadow-[#0866D9]/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Lớp {g} ({vocabulary.filter(v => v.grade === g).length} từ)
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo từ tiếng Anh, nghĩa tiếng Việt..."
            className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
          />
        </div>
      </div>

      {/* Vocabulary Table */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-extrabold text-base text-[#073B86]">
            Danh sách từ vựng Lớp {selectedGrade} ({filteredVocab.length} từ)
          </h2>
          <span className="text-xs text-slate-500">
            SGK: Kết nối tri thức với cuộc sống
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">STT</th>
                <th className="py-3 px-3">Từ tiếng Anh</th>
                <th className="py-3 px-3">Phiên âm / Loại từ</th>
                <th className="py-3 px-3">Nghĩa tiếng Việt</th>
                <th className="py-3 px-3">Bài học SGK</th>
                <th className="py-3 px-3">Phân loại nguồn</th>
                <th className="py-3 px-3 text-center">Độ khó</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVocab.map((v, idx) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-[#073B86] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span>{v.english}</span>
                      <button 
                        onClick={() => TTSService.speak(v.english)}
                        className="text-slate-400 hover:text-[#0866D9] p-0.5 cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {v.ipa} <span className="text-[10px] uppercase font-bold text-[#0866D9]">({v.partOfSpeech})</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">{v.vietnamese}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-[160px] truncate">{v.lessonName}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      v.sourceType === 'Trong SGK (Đã xác minh)'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {v.sourceType} {v.sourcePage ? `(Trang ${v.sourcePage})` : ''}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      v.level === 'dễ' ? 'bg-emerald-100 text-emerald-800' :
                      v.level === 'trung bình' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {v.level}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="p-1 rounded-lg hover:bg-blue-50 text-[#0866D9] transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(v)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        title="Nhân bản từ sang bài khác"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.english)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                        title="Xóa từ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Vocabulary */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-[#B6D9F9] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#073B86]">
                {editingItem ? 'Chỉnh sửa thuật ngữ Tin học' : 'Thêm từ vựng mới vào ngân hàng'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khối lớp</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                  >
                    <option value={10}>Lớp 10</option>
                    <option value={11}>Lớp 11</option>
                    <option value={12}>Lớp 12</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bài học trong SGK</label>
                  <input
                    type="text"
                    required
                    value={formLessonName}
                    onChange={(e) => setFormLessonName(e.target.value)}
                    placeholder="Ví dụ: Bài 7. HTML và cấu trúc trang web"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Từ tiếng Anh (*)</label>
                  <input
                    type="text"
                    required
                    value={formEnglish}
                    onChange={(e) => setFormEnglish(e.target.value)}
                    placeholder="Ví dụ: Hyperlink"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Từ loại</label>
                  <select
                    value={formPartOfSpeech}
                    onChange={(e) => setFormPartOfSpeech(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none"
                  >
                    <option value="n">Danh từ (n)</option>
                    <option value="v">Động từ (v)</option>
                    <option value="adj">Tính từ (adj)</option>
                    <option value="abbr">Viết tắt (abbr)</option>
                    <option value="phrase">Cụm từ (phrase)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phiên âm IPA</label>
                  <input
                    type="text"
                    value={formIpa}
                    onChange={(e) => setFormIpa(e.target.value)}
                    placeholder="Ví dụ: /ˈhaɪpəlɪŋk/"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nghĩa tiếng Việt (*)</label>
                  <input
                    type="text"
                    required
                    value={formVietnamese}
                    onChange={(e) => setFormVietnamese(e.target.value)}
                    placeholder="Ví dụ: Siêu liên kết"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giải thích theo ngữ cảnh môn Tin học</label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Giải thích bản chất kỹ thuật Tin học một cách ngắn gọn, dễ hiểu..."
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Câu ví dụ tiếng Anh</label>
                  <input
                    type="text"
                    value={formExample}
                    onChange={(e) => setFormExample(e.target.value)}
                    placeholder="Ví dụ: Click the hyperlink to visit the website."
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dịch nghĩa câu ví dụ</label>
                  <input
                    type="text"
                    value={formExampleTrans}
                    onChange={(e) => setFormExampleTrans(e.target.value)}
                    placeholder="Ví dụ: Nhấn vào siêu liên kết để truy cập trang web."
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Độ khó</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as WordLevel)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none"
                  >
                    <option value="dễ">Dễ (Cơ bản)</option>
                    <option value="trung bình">Trung bình (Phổ biến)</option>
                    <option value="nâng cao">Nâng cao (Chuyên sâu)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nguồn thẩm định</label>
                  <select
                    value={formSourceType}
                    onChange={(e) => setFormSourceType(e.target.value as WordSourceType)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none"
                  >
                    <option value="Trong SGK (Đã xác minh)">Trong SGK (Đã xác minh)</option>
                    <option value="Từ gợi ý - cần đối chiếu">Từ gợi ý - cần đối chiếu</option>
                    <option value="Từ mở rộng chuyên ngành">Từ mở rộng chuyên ngành</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trang SGK</label>
                  <input
                    type="text"
                    value={formSourcePage}
                    onChange={(e) => setFormSourcePage(e.target.value)}
                    placeholder="Trang 42"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0866D9] text-white font-bold hover:bg-[#073B86] shadow-md shadow-[#0866D9]/20"
                >
                  Lưu vào ngân hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
