import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  X, 
  Plus, 
  RefreshCw, 
  BookOpen, 
  HelpCircle,
  FileText,
  Volume2
} from 'lucide-react';
import { GeminiService } from '../../services/gemini';
import { VocabularyItem, GradeLevel, TopicItem } from '../../types';
import { StorageService } from '../../services/storage';
import { TTSService } from '../../services/tts';

interface AIAssistantProps {
  vocabulary: VocabularyItem[];
  topics: TopicItem[];
  onUpdateVocabulary: (vocab: VocabularyItem[]) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  vocabulary,
  topics,
  onUpdateVocabulary
}) => {
  const [grade, setGrade] = useState<GradeLevel>(12);
  const [topicInput, setTopicInput] = useState('Thiết kế trang web HTML và cấu trúc thẻ ngữ nghĩa');
  const [lessonName, setLessonName] = useState('Bài 7. HTML và cấu trúc trang web');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedWords, setSuggestedWords] = useState<any[]>([]);
  const [approvedIds, setApprovedIds] = useState<Record<string, boolean>>({});

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setIsGenerating(true);
    try {
      const results = await GeminiService.generateVocabularyFromTopic(
        topicInput.trim(),
        grade,
        lessonName,
        5
      );
      setSuggestedWords(results);
      setApprovedIds({});
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo từ vựng với AI. Vui lòng thử lại!');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveWord = (word: any, index: number) => {
    const newItem: VocabularyItem = {
      id: `voc-ai-${Date.now()}-${index}`,
      grade,
      textbook: 'Kết nối tri thức với cuộc sống',
      topicId: `top-${grade}-ai`,
      topicName: `Chủ đề mở rộng Lớp ${grade}`,
      lessonId: `les-${grade}-ai`,
      lessonName,
      english: word.english,
      ipa: word.ipa || '/.../',
      partOfSpeech: word.partOfSpeech || 'n',
      vietnamese: word.vietnamese,
      explanation: word.explanation,
      example: word.example || '',
      exampleTranslation: word.exampleTranslation || '',
      level: word.level || 'trung bình',
      sourceType: 'Từ gợi ý - cần đối chiếu',
      isLearned: false,
      isFavorite: false
    };

    const updated = [newItem, ...vocabulary];
    onUpdateVocabulary(updated);
    StorageService.saveVocabulary(updated);
    setApprovedIds(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7957E8] to-[#16D8FF] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Trợ Lý AI Từ Vựng Tin Học THPT
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Trích xuất thuật ngữ chuyên ngành, IPA chuẩn & câu hỏi luyện tập có kiểm duyệt của giáo viên
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Chế độ kiểm duyệt giáo viên</span>
          </span>
        </div>
      </div>

      {/* Input Formulation */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Khối lớp</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
              >
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên bài học SGK mục tiêu</label>
              <input
                type="text"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                placeholder="Ví dụ: Bài 7. HTML và cấu trúc trang web"
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Chủ đề, đoạn văn bản SGK hoặc nội dung muốn AI phân tích thuật ngữ:
            </label>
            <textarea
              rows={3}
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Nhập nội dung bài học hoặc chủ đề công nghệ (ví dụ: Các thẻ semantic tag trong HTML5, liên kết siêu văn bản, thuộc tính class và id)..."
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7957E8] to-[#0866D9] text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'AI đang phân tích thuật ngữ...' : 'PHÂN TÍCH & ĐỀ XUẤT TỪ VỰNG'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Suggested Words Section */}
      {suggestedWords.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#B6D9F9]/50 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-base text-[#073B86]">
                Danh sách thuật ngữ AI đề xuất ({suggestedWords.length} từ)
              </h2>
              <p className="text-xs text-amber-600 font-semibold mt-0.5">
                ⚠ Trạng thái: &quot;Chờ giáo viên duyệt&quot; – Nhấp &quot;Duyệt & Thêm vào ngân hàng&quot; để lưu chính thức.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {suggestedWords.map((word, idx) => {
              const isApproved = approvedIds[idx];
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isApproved ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-[#073B86] font-mono">
                          {word.english}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{word.ipa}</span>
                        <span className="text-[10px] uppercase font-bold text-[#0866D9] bg-blue-100 px-1.5 py-0.2 rounded">
                          {word.partOfSpeech}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {word.level}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        &rarr; {word.vietnamese}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => TTSService.speak(word.english)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0866D9] cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {isApproved ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Đã thêm vào ngân hàng
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveWord(word, idx)}
                          className="px-4 py-2 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Duyệt & Thêm vào ngân hàng</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <div>
                      <strong>Giải thích Tin học:</strong> {word.explanation}
                    </div>
                    {word.example && (
                      <div className="italic font-mono text-slate-700 pt-1">
                        &ldquo;{word.example}&rdquo; &rarr; {word.exampleTranslation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
