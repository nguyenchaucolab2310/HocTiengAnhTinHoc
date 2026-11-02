import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileCheck, 
  RefreshCw,
  Sparkles,
  Zap,
  ArrowRight,
  BookOpen,
  Layers,
  Volume2,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Database
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { VocabularyItem, TopicItem, GradeLevel, WordLevel, WordSourceType, TextbookSeries } from '../../types';
import { StorageService } from '../../services/storage';
import { TTSService } from '../../services/tts';
import { STANDARD_EXCEL_DATA, StandardExcelRow } from '../../data/standardExcelData';

interface ExcelImportExportProps {
  vocabulary: VocabularyItem[];
  topics?: TopicItem[];
  onUpdateVocabulary: (vocab: VocabularyItem[]) => void;
  onUpdateTopics?: (topics: TopicItem[]) => void;
  onNavigateTab?: (tab: string) => void;
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
  topics = [],
  onUpdateVocabulary,
  onUpdateTopics,
  onNavigateTab
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'updating' | 'previewing' | 'success' | 'auto-success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [autoUpdateOnUpload, setAutoUpdateOnUpload] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | '10' | '11' | '12'>('all');
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  // Statistics
  const [updateStats, setUpdateStats] = useState<{
    totalProcessed: number;
    newAdded: number;
    existingEnriched: number;
    timestamp: string;
    grade10: number;
    grade11: number;
    grade12: number;
  } | null>(null);

  // Check how many of standard rows are currently present in vocabulary
  const existingEnglishSet = new Set(vocabulary.map(v => v.english.toLowerCase().trim()));
  const missingFromStandard = STANDARD_EXCEL_DATA.filter(
    item => !existingEnglishSet.has(item.english.toLowerCase().trim())
  );
  const standardSyncedCount = STANDARD_EXCEL_DATA.length - missingFromStandard.length;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handlePlayTTS = async (text: string) => {
    setPlayingWord(text);
    await TTSService.speak(text);
    setPlayingWord(null);
  };

  // Convert a standard or parsed row into a VocabularyItem with real topic & lesson binding
  const convertRowToVocabItem = (
    r: StandardExcelRow | ParsedRow,
    currentTopicsList: TopicItem[]
  ): { item: VocabularyItem; nextTopicsList: TopicItem[] } => {
    const grade = r.grade;
    const { lessonId, topicId, updatedTopics } = StorageService.findOrCreateLessonForVocab(
      grade,
      r.lesson,
      r.topic,
      currentTopicsList
    );
    const safeSlug = (r.english || 'word').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
    const randomSuffix = Math.random().toString(36).substring(2, 6);

    const item: VocabularyItem = {
      id: `voc-${grade}-${safeSlug}-${Date.now().toString().slice(-4)}-${randomSuffix}`,
      grade: r.grade,
      textbook: (r.textbook === 'Cánh diều' || r.textbook === 'Chân trời sáng tạo' ? r.textbook : 'Kết nối tri thức với cuộc sống') as TextbookSeries,
      orientation: r.orientation || 'Tin học ứng dụng',
      topicId,
      topicName: r.topic || 'Chủ đề SGK Tin học THPT',
      lessonId,
      lessonName: r.lesson,
      english: r.english.trim(),
      ipa: r.ipa || '/.../',
      partOfSpeech: (r.partOfSpeech as any) || 'n',
      vietnamese: r.vietnamese.trim(),
      explanation: r.explanation || 'Thuật ngữ môn Tin học THPT',
      example: r.example || '',
      exampleTranslation: r.exampleTranslation || '',
      level: r.level || 'dễ',
      sourceType: r.sourceType || 'Trong SGK (Đã xác minh)',
      sourcePage: r.sourcePage || '',
      isLearned: false,
      isFavorite: false,
      masteryLevel: 1
    };

    return { item, nextTopicsList: updatedTopics };
  };

