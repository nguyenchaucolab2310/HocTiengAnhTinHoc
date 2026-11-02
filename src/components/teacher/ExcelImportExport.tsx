import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileCheck, 
  RefreshCw,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { VocabularyItem, GradeLevel, WordLevel, WordSourceType } from '../../types';
import { StorageService } from '../../services/storage';

interface ExcelImportExportProps {
  vocabulary: VocabularyItem[];
  onUpdateVocabulary: (vocab: VocabularyItem[]) => void;
}

interface ParsedRow {
  rowNum: number;
  grade: GradeLevel;
  textbook: string;
  orientation?: string;
  topic: string;
  lesson: string;
  english: string;
  ipa: string;
  partOfSpeech: any;
  vietnamese: string;
  explanation: string;
  example: string;
  exampleTranslation: string;
  level: WordLevel;
  sourceType: WordSourceType;
  sourcePage?: string | number;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
}

export const ExcelImportExport: React.FC<ExcelImportExportProps> = ({
  vocabulary,
  onUpdateVocabulary
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'previewing' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  // 1. Download standard template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        grade: 12,
        textbook: 'Kết nối tri thức với cuộc sống',
        orientation: 'Tin học ứng dụng',
        topic: 'Chủ đề 3. Thiết kế trang web (HTML)',
        lesson: 'Bài 7. HTML và cấu trúc trang web',
        english: 'Hypertext',
        ipa: '/ˈhaɪpətekst/',
        partOfSpeech: 'n',
        vietnamese: 'Siêu văn bản',
        explanation: 'Văn bản chứa liên kết tới tài liệu hoặc phần khác trên mạng internet.',
        example: 'HTML organizes hypertext documents.',
        exampleTranslation: 'HTML tổ chức các tài liệu siêu văn bản.',
        level: 'dễ',
        sourceType: 'Trong SGK (Đã xác minh)',
        sourcePage: 38
      },
      {
        grade: 11,
        textbook: 'Kết nối tri thức với cuộc sống',
        orientation: 'Tin học ứng dụng',
        topic: 'Chủ đề 2. Cơ sở dữ liệu',
        lesson: 'Bài 3. Bảng, trường và bản ghi',
        english: 'Foreign Key',
        ipa: '/ˈfɒrən kiː/',
        partOfSpeech: 'phrase',
        vietnamese: 'Khóa ngoại',
        explanation: 'Trường liên kết khóa chính của bảng khác để tạo mối quan hệ giữa hai bảng.',
        example: 'A foreign key links records between tables.',
        exampleTranslation: 'Khóa ngoại liên kết các bản ghi giữa các bảng.',
        level: 'trung bình',
        sourceType: 'Từ gợi ý - cần đối chiếu',
        sourcePage: 58
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Nhap_Tu_Vung');
    XLSX.writeFile(workbook, 'Mau_Nhap_Tu_Vung_Tin_Hoc_THPT.xlsx');
  };

  // 2. Read and parse uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length === 0) {
          alert('Tệp Excel không chứa dòng dữ liệu nào.');
          return;
        }

        const existingEnglishWords = new Set(vocabulary.map(v => v.english.toLowerCase().trim()));

        const validated: ParsedRow[] = jsonData.map((row, idx) => {
          const errors: string[] = [];
          const english = String(row.english || row['Từ tiếng Anh'] || '').trim();
          const vietnamese = String(row.vietnamese || row['Nghĩa tiếng Việt'] || '').trim();
          const lesson = String(row.lesson || row['Bài học'] || '').trim();
          const gradeNum = Number(row.grade || row['Khối lớp'] || 12);
          const validGrade = (gradeNum === 10 || gradeNum === 11 || gradeNum === 12) ? gradeNum : 12;

          if (!english) errors.push('Thiếu từ tiếng Anh');
          if (!vietnamese) errors.push('Thiếu nghĩa tiếng Việt');
          if (!lesson) errors.push('Thiếu tên bài học');

          const isDuplicate = existingEnglishWords.has(english.toLowerCase());

          return {
            rowNum: idx + 2, // Excel 1-based header is row 1
            grade: validGrade as GradeLevel,
            textbook: row.textbook || 'Kết nối tri thức với cuộc sống',
            orientation: row.orientation || 'Tin học ứng dụng',
            topic: row.topic || 'Chủ đề SGK Tin học',
            lesson,
            english,
            ipa: row.ipa || '/.../',
            partOfSpeech: row.partOfSpeech || 'n',
            vietnamese,
            explanation: row.explanation || 'Thuật ngữ môn Tin học',
            example: row.example || '',
            exampleTranslation: row.exampleTranslation || '',
            level: (row.level === 'nâng cao' || row.level === 'trung bình' ? row.level : 'dễ') as WordLevel,
            sourceType: (row.sourceType === 'Trong SGK (Đã xác minh)' ? row.sourceType : 'Từ gợi ý - cần đối chiếu') as WordSourceType,
            sourcePage: row.sourcePage || '',
            isValid: errors.length === 0,
            isDuplicate,
            errors
          };
        });

        setParsedRows(validated);
        setImportStatus('previewing');
      } catch (err) {
        console.error(err);
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng tệp!');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 3. Confirm Import
  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Không có dòng dữ liệu hợp lệ nào để nhập.');
      return;
    }

    const newItems: VocabularyItem[] = validRows.map(r => ({
      id: `voc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      grade: r.grade,
      textbook: 'Kết nối tri thức với cuộc sống',
      topicId: `top-${r.grade}-excel`,
      topicName: r.topic,
      lessonId: `les-${r.grade}-excel`,
      lessonName: r.lesson,
      english: r.english,
      ipa: r.ipa,
      partOfSpeech: r.partOfSpeech,
      vietnamese: r.vietnamese,
      explanation: r.explanation,
      example: r.example,
      exampleTranslation: r.exampleTranslation,
      level: r.level,
      sourceType: r.sourceType,
      sourcePage: r.sourcePage,
      isLearned: false,
      isFavorite: false
    }));

    const updated = [...newItems, ...vocabulary];
    onUpdateVocabulary(updated);
    StorageService.saveVocabulary(updated);

    setImportStatus('success');
    setImportMessage(`Đã nhập thành công ${newItems.length} từ vựng mới vào ngân hàng dữ liệu!`);
  };

  const handleReset = () => {
    setParsedRows([]);
    setFileName('');
    setImportStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const duplicateCount = parsedRows.filter(r => r.isDuplicate).length;
  const errorCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#12B981] to-[#0866D9] text-white flex items-center justify-center shadow-md">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Nhập & Xuất Ngân Hàng Từ Vựng Excel
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Nhập hàng loạt từ vựng chuẩn SGK từ file .xlsx hoặc .csv có kiểm tra lỗi tự động
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2.5 rounded-xl bg-white text-[#0866D9] hover:bg-blue-50 font-bold text-xs border border-[#1388F5]/40 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>TẢI FILE EXCEL MẪU</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-dashed border-[#B6D9F9] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0866D9] flex items-center justify-center mx-auto shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-base text-[#073B86]">
            Tải lên tệp Excel danh sách từ vựng (.xlsx, .csv)
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hệ thống sẽ tự động quét các cột: <code>english, ipa, partOfSpeech, vietnamese, explanation, example, level, sourceType</code>
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id="excel-file-upload"
        />

        <label
          htmlFor="excel-file-upload"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0866D9] hover:bg-[#073B86] text-white font-bold text-xs shadow-lg shadow-[#0866D9]/30 cursor-pointer transition-all active:scale-95"
        >
          <FileCheck className="w-4 h-4" />
          <span>{fileName ? `Đã chọn: ${fileName}` : 'Chọn tệp từ máy tính của bạn'}</span>
        </label>
      </div>

      {/* Success Notification */}
      {importStatus === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-emerald-800 text-base">{importMessage}</h3>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Nhập tiếp tệp khác
          </button>
        </div>
      )}

      {/* Preview Table & Validation Results */}
      {importStatus === 'previewing' && parsedRows.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#B6D9F9]/50 space-y-4">
          
          {/* Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-base text-[#073B86]">
                Kết quả kiểm tra trước khi nhập ({parsedRows.length} dòng)
              </h2>
              <div className="flex items-center gap-3 text-xs mt-1">
                <span className="text-emerald-600 font-bold">✔ Hợp lệ: {validCount}</span>
                <span className="text-amber-600 font-bold">⚠ Trùng từ có sẵn: {duplicateCount}</span>
                <span className="text-rose-600 font-bold">✕ Lỗi: {errorCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={validCount === 0}
                className="px-5 py-2 rounded-xl bg-[#0866D9] hover:bg-[#073B86] disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-[#0866D9]/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>XÁC NHẬN NHẬP {validCount} TỪ HỢP LỆ</span>
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Dòng</th>
                  <th className="py-2.5 px-3">Lớp</th>
                  <th className="py-2.5 px-3">Bài học</th>
                  <th className="py-2.5 px-3">Từ tiếng Anh</th>
                  <th className="py-2.5 px-3">Nghĩa tiếng Việt</th>
                  <th className="py-2.5 px-3">Loại từ</th>
                  <th className="py-2.5 px-3">Độ khó</th>
                  <th className="py-2.5 px-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((row) => (
                  <tr 
                    key={row.rowNum} 
                    className={`hover:bg-slate-50 ${!row.isValid ? 'bg-rose-50/40' : row.isDuplicate ? 'bg-amber-50/40' : ''}`}
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-400">{row.rowNum}</td>
                    <td className="py-2.5 px-3 font-bold text-[#0866D9]">Lớp {row.grade}</td>
                    <td className="py-2.5 px-3 text-slate-700 truncate max-w-[140px]">{row.lesson}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#073B86]">{row.english}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{row.vietnamese}</td>
                    <td className="py-2.5 px-3 uppercase text-slate-500 font-mono">{row.partOfSpeech}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {row.level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> {row.errors.join(', ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
