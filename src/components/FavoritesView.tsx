import React, { useState } from 'react';
import { 
  Star, 
  Volume2, 
  Trash2, 
  Layers, 
  BookOpen, 
  Search, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { VocabularyItem } from '../types';
import { TTSService } from '../services/tts';

interface FavoritesViewProps {
  vocabulary: VocabularyItem[];
  onToggleFavorite: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  vocabulary,
  onToggleFavorite,
  onNavigateTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const favorites = vocabulary.filter(v => v.isFavorite);

  const filteredFavorites = favorites.filter(v => 
    v.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vietnamese.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F5B827] to-[#16D8FF] text-white flex items-center justify-center shadow-md">
            <Star className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Kho Từ Yêu Thích Của Bạn
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Lưu trữ những thuật ngữ Tin học trọng tâm để ôn tập riêng và khắc sâu kiến thức
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0866D9] bg-[#EAF5FF] px-3 py-1.5 rounded-xl border border-[#1388F5]/30">
            {favorites.length} từ đã lưu
          </span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#B6D9F9]/50 relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm trong danh sách từ yêu thích..."
          className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866D9]"
        />
      </div>

      {/* Word Cards Grid */}
      {filteredFavorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-md border border-[#B6D9F9]/50 space-y-3">
          <Star className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Chưa có từ vựng nào trong kho yêu thích</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Khi học từ vựng hoặc flashcard, bạn có thể bấm vào biểu tượng ngôi sao để đánh dấu và lưu từ vào đây.
          </p>
          <button
            onClick={() => onNavigateTab('vocabulary')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#0866D9] text-white font-bold text-xs hover:bg-[#073B86] transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
          >
            <span>Đến mục Học từ vựng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFavorites.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-[#0866D9] bg-[#EAF5FF] px-2 py-0.5 rounded-md">
                    Lớp {item.grade} &bull; {item.lessonName}
                  </span>
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    title="Bỏ khỏi yêu thích"
                    className="text-amber-500 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </button>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#073B86] font-mono">
                      {item.english}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono">{item.ipa}</div>
                  </div>
                  <button
                    onClick={() => TTSService.speak(item.english)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-[#0866D9] hover:text-white text-[#0866D9] transition-colors cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2 text-xs font-bold text-slate-800">
                  {item.vietnamese}
                </div>

                <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
                  {item.explanation}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Độ khó: {item.level}</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {item.sourceType}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