  // Core Function: Auto Update from the Standard Excel File
  const handleAutoUpdateFromStandardExcel = async () => {
    setImportStatus('updating');
    setImportMessage('Đang đọc tệp Excel chuẩn và tự động cập nhật vào mục Học từ vựng & Ngân hàng đề...');

    try {
      let rowsToProcess: StandardExcelRow[] = STANDARD_EXCEL_DATA;

      try {
        const response = await fetch('/data/Tu_Vung_Tin_Hoc_THPT_Chuan_SGK.xlsx');
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const sheetJson = XLSX.utils.sheet_to_json<any>(firstSheet);
          if (sheetJson && sheetJson.length > 0) {
            rowsToProcess = sheetJson.map(row => ({
              grade: StorageService.parseGradeLevel(row.grade || row['Khối lớp'] || row['Khối'] || row['Lớp'], row.lesson, row.topic, row.english),
              textbook: row.textbook || 'Kết nối tri thức với cuộc sống',
              orientation: row.orientation || 'Tin học ứng dụng',
              topic: row.topic || 'Chủ đề Tin học THPT',
              lesson: row.lesson || 'Bài học Tin học',
              english: String(row.english || '').trim(),
              ipa: String(row.ipa || '/.../').trim(),
              partOfSpeech: row.partOfSpeech || 'n',
              vietnamese: String(row.vietnamese || '').trim(),
              explanation: String(row.explanation || '').trim(),
              example: String(row.example || '').trim(),
              exampleTranslation: String(row.exampleTranslation || '').trim(),
              level: (row.level === 'nâng cao' || row.level === 'trung bình' ? row.level : 'dễ') as WordLevel,
              sourceType: (row.sourceType === 'Trong SGK (Đã xác minh)' ? row.sourceType : 'Từ gợi ý - cần đối chiếu') as WordSourceType,
              sourcePage: row.sourcePage || ''
            }));
          }
        }
      } catch (fetchErr) {
        console.info('Using compiled standard Excel data fallback:', fetchErr);
      }

      // Merge into vocabulary bank
      const currentVocabMap = new Map<string, VocabularyItem>();
      vocabulary.forEach(item => {
        currentVocabMap.set(item.english.toLowerCase().trim(), item);
      });

      let addedCount = 0;
      let enrichedCount = 0;
      let g10 = 0;
      let g11 = 0;
      let g12 = 0;

      const newItemsToAdd: VocabularyItem[] = [];
      let runningTopics = topics.length > 0 ? topics : StorageService.getTopics();

      rowsToProcess.forEach((row) => {
        const key = row.english.toLowerCase().trim();
        if (!key) return;

        if (row.grade === 10) g10++;
        else if (row.grade === 11) g11++;
        else if (row.grade === 12) g12++;

        if (currentVocabMap.has(key)) {
          const existing = currentVocabMap.get(key)!;
          let changed = false;
          if (!existing.example && row.example) {
            existing.example = row.example;
            existing.exampleTranslation = row.exampleTranslation;
            changed = true;
          }
          if (!existing.explanation && row.explanation) {
            existing.explanation = row.explanation;
            changed = true;
          }
          if (changed) enrichedCount++;
        } else {
          const { item: newItem, nextTopicsList } = convertRowToVocabItem(row, runningTopics);
          runningTopics = nextTopicsList;
          newItemsToAdd.push(newItem);
          currentVocabMap.set(key, newItem);
          addedCount++;
        }
      });

      const updatedVocabularyList = [...newItemsToAdd, ...vocabulary];
      const finalTopics = StorageService.syncTopicsWithVocabulary(updatedVocabularyList, runningTopics);

      // Save to state and storage
      onUpdateVocabulary(updatedVocabularyList);
      StorageService.saveVocabulary(updatedVocabularyList);

      if (onUpdateTopics) onUpdateTopics(finalTopics);
      StorageService.saveTopics(finalTopics);

      const stats = {
        totalProcessed: rowsToProcess.length,
        newAdded: addedCount,
        existingEnriched: enrichedCount,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        grade10: g10,
        grade11: g11,
        grade12: g12
      };

      setUpdateStats(stats);
      setImportStatus('auto-success');
      setImportMessage(
        addedCount > 0
          ? `Đã đồng bộ thành công ${addedCount} từ vựng mới từ file Excel vào mục "Học từ vựng" (Lớp 10, 11, 12) và Ngân hàng đề thi trắc nghiệm!`
          : `Tất cả ${rowsToProcess.length} từ vựng trong file Excel chuẩn đã có đầy đủ và đồng bộ hoàn toàn vào mục "Học từ vựng" & Ngân hàng đề thi!`
      );

      triggerConfetti();
    } catch (err) {
      console.error('Error auto updating vocabulary from Excel:', err);
      setImportStatus('error');
      setImportMessage('Có lỗi xảy ra khi tự động cập nhật từ vựng từ tệp Excel.');
    }
  };

  // Download the official standard Excel file
  const handleDownloadStandardExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(STANDARD_EXCEL_DATA);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ngan_Hang_Tu_Vung_SGK');
    XLSX.writeFile(workbook, 'Tu_Vung_Tin_Hoc_THPT_Chuan_SGK.xlsx');
  };

  // Re-organize current vocabulary bank across Grade 10, 11, 12 and their lessons
  const handleReorganizeCurrentBank = () => {
    const { updatedVocab, updatedTopics } = StorageService.reorganizeVocabularyByGradeAndLesson(vocabulary, topics);
    onUpdateVocabulary(updatedVocab);
    StorageService.saveVocabulary(updatedVocab);
    if (onUpdateTopics) onUpdateTopics(updatedTopics);
    StorageService.saveTopics(updatedTopics);

    const g10 = updatedVocab.filter(v => v.grade === 10).length;
    const g11 = updatedVocab.filter(v => v.grade === 11).length;
    const g12 = updatedVocab.filter(v => v.grade === 12).length;

    setImportStatus('auto-success');
    setImportMessage(`Đã tự động phân chia toàn bộ ${updatedVocab.length} từ vựng chuẩn theo từng khối và từng bài: Lớp 10 (${g10} từ), Lớp 11 (${g11} từ), Lớp 12 (${g12} từ)!`);
    triggerConfetti();
  };

  // Export current entire vocabulary bank to Excel
  const handleExportCurrentBank = () => {
    const exportData = vocabulary.map((v, i) => ({
      STT: i + 1,
      grade: v.grade,
      textbook: v.textbook,
      orientation: v.orientation || 'Tin học ứng dụng',
      topic: v.topicName,
      lesson: v.lessonName,
      english: v.english,
      ipa: v.ipa,
      partOfSpeech: v.partOfSpeech,
      vietnamese: v.vietnamese,
      explanation: v.explanation,
      example: v.example,
      exampleTranslation: v.exampleTranslation,
      level: v.level,
      sourceType: v.sourceType,
      sourcePage: v.sourcePage || '',
      isFavorite: v.isFavorite ? 'Có' : 'Không',
      isLearned: v.isLearned ? 'Đã học' : 'Chưa học'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ngan_Hang_Hien_Tai');
    XLSX.writeFile(workbook, `Ngan_Hang_Tu_Vung_Tin_Hoc_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Handle uploaded Excel file (from teacher's computer)
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
          const english = String(
            row.english || row['Từ tiếng Anh'] || row['Tiếng Anh'] || row['Word'] || row['Từ vựng'] || row['Thuật ngữ'] || ''
          ).trim();
          const vietnamese = String(
            row.vietnamese || row['Nghĩa tiếng Việt'] || row['Tiếng Việt'] || row['Meaning'] || row['Nghĩa'] || ''
          ).trim();
          const lesson = String(
            row.lesson || row['Bài học'] || row['Bài'] || row['Tên bài'] || row['Bài số'] || row['Lesson'] || row['Unit'] || 'Bài học Tin học'
          ).trim();
          const topic = String(
            row.topic || row['Chủ đề'] || row['Chủ đề SGK'] || row['Topic'] || row['Chương'] || 'Chủ đề SGK Tin học'
          ).trim();
          const rawGrade = row.grade || row['Khối lớp'] || row['Lớp'] || row['Khối'] || row['Grade'] || row['Class'] || '';
          const validGrade = StorageService.parseGradeLevel(rawGrade, lesson, topic, english);

          if (!english) errors.push('Thiếu từ tiếng Anh');
          if (!vietnamese) errors.push('Thiếu nghĩa tiếng Việt');

          const isDuplicate = existingEnglishWords.has(english.toLowerCase());

          return {
            rowNum: idx + 2,
            grade: validGrade,
            textbook: row.textbook || row['Bộ sách'] || 'Kết nối tri thức với cuộc sống',
            orientation: row.orientation || row['Định hướng'] || 'Tin học ứng dụng',
            topic,
            lesson,
            english,
            ipa: row.ipa || row['Phiên âm'] || row['Phát âm'] || '/.../',
            partOfSpeech: row.partOfSpeech || row['Loại từ'] || row['Từ loại'] || 'n',
            vietnamese,
            explanation: row.explanation || row['Giải thích'] || row['Định nghĩa'] || 'Thuật ngữ môn Tin học THPT',
            example: row.example || row['Ví dụ'] || row['Câu ví dụ'] || '',
            exampleTranslation: row.exampleTranslation || row['Dịch ví dụ'] || row['Dịch nghĩa ví dụ'] || '',
            level: (row.level === 'nâng cao' || row.level === 'trung bình' ? row.level : 'dễ') as WordLevel,
            sourceType: (row.sourceType === 'Trong SGK (Đã xác minh)' ? row.sourceType : 'Từ gợi ý - cần đối chiếu') as WordSourceType,
            sourcePage: row.sourcePage || row['Trang SGK'] || row['Trang'] || '',
            isValid: errors.length === 0,
            isDuplicate,
            errors
          };
        });

        setParsedRows(validated);

        // If Auto Update On Upload is activated, immediately import valid items into vocabulary bank & question bank
        if (autoUpdateOnUpload) {
          const validRows = validated.filter(r => r.isValid && !r.isDuplicate);
          const duplicateRows = validated.filter(r => r.isValid && r.isDuplicate);

          if (validRows.length > 0) {
            let runningTopics = topics.length > 0 ? topics : StorageService.getTopics();
            const newItems: VocabularyItem[] = [];

            let g10 = 0;
            let g11 = 0;
            let g12 = 0;

            validRows.forEach(r => {
              if (r.grade === 10) g10++;
              else if (r.grade === 11) g11++;
              else if (r.grade === 12) g12++;

              const { item, nextTopicsList } = convertRowToVocabItem(r, runningTopics);
              runningTopics = nextTopicsList;
              newItems.push(item);
            });

            const updated = [...newItems, ...vocabulary];
            const finalTopics = StorageService.syncTopicsWithVocabulary(updated, runningTopics);

            onUpdateVocabulary(updated);
            StorageService.saveVocabulary(updated);

            if (onUpdateTopics) onUpdateTopics(finalTopics);
            StorageService.saveTopics(finalTopics);

            setUpdateStats({
              totalProcessed: validated.length,
              newAdded: newItems.length,
              existingEnriched: duplicateRows.length,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              grade10: g10,
              grade11: g11,
              grade12: g12
            });

            setImportStatus('success');
            setImportMessage(`Tự động đồng bộ thành công ${newItems.length} từ vựng từ tệp "${file.name}" vào mục Học từ vựng (Lớp 10: ${g10}, Lớp 11: ${g11}, Lớp 12: ${g12}) và Ngân hàng đề thi!`);
            triggerConfetti();
          } else if (duplicateRows.length > 0) {
            setImportStatus('previewing');
            setImportMessage(`Tất cả ${duplicateRows.length} từ trong tệp đã có sẵn và đồng bộ trong ngân hàng từ vựng & ngân hàng đề.`);
          } else {
            setImportStatus('previewing');
            setImportMessage('Các dòng trong tệp bị thiếu trường bắt buộc (cần tiếng Anh và nghĩa tiếng Việt).');
          }
        } else {
          setImportStatus('previewing');
        }
      } catch (err) {
        console.error(err);
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng tệp!');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Manual Confirmation if auto-upload is disabled
  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Không có dòng dữ liệu hợp lệ nào để nhập.');
      return;
    }

    let runningTopics = topics.length > 0 ? topics : StorageService.getTopics();
    const newItems: VocabularyItem[] = [];
    let g10 = 0;
    let g11 = 0;
    let g12 = 0;

    validRows.forEach(r => {
      if (r.grade === 10) g10++;
      else if (r.grade === 11) g11++;
      else if (r.grade === 12) g12++;

      const { item, nextTopicsList } = convertRowToVocabItem(r, runningTopics);
      runningTopics = nextTopicsList;
      newItems.push(item);
    });

    const updated = [...newItems, ...vocabulary];
    const finalTopics = StorageService.syncTopicsWithVocabulary(updated, runningTopics);

    onUpdateVocabulary(updated);
    StorageService.saveVocabulary(updated);

    if (onUpdateTopics) onUpdateTopics(finalTopics);
    StorageService.saveTopics(finalTopics);

    setUpdateStats({
      totalProcessed: parsedRows.length,
      newAdded: newItems.length,
      existingEnriched: 0,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      grade10: g10,
      grade11: g11,
      grade12: g12
    });

    setImportStatus('success');
    setImportMessage(`Đã cập nhật thành công ${newItems.length} từ vựng vào mục Học từ vựng và Ngân hàng đề thi!`);
    triggerConfetti();
  };

  const handleReset = () => {
    setParsedRows([]);
    setFileName('');
    setImportStatus('idle');
    setImportMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter display list for explorer
  const displayedStandardData = STANDARD_EXCEL_DATA.filter(item => {
    if (gradeFilter !== 'all' && String(item.grade) !== gradeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.english.toLowerCase().includes(q) ||
        item.vietnamese.toLowerCase().includes(q) ||
        item.lesson.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const validCount = parsedRows.filter(r => r.isValid).length;
  const duplicateCount = parsedRows.filter(r => r.isDuplicate).length;
  const errorCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#12B981] via-[#0866D9] to-[#073B86] text-white flex items-center justify-center shadow-lg shadow-[#0866D9]/20 shrink-0">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
                Nhập & Tự Động Cập Nhật Từ Vựng (Excel)
              </h1>
              <span className="bg-emerald-100 text-emerald-700 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <Zap className="w-3 h-3 fill-emerald-600" /> Auto-Sync
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Tự động cập nhật toàn bộ thuật ngữ tiếng Anh Tin học THPT chuẩn SGK Kết nối tri thức vào ngân hàng từ vựng
            </p>
          </div>
        </div>

        {/* Quick export actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleReorganizeCurrentBank}
            className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs border border-purple-200 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Tự động phân bổ lại toàn bộ từ vựng theo đúng Khối 10, 11, 12 và từng bài học"
          >
            <RefreshCw className="w-4 h-4 text-purple-600" />
            <span>PHÂN CHIA LẠI THEO KHỐI & BÀI</span>
          </button>

          <button
            onClick={handleDownloadStandardExcel}
            className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-white text-[#0866D9] hover:bg-blue-50 font-bold text-xs border border-[#1388F5]/40 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Tải tệp Excel chứa 40 thuật ngữ chuẩn"
          >
            <Download className="w-4 h-4" />
            <span>TẢI FILE EXCEL CHUẨN</span>
          </button>

          <button
            onClick={handleExportCurrentBank}
            className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Xuất sao lưu ngân hàng từ vựng hiện tại ra tệp Excel"
          >
            <Database className="w-4 h-4" />
            <span>XUẤT NGÂN HÀNG ({vocabulary.length})</span>
          </button>
        </div>
      </div>

      {/* 2. HERO CARD: TỰ ĐỘNG CẬP NHẬT TỪ VỰNG TỪ FILE EXCEL NÀY VÀO NGÂN HÀNG */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#073B86] via-[#0866D9] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-[#16D8FF]/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-[#16D8FF]">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>Chức năng tự động cập nhật từ vựng từ tệp Excel chuẩn</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Tự Động Cập Nhật Từ Vựng Trong File Excel Này Vào Ngân Hàng
            </h2>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Tệp Excel chuẩn <strong>Tu_Vung_Tin_Hoc_THPT_Chuan_SGK.xlsx</strong> đã được biên soạn sẵn gồm{' '}
              <span className="font-bold text-white underline decoration-[#16D8FF] decoration-2">
                {STANDARD_EXCEL_DATA.length} thuật ngữ Tin học THPT
              </span>{' '}
              (Lớp 10, 11, 12 - Kết nối tri thức với cuộc sống). Bấm nút bên dưới để hệ thống quét và tự động nạp toàn bộ các từ này vào ngân hàng từ vựng ngay lập tức!
            </p>

            {/* Quick status bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="bg-black/25 px-3 py-1 rounded-lg backdrop-blur-xs font-medium">
                📚 Tổng thuật ngữ trong file: <strong>{STANDARD_EXCEL_DATA.length} từ</strong>
              </span>
              <span className="bg-black/25 px-3 py-1 rounded-lg backdrop-blur-xs font-medium">
                ✅ Đã có trong ngân hàng: <strong className="text-emerald-300">{standardSyncedCount} từ</strong>
              </span>
              {missingFromStandard.length > 0 ? (
                <span className="bg-amber-500/30 text-amber-200 border border-amber-400/40 px-3 py-1 rounded-lg font-bold">
                  ⚡ Còn thiếu {missingFromStandard.length} từ chưa nạp
                </span>
              ) : (
                <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Đã đồng bộ 100%
                </span>
              )}
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="shrink-0 w-full lg:w-auto flex flex-col items-stretch gap-2.5">
            <button
              onClick={handleAutoUpdateFromStandardExcel}
              disabled={importStatus === 'updating'}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-[#073B86] font-black text-sm sm:text-base shadow-xl shadow-black/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-5 h-5 fill-[#073B86]" />
              <span>
                {importStatus === 'updating' 
                  ? 'ĐANG TỰ ĐỘNG CẬP NHẬT...' 
                  : missingFromStandard.length > 0 
                    ? `CẬP NHẬT NGAY ${missingFromStandard.length} TỪ CÒN THIẾU` 
                    : 'ĐỒNG BỘ LẠI TỪ FILE EXCEL'
                }
              </span>
            </button>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('teacher-vocab')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-white/15"
              >
                <span>Xem Ngân hàng từ vựng hiện tại ({vocabulary.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Notification of Auto-Update Success */}
      {(importStatus === 'auto-success' || importStatus === 'success') && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-emerald-900 text-base">
                  {importMessage}
                </h3>
                <p className="text-xs font-semibold text-emerald-700">
                  Dữ liệu từ vựng đã được lưu tự động vào bộ nhớ trình duyệt (LocalStorage) và áp dụng ngay lập tức cho các phần học tập, Flashcard, luyện tập và kiểm tra!
                </p>
                {updateStats && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-emerald-800">
                    <span className="bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Mới thêm: +{updateStats.newAdded}
                    </span>
                    <span className="bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Lớp 10: {updateStats.grade10} từ
                    </span>
                    <span className="bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Lớp 11: {updateStats.grade11} từ
                    </span>
                    <span className="bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Lớp 12: {updateStats.grade12} từ
                    </span>
                    <span className="text-emerald-600 font-normal">
                      Lúc {updateStats.timestamp}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('vocabulary')}
                  className="px-4 py-2.5 rounded-xl bg-[#0866D9] text-white hover:bg-[#073B86] font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>HỌC TỪ VỰNG TỪNG LỚP</span>
                </button>
              )}
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('exam')}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>VÀO NGÂN HÀNG ĐỀ THI</span>
                </button>
              )}
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('flashcard')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" />
                  <span>HỌC FLASHCARD</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Upload Zone For Custom Excel Files */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-[#073B86] flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#0866D9]" />
              <span>Tải Lên Tệp Excel Khác Của Giáo Viên (.xlsx, .xls, .csv)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Nếu quý thầy cô có file Excel riêng, hãy tải lên tại đây để bổ sung thêm từ vựng mới
            </p>
          </div>

          {/* Auto-update Toggle */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#0866D9] cursor-pointer">
            <input
              type="checkbox"
              checked={autoUpdateOnUpload}
              onChange={(e) => setAutoUpdateOnUpload(e.target.checked)}
              className="rounded text-[#0866D9] focus:ring-[#0866D9] cursor-pointer"
            />
            <span>Tự động cập nhật ngay khi chọn tệp</span>
          </label>
        </div>

        <div className="border-2 border-dashed border-[#B6D9F9] rounded-2xl p-6 text-center space-y-3 bg-slate-50/50 hover:bg-blue-50/30 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0866D9] flex items-center justify-center mx-auto shadow-inner">
            <FileSpreadsheet className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#073B86]">
              Chọn hoặc kéo thả tệp Excel từ máy tính của bạn
            </h4>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Hệ thống tự động nhận diện các cột: <code>english, vietnamese, ipa, partOfSpeech, explanation, example, grade, lesson</code>
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-custom-upload"
          />

          <div className="pt-2">
            <label
              htmlFor="excel-custom-upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0866D9] hover:bg-[#073B86] text-white font-bold text-xs shadow-md shadow-[#0866D9]/30 cursor-pointer transition-all active:scale-95"
            >
              <FileCheck className="w-4 h-4" />
              <span>{fileName ? `Đã chọn: ${fileName}` : 'Chọn tệp từ máy tính của bạn'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* 5. Custom File Preview Table (if manual review or preview status) */}
      {importStatus === 'previewing' && parsedRows.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#B6D9F9]/50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-base text-[#073B86]">
                Kết quả kiểm tra tệp Excel: {fileName} ({parsedRows.length} dòng)
              </h2>
              <div className="flex items-center gap-3 text-xs mt-1">
                <span className="text-emerald-600 font-bold">✔ Hợp lệ: {validCount}</span>
                <span className="text-amber-600 font-bold">⚠ Đã có trong ngân hàng: {duplicateCount}</span>
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
                <span>XÁC NHẬN CẬP NHẬT {validCount} TỪ HỢP LỆ VÀO NGÂN HÀNG</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Dòng</th>
                  <th className="py-2.5 px-3">Lớp</th>
                  <th className="py-2.5 px-3">Bài học</th>
                  <th className="py-2.5 px-3">Từ tiếng Anh</th>
                  <th className="py-2.5 px-3">Nghĩa tiếng Việt</th>
                  <th className="py-2.5 px-3">Loại từ</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((row) => (
                  <tr 
                    key={row.rowNum} 
                    className={`hover:bg-slate-50 ${!row.isValid ? 'bg-rose-50/50' : row.isDuplicate ? 'bg-amber-50/40' : ''}`}
                  >
                    <td className="py-2 px-3 font-mono text-slate-400">{row.rowNum}</td>
                    <td className="py-2 px-3 font-bold text-[#0866D9]">Lớp {row.grade}</td>
                    <td className="py-2 px-3 text-slate-700 truncate max-w-[150px]">{row.lesson}</td>
                    <td className="py-2 px-3 font-mono font-bold text-[#073B86]">{row.english}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{row.vietnamese}</td>
                    <td className="py-2 px-3 uppercase text-slate-500 font-mono">{row.partOfSpeech}</td>
                    <td className="py-2 px-3">
                      {row.isValid ? (
                        row.isDuplicate ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            Đã có sẵn
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Hợp lệ (Sẽ nạp mới)
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          Lỗi: {row.errors.join(', ')}
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

      {/* 6. Standard Excel Vocabulary Explorer */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-[#073B86] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0866D9]" />
              <span>Danh Sách Thuật Ngữ Có Sẵn Trong Tệp Excel Chuẩn ({STANDARD_EXCEL_DATA.length} từ)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Kiểm tra tình trạng đồng bộ của từng từ giữa file Excel và ngân hàng dữ liệu
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Grade Filter Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setGradeFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  gradeFilter === 'all' ? 'bg-[#0866D9] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({STANDARD_EXCEL_DATA.length})
              </button>
              <button
                onClick={() => setGradeFilter('12')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  gradeFilter === '12' ? 'bg-[#0866D9] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lớp 12
              </button>
              <button
                onClick={() => setGradeFilter('11')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  gradeFilter === '11' ? 'bg-[#0866D9] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lớp 11
              </button>
              <button
                onClick={() => setGradeFilter('10')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  gradeFilter === '10' ? 'bg-[#0866D9] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lớp 10
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm từ tiếng Anh, tiếng Việt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0866D9] bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Table of Words */}
        <div className="overflow-x-auto max-h-96 custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Lớp</th>
                <th className="py-2.5 px-3">Thuật ngữ tiếng Anh</th>
                <th className="py-2.5 px-3">Phiên âm & Loại</th>
                <th className="py-2.5 px-3">Nghĩa tiếng Việt</th>
                <th className="py-2.5 px-3">Bài học SGK</th>
                <th className="py-2.5 px-3 text-right">Trạng thái trong Ngân hàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedStandardData.map((item, idx) => {
                const isAlreadyInBank = existingEnglishSet.has(item.english.toLowerCase().trim());

                return (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#0866D9]">
                        Lớp {item.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-[#073B86] text-xs sm:text-sm">
                          {item.english}
                        </span>
                        <button
                          onClick={() => handlePlayTTS(item.english)}
                          className={`p-1 rounded-full text-slate-400 hover:text-[#0866D9] hover:bg-blue-50 cursor-pointer ${
                            playingWord === item.english ? 'text-[#0866D9] animate-pulse' : ''
                          }`}
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      <span>{item.ipa}</span>
                      <span className="ml-1 text-[9px] uppercase bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                        {item.partOfSpeech}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {item.vietnamese}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[200px]" title={item.lesson}>
                      {item.lesson}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isAlreadyInBank ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3 stroke-[3]" /> Đã có trong ngân hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Chưa nạp
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayedStandardData.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs font-semibold">
            Không tìm thấy từ vựng nào phù hợp với bộ lọc.
          </div>
        )}
      </div>

    </div>
  );
};
